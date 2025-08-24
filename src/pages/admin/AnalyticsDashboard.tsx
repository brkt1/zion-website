import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaChartLine,
    FaCog,
    FaDownload,
    FaGamepad,
    FaGift,
    FaTrendingDown,
    FaTrendingUp,
    FaTrophy,
    FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticsData {
    overview: {
        totalUsers: number;
        activeUsers: number;
        totalGames: number;
        totalRevenue: number;
        userGrowth: number;
        revenueGrowth: number;
    };
    userStats: {
        registrations: { date: string; count: number }[];
        activeUsers: { date: string; count: number }[];
        userTypes: { type: string; count: number }[];
        topLocations: { location: string; users: number }[];
    };
    gameStats: {
        gameTypes: { type: string; plays: number; revenue: number }[];
        dailyPlays: { date: string; count: number }[];
        peakHours: { hour: number; plays: number }[];
        completionRates: { type: string; rate: number }[];
    };
    revenueStats: {
        dailyRevenue: { date: string; amount: number }[];
        paymentMethods: { method: string; count: number; amount: number }[];
        topEarners: { user: string; amount: number; games: number }[];
        monthlyTrends: { month: string; revenue: number; growth: number }[];
    };
    performance: {
        systemUptime: number;
        averageResponseTime: number;
        errorRate: number;
        activeConnections: number;
        serverLoad: { server: string; cpu: number; memory: number; status: string }[];
    };
}

