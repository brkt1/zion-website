import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCalendar,
    FaChartLine,
    FaClock,
    FaDownload,
    FaEye,
    FaGamepad,
    FaHistory,
    FaSearch,
    FaStar,
    FaTrophy,
    FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';

interface GameSession {
    id: string;
    gameType: string;
    mode: 'solo' | 'multiplayer';
    score: number;
    maxScore: number;
    duration: number; // in seconds
    completedAt: string;
    players: number;
    rank?: number;
    totalPlayers?: number;
    isWinner: boolean;
    pointsEarned: number;
    cafeId?: string;
    cafeName?: string;
    eventId?: string;
    eventName?: string;
}

interface GameStats {
    totalGames: number;
    totalScore: number;
    averageScore: number;
    bestScore: number;
    totalPoints: number;
    winRate: number;
    totalTime: number;
    favoriteGame: string;
    recentPerformance: 'improving' | 'declining' | 'stable';
}

const GameHistory: React.FC = () => {
    const { user } = useAuth();
    const { currentSession } = useGame();
    const navigate = useNavigate();

    const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<GameSession[]>([]);
    const [stats, setStats] = useState<GameStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGameType, setSelectedGameType] = useState<string>('all');
    const [selectedMode, setSelectedMode] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'score' | 'duration' | 'points'>('recent');
    const [showDetails, setShowDetails] = useState<string | null>(null);

    const gameTypes = {
        emoji: { name: 'Emoji Game', icon: '🎯', color: 'from-blue-500 to-blue-700' },
        trivia: { name: 'Trivia Challenge', icon: '🧠', color: 'from-green-500 to-green-700' },
        truthOrDare: { name: 'Truth or Dare', icon: '💝', color: 'from-pink-500 to-pink-700' },
        rockPaperScissors: { name: 'Rock Paper Scissors', icon: '✂️', color: 'from-purple-500 to-purple-700' }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadGameHistory();
    }, [user, navigate]);

    useEffect(() => {
        filterAndSortHistory();
    }, [gameHistory, searchTerm, selectedGameType, selectedMode, selectedPeriod, sortBy]);

    const loadGameHistory = async () => {
        try {
            setIsLoading(true);
            // Mock data for demonstration
            const mockHistory: GameSession[] = [
                {
                    id: '1',
                    gameType: 'emoji',
                    mode: 'solo',
                    score: 850,
                    maxScore: 1000,
                    duration: 420,
                    completedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    players: 1,
                    isWinner: true,
                    pointsEarned: 85,
                    cafeId: 'cafe1',
                    cafeName: 'Coffee Corner'
                },
                {
                    id: '2',
                    gameType: 'trivia',
                    mode: 'multiplayer',
                    score: 1200,
                    maxScore: 1500,
                    duration: 600,
                    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    players: 4,
                    rank: 1,
                    totalPlayers: 4,
                    isWinner: true,
                    pointsEarned: 120,
                    cafeId: 'cafe2',
                    cafeName: 'Game Hub'
                },
                {
                    id: '3',
                    gameType: 'truthOrDare',
                    mode: 'multiplayer',
                    score: 750,
                    maxScore: 1000,
                    duration: 480,
                    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                    players: 6,
                    rank: 3,
                    totalPlayers: 6,
                    isWinner: false,
                    pointsEarned: 45,
                    cafeId: 'cafe1',
                    cafeName: 'Coffee Corner'
                },
                {
                    id: '4',
                    gameType: 'rockPaperScissors',
                    mode: 'solo',
                    score: 400,
                    maxScore: 500,
                    duration: 300,
                    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                    players: 1,
                    isWinner: false,
                    pointsEarned: 0,
                    cafeId: 'cafe3',
                    cafeName: 'Arcade Zone'
                },
                {
                    id: '5',
                    gameType: 'emoji',
                    mode: 'multiplayer',
                    score: 950,
                    maxScore: 1000,
                    duration: 540,
                    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
                    players: 3,
                    rank: 1,
                    totalPlayers: 3,
                    isWinner: true,
                    pointsEarned: 95,
                    eventId: 'event1',
                    eventName: 'Friday Game Night'
                }
            ];

            setGameHistory(mockHistory);
            calculateStats(mockHistory);
        } catch (error) {
            console.error('Error loading game history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (history: GameSession[]) => {
        if (history.length === 0) return;

        const totalGames = history.length;
        const totalScore = history.reduce((sum, game) => sum + game.score, 0);
        const averageScore = Math.round(totalScore / totalGames);
        const bestScore = Math.max(...history.map(game => game.score));
        const totalPoints = history.reduce((sum, game) => sum + game.pointsEarned, 0);
        const wins = history.filter(game => game.isWinner).length;
        const winRate = Math.round((wins / totalGames) * 100);
        const totalTime = history.reduce((sum, game) => sum + game.duration, 0);

        // Calculate favorite game
        const gameCounts = history.reduce((acc, game) => {
            acc[game.gameType] = (acc[game.gameType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const favoriteGame = Object.entries(gameCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

        // Calculate recent performance (last 5 games vs previous 5)
        const recentGames = history.slice(0, 5);
        const previousGames = history.slice(5, 10);
        let recentPerformance: 'improving' | 'declining' | 'stable' = 'stable';
        
        if (recentGames.length >= 3 && previousGames.length >= 3) {
            const recentAvg = recentGames.reduce((sum, game) => sum + game.score, 0) / recentGames.length;
            const previousAvg = previousGames.reduce((sum, game) => sum + game.score, 0) / previousGames.length;
            const diff = recentAvg - previousAvg;
            if (diff > 50) recentPerformance = 'improving';
            else if (diff < -50) recentPerformance = 'declining';
        }

        setStats({
            totalGames,
            totalScore,
            averageScore,
            bestScore,
            totalPoints,
            winRate,
            totalTime,
            favoriteGame,
            recentPerformance
        });
    };

    const filterAndSortHistory = () => {
        let filtered = gameHistory.filter(game => {
            const matchesSearch = game.gameType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (game.cafeName && game.cafeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (game.eventName && game.eventName.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesGameType = selectedGameType === 'all' || game.gameType === selectedGameType;
            const matchesMode = selectedMode === 'all' || game.mode === selectedMode;
            const matchesPeriod = selectedPeriod === 'all' || isWithinPeriod(game.completedAt, selectedPeriod);
            
            return matchesSearch && matchesGameType && matchesMode && matchesPeriod;
        });

        // Sort games
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
                case 'score':
                    return b.score - a.score;
                case 'duration':
                    return b.duration - a.duration;
                case 'points':
                    return b.pointsEarned - a.pointsEarned;
                default:
                    return 0;
            }
        });

        setFilteredHistory(filtered);
    };

    const isWithinPeriod = (date: string, period: string): boolean => {
        const gameDate = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - gameDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        switch (period) {
            case 'today': return diffDays === 0;
            case 'week': return diffDays <= 7;
            case 'month': return diffDays <= 30;
            case 'year': return diffDays <= 365;
            default: return true;
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    const getGameTypeIcon = (type: string) => {
        return gameTypes[type as keyof typeof gameTypes]?.icon || '🎮';
    };

    const getGameTypeName = (type: string) => {
        return gameTypes[type as keyof typeof gameTypes]?.name || 'Unknown Game';
    };

    const getGameTypeColor = (type: string) => {
        return gameTypes[type as keyof typeof gameTypes]?.color || 'from-gray-500 to-gray-700';
    };

    const getPerformanceColor = (performance: string) => {
        switch (performance) {
            case 'improving': return 'text-green-400';
            case 'declining': return 'text-red-400';
            case 'stable': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const exportHistory = () => {
        const csvContent = [
            ['Date', 'Game Type', 'Mode', 'Score', 'Max Score', 'Duration', 'Points Earned', 'Result', 'Location'],
            ...filteredHistory.map(game => [
                new Date(game.completedAt).toLocaleDateString(),
                getGameTypeName(game.gameType),
                game.mode,
                game.score.toString(),
                game.maxScore.toString(),
                formatDuration(game.duration),
                game.pointsEarned.toString(),
                game.isWinner ? 'Win' : 'Loss',
                game.cafeName || game.eventName || 'Unknown'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading game history...</p>
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
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Game History</h1>
                        <p className="text-xl text-gray-light">
                            Track your gaming journey and performance over time
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="px-6 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                        <FaGamepad className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Total Games</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalGames}</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                                        <FaTrophy className="text-black-primary text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Best Score</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.bestScore}</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                                        <FaStar className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Win Rate</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.winRate}%</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                        <FaChartLine className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Performance</span>
                                </div>
                                <div className={`text-lg font-bold ${getPerformanceColor(stats.recentPerformance)}`}>
                                    {stats.recentPerformance.charAt(0).toUpperCase() + stats.recentPerformance.slice(1)}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light" />
                                <input
                                    type="text"
                                    placeholder="Search games, cafes, events..."
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

                        {/* Mode Filter */}
                        <div>
                            <select
                                value={selectedMode}
                                onChange={(e) => setSelectedMode(e.target.value)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all">All Modes</option>
                                <option value="solo">Solo</option>
                                <option value="multiplayer">Multiplayer</option>
                            </select>
                        </div>

                        {/* Period Filter */}
                        <div>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="recent">Most Recent</option>
                                <option value="score">Highest Score</option>
                                <option value="duration">Longest Duration</option>
                                <option value="points">Most Points</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Button */}
            <div className="px-6 mb-6">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={exportHistory}
                        className="px-6 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-medium transition-colors flex items-center space-x-2"
                    >
                        <FaDownload />
                        <span>Export History (CSV)</span>
                    </button>
                </div>
            </div>

            {/* Game History List */}
            <div className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaHistory className="text-gray-light text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No games found</h3>
                            <p className="text-gray-light mb-6">
                                {searchTerm || selectedGameType !== 'all' || selectedMode !== 'all' || selectedPeriod !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Start playing games to see your history here!'
                                }
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
                            >
                                Play Games
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredHistory.map((game, index) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-black-secondary rounded-xl border border-gray-dark p-6 hover:border-gold-primary/50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Game Info */}
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${getGameTypeColor(game.gameType)} rounded-xl flex items-center justify-center`}>
                                                <span className="text-3xl">{getGameTypeIcon(game.gameType)}</span>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-lg font-bold mb-1">{getGameTypeName(game.gameType)}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-light">
                                                    <span className="flex items-center">
                                                        <FaUsers className="mr-1" />
                                                        {game.mode === 'multiplayer' ? `${game.players} players` : 'Solo'}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <FaClock className="mr-1" />
                                                        {formatDuration(game.duration)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <FaCalendar className="mr-1" />
                                                        {getTimeAgo(game.completedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score and Results */}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold mb-1">
                                                {game.score}/{game.maxScore}
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-light">Score</span>
                                                <span className={`text-sm font-medium ${game.isWinner ? 'text-green-400' : 'text-red-400'}`}>
                                                    {game.isWinner ? 'Winner!' : 'Loss'}
                                                </span>
                                            </div>
                                            {game.mode === 'multiplayer' && game.rank && (
                                                <div className="text-sm text-gray-light">
                                                    Rank: {game.rank}/{game.totalPlayers}
                                                </div>
                                            )}
                                        </div>

                                        {/* Points and Actions */}
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-gold-primary mb-2">
                                                +{game.pointsEarned} pts
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setShowDetails(showDetails === game.id ? null : game.id)}
                                                    className="px-3 py-1 bg-gray-dark text-white rounded text-sm hover:bg-gray-medium transition-colors"
                                                >
                                                    <FaEye className="inline mr-1" />
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Info */}
                                    <div className="mt-4 pt-4 border-t border-gray-dark">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-light">Location:</span>
                                            <span className="font-medium">
                                                {game.cafeName || game.eventName || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {showDetails === game.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-gray-dark"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-light">Game ID:</span>
                                                    <span className="ml-2 font-mono">{game.id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-light">Completion:</span>
                                                    <span className="ml-2">{new Date(game.completedAt).toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-light">Accuracy:</span>
                                                    <span className="ml-2">{Math.round((game.score / game.maxScore) * 100)}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameHistory;
