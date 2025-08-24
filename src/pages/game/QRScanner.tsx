import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaQrcode, FaCamera, FaArrowLeft, FaGamepad, FaUsers } from 'react-icons/fa';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

const QRScanner: React.FC = () => {
  const { scanQRCode } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock QR scanner for demo purposes
  // In production, you would use a real QR scanner library like html5-qrcode
  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    
    // Simulate QR code scanning
    setTimeout(() => {
      const mockQRData = `QR_${Date.now()}_demo_${Math.random().toString(36).substr(2, 9)}`;
      setScannedData(mockQRData);
      setIsScanning(false);
    }, 2000);
  };

  const handleQRCodeProcess = async () => {
    if (!scannedData) return;

    try {
      setIsProcessing(true);
      setError(null);
      
      // Process the scanned QR code
      const qrCode = await scanQRCode(scannedData);
      
      // Navigate to game selection with QR data
      navigate('/games', { 
        state: { 
          qrCode,
          scannedData 
        } 
      });
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Invalid or expired QR code. Please try again.');
      setScannedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-black-primary text-white">
      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-light hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                <FaGamepad className="text-black-primary text-xl" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                Yenege
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full mb-6">
              <FaQrcode className="text-black-primary text-4xl" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scan QR Code
            </h1>
            
            <p className="text-xl text-gray-light max-w-2xl mx-auto">
              Point your camera at the QR code provided by the waiter to access games
            </p>
          </motion.div>

          {/* Scanner Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Scanner Interface */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              {!scannedData ? (
                <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                  {!isScanning ? (
                    <div>
                      <div className="w-48 h-48 mx-auto mb-6 border-2 border-dashed border-gray-dark rounded-2xl flex items-center justify-center">
                        <FaCamera className="text-6xl text-gray-medium" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4">
                        Ready to Scan
                      </h3>
                      
                      <p className="text-gray-light mb-6">
                        Click the button below to start scanning QR codes
                      </p>
                      
                      <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="px-8 py-4 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-xl hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50"
                      >
                        Start Scanning
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-48 h-48 mx-auto mb-6 border-2 border-gold-primary rounded-2xl flex items-center justify-center bg-gold-primary/10">
                        <div className="w-32 h-32 border-4 border-gold-primary rounded-lg animate-pulse"></div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4">
                        Scanning...
                      </h3>
                      
                      <p className="text-gray-light mb-6">
                        Point your camera at the QR code
                      </p>
                      
                      <div className="w-8 h-8 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                  <div className="w-48 h-48 mx-auto mb-6 bg-green-500/20 border-2 border-green-500 rounded-2xl flex items-center justify-center">
                    <FaQrcode className="text-6xl text-green-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-green-400">
                    QR Code Detected!
                  </h3>
                  
                  <p className="text-gray-light mb-6">
                    Code: {scannedData.substring(0, 20)}...
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleQRCodeProcess}
                      disabled={isProcessing}
                      className="w-full px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-xl hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Continue to Games'}
                    </button>
                    
                    <button
                      onClick={resetScanner}
                      className="w-full px-6 py-3 bg-gray-dark text-white font-medium rounded-xl hover:bg-gray-medium transition-colors"
                    >
                      Scan Another Code
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  How to Use
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gold-primary rounded-full flex items-center justify-center text-black-primary font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Get QR Code from Waiter</h4>
                      <p className="text-gray-light text-sm">
                        Ask your waiter for a QR code to access games
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gold-primary rounded-full flex items-center justify-center text-black-primary font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Scan the Code</h4>
                      <p className="text-gray-light text-sm">
                        Use your camera to scan the QR code
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gold-primary rounded-full flex items-center justify-center text-black-primary font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Choose Your Game</h4>
                      <p className="text-gray-light text-sm">
                        Select from available games and modes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Modes Info */}
              <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark">
                <h4 className="font-semibold mb-4 flex items-center">
                  <FaUsers className="mr-2 text-gold-primary" />
                  Available Game Modes
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-light">Solo Mode</span>
                    <span className="text-green-400 text-sm">✓ Available</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-light">Multiplayer Mode</span>
                    <span className="text-green-400 text-sm">✓ Available</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-light">Game Night Events</span>
                    <span className="text-blue-400 text-sm">Special Events</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
              <h3 className="text-2xl font-bold mb-4">
                Need Help?
              </h3>
              
              <p className="text-gray-light mb-6 max-w-2xl mx-auto">
                If you're having trouble scanning the QR code or accessing games, 
                please ask a waiter for assistance or contact our support team.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button className="px-6 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors">
                  Contact Support
                </button>
                
                <button className="px-6 py-3 border-2 border-gold-primary text-gold-primary font-medium rounded-lg hover:bg-gold-primary hover:text-black-primary transition-all duration-200">
                  View Tutorial
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
