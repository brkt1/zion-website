import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGamepad, 
  FaArrowLeft, 
  FaUsers, 
  FaLock, 
  FaGlobe,
  FaCopy,
  FaQrcode,
  FaPlay,
  FaCog,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

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
}

const RoomCreation: React.FC = () => {
  const { createRoom, getActiveRooms } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeRooms, setActiveRooms] = useState<GameRoom[]>([]);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [joinPassword, setJoinPassword] = useState('');

  const gameType = location.state?.gameType || 'emoji';
  const qrData = location.state?.qrData;

  const gameTypes = {
    emoji: { name: 'Emoji Game', icon: '😊', color: 'from-yellow-400 to-orange-500' },
    trivia: { name: 'Trivia Challenge', icon: '🧠', color: 'from-blue-400 to-purple-500' },
    truth_dare: { name: 'Truth or Dare', icon: '💕', color: 'from-pink-400 to-red-500' },
    rock_paper_scissors: { name: 'Rock Paper Scissors', icon: '✂️', color: 'from-gray-400 to-gray-600' }
  };

  const currentGame = gameTypes[gameType as keyof typeof gameTypes];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadActiveRooms();
    const interval = setInterval(loadActiveRooms, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [user, navigate]);

  const loadActiveRooms = async () => {
    try {
      const rooms = await getActiveRooms();
      setActiveRooms(rooms);
    } catch (error) {
      console.error('Error loading active rooms:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !user) return;

    setIsCreating(true);
    try {
      const roomId = await createRoom({
        name: roomName.trim(),
        gameType,
        maxPlayers,
        isPrivate,
        password: isPrivate ? password : undefined,
        hostId: user.id,
        hostName: user.username || user.email
      });

      // Navigate to the created room
      navigate(`/multiplayer/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (room: GameRoom) => {
    if (room.isPrivate) {
      setSelectedRoom(room);
      setShowPasswordInput(true);
      return;
    }

    try {
      // Join the room directly
      navigate(`/multiplayer/room/${room.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    }
  };

  const handleJoinWithPassword = async () => {
    if (!selectedRoom || !joinPassword.trim()) return;

    try {
      // Verify password and join room
      if (selectedRoom.password === joinPassword) {
        navigate(`/multiplayer/room/${selectedRoom.id}`);
      } else {
        alert('Incorrect password. Please try again.');
        setJoinPassword('');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    }
  };

  const copyRoomLink = (roomId: string) => {
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

  return (
    <div className="min-h-screen bg-black-primary text-white">
      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/games')}
              className="flex items-center text-gray-light hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Games
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
              Create Multiplayer Room
            </h1>
            
            <p className="text-xl text-gray-light max-w-3xl mx-auto">
              Set up a game room for {currentGame.name} and invite friends to join
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Room Creation Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                <h2 className="text-2xl font-bold mb-6">Create New Room</h2>
                
                <div className="space-y-6">
                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-light mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter a creative room name..."
                      className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary"
                    />
                  </div>

                  {/* Max Players */}
                  <div>
                    <label className="block text-sm font-medium text-gray-light mb-2">
                      Maximum Players
                    </label>
                    <select
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary"
                    >
                      <option value={2}>2 Players</option>
                      <option value={3}>3 Players</option>
                      <option value={4}>4 Players</option>
                      <option value={5}>5 Players</option>
                      <option value={6}>6 Players</option>
                      <option value={8}>8 Players</option>
                      <option value={10}>10 Players</option>
                    </select>
                  </div>

                  {/* Privacy Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-5 h-5 text-gold-primary bg-gray-dark border-gray-medium rounded focus:ring-gold-primary focus:ring-2"
                      />
                      <label htmlFor="isPrivate" className="text-sm font-medium text-gray-light">
                        Make room private
                      </label>
                    </div>

                    {isPrivate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-light mb-2">
                          Room Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter a password for the room"
                            className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-gold-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="text-gray-light" />
                            ) : (
                              <FaEye className="text-gray-light" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating || !roomName.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-xl hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isCreating ? (
                      <div className="w-5 h-5 border-2 border-black-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaPlay />
                        <span>Create Room</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Room Features */}
                <div className="mt-8 p-4 bg-gray-dark/50 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FaCog className="mr-2 text-gold-primary" />
                    Room Features
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-light">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      Real-time multiplayer gameplay
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      Voice chat support (coming soon)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      Custom room settings
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      QR code sharing
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Active Rooms */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                <h2 className="text-2xl font-bold mb-6">Join Existing Rooms</h2>
                
                {activeRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUsers className="text-gray-medium text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Active Rooms</h3>
                    <p className="text-gray-light">
                      Be the first to create a room and start playing!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeRooms.map(room => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-dark/50 rounded-lg p-4 border border-gray-medium hover:border-gold-primary transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{gameTypes[room.gameType as keyof typeof gameTypes]?.icon || '🎮'}</span>
                            <div>
                              <h4 className="font-semibold">{room.name}</h4>
                              <p className="text-sm text-gray-light">
                                Hosted by {room.hostName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getStatusColor(room.status)}`}>
                              {getStatusLabel(room.status)}
                            </div>
                            <div className="text-xs text-gray-light">
                              {room.currentPlayers}/{room.maxPlayers} players
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-light">
                            {room.isPrivate ? (
                              <FaLock className="text-yellow-400" />
                            ) : (
                              <FaGlobe className="text-green-400" />
                            )}
                            <span>{room.isPrivate ? 'Private' : 'Public'}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => copyRoomLink(room.id)}
                              className="px-3 py-2 bg-gray-medium text-white text-sm rounded-lg hover:bg-gray-light transition-colors flex items-center space-x-2"
                            >
                              <FaCopy className="text-xs" />
                              <span>Copy Link</span>
                            </button>
                            
                            <button
                              onClick={() => handleJoinRoom(room)}
                              disabled={room.status !== 'waiting'}
                              className="px-4 py-2 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordInput && selectedRoom && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black-secondary rounded-2xl p-8 border border-gray-dark max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <FaLock className="text-black-primary text-2xl" />
              </div>
              
              <h3 className="text-xl font-bold mb-4">
                Private Room
              </h3>
              
              <p className="text-gray-light mb-6">
                This room requires a password to join.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-light mb-2 text-left">
                  Room Password
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary"
                />
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleJoinWithPassword}
                  disabled={!joinPassword.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50"
                >
                  Join Room
                </button>
                
                <button
                  onClick={() => {
                    setShowPasswordInput(false);
                    setSelectedRoom(null);
                    setJoinPassword('');
                  }}
                  className="w-full px-4 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RoomCreation;
