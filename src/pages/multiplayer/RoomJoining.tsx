import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCopy,
    FaGamepad,
    FaLock,
    FaPlay,
    FaSearch,
    FaUsers
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';

interface GameRoom {
    id: string;
    name: string;
    gameType: string;
    maxPlayers: number;
    currentPlayers: number;
    status: 'waiting' | 'starting' | 'full';
    isPrivate: boolean;
    createdAt: string;
    host: {
        id: string;
        username: string;
        avatar?: string;
    };
    players: Array<{
        id: string;
        username: string;
        avatar?: string;
        isReady: boolean;
        isHost: boolean;
    }>;
}

const RoomJoining: React.FC = () => {
    const { joinRoom, getActiveRooms } = useGame();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeRooms, setActiveRooms] = useState<GameRoom[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<GameRoom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGameType, setSelectedGameType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'players' | 'name'>('newest');
    const [isLoading, setIsLoading] = useState(true);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
    const [joinPassword, setJoinPassword] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const gameType = location.state?.gameType || 'emoji';
    const qrData = location.state?.qrData;

    const gameTypes = {
        emoji: { name: 'Emoji Game', icon: '🎯', color: 'from-blue-500 to-blue-700' },
        trivia: { name: 'Trivia Challenge', icon: '🧠', color: 'from-green-500 to-green-700' },
        truthOrDare: { name: 'Truth or Dare', icon: '💝', color: 'from-pink-500 to-pink-700' },
        rockPaperScissors: { name: 'Rock Paper Scissors', icon: '✂️', color: 'from-purple-500 to-purple-700' }
    };

    const currentGame = gameTypes[gameType as keyof typeof gameTypes];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadActiveRooms();
    }, [user, navigate]);

    useEffect(() => {
        filterAndSortRooms();
    }, [activeRooms, searchTerm, selectedGameType, sortBy]);

    const loadActiveRooms = async () => {
        try {
            setIsLoading(true);
            // Mock data for demonstration
            const mockRooms: GameRoom[] = [
                {
                    id: '1',
                    name: 'Fun Emoji Squad',
                    gameType: 'emoji',
                    maxPlayers: 6,
                    currentPlayers: 3,
                    status: 'waiting',
                    isPrivate: false,
                    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                    host: { id: '1', username: 'GameMaster' },
                    players: [
                        { id: '1', username: 'GameMaster', isReady: true, isHost: true },
                        { id: '2', username: 'Player2', isReady: false, isHost: false },
                        { id: '3', username: 'Player3', isReady: true, isHost: false }
                    ]
                },
                {
                    id: '2',
                    name: 'Trivia Masters',
                    gameType: 'trivia',
                    maxPlayers: 4,
                    currentPlayers: 4,
                    status: 'full',
                    isPrivate: false,
                    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                    host: { id: '4', username: 'QuizKing' },
                    players: [
                        { id: '4', username: 'QuizKing', isReady: true, isHost: true },
                        { id: '5', username: 'Player5', isReady: true, isHost: false },
                        { id: '6', username: 'Player6', isReady: true, isHost: false },
                        { id: '7', username: 'Player7', isReady: true, isHost: false }
                    ]
                },
                {
                    id: '3',
                    name: 'Private Party',
                    gameType: 'truthOrDare',
                    maxPlayers: 8,
                    currentPlayers: 2,
                    status: 'waiting',
                    isPrivate: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
                    host: { id: '8', username: 'PartyHost' },
                    players: [
                        { id: '8', username: 'PartyHost', isReady: true, isHost: true },
                        { id: '9', username: 'Player9', isReady: false, isHost: false }
                    ]
                }
            ];

            setActiveRooms(mockRooms);
        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortRooms = () => {
        let filtered = activeRooms.filter(room => {
            const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGameType = selectedGameType === 'all' || room.gameType === selectedGameType;
            return matchesSearch && matchesGameType;
        });

        // Sort rooms
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'players':
                    return b.currentPlayers - a.currentPlayers;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        setFilteredRooms(filtered);
    };

    const handleJoinRoom = async (room: GameRoom) => {
        if (room.isPrivate) {
            setSelectedRoom(room);
            setShowPasswordInput(true);
        } else {
            await joinRoomDirectly(room);
        }
    };

    const handleJoinWithPassword = async () => {
        if (!selectedRoom || !joinPassword.trim()) return;

        // Mock password verification
        if (joinPassword === 'password123') {
            await joinRoomDirectly(selectedRoom);
        } else {
            alert('Incorrect password');
        }
    };

    const joinRoomDirectly = async (room: GameRoom) => {
        try {
            setIsJoining(true);
            // Mock join room
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            navigate(`/room/${room.id}`, {
                state: {
                    roomId: room.id,
                    gameType: room.gameType,
                    qrData: qrData
                }
            });
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room');
        } finally {
            setIsJoining(false);
            setShowPasswordInput(false);
            setSelectedRoom(null);
            setJoinPassword('');
        }
    };

    const copyRoomLink = (roomId: string) => {
        const link = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(link);
        alert('Room link copied to clipboard!');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting': return 'text-green-400';
            case 'starting': return 'text-yellow-400';
            case 'full': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'waiting': return 'Waiting for players';
            case 'starting': return 'Starting soon';
            case 'full': return 'Room full';
            default: return 'Unknown';
        }
    };

    const getGameTypeIcon = (type: string) => {
        return gameTypes[type as keyof typeof gameTypes]?.icon || '🎮';
    };

    const getGameTypeName = (type: string) => {
        return gameTypes[type as keyof typeof gameTypes]?.name || 'Unknown Game';
    };

    const getTimeAgo = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading rooms...</p>
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
                            onClick={() => navigate('/game-selection', { state: { qrCode: qrData } })}
                            className="flex items-center text-gray-light hover:text-white transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Game Selection
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

            {/* Game Type Header */}
            <div className="px-6 mb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full mb-4">
                            <span className="text-4xl">{currentGame.icon}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Join Multiplayer Room</h1>
                        <p className="text-xl text-gray-light">
                            Find and join exciting {currentGame.name} rooms with other players
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="px-6 mb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light" />
                                <input
                                    type="text"
                                    placeholder="Search rooms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white placeholder-gray-light focus:border-gold-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Game Type Filter */}
                        <div>
                            <select
                                value={selectedGameType}
                                onChange={(e) => setSelectedGameType(e.target.value)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all">All Games</option>
                                {Object.entries(gameTypes).map(([key, game]) => (
                                    <option key={key} value={key}>{game.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="players">Most Players</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms List */}
            <div className="px-6 pb-12">
                <div className="max-w-6xl mx-auto">
                    {filteredRooms.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaUsers className="text-gray-light text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No rooms found</h3>
                            <p className="text-gray-light mb-6">
                                {searchTerm || selectedGameType !== 'all' 
                                    ? 'Try adjusting your search or filters'
                                    : 'No active rooms available at the moment'
                                }
                            </p>
                            <button
                                onClick={loadActiveRooms}
                                className="px-6 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-medium transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredRooms.map((room) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-black-secondary rounded-xl border border-gray-dark p-6 hover:border-gold-primary/50 transition-all duration-200"
                                >
                                    {/* Room Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                                                <span className="text-2xl">{getGameTypeIcon(room.gameType)}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">{room.name}</h3>
                                                <p className="text-sm text-gray-light">{getGameTypeName(room.gameType)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {room.isPrivate && (
                                                <div className="p-2 bg-red-500/20 rounded-lg">
                                                    <FaLock className="text-red-400 text-sm" />
                                                </div>
                                            )}
                                            <span className={`text-sm font-medium ${getStatusColor(room.status)}`}>
                                                {getStatusLabel(room.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Room Info */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-light">Host:</span>
                                            <span className="font-medium">{room.host.username}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-light">Players:</span>
                                            <span className="font-medium">
                                                {room.currentPlayers}/{room.maxPlayers}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-light">Created:</span>
                                            <span className="text-gray-light">{getTimeAgo(room.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Players Preview */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-light">Players</span>
                                            <span className="text-sm text-gray-light">{room.currentPlayers}/{room.maxPlayers}</span>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {room.players.slice(0, 4).map((player, index) => (
                                                <div
                                                    key={player.id}
                                                    className={`w-8 h-8 rounded-full border-2 border-black-secondary flex items-center justify-center text-xs font-medium ${
                                                        player.isHost 
                                                            ? 'bg-gold-primary text-black-primary' 
                                                            : 'bg-gray-dark text-white'
                                                    }`}
                                                    title={`${player.username}${player.isHost ? ' (Host)' : ''}`}
                                                >
                                                    {player.avatar ? (
                                                        <img src={player.avatar} alt={player.username} className="w-full h-full rounded-full" />
                                                    ) : (
                                                        player.username.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            ))}
                                            {room.currentPlayers > 4 && (
                                                <div className="w-8 h-8 bg-gray-dark rounded-full border-2 border-black-secondary flex items-center justify-center text-xs text-gray-light">
                                                    +{room.currentPlayers - 4}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleJoinRoom(room)}
                                            disabled={room.status === 'full' || room.currentPlayers >= room.maxPlayers}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                room.status === 'full' || room.currentPlayers >= room.maxPlayers
                                                    ? 'bg-gray-dark text-gray-light cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary hover:from-gold-secondary hover:to-gold-primary'
                                            }`}
                                        >
                                            <FaPlay className="inline mr-2" />
                                            {room.status === 'full' ? 'Full' : 'Join Room'}
                                        </button>
                                        <button
                                            onClick={() => copyRoomLink(room.id)}
                                            className="px-4 py-2 bg-gray-dark text-white rounded-lg hover:bg-gray-medium transition-colors"
                                            title="Copy room link"
                                        >
                                            <FaCopy />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordInput && selectedRoom && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black-secondary rounded-2xl p-8 border border-gray-dark max-w-md w-full"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaLock className="text-black-primary text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Private Room</h3>
                            <p className="text-gray-light">This room requires a password to join</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Room Password</label>
                                <input
                                    type="password"
                                    value={joinPassword}
                                    onChange={(e) => setJoinPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white placeholder-gray-light focus:border-gold-primary focus:outline-none"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowPasswordInput(false);
                                        setSelectedRoom(null);
                                        setJoinPassword('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleJoinWithPassword}
                                    disabled={!joinPassword.trim() || isJoining}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isJoining ? 'Joining...' : 'Join Room'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default RoomJoining;
