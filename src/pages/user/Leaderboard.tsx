import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCrown,
    FaFire,
    FaGamepad,
    FaMapMarkerAlt,
    FaMedal,
    FaMinus,
    FaSearch,
    FaTrendingDown,
    FaTrendingUp,
    FaTrophy
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLeaderboard } from '../../contexts/LeaderboardContext';

interface LeaderboardEntry {
    id: string;
    rank: number;
    username: string;
    avatar?: string;
    points: number;
    gamesPlayed: number;
    winRate: number;
    bestScore: number;
    streak: number;
    lastGame: string;
    cafeId?: string;
    cafeName?: string;
    eventId?: string;
    eventName?: string;
    previousRank?: number;
}

interface LeaderboardType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    totalParticipants: number;
    lastUpdated: string;
    timeFrame: 'all-time' | 'weekly' | 'monthly' | 'event';
}

const Leaderboard: React.FC = () => {
    const { user } = useAuth();
    const { globalLeaderboard, fetchGlobalLeaderboard, fetchCafeLeaderboard } = useLeaderboard();
    const navigate = useNavigate();

    const [selectedLeaderboard, setSelectedLeaderboard] = useState<string>('global');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCafe, setSelectedCafe] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all-time');
    const [showUserDetails, setShowUserDetails] = useState<string | null>(null);

    const leaderboardTypes: LeaderboardType[] = [
        {
            id: 'global',
            name: 'Global Leaderboard',
            description: 'Top players across all cafes and events',
            icon: '🌍',
            color: 'from-blue-500 to-blue-700',
            totalParticipants: 15420,
            lastUpdated: new Date().toISOString(),
            timeFrame: 'all-time'
        },
        {
            id: 'weekly',
            name: 'Weekly Challenge',
            description: 'This week\'s top performers',
            icon: '📅',
            color: 'from-green-500 to-green-700',
            totalParticipants: 2847,
            lastUpdated: new Date().toISOString(),
            timeFrame: 'weekly'
        },
        {
            id: 'monthly',
            name: 'Monthly Champions',
            description: 'Best players of the month',
            icon: '🏆',
            color: 'from-purple-500 to-purple-700',
            totalParticipants: 12563,
            lastUpdated: new Date().toISOString(),
            timeFrame: 'monthly'
        },
        {
            id: 'cafe',
            name: 'Café Rankings',
            description: 'Top players at specific locations',
            icon: '☕',
            color: 'from-orange-500 to-orange-700',
            totalParticipants: 0,
            lastUpdated: new Date().toISOString(),
            timeFrame: 'all-time'
        }
    ];

    const cafes = [
        { id: 'cafe1', name: 'Coffee Corner', location: 'Addis Ababa' },
        { id: 'cafe2', name: 'Game Hub', location: 'Addis Ababa' },
        { id: 'cafe3', name: 'Arcade Zone', location: 'Addis Ababa' },
        { id: 'cafe4', name: 'Digital Café', location: 'Addis Ababa' }
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadLeaderboardData();
    }, [user, navigate, selectedLeaderboard, selectedCafe, selectedPeriod]);

    useEffect(() => {
        filterLeaderboardData();
    }, [leaderboardData, searchTerm]);

    const loadLeaderboardData = async () => {
        try {
            setIsLoading(true);
            
            // Mock data for demonstration
            const mockData: LeaderboardEntry[] = [
                {
                    id: '1',
                    rank: 1,
                    username: 'GameMaster',
                    points: 15420,
                    gamesPlayed: 156,
                    winRate: 87,
                    bestScore: 980,
                    streak: 12,
                    lastGame: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    cafeId: 'cafe1',
                    cafeName: 'Coffee Corner'
                },
                {
                    id: '2',
                    rank: 2,
                    username: 'QuizKing',
                    points: 14280,
                    gamesPlayed: 134,
                    winRate: 82,
                    bestScore: 1450,
                    streak: 8,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    cafeId: 'cafe2',
                    cafeName: 'Game Hub'
                },
                {
                    id: '3',
                    rank: 3,
                    username: 'EmojiQueen',
                    points: 13850,
                    gamesPlayed: 142,
                    winRate: 79,
                    bestScore: 950,
                    streak: 15,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                    cafeId: 'cafe1',
                    cafeName: 'Coffee Corner'
                },
                {
                    id: '4',
                    rank: 4,
                    username: 'TruthSeeker',
                    points: 12560,
                    gamesPlayed: 98,
                    winRate: 75,
                    bestScore: 880,
                    streak: 6,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                    cafeId: 'cafe3',
                    cafeName: 'Arcade Zone'
                },
                {
                    id: '5',
                    rank: 5,
                    username: 'RockStar',
                    points: 11890,
                    gamesPlayed: 112,
                    winRate: 71,
                    bestScore: 480,
                    streak: 9,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
                    cafeId: 'cafe2',
                    cafeName: 'Game Hub'
                },
                {
                    id: '6',
                    rank: 6,
                    username: 'Player6',
                    points: 11240,
                    gamesPlayed: 89,
                    winRate: 68,
                    bestScore: 820,
                    streak: 4,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
                    cafeId: 'cafe4',
                    cafeName: 'Digital Café'
                },
                {
                    id: '7',
                    rank: 7,
                    username: 'Player7',
                    points: 10890,
                    gamesPlayed: 76,
                    winRate: 65,
                    bestScore: 780,
                    streak: 7,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
                    cafeId: 'cafe1',
                    cafeName: 'Coffee Corner'
                },
                {
                    id: '8',
                    rank: 8,
                    username: 'Player8',
                    points: 10230,
                    gamesPlayed: 94,
                    winRate: 62,
                    bestScore: 750,
                    streak: 3,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
                    cafeId: 'cafe3',
                    cafeName: 'Arcade Zone'
                },
                {
                    id: '9',
                    rank: 9,
                    username: 'Player9',
                    points: 9870,
                    gamesPlayed: 67,
                    winRate: 59,
                    bestScore: 720,
                    streak: 5,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
                    cafeId: 'cafe2',
                    cafeName: 'Game Hub'
                },
                {
                    id: '10',
                    rank: 10,
                    username: 'Player10',
                    points: 9450,
                    gamesPlayed: 82,
                    winRate: 56,
                    bestScore: 680,
                    streak: 2,
                    lastGame: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
                    cafeId: 'cafe4',
                    cafeName: 'Digital Café'
                }
            ];

            // Add previous rank for ranking changes
            const dataWithChanges = mockData.map((entry, index) => ({
                ...entry,
                previousRank: index + 1
            }));

            setLeaderboardData(dataWithChanges);
        } catch (error) {
            console.error('Error loading leaderboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterLeaderboardData = () => {
        if (!searchTerm) {
            return;
        }

        const filtered = leaderboardData.filter(entry =>
            entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.cafeName && entry.cafeName.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        setLeaderboardData(filtered);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <FaCrown className="text-yellow-400 text-xl" />;
            case 2: return <FaMedal className="text-gray-300 text-xl" />;
            case 3: return <FaMedal className="text-amber-600 text-xl" />;
            default: return <span className="text-lg font-bold text-gray-light">{rank}</span>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black-primary';
            case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black-primary';
            case 3: return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
            default: return 'bg-gray-dark text-white';
        }
    };

    const getRankingChange = (entry: LeaderboardEntry) => {
        if (!entry.previousRank) return null;
        
        const change = entry.previousRank - entry.rank;
        if (change > 0) return { type: 'up', value: change, icon: FaTrendingUp, color: 'text-green-400' };
        if (change < 0) return { type: 'down', value: Math.abs(change), icon: FaTrendingDown, color: 'text-red-400' };
        return { type: 'stable', value: 0, icon: FaMinus, color: 'text-gray-400' };
    };

    const getTimeAgo = (date: string): string => {
        const now = new Date();
        const gameDate = new Date(date);
        const diffMs = now.getTime() - gameDate.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const getCurrentLeaderboard = () => {
        return leaderboardTypes.find(lt => lt.id === selectedLeaderboard);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black-primary text-white">
            {/* Header */}
            <div className="relative z-10 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center text-gray-light hover:text-white transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Profile
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

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Leaderboards</h1>
                        <p className="text-xl text-gray-light">
                            Compete with the best players and climb the rankings
                        </p>
                    </div>
                </div>
            </div>

            {/* Leaderboard Type Selection */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {leaderboardTypes.map((type) => (
                            <motion.button
                                key={type.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedLeaderboard(type.id)}
                                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                                    selectedLeaderboard === type.id
                                        ? 'border-gold-primary bg-gold-primary/10'
                                        : 'border-gray-dark hover:border-gold-primary/50'
                                }`}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <span className="text-3xl">{type.icon}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{type.name}</h3>
                                <p className="text-sm text-gray-light mb-3">{type.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-light">{type.totalParticipants.toLocaleString()} players</span>
                                    <span className="text-gray-light capitalize">{type.timeFrame.replace('-', ' ')}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Current Leaderboard Info */}
            {getCurrentLeaderboard() && (
                <div className="px-6 mb-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${getCurrentLeaderboard()?.color} rounded-xl flex items-center justify-center`}>
                                        <span className="text-3xl">{getCurrentLeaderboard()?.icon}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{getCurrentLeaderboard()?.name}</h2>
                                        <p className="text-gray-light">{getCurrentLeaderboard()?.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gold-primary">
                                        {leaderboardData.length.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-light">Active Players</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light" />
                                <input
                                    type="text"
                                    placeholder="Search players or cafes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white placeholder-gray-light focus:border-gold-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Café Filter (only for café leaderboard) */}
                        {selectedLeaderboard === 'cafe' && (
                            <div>
                                <select
                                    value={selectedCafe}
                                    onChange={(e) => setSelectedCafe(e.target.value)}
                                    className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                >
                                    <option value="all">All Cafés</option>
                                    {cafes.map(cafe => (
                                        <option key={cafe.id} value={cafe.id}>{cafe.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Period Filter */}
                        <div>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all-time">All Time</option>
                                <option value="this-week">This Week</option>
                                <option value="this-month">This Month</option>
                                <option value="this-year">This Year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-black-secondary rounded-xl border border-gray-dark overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-gray-dark px-6 py-4">
                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-light">
                                <div className="col-span-1">Rank</div>
                                <div className="col-span-4">Player</div>
                                <div className="col-span-2 text-center">Points</div>
                                <div className="col-span-2 text-center">Games</div>
                                <div className="col-span-2 text-center">Win Rate</div>
                                <div className="col-span-1 text-center">Streak</div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-dark">
                            {leaderboardData.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="px-6 py-4 hover:bg-gray-dark/30 transition-colors cursor-pointer"
                                    onClick={() => setShowUserDetails(showUserDetails === entry.id ? null : entry.id)}
                                >
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Rank */}
                                        <div className="col-span-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                                                {getRankIcon(entry.rank)}
                                            </div>
                                        </div>

                                        {/* Player Info */}
                                        <div className="col-span-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full flex items-center justify-center">
                                                    {entry.avatar ? (
                                                        <img src={entry.avatar} alt={entry.username} className="w-full h-full rounded-full" />
                                                    ) : (
                                                        <span className="text-black-primary font-bold text-lg">
                                                            {entry.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{entry.username}</div>
                                                    {entry.cafeName && (
                                                        <div className="text-sm text-gray-light flex items-center">
                                                            <FaMapMarkerAlt className="mr-1" />
                                                            {entry.cafeName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className="col-span-2 text-center">
                                            <div className="text-xl font-bold text-gold-primary">
                                                {entry.points.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Games Played */}
                                        <div className="col-span-2 text-center">
                                            <div className="font-medium">{entry.gamesPlayed}</div>
                                        </div>

                                        {/* Win Rate */}
                                        <div className="col-span-2 text-center">
                                            <div className="font-medium">{entry.winRate}%</div>
                                        </div>

                                        {/* Streak */}
                                        <div className="col-span-1 text-center">
                                            <div className="flex items-center justify-center">
                                                <FaFire className="text-orange-400 mr-1" />
                                                <span className="font-medium">{entry.streak}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ranking Change Indicator */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-4 text-sm text-gray-light">
                                            <span>Last game: {getTimeAgo(entry.lastGame)}</span>
                                            {entry.bestScore > 0 && (
                                                <span>Best: {entry.bestScore}</span>
                                            )}
                                        </div>
                                        
                                        {getRankingChange(entry) && (
                                            <div className={`flex items-center space-x-1 text-sm ${getRankingChange(entry)?.color}`}>
                                                {React.createElement(getRankingChange(entry)?.icon || FaMinus)}
                                                <span>
                                                    {getRankingChange(entry)?.type === 'up' && '+'}
                                                    {getRankingChange(entry)?.value}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded User Details */}
                                    {showUserDetails === entry.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-gray-dark"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-light">Player ID:</span>
                                                    <span className="ml-2 font-mono">{entry.id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-light">Last Activity:</span>
                                                    <span className="ml-2">{new Date(entry.lastGame).toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-light">Average Points:</span>
                                                    <span className="ml-2">{Math.round(entry.points / entry.gamesPlayed)} per game</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {leaderboardData.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaTrophy className="text-gray-light text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No players found</h3>
                            <p className="text-gray-light mb-6">
                                {searchTerm 
                                    ? 'Try adjusting your search'
                                    : 'No leaderboard data available at the moment'
                                }
                            </p>
                            <button
                                onClick={loadLeaderboardData}
                                className="px-6 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-medium transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
