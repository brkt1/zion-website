import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FaCamera, FaQrcode, FaKeyboard, FaRedo } from 'react-icons/fa';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';

const GAME_ROUTES = {
  1: '/trivia-game',
  2: '/truth-or-dare',
  3: '/rock-paper-scissors',
  4: '/emoji-game',
};

const QRScanMode = () => {
  const { startSession } = useSessionStore();
  const { initialize } = useAuthStore();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const shouldRedirect = !location.state?.fromGame;

  const requestCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraAccess(true);
      // Release camera stream immediately after getting access
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      setError('Camera access required - Please enable in browser settings');
      setHasCameraAccess(false);
      return false;
    }
  }, []);

  const getCameras = useCallback(async () => {
    try {
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) return;

      const devices = await Html5Qrcode.getCameras();
      if (devices?.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    } catch (err) {
      setError('Failed to get camera devices');
    }
  }, [requestCameraAccess]);

  const initScanner = useCallback(async () => {
    if (!selectedCamera || !scannerRef.current || !hasCameraAccess) return;

    try {
      if (html5QrCode.current?.isScanning) {
        await html5QrCode.current.stop();
      }

      const container = scannerRef.current;
      const qrboxSize = Math.min(
        container.offsetWidth - 40,
        container.offsetHeight - 40,
        300
      );

      html5QrCode.current = new Html5Qrcode(container.id);
      setIsScanning(true);
      
      await html5QrCode.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => handleScan(decodedText),
        (errorMessage) => {
          if (!errorMessage.includes('NotFoundException')) {
            setError(errorMessage);
          }
        }
      );
    } catch (err) {
      setError(err.message.includes('permission') 
        ? 'Camera access denied - check browser settings'
        : 'Failed to initialize scanner');
      setIsScanning(false);
    }
  }, [selectedCamera, hasCameraAccess]);

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError('Your game session has expired. Please scan a new card to continue playing.');
    }
  }, [location.state]);
  
  if (shouldRedirect) {
    return <Navigate to="/qr-scan" replace state={{ fromGame: true }} />;
  }

  const stopScanner = useCallback(async () => {
    try {
      if (html5QrCode.current?.isScanning && !html5QrCode.current._isStopping) {
        html5QrCode.current._isStopping = true;
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
        html5QrCode.current._isStopping = false;
      }
      setIsScanning(false);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  }, []);

const handleScan = useCallback(async (scannedData) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      let cardNumber = '';
      try {
        const parsedData = JSON.parse(scannedData);
        if (parsedData && parsedData.card_number) {
          cardNumber = String(parsedData.card_number);
        } else {
          throw new Error('Card number not found in scanned data');
        }
      } catch {
        // If not JSON, fallback to extracting digits
        cardNumber = scannedData.replace(/\D/g, '');
      }

      if (!/^\d{13}$/.test(cardNumber)) {
        throw new Error(`Invalid 13-digit card number: ${scannedData}`);
      }

      // Fetch card details from backend API
      const response = await fetch(`http://localhost:3001/api/cards`);
      if (!response.ok) {
        throw new Error('Failed to fetch cards from server');
      }
      
      const cards = await response.json();
      const card = cards.find(c => c.cardNumber === cardNumber && !c.used);
      
      if (!card) {
        throw new Error('Card not found or already used');
      }

      // Start session with card details
      await startSession(card.gameTypeId, 'Player', card.duration * 60);
      
      // Mark card as used via backend
      const markUsedResponse = await fetch(`http://localhost:3001/api/cards/${card.id}/use`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!markUsedResponse.ok) {
        console.warn('Failed to mark card as used on server');
      }
      
      // Navigate to appropriate game based on game type name
      const gameTypeName = card.gameType?.name?.toLowerCase() || '';
      let gameRoute = '/game-screen'; // default fallback
      
      if (gameTypeName.includes('trivia')) {
        gameRoute = '/trivia-game';
      } else if (gameTypeName.includes('truth') || gameTypeName.includes('dare')) {
        gameRoute = '/truth-or-dare';
      } else if (gameTypeName.includes('rock') || gameTypeName.includes('paper') || gameTypeName.includes('scissors')) {
        gameRoute = '/rock-paper-scissors';
      } else if (gameTypeName.includes('emoji')) {
        gameRoute = '/emoji-game';
      }

      navigate(gameRoute, {
        state: {
          cardDetails: card,
          fromGame: true
        },
      });
      
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, navigate, startSession]);

  useEffect(() => {
    getCameras();
    return () => {
      stopScanner();
      window.stream?.getTracks().forEach(track => track.stop());
    };
  }, [getCameras, stopScanner]);

  useEffect(() => {
    if (selectedCamera && hasCameraAccess) {
      initScanner();
    }
    return () => {
      stopScanner();
    };
  }, [selectedCamera, hasCameraAccess, initScanner, stopScanner]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopScanner();
      } else if (hasCameraAccess) {
        initScanner();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stopScanner, initScanner, hasCameraAccess]);

  const handleManualEntry = () => {
    const manualInput = prompt('Enter number:');
    if (manualInput) {
      const cleanedInput = manualInput.replace(/\D/g, '');
      if (/^\d{13}$/.test(cleanedInput)) {
        handleScan(cleanedInput);
      } else {
        setError('Invalid card');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black-primary text-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black-secondary rounded-xl shadow-lg overflow-hidden border border-gray-dark">
          <div className="bg-gradient-to-r from-gold-primary to-gold-secondary p-6 text-center">
            <h1 className="text-2xl font-bold text-black-primary flex items-center justify-center gap-3">
              <FaQrcode className="text-xl" /> SCAN GAME CARD
            </h1>
            <p className="text-sm text-black-primary mt-1 opacity-90">
              Scan the QR code on your game card to start playing
            </p>
          </div>

          <div className="p-6">
            {cameras.length > 0 && (
              <div className="mb-4">
                <label className="block text-gold-light text-sm font-medium mb-2">
                  Camera Selection
                </label>
                <select
                  value={selectedCamera || ''}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full p-3 bg-black-primary text-cream rounded-lg border border-gray-medium focus:border-gold-primary focus:ring-1 focus:ring-gold-primary"
                >
                  {cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative mb-6 border-2 border-gold-primary rounded-lg overflow-hidden bg-black-primary">
              <div 
                id="scanner-container" 
                ref={scannerRef}
                className="h-64 w-full flex items-center justify-center relative min-h-[256px]"
              >
                {!hasCameraAccess ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
                    <FaCamera className="text-4xl text-gold-primary" />
                    <button
                      onClick={getCameras}
                      className="bg-gold-primary text-black-primary py-2 px-6 rounded-lg hover:bg-gold-secondary transition-colors flex items-center gap-2"
                    >
                      <FaRedo /> Enable Camera
                    </button>
                    <p className="text-center text-gold-light text-sm">
                      Camera access is required to scan QR codes
                    </p>
                  </div>
                ) : isScanning ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="border-2 border-gold-primary rounded-lg animate-pulse"
                      style={{
                        width: 'min(300px, 80vw)',
                        height: 'min(300px, 80vw)'
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={handleManualEntry}
                className="flex items-center justify-center gap-2 bg-black-primary hover:bg-gray-dark text-gold-primary py-3 px-4 rounded-lg border border-gold-primary transition-colors"
              >
                <FaKeyboard /> Manual Entry
              </button>

              <button
                onClick={initScanner}
                disabled={!hasCameraAccess}
                className="flex items-center justify-center gap-2 bg-gold-primary hover:bg-gold-secondary text-black-primary py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <FaCamera /> {isScanning ? 'Scanning...' : 'Start Scan'}
              </button>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="text-red-300">
                  <p className="font-medium">{error}</p>
                  {error.includes('Camera access') && (
                    <button
                      onClick={getCameras}
                      className="w-full mt-3 bg-gold-primary text-black-primary py-2 rounded-lg hover:bg-gold-secondary transition-colors flex items-center justify-center gap-2"
                    >
                      <FaRedo /> Retry Camera Access
                    </button>
                  )}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="p-4 text-center text-gold-primary">
                <div className="inline-flex items-center gap-2 animate-pulse">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" className="opacity-25 stroke-current"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Verifying card...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanMode;
