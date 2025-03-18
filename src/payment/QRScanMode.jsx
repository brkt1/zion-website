import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { TimeContext } from '../App';
import gameStorage from '../utils/storage';

import { FaCamera, FaQrcode } from 'react-icons/fa';

const GAME_ROUTES = {
  1: '/trivia-game',
  2: '/truth-or-dare',
  3: '/rock-paper-scissors',
  4: '/emoji-game',
};

const QRScanMode = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);
  const navigate = useNavigate();
  const { startTimer } = useContext(TimeContext);
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
      setError('Camera access required');
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
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.777778,
          disableFlip: false,
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
      setError(err.message || 'Failed to start scanner');
    }
  }, [selectedCamera]);

  const stopScanner = useCallback(async () => {
    if (html5QrCode.current && html5QrCode.current.isScanning) {
      try {
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  }, []);

  const handleScan = useCallback(async (scannedData) => {
    if (isLoading || !scannedData) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Scanned data before validation:', scannedData);
      if (!/^\d{14}$/.test(scannedData)) {

        console.log('Scanned data:', scannedData);
        throw new Error('Invalid 14-digit card number');
      }

      const { data, error } = await supabase
        .from('cards')
        .select('*, game_types(name)')
        .eq('card_number', scannedData)
        .single();
      console.log('Supabase query result:', data, error);

      console.log('Supabase response:', data, error);

      if (error) throw error;
      if (data.used) {
        console.log('Card already redeemed:', scannedData);
        throw new Error('Card already redeemed');
      }

      await supabase
        .from('cards')
        .update({ used: true })
        .eq('card_number', scannedData);

      gameStorage.setCard(scannedData);
      setScanResult(data);
      startTimer(data.duration * 60);
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
      setError(err.message || 'Failed to process card');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, navigate, startTimer, stopScanner]);

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
    const manualInput = prompt('Enter 14-digit card number:');
    if (manualInput) {
      if (/^\d{14}$/.test(manualInput)) {
        handleScan(manualInput);
      } else {
        setError('Invalid format - must be 14 digits');
      }
    }
  };

  useEffect(() => {
    getCameras();
  }, [getCameras]);

  useEffect(() => {
    if (selectedCamera && !isInitializing) {
      initScanner();
    }

    return () => {
      stopScanner();
    };
  }, [initScanner, selectedCamera, stopScanner, isInitializing]);

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
                <FaQrcode className="text-xl" /> for better experience use our app
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
                <p className="text-gray-300">Game: {scanResult.game_types.name}</p>
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
