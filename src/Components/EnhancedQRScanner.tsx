import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FaCamera, FaQrcode, FaKeyboard, FaRedo, FaGamepad } from 'react-icons/fa';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';

interface ScannedCardData {
  cardNumber: string;
  gameTypeId: string;
  duration: number;
  routeAccess: string[];
  playerId: string;
  timestamp: string;
}

interface GameRoute {
  id: string;
  name: string;
  path: string;
}

const EnhancedQRScanner: React.FC = () => {
  const { startSession } = useSessionStore();
  const { initialize } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCard, setScannedCard] = useState<ScannedCardData | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<GameRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Game routes mapping
  const gameRoutes: GameRoute[] = [
    { id: 'trivia', name: 'Trivia Game', path: '/trivia-game' },
    { id: 'truth-dare', name: 'Truth or Dare', path: '/truth-or-dare' },
    { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', path: '/rock-paper-scissors' },
    { id: 'emoji', name: 'Emoji Game', path: '/emoji-game' }
  ];

  // Generate unique player ID
  const generatePlayerId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const requestCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraAccess(true);
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
            console.warn('Scanner error:', errorMessage);
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error && err.message.includes('permission') 
        ? 'Camera access denied - check browser settings'
        : 'Failed to initialize scanner');
      setIsScanning(false);
    }
  }, [selectedCamera, hasCameraAccess]);

  const stopScanner = useCallback(async () => {
    try {
      if (html5QrCode.current?.isScanning && !(html5QrCode.current as any)._isStopping) {
        (html5QrCode.current as any)._isStopping = true;
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
        (html5QrCode.current as any)._isStopping = false;
      }
      setIsScanning(false);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  }, []);

  const handleScan = useCallback(async (scannedData: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      let cardData: ScannedCardData;
      
      try {
        const parsedData = JSON.parse(scannedData);
        
        // Check if it's a winner card
        if (parsedData.type === 'winner_card') {
          setError('This is a winner card. Please use the winner verification scanner.');
          return;
        }
        
        // Validate card data structure
        if (!parsedData.cardNumber || !parsedData.gameTypeId || !parsedData.routeAccess) {
          throw new Error('Invalid card data structure');
        }
        
        cardData = {
          cardNumber: parsedData.cardNumber,
          gameTypeId: parsedData.gameTypeId,
          duration: parsedData.duration || 30,
          routeAccess: parsedData.routeAccess || [],
          playerId: parsedData.playerId || generatePlayerId(),
          timestamp: parsedData.timestamp || new Date().toISOString()
        };
      } catch {
        // Fallback for simple card number
        const cardNumber = scannedData.replace(/\D/g, '');
        if (!/^\d{13}$/.test(cardNumber)) {
          throw new Error(`Invalid card format: ${scannedData}`);
        }
        
        // Fetch card from database
        const { data: cardRecord, error } = await supabase
          .from('enhanced_cards')
          .select(`
            *,
            game_types (
              id,
              name
            )
          `)
          .eq('card_number', cardNumber)
          .eq('used', false)
          .single();

        if (error || !cardRecord) {
          throw new Error('Card not found or already used');
        }

        cardData = {
          cardNumber: cardRecord.card_number,
          gameTypeId: cardRecord.game_type_id,
          duration: cardRecord.duration,
          routeAccess: cardRecord.route_access,
          playerId: generatePlayerId(),
          timestamp: new Date().toISOString()
        };
      }

      // Validate card hasn't been used
      const { data: existingCard, error: checkError } = await supabase
        .from('enhanced_cards')
        .select('used, player_id')
        .eq('card_number', cardData.cardNumber)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Error validating card');
      }

      if (existingCard?.used) {
        throw new Error('This card has already been used');
      }

      // Set available routes based on card
      const cardRoutes = cardData.routeAccess.map(routeId => 
        gameRoutes.find(route => route.id === routeId)
      ).filter(Boolean) as GameRoute[];

      setAvailableRoutes(cardRoutes);
      setScannedCard(cardData);
      
      // Auto-select first route if only one available
      if (cardRoutes.length === 1) {
        setSelectedRoute(cardRoutes[0].id);
      }

      // Stop scanning
      await stopScanner();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process card');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, stopScanner]);

  const startGame = async () => {
    if (!scannedCard || !selectedRoute) {
      setError('Please select a game route');
      return;
    }

    setIsLoading(true);
    
    try {
      // Mark card as used and assign player ID
      const { error: updateError } = await supabase
        .from('enhanced_cards')
        .update({ 
          used: true, 
          player_id: scannedCard.playerId,
          used_at: new Date().toISOString()
        })
        .eq('card_number', scannedCard.cardNumber);

      if (updateError) {
        console.warn('Failed to mark card as used:', updateError);
      }

      // Start game session
      await startSession(scannedCard.gameTypeId, scannedCard.playerId, scannedCard.duration * 60);
      
      // Navigate to selected game route
      const selectedGameRoute = gameRoutes.find(route => route.id === selectedRoute);
      if (selectedGameRoute) {
        navigate(selectedGameRoute.path, {
          state: {
            cardDetails: scannedCard,
            playerId: scannedCard.playerId,
            fromScanner: true
          }
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedCard(null);
    setAvailableRoutes([]);
    setSelectedRoute('');
    setError(null);
    initScanner();
  };

  const handleManualEntry = () => {
    const manualInput = prompt('Enter card number or scan data:');
    if (manualInput) {
      handleScan(manualInput);
    }
  };

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError('Your game session has expired. Please scan a new card to continue playing.');
    }
  }, [location.state]);

  useEffect(() => {
    getCameras();
    return () => {
      stopScanner();
    };
  }, [getCameras, stopScanner]);

  useEffect(() => {
    if (selectedCamera && hasCameraAccess && !scannedCard) {
      initScanner();
    }
    return () => {
      stopScanner();
    };
  }, [selectedCamera, hasCameraAccess, initScanner, stopScanner, scannedCard]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopScanner();
      } else if (hasCameraAccess && !scannedCard) {
        initScanner();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stopScanner, initScanner, hasCameraAccess, scannedCard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-amber-500/20">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <FaQrcode className="text-xl" /> ENHANCED CARD SCANNER
            </h1>
            <p className="text-sm text-gray-800 mt-1 opacity-90">
              Scan your Yenege game card to access available games
            </p>
          </div>

          <div className="p-6">
            {!scannedCard ? (
              <>
                {/* Camera Selection */}
                {cameras.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-amber-400 text-sm font-medium mb-2">
                      Camera Selection
                    </label>
                    <select
                      value={selectedCamera || ''}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {cameras.map(camera => (
                        <option key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${camera.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Scanner Area */}
                <div className="relative mb-6 border-2 border-amber-500 rounded-lg overflow-hidden bg-gray-900">
                  <div 
                    id="scanner-container" 
                    ref={scannerRef}
                    className="h-64 w-full flex items-center justify-center relative min-h-[256px]"
                  >
                    {!hasCameraAccess ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
                        <FaCamera className="text-4xl text-amber-500" />
                        <button
                          onClick={getCameras}
                          className="bg-amber-500 text-gray-900 py-2 px-6 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
                        >
                          <FaRedo /> Enable Camera
                        </button>
                        <p className="text-center text-amber-400 text-sm">
                          Camera access is required to scan QR codes
                        </p>
                      </div>
                    ) : isScanning ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="border-2 border-amber-500 rounded-lg animate-pulse"
                          style={{
                            width: 'min(300px, 80vw)',
                            height: 'min(300px, 80vw)'
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={handleManualEntry}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-amber-400 py-3 px-4 rounded-lg border border-amber-500/30 transition-colors"
                  >
                    <FaKeyboard /> Manual Entry
                  </button>

                  <button
                    onClick={initScanner}
                    disabled={!hasCameraAccess}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <FaCamera /> {isScanning ? 'Scanning...' : 'Start Scan'}
                  </button>
                </div>
              </>
            ) : (
              /* Card Details and Route Selection */
              <div className="space-y-6">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-green-400 font-bold text-lg mb-3">✅ Card Scanned Successfully!</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="text-amber-400 font-semibold">Card Number:</span> {scannedCard.cardNumber}</p>
                      <p><span className="text-amber-400 font-semibold">Player ID:</span> {scannedCard.playerId}</p>
                    </div>
                    <div>
                      <p><span className="text-amber-400 font-semibold">Duration:</span> {scannedCard.duration} minutes</p>
                      <p><span className="text-amber-400 font-semibold">Routes:</span> {availableRoutes.length}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-3">
                    <FaGamepad className="inline mr-2" />
                    Select Game to Play:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {availableRoutes.map(route => (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(route.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedRoute === route.id
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="font-semibold">{route.name}</div>
                        <div className="text-sm opacity-75">Tap to select this game</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Scan Another Card
                  </button>
                  <button
                    onClick={startGame}
                    disabled={!selectedRoute || isLoading}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
                      selectedRoute && !isLoading
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Starting...' : 'Start Game'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 mb-4 bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="text-red-300">
                  <p className="font-medium">{error}</p>
                  {error.includes('Camera access') && (
                    <button
                      onClick={getCameras}
                      className="w-full mt-3 bg-amber-500 text-gray-900 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaRedo /> Retry Camera Access
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Loading Display */}
            {isLoading && (
              <div className="p-4 text-center text-amber-400">
                <div className="inline-flex items-center gap-2 animate-pulse">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" className="opacity-25 stroke-current"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {scannedCard ? 'Starting game...' : 'Processing card...'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQRScanner;
