import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { FaCamera, FaQrcode, FaKeyboard, FaRedo, FaTrophy, FaCheck, FaTimes } from 'react-icons/fa';

interface WinnerCardData {
  type: string;
  winnerCardId: string;
  playerId: string;
  prize: string;
  verificationCode: string;
}

interface WinnerRecord {
  winnerCardId: string;
  playerId: string;
  playerName: string;
  gameType: string;
  score: number;
  prize: string;
  timestamp: string;
  sessionId: string;
  status: string;
  generatedAt: string;
}

const WinnerCardScanner: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedWinner, setScannedWinner] = useState<WinnerRecord | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);

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
      let winnerCardData: WinnerCardData;
      
      try {
        const parsedData = JSON.parse(scannedData);
        
        // Check if it's a winner card
        if (parsedData.type !== 'winner_card') {
          setError('This is not a winner card. Please scan a valid winner card.');
          return;
        }
        
        // Validate winner card data structure
        if (!parsedData.winnerCardId || !parsedData.playerId || !parsedData.prize) {
          throw new Error('Invalid winner card data structure');
        }
        
        winnerCardData = parsedData;
      } catch {
        setError('Invalid QR code format. Please scan a valid winner card.');
        return;
      }

      // Fetch winner record from database
      const { data: winnerRecord, error: fetchError } = await supabase
        .from('winner_cards')
        .select('*')
        .eq('winnerCardId', winnerCardData.winnerCardId)
        .single();

      if (fetchError || !winnerRecord) {
        throw new Error('Winner card not found in database');
      }

      // Verify the card data matches
      if (winnerRecord.playerId !== winnerCardData.playerId || 
          winnerRecord.prize !== winnerCardData.prize) {
        throw new Error('Winner card verification failed - data mismatch');
      }

      setScannedWinner(winnerRecord);
      setIsVerified(true);
      setRewardClaimed(winnerRecord.status === 'claimed');
      
      // Stop scanning
      await stopScanner();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify winner card');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, stopScanner]);

  const claimReward = async () => {
    if (!scannedWinner || rewardClaimed) return;

    setIsLoading(true);
    
    try {
      // Get current user (cafe owner or admin)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        throw new Error('Authentication required');
      }

      // Update winner card status to claimed
      const { error: updateError } = await supabase
        .from('winner_cards')
        .update({ 
          status: 'claimed',
          claimedAt: new Date().toISOString(),
          claimedBy: user.id
        })
        .eq('winnerCardId', scannedWinner.winnerCardId);

      if (updateError) {
        throw new Error('Failed to update winner card status');
      }

      // Log the reward claim
      const { error: logError } = await supabase
        .from('reward_claims')
        .insert([{
          winnerCardId: scannedWinner.winnerCardId,
          playerId: scannedWinner.playerId,
          playerName: scannedWinner.playerName,
          prize: scannedWinner.prize,
          claimedBy: user.id,
          claimedAt: new Date().toISOString()
        }]);

      if (logError) {
        console.warn('Failed to log reward claim:', logError);
      }

      setRewardClaimed(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedWinner(null);
    setIsVerified(false);
    setRewardClaimed(false);
    setError(null);
    initScanner();
  };

  const handleManualEntry = () => {
    const manualInput = prompt('Enter winner card ID or scan data:');
    if (manualInput) {
      handleScan(manualInput);
    }
  };

  useEffect(() => {
    getCameras();
    return () => {
      stopScanner();
    };
  }, [getCameras, stopScanner]);

  useEffect(() => {
    if (selectedCamera && hasCameraAccess && !scannedWinner) {
      initScanner();
    }
    return () => {
      stopScanner();
    };
  }, [selectedCamera, hasCameraAccess, initScanner, stopScanner, scannedWinner]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopScanner();
      } else if (hasCameraAccess && !scannedWinner) {
        initScanner();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stopScanner, initScanner, hasCameraAccess, scannedWinner]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/20">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-center">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <FaTrophy className="text-xl" /> WINNER CARD VERIFICATION
            </h1>
            <p className="text-sm text-purple-100 mt-1 opacity-90">
              Scan winner cards to verify and claim rewards
            </p>
          </div>

          <div className="p-6">
            {!scannedWinner ? (
              <>
                {/* Camera Selection */}
                {cameras.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-purple-400 text-sm font-medium mb-2">
                      Camera Selection
                    </label>
                    <select
                      value={selectedCamera || ''}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
                <div className="relative mb-6 border-2 border-purple-500 rounded-lg overflow-hidden bg-gray-900">
                  <div 
                    id="winner-scanner-container" 
                    ref={scannerRef}
                    className="h-64 w-full flex items-center justify-center relative min-h-[256px]"
                  >
                    {!hasCameraAccess ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
                        <FaCamera className="text-4xl text-purple-500" />
                        <button
                          onClick={getCameras}
                          className="bg-purple-500 text-white py-2 px-6 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                        >
                          <FaRedo /> Enable Camera
                        </button>
                        <p className="text-center text-purple-400 text-sm">
                          Camera access is required to scan winner cards
                        </p>
                      </div>
                    ) : isScanning ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="border-2 border-purple-500 rounded-lg animate-pulse"
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
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-purple-400 py-3 px-4 rounded-lg border border-purple-500/30 transition-colors"
                  >
                    <FaKeyboard /> Manual Entry
                  </button>

                  <button
                    onClick={initScanner}
                    disabled={!hasCameraAccess}
                    className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <FaCamera /> {isScanning ? 'Scanning...' : 'Start Scan'}
                  </button>
                </div>
              </>
            ) : (
              /* Winner Card Details */
              <div className="space-y-6">
                <div className={`border rounded-lg p-4 ${
                  isVerified 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-red-900/20 border-red-500/30'
                }`}>
                  <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${
                    isVerified ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isVerified ? <FaCheck /> : <FaTimes />}
                    {isVerified ? 'Winner Card Verified!' : 'Verification Failed'}
                  </h3>
                  
                  {isVerified && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="text-purple-400 font-semibold">Player:</span> {scannedWinner.playerName}</p>
                        <p><span className="text-purple-400 font-semibold">Player ID:</span> {scannedWinner.playerId}</p>
                        <p><span className="text-purple-400 font-semibold">Game:</span> {scannedWinner.gameType}</p>
                      </div>
                      <div>
                        <p><span className="text-purple-400 font-semibold">Score:</span> {scannedWinner.score}</p>
                        <p><span className="text-purple-400 font-semibold">Prize:</span> {scannedWinner.prize}</p>
                        <p><span className="text-purple-400 font-semibold">Status:</span> 
                          <span className={`ml-1 font-bold ${
                            rewardClaimed ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            {rewardClaimed ? 'Already Claimed' : 'Available'}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {isVerified && (
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-purple-400 font-semibold mb-3">Card Details</h4>
                    <div className="text-sm space-y-2">
                      <p><span className="text-purple-400">Card ID:</span> {scannedWinner.winnerCardId}</p>
                      <p><span className="text-purple-400">Generated:</span> {new Date(scannedWinner.generatedAt).toLocaleString()}</p>
                      <p><span className="text-purple-400">Session ID:</span> {scannedWinner.sessionId}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Scan Another Card
                  </button>
                  
                  {isVerified && !rewardClaimed && (
                    <button
                      onClick={claimReward}
                      disabled={isLoading}
                      className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
                        isLoading
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isLoading ? 'Processing...' : 'Claim Reward'}
                    </button>
                  )}
                  
                  {rewardClaimed && (
                    <div className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg text-center font-bold">
                      Reward Already Claimed
                    </div>
                  )}
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
                      className="w-full mt-3 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaRedo /> Retry Camera Access
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Loading Display */}
            {isLoading && (
              <div className="p-4 text-center text-purple-400">
                <div className="inline-flex items-center gap-2 animate-pulse">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" className="opacity-25 stroke-current"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {scannedWinner ? 'Processing reward...' : 'Verifying winner card...'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerCardScanner;
