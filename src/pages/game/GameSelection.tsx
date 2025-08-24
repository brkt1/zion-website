import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCrown,
  FaGamepad,
  FaPlay,
  FaQrcode,
  FaStar,
  FaTrophy,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';

const GameSelection: React.FC = () => {
  const { startGame, scannedQR } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMode, setSelectedMode] = useState<'solo' | 'multiplayer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get QR data from navigation state or context
  const qrData = location.state?.qrCode || scannedQR;

  useEffect(() => {
    if (!qrData) {
      navigate('/scan');
    }
  }, [qrData, navigate]);

  const handleModeSelection = async (mode: 'solo' | 'multiplayer') => {
    if (!qrData) return;

    setSelectedMode(mode);
    setIsLoading(true);

    try {
      if (mode === 'solo') {
        // Start solo game directly
        await startGame(qrData.game_type, 'solo');
        navigate(`/game/${qrData.game_type}`);
      } else {
        // Navigate to multiplayer room creation
        navigate('/multiplayer/create', { 
          state: { 
            gameType: qrData.game_type,
            qrData 
          } 
        });
      }
    } catch (error) {
      console.error('Error starting game:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const gameTypes = [
    {
      type: 'emoji',
      name: 'Emoji Game',
      description: 'Guess hidden emoji phrases and test your creativity',
      icon: '😊',
      color: 'from-yellow-400 to-orange-500',
      features: ['Multiple difficulty levels', 'Time-based scoring', 'Creative challenges']
    },
    {
      type: 'trivia',
      name: 'Trivia Challenge',
      description: 'Test your knowledge across various categories',
      icon: '🧠',
      color: 'from-blue-400 to-purple-500',
      features: ['Multiple categories', 'Adaptive difficulty', 'Speed bonuses']
    },
    {
      type: 'truth_dare',
      name: 'Truth or Dare',
      description: 'Choose between lovers or friends mode for exciting challenges',
      icon: '💕',
      color: 'from-pink-400 to-red-500',
      features: ['Two game modes', 'Age-appropriate content', 'Social interaction']
    },
    {
      type: 'rock_paper_scissors',
      name: 'Rock Paper Scissors',
      description: 'The classic game with modern twists and rewards',
      icon: '✂️',
      color: 'from-gray-400 to-gray-600',
      features: ['Tournament mode', 'Streak bonuses', 'Team battles']
    }
  ];

  const currentGame = gameTypes.find(game => game.type === qrData?.game_type);

  if (!qrData || !currentGame) {
    return (
      <div className="min-h-screen bg-black-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-light">Loading game information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-primary text-white">
      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/scan')}
              className="flex items-center text-gray-light hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Scanner
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
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${currentGame.color} rounded-full mb-6`}>
              <span className="text-4xl">{currentGame.icon}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {currentGame.name}
            </h1>
            
            <p className="text-xl text-gray-light max-w-3xl mx-auto mb-6">
              {currentGame.description}
            </p>

            {/* QR Code Info */}
            <div className="inline-flex items-center space-x-2 bg-black-secondary px-4 py-2 rounded-full border border-gray-dark">
              <FaQrcode className="text-gold-primary" />
              <span className="text-sm text-gray-light">
                QR Code: {qrData.code?.substring(0, 15)}...
              </span>
            </div>
          </motion.div>

          {/* Game Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Game Features
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentGame.features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FaStar className="text-black-primary text-xl" />
                    </div>
                    <p className="text-gray-light">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-center mb-8">
              Choose Your Game Mode
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Solo Mode */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black-secondary rounded-2xl p-8 border border-gray-dark hover:border-gold-primary transition-all duration-200 cursor-pointer"
                onClick={() => handleModeSelection('solo')}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaUser className="text-white text-3xl" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">Solo Mode</h3>
                  
                  <p className="text-gray-light mb-6">
                    Play individually and challenge yourself to beat your high scores
                  </p>
                  
                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-light">Individual gameplay</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-light">Personal best tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-light">Focus on skill improvement</span>
                    </div>
                  </div>
                  
                  <button
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isLoading && selectedMode === 'solo' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaPlay />
                        <span>Start Solo Game</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Multiplayer Mode */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black-secondary rounded-2xl p-8 border border-gray-dark hover:border-gold-primary transition-all duration-200 cursor-pointer"
                onClick={() => handleModeSelection('multiplayer')}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaUsers className="text-white text-3xl" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">Multiplayer Mode</h3>
                  
                  <p className="text-gray-light mb-6">
                    Create or join rooms to play with friends and compete together
                  </p>
                  
                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-light">Team up with friends</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-light">Real-time competition</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-light">Social gaming experience</span>
                    </div>
                  </div>
                  
                  <button
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isLoading && selectedMode === 'multiplayer' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaUsers />
                        <span>Join Multiplayer</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Points Info */}
            <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-black-primary text-xl" />
              </div>
              <h4 className="font-semibold mb-2">Earn Points</h4>
              <p className="text-gray-light text-sm">
                Score points based on performance and compete on leaderboards
              </p>
            </div>

            {/* Rewards Info */}
            <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaCrown className="text-black-primary text-xl" />
              </div>
              <h4 className="font-semibold mb-2">Unlock Rewards</h4>
              <p className="text-gray-light text-sm">
                Redeem points for café rewards and special prizes
              </p>
            </div>

            {/* Progress Info */}
            <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-black-primary text-xl" />
              </div>
              <h4 className="font-semibold mb-2">Track Progress</h4>
              <p className="text-gray-light text-sm">
                Monitor your improvement and unlock achievements
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;
