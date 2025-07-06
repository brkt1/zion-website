import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';

interface GameType {
  id: string;
  name: string;
  description?: string;
  _count: {
    cards: number;
    questions: number;
    scores: number;
  };
}

interface GameModeProps {
  onGameStart?: (gameTypeId: string, playerName: string) => void;
}

const GameModeSelector: React.FC<GameModeProps> = ({ onGameStart }) => {
  const navigate = useNavigate();
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const { startSession } = useSessionStore();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    fetchGameTypes();
  }, []);

  const fetchGameTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/game-types');
      
      if (!response.ok) {
        throw new Error('Failed to fetch game types');
      }

      const data = await response.json();
      setGameTypes(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load game types');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!selectedGameType || !playerName.trim()) {
      setError('Please select a game type and enter your name');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      // Start session with 5 minutes (300 seconds) duration
      await startSession(selectedGameType, playerName.trim(), 300);

      // Call parent callback if provided
      if (onGameStart) {
        onGameStart(selectedGameType, playerName.trim());
      }

      // Navigate to appropriate game based on game type
      const gameType = gameTypes.find(gt => gt.id === selectedGameType);
      if (gameType) {
        switch (gameType.name.toLowerCase()) {
          case 'trivia':
            navigate('/trivia-game');
            break;
          case 'truth or dare':
            navigate('/truth-or-dare');
            break;
          case 'emoji game':
            navigate('/emoji-game');
            break;
          case 'rock paper scissors':
            navigate('/rock-paper-scissors');
            break;
          default:
            navigate('/game-screen');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to start game');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading game modes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Choose Your Game
          </h1>
          <p className="text-xl text-blue-200">
            Select a game mode and enter your name to start playing
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center"
          >
            <p className="text-red-200">{error}</p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Player Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 mb-2">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  maxLength={50}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Game Types</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {gameTypes.map((gameType) => (
                <motion.div
                  key={gameType.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedGameType === gameType.id
                      ? 'bg-blue-500/30 border-2 border-blue-400'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedGameType(gameType.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {gameType.name}
                      </h3>
                      {gameType.description && (
                        <p className="text-blue-200 text-sm mt-1">
                          {gameType.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-blue-300">
                      <div>{gameType._count.questions} questions</div>
                      <div>{gameType._count.cards} cards</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={handleStartGame}
            disabled={!selectedGameType || !playerName.trim() || isStarting}
            className={`px-8 py-4 rounded-xl text-xl font-bold transition-all ${
              selectedGameType && playerName.trim() && !isStarting
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isStarting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Starting Game...</span>
              </div>
            ) : (
              'Start Game'
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-blue-200"
        >
          <p>Game duration: 5 minutes</p>
          <p className="text-sm mt-2">
            Your progress will be saved automatically
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default GameModeSelector;
