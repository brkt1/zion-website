import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FaCamera, FaQrcode } from 'react-icons/fa';
import { useCardStore, useTimerStore, useGameStore } from '../app/store';

const GAME_ROUTES = {
  1: '/trivia-game',
  2: '/truth-or-dare',
  3: '/rock-paper-scissors',
  4: '/emoji-game',
};

const QRScanMode = () => {
  // Zustand stores
  const { setCurrentCard, markCardAsUsed } = useCardStore();
  const { startTimer } = useTimerStore();
  const { setGameState } = useGameStore();

  // Local state
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Refs
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const shouldRedirect = !location.state?.fromGame;

  const getCameras = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    } catch (err) {
      setError('Camera access required - Please enable in browser settings');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const initScanner = useCallback(async () => {
    if (!selectedCamera || !scannerRef.current) return;

    try {
      if (html5QrCode.current) {
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
      }

      html5QrCode.current = new Html5Qrcode(scannerRef.current.id);
      
      await html5QrCode.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: true,
          supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
        },
        (decodedText) => handleScan(decodedText),
        (errorMessage) => {
          if (errorMessage.includes('NotFoundException')) {
            setError('Position QR code within frame. Ensure good lighting and focus.');
          } else {
            console.error('Scan error:', errorMessage);
            setError(errorMessage);
          }
        }
      );
    } catch (err) {
      console.error('Scanner init error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start scanner');
    }
  }, [selectedCamera]);

  const stopScanner = useCallback(async () => {
    try {
      if (html5QrCode.current?.isScanning) {
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
      }
      html5QrCode.current = null;
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  }, []);

  const handleScan = useCallback(async (scannedData) => {
    setIsLoading(true);
    setError(null);
    if (isLoading) return;

    try {
      const cleanedData = scannedData.replace(/\D/g, '');
      console.log('Cleaned scan data:', cleanedData);

      if (!/^\d{13}$/.test(cleanedData)) {
        throw new Error(`Invalid 13-digit card number. Scanned: ${scannedData}`);
      }

      const { data, error } = await supabase
        .from('cards')
        .select('*, game_types(name)')
        .eq('card_number', cleanedData)
        .single();

      if (error) throw error;
      if (data.used) throw new Error('Card already redeemed');

      // Zustand state updates
      setCurrentCard(data);
      startTimer(data.duration * 60);
      setGameState({ isPlaying: true, score: 0, winner: '' });

      await markCardAsUsed(data.id);
      setScanResult(data);
      await stopScanner();

      const gameRoute = GAME_ROUTES[data.game_type];
      if (gameRoute) {
        navigate(gameRoute, {
          state: {
            cardDetails: data,
            remainingTime: data.duration * 60,
            fromGame: true
          },
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, navigate, setCurrentCard, startTimer, markCardAsUsed, setGameState, stopScanner]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) stopScanner();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await Html5Qrcode.getCameras();
        if (isMounted && devices?.length) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
        }
      } catch (err) {
        setError('Camera access required - Please enable in browser settings');
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initialize();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (selectedCamera && !isInitializing) {
      initScanner();
    }

    return () => {
      stopScanner();
    };
  }, [initScanner, selectedCamera, stopScanner, isInitializing]);

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
    stopScanner();
  };

  const launchApp = () => {
    const appUrl = 'zionapp://';
    const fallbackUrl = 'https://yenege.com/download-app';

    window.location.href = appUrl;
    setTimeout(() => {
      if (!document.hidden) {
        window.location.href = fallbackUrl;
      }
    }, 1000);
  };

  const handleManualEntry = () => {
    const manualInput = prompt('Enter 13-digit card number:');
    if (manualInput) {
      const cleanedInput = manualInput.replace(/\D/g, '');
      if (/^\d{13}$/.test(cleanedInput)) {
        handleScan(cleanedInput);
      } else {
        setError('Invalid format - must be 13 digits');
      }
    }
  };

  if (shouldRedirect) {
    return <Navigate to="/qr-scan" replace state={{ fromGame: true }} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-amber-500">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <FaQrcode className="animate-pulse" /> SCAN CARD
            </h1>
          </div>

          <div className="p-6">
            {cameras.length > 0 && (
              <select
                value={selectedCamera || ''}
                onChange={handleCameraChange}
                className="w-full p-2 mb-4 bg-gray-800 text-amber-500 rounded border border-amber-500"
              >
                {cameras.map(camera => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </option>
                ))}
              </select>
            )}

            <div className="relative mb-6 border-4 border-amber-500 rounded-lg overflow-hidden">
              <div 
                id="scanner-container" 
                ref={scannerRef}
                className="h-64 bg-black relative"
              >
                {isInitializing && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center text-amber-500">
                    Initializing camera...
                  </div>
                )}
                {!isInitializing && (
                  <div className="absolute inset-0 animate-pulse">
                    <div className="absolute left-1/4 right-1/4 top-1/4 bottom-1/4 border-2 border-amber-500"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={handleManualEntry}
                className="flex-1 bg-amber-500 text-black py-3 rounded hover:bg-amber-600
                         flex items-center justify-center gap-2 font-bold"
              >
                <FaCamera /> Manual Entry
              </button>

              <button
                onClick={initScanner}
                className="bg-gray-800 text-amber-500 px-6 py-3 rounded hover:bg-gray-700
                         border-2 border-amber-500 font-bold"
              >
                Retry
              </button>
            </div>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={launchApp}
                className="flex-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white py-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                <FaQrcode className="text-xl" /> For better experience use our app
              </button>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-900/20 border-l-4 border-red-500 text-red-300 rounded">
                {error}
                {error.includes('Camera access') && (
                  <button
                    onClick={async () => {
                      try {
                        await navigator.mediaDevices.getUserMedia({ video: true });
                        await getCameras();
                      } catch (err) {
                        setError('Please enable camera access in browser settings');
                      }
                    }}
                    className="w-full mt-2 bg-amber-500 text-black py-2 rounded hover:bg-amber-600"
                  >
                    <FaCamera /> Enable Camera
                  </button>
                )}
              </div>
            )}

            {isLoading && (
              <div className="p-4 text-center text-amber-500 animate-pulse">
                Verifying card...
              </div>
            )}

            {scanResult && (
              <div className="p-4 bg-gray-800 rounded border-l-4 border-amber-500">
                <h3 className="text-xl font-bold text-amber-500 mb-2">Card Verified!</h3>
                <p className="text-gray-300">Game: {scanResult.game_types?.name}</p>
                <p className="text-gray-300">Duration: {scanResult.duration} minutes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanMode;