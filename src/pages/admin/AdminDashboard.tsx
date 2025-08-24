import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaDatabase,
  FaExclamationTriangle,
  FaGamepad,
  FaGift,
  FaPlus,
  FaServer,
  FaShieldAlt,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    totalGames: number;
    totalPoints: number;
    totalRewards: number;
    pendingRewards: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    lastBackup: string;
    uptime: string;
}

interface RecentActivity {
    id: string;
    type: 'user_registration' | 'game_completed' | 'reward_created' | 'admin_action' | 'system_alert';
    description: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    username?: string;
}

interface SystemAlert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    timestamp: string;
    isResolved: boolean;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { getSystemStats, getRecentActivity, getSystemAlerts } = useAdmin();
    const navigate = useNavigate();

    const [stats, setStats] = useState<SystemStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'games' | 'rewards' | 'system'>('overview');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadDashboardData();
    }, [user, navigate]);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            
            // Mock data for demonstration
            const mockStats: SystemStats = {
                totalUsers: 15420,
                activeUsers: 2847,
                totalGames: 45678,
                totalPoints: 2847560,
                totalRewards: 156,
                pendingRewards: 23,
                systemHealth: 'excellent',
                lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                uptime: '99.98%'
            };

            const mockActivity: RecentActivity[] = [
                {
                    id: '1',
                    type: 'user_registration',
                    description: 'New user registered: Player123',
                    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                    severity: 'low',
                    userId: 'user1',
                    username: 'Player123'
                },
                {
                    id: '2',
                    type: 'game_completed',
                    description: 'High score achieved: 980 points in Emoji Game',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                    severity: 'low',
                    userId: 'user2',
                    username: 'GameMaster'
                },
                {
                    id: '3',
                    type: 'reward_created',
                    description: 'New café reward created: Free Coffee',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    severity: 'medium'
                },
                {
                    id: '4',
                    type: 'admin_action',
                    description: 'User role updated: Player456 → Waiter',
                    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                    severity: 'medium',
                    userId: 'user3',
                    username: 'Player456'
                },
                {
                    id: '5',
                    type: 'system_alert',
                    description: 'Database backup completed successfully',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                    severity: 'low'
                }
            ];

            const mockAlerts: SystemAlert[] = [
                {
                    id: '1',
                    type: 'warning',
                    message: 'High memory usage detected on server-01',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    isResolved: false
                },
                {
                    id: '2',
                    type: 'info',
                    message: 'Scheduled maintenance in 2 hours',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                    isResolved: false
                },
                {
                    id: '3',
                    type: 'success',
                    message: 'All systems operating normally',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    isResolved: true
                }
            ];

            setStats(mockStats);
            setRecentActivity(mockActivity);
            setSystemAlerts(mockAlerts);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-400';
            case 'good': return 'text-blue-400';
            case 'warning': return 'text-yellow-400';
            case 'critical': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'excellent': return '🟢';
            case 'good': return '🔵';
            case 'warning': return '🟡';
            case 'critical': return '🔴';
            default: return '⚪';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_registration': return '👤';
            case 'game_completed': return '🎮';
            case 'reward_created': return '🎁';
            case 'admin_action': return '⚙️';
            case 'system_alert': return '🔔';
            default: return '📝';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'text-green-400';
            case 'medium': return 'text-yellow-400';
            case 'high': return 'text-orange-400';
            case 'critical': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getAlertTypeColor = (type: string) => {
        switch (type) {
            case 'warning': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            case 'info': return 'text-blue-400';
            case 'success': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const getTimeAgo = (date: string): string => {
        const now = new Date();
        const activityDate = new Date(date);
        const diffMs = now.getTime() - activityDate.getTime();
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
                    <p className="text-xl">Loading admin dashboard...</p>
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
                            onClick={() => navigate('/')}
                            className="flex items-center text-gray-light hover:text-white transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Home
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                                <FaShieldAlt className="text-black-primary text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                                Admin Dashboard
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">System Administration</h1>
                        <p className="text-xl text-gray-light">
                            Monitor and manage the Yenege Game App platform
                        </p>
                    </div>
                </div>
            </div>

            {/* System Health Overview */}
            {stats && (
                <div className="px-6 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-gradient-to-r from-gold-primary to-gold-secondary rounded-xl p-6 text-black-primary">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-black-primary rounded-full flex items-center justify-center">
                                        <FaServer className="text-gold-primary text-3xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">System Status</h2>
                                        <p className="text-black-primary/80">Overall platform health</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold flex items-center">
                                        {getHealthIcon(stats.systemHealth)}
                                        <span className="ml-2">{stats.uptime}</span>
                                    </div>
                                    <div className="text-black-primary/80">Uptime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
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
                                        <FaUsers className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Total Users</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    +{stats.activeUsers.toLocaleString()} active
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
                                <div className="text-3xl font-bold">{stats.totalGames.toLocaleString()}</div>
                                <div className="text-sm text-blue-400 mt-2">
                                    {stats.totalPoints.toLocaleString()} points
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                        <FaGift className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Rewards</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalRewards}</div>
                                <div className="text-sm text-yellow-400 mt-2">
                                    {stats.pendingRewards} pending
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
                                        <FaDatabase className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Last Backup</span>
                                </div>
                                <div className="text-3xl font-bold">{getTimeAgo(stats.lastBackup)}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    Backup successful
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-1 bg-black-secondary rounded-lg p-1">
                        {[
                            { id: 'overview', label: 'Overview', icon: FaChartLine },
                            { id: 'users', label: 'Users', icon: FaUsers },
                            { id: 'games', label: 'Games', icon: FaGamepad },
                            { id: 'rewards', label: 'Rewards', icon: FaGift },
                            { id: 'system', label: 'System', icon: FaCog }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                                    selectedTab === tab.id
                                        ? 'bg-gold-primary text-black-primary font-medium'
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
                    {selectedTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Activity */}
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">Recent Activity</h3>
                                    <button className="text-gold-primary hover:text-gold-secondary transition-colors">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivity.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-black-primary rounded-lg">
                                            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                                            <div className="flex-1">
                                                <p className="text-sm">{activity.description}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`text-xs ${getSeverityColor(activity.severity)}`}>
                                                        {activity.severity}
                                                    </span>
                                                    <span className="text-xs text-gray-light">
                                                        {getTimeAgo(activity.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* System Alerts */}
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">System Alerts</h3>
                                    <button className="text-gold-primary hover:text-gold-secondary transition-colors">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {systemAlerts.map((alert) => (
                                        <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                                            alert.isResolved ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                                        }`}>
                                            <div className={`text-xl ${getAlertTypeColor(alert.type)}`}>
                                                {alert.isResolved ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{alert.message}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`text-xs ${getAlertTypeColor(alert.type)}`}>
                                                        {alert.type}
                                                    </span>
                                                    <span className="text-xs text-gray-light">
                                                        {getTimeAgo(alert.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'users' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">User Management</h3>
                                <button className="px-4 py-2 bg-gold-primary text-black-primary rounded-lg hover:bg-gold-secondary transition-colors">
                                    <FaPlus className="inline mr-2" />
                                    Add User
                                </button>
                            </div>
                            <p className="text-gray-light">User management interface coming soon...</p>
                        </div>
                    )}

                    {selectedTab === 'games' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Game Management</h3>
                                <button className="px-4 py-2 bg-gold-primary text-black-primary rounded-lg hover:bg-gold-secondary transition-colors">
                                    <FaPlus className="inline mr-2" />
                                    Add Game
                                </button>
                            </div>
                            <p className="text-gray-light">Game management interface coming soon...</p>
                        </div>
                    )}

                    {selectedTab === 'rewards' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Reward Management</h3>
                                <button className="px-4 py-2 bg-gold-primary text-black-primary rounded-lg hover:bg-gold-secondary transition-colors">
                                    <FaPlus className="inline mr-2" />
                                    Create Reward
                                </button>
                            </div>
                            <p className="text-gray-light">Reward management interface coming soon...</p>
                        </div>
                    )}

                    {selectedTab === 'system' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">System Settings</h3>
                                <button className="px-4 py-2 bg-gold-primary text-black-primary rounded-lg hover:bg-gold-secondary transition-colors">
                                    <FaCog className="inline mr-2" />
                                    Configure
                                </button>
                            </div>
                            <p className="text-gray-light">System configuration interface coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
