import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FaCamera, FaQrcode, FaKeyboard, FaMobileAlt } from 'react-icons/fa';
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
    <div className="min-h-screen bg-black-primary text-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Scanner Card */}
        <div className="bg-black-secondary rounded-xl shadow-lg overflow-hidden border border-gray-dark">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-primary to-gold-secondary p-6 text-center">
            <h1 className="text-2xl font-bold text-black-primary flex items-center justify-center gap-3">
              <FaQrcode className="text-xl" /> SCAN GAME CARD
            </h1>
            <p className="text-sm text-black-primary mt-1 opacity-90">
              Scan the QR code on your game card to start playing
            </p>
          </div>

          <div className="p-6">
            {/* Camera Selection */}
            {cameras.length > 0 && (
              <div className="mb-4">
                <label className="block text-gold-light text-sm font-medium mb-2">
                  Camera Selection
                </label>
                <select
                  value={selectedCamera || ''}
                  onChange={handleCameraChange}
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

            {/* Scanner View */}
            <div className="relative mb-6 border-2 border-gold-primary rounded-lg overflow-hidden bg-black-primary">
              <div 
                id="scanner-container" 
                ref={scannerRef}
                className="h-64 w-full flex items-center justify-center relative"
              >
                {isInitializing && (
                  <div className="absolute inset-0 bg-black-primary flex items-center justify-center text-gold-light">
                    <div className="animate-pulse flex flex-col items-center">
                      <FaCamera className="text-2xl mb-2" />
                      <span>Initializing camera...</span>
                    </div>
                  </div>
                )}
                {!isInitializing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-64 h-64 border-2 border-gold-primary rounded-lg animate-pulse"></div>
                    <div className="absolute top-0 left-0 right-0 bottom-0 border-8 border-black-primary opacity-30"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={handleManualEntry}
                className="flex items-center justify-center gap-2 bg-black-primary hover:bg-gray-dark text-gold-primary py-3 px-4 rounded-lg border border-gold-primary transition-colors"
              >
                <FaKeyboard /> Manual Entry
              </button>

              <button
                onClick={initScanner}
                className="flex items-center justify-center gap-2 bg-gold-primary hover:bg-gold-secondary text-black-primary py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <FaCamera /> Retry Scan
              </button>
            </div>
            
            {/* App Promotion */}
            <div className="mb-6">
              <button
                onClick={launchApp}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-primary/90 to-gold-secondary/90 hover:from-gold-primary hover:to-gold-secondary text-black-primary py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                <FaMobileAlt className="text-xl" />
                <span>For better experience use our app</span>
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-4 mb-4 bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="text-red-300 flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{error}</p>
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
                        className="w-full mt-3 bg-gold-primary text-black-primary py-2 rounded-lg hover:bg-gold-secondary transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCamera /> Enable Camera
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="p-4 text-center text-gold-primary">
                <div className="inline-flex items-center gap-2 animate-pulse">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying card...
                </div>
              </div>
            )}

            {scanResult && (
              <div className="p-4 bg-black-primary rounded-lg border-l-4 border-gold-primary">
                <h3 className="text-xl font-bold text-gold-primary mb-2 flex items-center gap-2">
                  <FaQrcode /> Card Verified!
                </h3>
                <div className="space-y-1 text-cream">
                  <p className="flex items-center gap-2">
                    <span className="text-gold-light">Game:</span> 
                    <span className="font-medium">{scanResult.game_types?.name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gold-light">Duration:</span> 
                    <span className="font-medium">{scanResult.duration} minutes</span>
                  </p>
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