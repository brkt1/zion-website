import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaClock,
    FaCog,
    FaCopy,
    FaGamepad,
    FaMicrophone,
    FaMicrophoneSlash,
    FaPlay,
    FaQrcode,
    FaShare,
    FaUsers,
    FaVolumeMute,
    FaVolumeUp
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';

interface GamePlayer {
  id: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  joinedAt: Date;
}

interface GameRoom {
  id: string;
  name: string;
  gameType: string;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  createdAt: Date;
  hostId: string;
  hostName: string;
  settings: {
    timeLimit: number;
    rounds: number;
    difficulty: string;
    allowSpectators: boolean;
  };
}

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { joinRoom, currentSession } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    timeLimit: 30,
    rounds: 10,
    difficulty: 'medium',
    allowSpectators: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const gameTypes = {
    emoji: { name: 'Emoji Game', icon: '😊', color: 'from-yellow-400 to-orange-500' },
    trivia: { name: 'Trivia Challenge', icon: '🧠', color: 'from-blue-400 to-purple-500' },
    truth_dare: { name: 'Truth or Dare', icon: '💕', color: 'from-pink-400 to-red-500' },
    rock_paper_scissors: { name: 'Rock Paper Scissors', icon: '✂️', color: 'from-gray-400 to-gray-600' }
  };

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/');
      return;
    }

    loadRoomData();
    const interval = setInterval(loadRoomData, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, [user, roomId, navigate]);

  const loadRoomData = async () => {
    try {
      // Mock room data - in production, this would come from the API
      const mockRoom: GameRoom = {
        id: roomId!,
        name: 'Awesome Gaming Room',
        gameType: 'emoji',
        maxPlayers: 6,
        currentPlayers: 3,
        isPrivate: false,
        status: 'waiting',
        createdAt: new Date(),
        hostId: user!.id,
        hostName: user!.username || user!.email,
        settings: gameSettings
      };

      const mockPlayers: GamePlayer[] = [
        {
          id: user!.id,
          username: user!.username || user!.email,
          isHost: true,
          isReady: isReady,
          score: 0,
          status: 'waiting',
          joinedAt: new Date()
        },
        {
          id: 'player2',
          username: 'GamerPro123',
          isHost: false,
          isReady: true,
          score: 0,
          status: 'waiting',
          joinedAt: new Date(Date.now() - 300000)
        },
        {
          id: 'player3',
          username: 'TriviaMaster',
          isHost: false,
          isReady: false,
          score: 0,
          status: 'waiting',
          joinedAt: new Date(Date.now() - 600000)
        }
      ];

      setRoom(mockRoom);
      setPlayers(mockPlayers);
      setIsHost(mockPlayers.find(p => p.id === user!.id)?.isHost || false);
    } catch (error) {
      console.error('Error loading room data:', error);
    }
  };

  const handleReadyToggle = () => {
    setIsReady(!isReady);
    // Update player ready status in the backend
  };

  const handleStartGame = () => {
    if (!isHost) return;
    
    // Start countdown
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          startGame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    // Navigate to the actual game
    navigate(`/game/${room?.gameType}`, { 
      state: { 
        roomId: room?.id,
        isMultiplayer: true,
        players: players
      } 
    });
  };

  const handleLeaveRoom = () => {
    // Leave room logic
    navigate('/');
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/multiplayer/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert('Room link copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-green-400';
      case 'starting': return 'text-yellow-400';
      case 'playing': return 'text-blue-400';
      case 'finished': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting for players';
      case 'starting': return 'Starting soon';
      case 'playing': return 'Game in progress';
      case 'finished': return 'Game finished';
      default: return 'Unknown';
    }
  };

  if (!room || !user) {
    return (
      <div className="min-h-screen bg-black-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-light">Loading room...</p>
        </div>
      </div>
    );
  }

  const currentGame = gameTypes[room.gameType as keyof typeof gameTypes];

  return (
    <div className="min-h-screen bg-black-primary text-white">
      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center text-gray-light hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Leave Room
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-gold-primary" />
                  <span className="text-lg font-bold">{players.length}/{room.maxPlayers}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gold-primary" />
                  <span className="text-lg font-bold">{room.settings.timeLimit}s</span>
                </div>
              </div>
              
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Room Header */}
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
              {room.name}
            </h1>
            
            <div className="inline-flex items-center space-x-4 bg-black-secondary px-6 py-3 rounded-full border border-gray-dark">
              <span className="text-gray-light">Game:</span>
              <span className="font-semibold">{currentGame.name}</span>
              <span className="text-gray-light">•</span>
              <span className={`font-medium ${getStatusColor(room.status)}`}>
                {getStatusLabel(room.status)}
              </span>
            </div>
          </motion.div>

          {/* Countdown Overlay */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              >
                <div className="text-center">
                  <div className="text-8xl font-bold text-gold-primary mb-4">{countdown}</div>
                  <p className="text-2xl text-white">Game starting...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Players List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Players</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-4 py-2 bg-gray-dark text-white text-sm rounded-lg hover:bg-gray-medium transition-colors flex items-center space-x-2"
                    >
                      <FaShare />
                      <span>Share</span>
                    </button>
                    
                    <button
                      onClick={copyRoomLink}
                      className="px-4 py-2 bg-gray-dark text-white text-sm rounded-lg hover:bg-gray-medium transition-colors flex items-center space-x-2"
                    >
                      <FaCopy />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-dark/50 rounded-lg border border-gray-medium"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-black-primary">
                            {player.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{player.username}</h3>
                            {player.isHost && (
                              <span className="px-2 py-1 bg-gold-primary text-black-primary text-xs font-bold rounded-full">
                                HOST
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-light">
                            <span>Score: {player.score}</span>
                            <span>Joined: {player.joinedAt.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          player.isReady ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        
                        <span className={`text-sm font-medium ${
                          player.isReady ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {player.isReady ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Ready Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={handleReadyToggle}
                    disabled={!user}
                    className={`px-8 py-4 rounded-xl font-bold transition-all duration-200 ${
                      isReady
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-dark text-white hover:bg-gray-medium'
                    } disabled:opacity-50`}
                  >
                    {isReady ? 'Ready ✓' : 'Mark as Ready'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Room Controls & Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Room Info */}
              <div className="bg-black-secondary rounded-2xl p-6 border border-gray-dark">
                <h3 className="text-xl font-bold mb-4">Room Info</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-light">Game Type:</span>
                    <span className="font-medium">{currentGame.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-light">Max Players:</span>
                    <span className="font-medium">{room.maxPlayers}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-light">Time Limit:</span>
                    <span className="font-medium">{room.settings.timeLimit}s</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-light">Rounds:</span>
                    <span className="font-medium">{room.settings.rounds}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-light">Difficulty:</span>
                    <span className="font-medium capitalize">{room.settings.difficulty}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-light">Privacy:</span>
                    <span className="font-medium">{room.isPrivate ? 'Private' : 'Public'}</span>
                  </div>
                </div>
              </div>

              {/* Host Controls */}
              {isHost && (
                <div className="bg-black-secondary rounded-2xl p-6 border border-gray-dark">
                  <h3 className="text-xl font-bold mb-4">Host Controls</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full px-4 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaCog />
                      <span>Game Settings</span>
                    </button>
                    
                    <button
                      onClick={handleStartGame}
                      disabled={players.filter(p => p.isReady).length < 2}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <FaPlay />
                      <span>Start Game</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-dark/50 rounded-lg">
                    <p className="text-xs text-gray-light text-center">
                      {players.filter(p => p.isReady).length < 2 
                        ? 'Need at least 2 ready players to start'
                        : 'All players are ready!'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Audio Controls */}
              <div className="bg-black-secondary rounded-2xl p-6 border border-gray-dark">
                <h3 className="text-xl font-bold mb-4">Audio</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isAudioEnabled
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-dark text-white hover:bg-gray-medium'
                    }`}
                  >
                    {isAudioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                    <span>{isAudioEnabled ? 'Audio On' : 'Audio Off'}</span>
                  </button>
                  
                  <button
                    onClick={() => setIsMicrophoneEnabled(!isMicrophoneEnabled)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isMicrophoneEnabled
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-dark text-white hover:bg-gray-medium'
                    }`}
                  >
                    {isMicrophoneEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    <span>{isMicrophoneEnabled ? 'Mic On' : 'Mic Off'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black-secondary rounded-2xl p-6 border border-gray-dark">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full px-4 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaQrcode />
                    <span>Show QR Code</span>
                  </button>
                  
                  <button
                    onClick={copyRoomLink}
                    className="w-full px-4 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaCopy />
                    <span>Copy Room Link</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black-secondary rounded-2xl p-8 border border-gray-dark max-w-md w-full text-center"
          >
            <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mx-auto mb-6">
              <div className="text-center">
                <span className="text-4xl">{currentGame.icon}</span>
                <p className="text-xs text-gray-600 mt-2">Room QR Code</p>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-4">
              Share Room
            </h3>
            
            <p className="text-gray-light mb-6">
              Share this QR code with friends to join your room
            </p>
            
            <div className="space-y-3">
              <button
                onClick={copyRoomLink}
                className="w-full px-4 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
              >
                Copy Room Link
              </button>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