const AnalyticsDashboard: React.FC = () => {
    const { user } = useAuth();
    const { getAnalyticsData } = useAdmin();
    const navigate = useNavigate();

    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [selectedMetric, setSelectedMetric] = useState<'users' | 'games' | 'revenue' | 'performance'>('users');

    useEffect(() => {
        if (!user || !['admin', 'super_admin'].includes(user.role)) {
            navigate('/');
            return;
        }
        loadAnalyticsData();
    }, [user, navigate, selectedPeriod]);

    const loadAnalyticsData = async () => {
        try {
            setIsLoading(true);
            
            // Mock analytics data
            const mockData: AnalyticsData = {
                overview: {
                    totalUsers: 15420,
                    activeUsers: 2847,
                    totalGames: 45678,
                    totalRevenue: 2847560,
                    userGrowth: 12.5,
                    revenueGrowth: 8.3
                },
                userStats: {
                    registrations: generateMockTimeSeriesData(30, 50, 150),
                    activeUsers: generateMockTimeSeriesData(30, 2000, 3000),
                    userTypes: [
                        { type: 'Players', count: 12450 },
                        { type: 'Waiters', count: 156 },
                        { type: 'Cafe Owners', count: 89 },
                        { type: 'Admins', count: 45 },
                        { type: 'Super Admins', count: 12 }
                    ],
                    topLocations: [
                        { location: 'Addis Ababa', users: 8234 },
                        { location: 'Dire Dawa', users: 2156 },
                        { location: 'Bahir Dar', users: 1890 },
                        { location: 'Mekelle', users: 1654 },
                        { location: 'Hawassa', users: 1486 }
                    ]
                },
                gameStats: {
                    gameTypes: [
                        { type: 'Emoji Game', plays: 15678, revenue: 784000 },
                        { type: 'Trivia', plays: 12345, revenue: 617250 },
                        { type: 'Truth or Dare', plays: 9876, revenue: 493800 },
                        { type: 'Rock Paper Scissors', plays: 7779, revenue: 388950 }
                    ],
                    dailyPlays: generateMockTimeSeriesData(30, 1000, 2000),
                    peakHours: Array.from({ length: 24 }, (_, i) => ({
                        hour: i,
                        plays: Math.floor(Math.random() * 500) + 100
                    })),
                    completionRates: [
                        { type: 'Emoji Game', rate: 87.5 },
                        { type: 'Trivia', rate: 92.3 },
                        { type: 'Truth or Dare', rate: 78.9 },
                        { type: 'Rock Paper Scissors', rate: 95.1 }
                    ]
                },
                revenueStats: {
                    dailyRevenue: generateMockTimeSeriesData(30, 50000, 120000),
                    paymentMethods: [
                        { method: 'Telebirr', count: 15678, amount: 784000 },
                        { method: 'CBE Birr', count: 9876, amount: 493800 },
                        { method: 'Card', count: 12345, amount: 617250 },
                        { method: 'Wallet', count: 7779, amount: 388950 }
                    ],
                    topEarners: [
                        { user: 'Player123', amount: 12500, games: 156 },
                        { user: 'GameMaster', amount: 11800, games: 142 },
                        { user: 'CoffeeLover', amount: 10900, games: 128 },
                        { user: 'PuzzleSolver', amount: 9800, games: 115 }
                    ],
                    monthlyTrends: [
                        { month: 'Jan', revenue: 245000, growth: 0 },
                        { month: 'Feb', revenue: 267000, growth: 9.0 },
                        { month: 'Mar', revenue: 289000, growth: 8.2 },
                        { month: 'Apr', revenue: 312000, growth: 8.0 },
                        { month: 'May', revenue: 298000, growth: -4.5 },
                        { month: 'Jun', revenue: 325000, growth: 9.1 }
                    ]
                },
                performance: {
                    systemUptime: 99.87,
                    averageResponseTime: 245,
                    errorRate: 0.13,
                    activeConnections: 1247,
                    serverLoad: [
                        { server: 'Server-01', cpu: 67, memory: 78, status: 'healthy' },
                        { server: 'Server-02', cpu: 45, memory: 62, status: 'healthy' },
                        { server: 'Server-03', cpu: 89, memory: 91, status: 'warning' },
                        { server: 'Server-04', cpu: 34, memory: 48, status: 'healthy' }
                    ]
                }
            };

            setAnalyticsData(mockData);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockTimeSeriesData = (days: number, min: number, max: number) => {
        return Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * (max - min + 1)) + min
        }));
    };

    const getGrowthColor = (growth: number) => {
        return growth >= 0 ? 'text-green-400' : 'text-red-400';
    };

    const getGrowthIcon = (growth: number) => {
        return growth >= 0 ? <FaTrendingUp /> : <FaTrendingDown />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-400';
            case 'warning': return 'text-yellow-400';
            case 'critical': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const exportData = (type: string) => {
        // Mock export functionality
        const data = analyticsData ? JSON.stringify(analyticsData, null, 2) : '';
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yenege-analytics-${type}-${selectedPeriod}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl">No analytics data available</p>
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
                            onClick={() => navigate('/admin')}
                            className="flex items-center text-gray-light hover:text-white transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Admin
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                <FaChartLine className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                                Analytics Dashboard
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">System Analytics</h1>
                        <p className="text-xl text-gray-light">
                            Comprehensive insights into platform performance and user behavior
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                            <div className="flex space-x-2">
                                {['7d', '30d', '90d', '1y'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period as any)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${
                                            selectedPeriod === period
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-black-primary text-gray-light hover:text-white'
                                        }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => exportData('overview')}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <FaDownload className="inline mr-2" />
                                    Export Data
                                </button>
                                <button className="px-4 py-2 bg-gray-dark text-white rounded-lg hover:bg-gray-600 transition-colors">
                                    <FaCog className="inline mr-2" />
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
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
                                    <FaUsers className="text-white text-xl" />
                                </div>
                                <span className="text-sm text-gray-light">Total Users</span>
                            </div>
                            <div className="text-3xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
                            <div className={`flex items-center text-sm mt-2 ${getGrowthColor(analyticsData.overview.userGrowth)}`}>
                                {getGrowthIcon(analyticsData.overview.userGrowth)}
                                <span className="ml-1">{analyticsData.overview.userGrowth}%</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                                    <FaGamepad className="text-white text-xl" />
                                </div>
                                <span className="text-sm text-gray-light">Games Played</span>
                            </div>
                            <div className="text-3xl font-bold">{analyticsData.overview.totalGames.toLocaleString()}</div>
                            <div className="text-sm text-gray-light mt-2">
                                {analyticsData.overview.activeUsers.toLocaleString()} active users
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                                    <FaGift className="text-black-primary text-xl" />
                                </div>
                                <span className="text-sm text-gray-light">Total Revenue</span>
                            </div>
                            <div className="text-3xl font-bold">ETB {analyticsData.overview.totalRevenue.toLocaleString()}</div>
                            <div className={`flex items-center text-sm mt-2 ${getGrowthColor(analyticsData.overview.revenueGrowth)}`}>
                                {getGrowthIcon(analyticsData.overview.revenueGrowth)}
                                <span className="ml-1">{analyticsData.overview.revenueGrowth}%</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                    <FaTrophy className="text-white text-xl" />
                                </div>
                                <span className="text-sm text-gray-light">System Uptime</span>
                            </div>
                            <div className="text-3xl font-bold">{analyticsData.performance.systemUptime}%</div>
                            <div className="text-sm text-green-400 mt-2">
                                Excellent performance
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-1 bg-black-secondary rounded-lg p-1">
                        {[
                            { id: 'users', label: 'Users', icon: FaUsers },
                            { id: 'games', label: 'Games', icon: FaGamepad },
                            { id: 'revenue', label: 'Revenue', icon: FaGift },
                            { id: 'performance', label: 'Performance', icon: FaChartLine }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedMetric(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                                    selectedMetric === tab.id
                                        ? 'bg-blue-500 text-white font-medium'
                                        : 'text-gray-light hover:text-white hover:bg-gray-dark'
                                }`}
                            >
                                <tab.icon />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    {selectedMetric === 'users' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">User Registrations</h3>
                                <div className="space-y-2">
                                    {analyticsData.userStats.registrations.slice(-7).map((item) => (
                                        <div key={item.date} className="flex items-center justify-between p-3 bg-black-primary rounded-lg">
                                            <span className="text-sm">{item.date}</span>
                                            <span className="font-medium">{item.count} users</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">User Types Distribution</h3>
                                <div className="space-y-3">
                                    {analyticsData.userStats.userTypes.map((type) => (
                                        <div key={type.type} className="flex items-center justify-between">
                                            <span className="text-sm">{type.type}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-24 bg-gray-dark rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${(type.count / analyticsData.overview.totalUsers) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{type.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMetric === 'games' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">Game Performance</h3>
                                <div className="space-y-4">
                                    {analyticsData.gameStats.gameTypes.map((game) => (
                                        <div key={game.type} className="p-4 bg-black-primary rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{game.type}</h4>
                                                <span className="text-gold-primary font-bold">
                                                    ETB {game.revenue.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-light">
                                                {game.plays.toLocaleString()} plays
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">Completion Rates</h3>
                                <div className="space-y-3">
                                    {analyticsData.gameStats.completionRates.map((game) => (
                                        <div key={game.type} className="flex items-center justify-between">
                                            <span className="text-sm">{game.type}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-24 bg-gray-dark rounded-full h-2">
                                                    <div 
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${game.rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{game.rate}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMetric === 'revenue' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">Payment Methods</h3>
                                <div className="space-y-4">
                                    {analyticsData.revenueStats.paymentMethods.map((method) => (
                                        <div key={method.method} className="p-4 bg-black-primary rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{method.method}</h4>
                                                <span className="text-gold-primary font-bold">
                                                    ETB {method.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-light">
                                                {method.count.toLocaleString()} transactions
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">Top Earners</h3>
                                <div className="space-y-3">
                                    {analyticsData.revenueStats.topEarners.map((user, index) => (
                                        <div key={user.user} className="flex items-center justify-between p-3 bg-black-primary rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-gold-primary font-bold">#{index + 1}</span>
                                                <span className="font-medium">{user.user}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gold-primary">
                                                    ETB {user.amount.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-light">
                                                    {user.games} games
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMetric === 'performance' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">System Health</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm">Uptime</span>
                                            <span className="font-bold text-green-400">
                                                {analyticsData.performance.systemUptime}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm">Response Time</span>
                                            <span className="font-bold text-blue-400">
                                                {analyticsData.performance.averageResponseTime}ms
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm">Error Rate</span>
                                            <span className="font-bold text-red-400">
                                                {analyticsData.performance.errorRate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-4">Server Status</h3>
                                <div className="space-y-3">
                                    {analyticsData.performance.serverLoad.map((server) => (
                                        <div key={server.server} className="p-3 bg-black-primary rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{server.server}</span>
                                                <span className={`text-sm ${getStatusColor(server.status)}`}>
                                                    {server.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-light">CPU:</span>
                                                    <span className="ml-2">{server.cpu}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-light">Memory:</span>
                                                    <span className="ml-2">{server.memory}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
