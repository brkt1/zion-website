import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaEye,
  FaGift,
  FaPlus,
  FaQrcode,
  FaStore,
  FaTrash,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

interface CafeStats {
    totalCustomers: number;
    totalRewards: number;
    activeRewards: number;
    pendingApprovals: number;
    totalRevenue: number;
    monthlyVisitors: number;
    averageRating: number;
}

interface CafeReward {
    id: string;
    name: string;
    description: string;
    pointsRequired: number;
    value: number;
    status: 'active' | 'pending' | 'rejected' | 'draft';
    category: string;
    createdAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
}

interface Customer {
    id: string;
    username: string;
    email: string;
    points: number;
    visits: number;
    lastVisit: string;
    favoriteReward?: string;
}

const CafeOwnerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { getCafeStats, getCafeRewards, getCafeCustomers } = useAdmin();
    const navigate = useNavigate();

    const [stats, setStats] = useState<CafeStats | null>(null);
    const [rewards, setRewards] = useState<CafeReward[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'rewards' | 'customers' | 'analytics'>('overview');
    const [showCreateReward, setShowCreateReward] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'cafe_owner') {
            navigate('/');
            return;
        }
        loadCafeData();
    }, [user, navigate]);

    const loadCafeData = async () => {
        try {
            setIsLoading(true);
            
            // Mock data for demonstration
            const mockStats: CafeStats = {
                totalCustomers: 1247,
                totalRewards: 15,
                activeRewards: 12,
                pendingApprovals: 3,
                totalRevenue: 156780,
                monthlyVisitors: 89,
                averageRating: 4.6
            };

            const mockRewards: CafeReward[] = [
                {
                    id: '1',
                    name: 'Free Coffee',
                    description: 'Get a free coffee of your choice',
                    pointsRequired: 100,
                    value: 25,
                    status: 'active',
                    category: 'Beverages',
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
                    approvedBy: 'admin_user1',
                    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
                },
                {
                    id: '2',
                    name: '50% Off Dessert',
                    description: 'Half price on any dessert item',
                    pointsRequired: 200,
                    value: 50,
                    status: 'pending',
                    category: 'Desserts',
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
                },
                {
                    id: '3',
                    name: 'Free Appetizer',
                    description: 'Complimentary appetizer with main course',
                    pointsRequired: 300,
                    value: 75,
                    status: 'active',
                    category: 'Food',
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
                    approvedBy: 'admin_user1',
                    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString()
                }
            ];

            const mockCustomers: Customer[] = [
                {
                    id: '1',
                    username: 'Player123',
                    email: 'player123@email.com',
                    points: 450,
                    visits: 12,
                    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                    favoriteReward: 'Free Coffee'
                },
                {
                    id: '2',
                    username: 'GameMaster',
                    email: 'gamemaster@email.com',
                    points: 890,
                    visits: 8,
                    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                    favoriteReward: 'Free Appetizer'
                },
                {
                    id: '3',
                    username: 'CoffeeLover',
                    email: 'coffee@email.com',
                    points: 1250,
                    visits: 25,
                    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
                    favoriteReward: 'Free Coffee'
                }
            ];

            setStats(mockStats);
            setRewards(mockRewards);
            setCustomers(mockCustomers);
        } catch (error) {
            console.error('Error loading cafe data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'draft': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <FaCheckCircle />;
            case 'pending': return <FaClock />;
            case 'rejected': return <FaTimes />;
            case 'draft': return <FaEdit />;
            default: return <FaClock />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading cafe dashboard...</p>
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
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                                <FaStore className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                                Cafe Owner Dashboard
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Cafe Management</h1>
                        <p className="text-xl text-gray-light">
                            Manage your cafe rewards, customers, and business analytics
                        </p>
                    </div>
                </div>
            </div>

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
                                    <span className="text-sm text-gray-light">Total Customers</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    {stats.monthlyVisitors} this month
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
                                        <FaGift className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Rewards</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalRewards}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    {stats.activeRewards} active
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
                                        <FaChartLine className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Revenue</span>
                                </div>
                                <div className="text-3xl font-bold">ETB {stats.totalRevenue.toLocaleString()}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    Total earnings
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                                        <FaQrcode className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Rating</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.averageRating}/5.0</div>
                                <div className="text-sm text-green-400 mt-2">
                                    Customer satisfaction
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
                            { id: 'overview', label: 'Overview', icon: FaEye },
                            { id: 'rewards', label: 'Rewards', icon: FaGift },
                            { id: 'customers', label: 'Customers', icon: FaUsers },
                            { id: 'analytics', label: 'Analytics', icon: FaChartLine }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                                    selectedTab === tab.id
                                        ? 'bg-green-500 text-white font-medium'
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
                            {/* Quick Actions */}
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setShowCreateReward(true)}
                                        className="p-4 bg-gradient-to-r from-green-500 to-green-700 rounded-lg text-white font-medium hover:from-green-600 hover:to-green-800 transition-all"
                                    >
                                        <FaPlus className="inline mr-2" />
                                        Create Reward
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg text-white font-medium hover:from-blue-600 hover:to-blue-800 transition-all">
                                        <FaQrcode className="inline mr-2" />
                                        Generate QR
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg text-white font-medium hover:from-purple-600 hover:to-purple-800 transition-all">
                                        <FaUsers className="inline mr-2" />
                                        View Customers
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg text-white font-medium hover:from-orange-600 hover:to-orange-800 transition-all">
                                        <FaChartLine className="inline mr-2" />
                                        View Analytics
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">New reward "50% Off Dessert" created</span>
                                            <span className="text-xs text-gray-light">2d ago</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Customer Player123 redeemed "Free Coffee"</span>
                                            <span className="text-xs text-gray-light">1d ago</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">New customer GameMaster joined</span>
                                            <span className="text-xs text-gray-light">3d ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'rewards' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Cafe Rewards</h3>
                                <button 
                                    onClick={() => setShowCreateReward(true)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <FaPlus className="inline mr-2" />
                                    Create Reward
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rewards.map((reward) => (
                                    <div key={reward.id} className="bg-black-primary rounded-lg p-4 border border-gray-dark">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold">{reward.name}</h4>
                                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(reward.status)}`}>
                                                {getStatusIcon(reward.status)}
                                                <span className="ml-1 capitalize">{reward.status}</span>
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-light mb-3">{reward.description}</p>
                                        <div className="space-y-2 text-sm">
                                            <div>Points Required: {reward.pointsRequired}</div>
                                            <div>Value: ETB {reward.value}</div>
                                            <div>Category: {reward.category}</div>
                                            <div>Created: {formatDate(reward.createdAt)}</div>
                                        </div>
                                        <div className="flex space-x-2 mt-4">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                <FaEdit className="inline mr-1" />
                                                Edit
                                            </button>
                                            <button className="text-red-400 hover:text-red-300 text-sm">
                                                <FaTrash className="inline mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'customers' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Customer Management</h3>
                                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                    <FaEye className="inline mr-2" />
                                    View All
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black-primary">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Customer</th>
                                            <th className="px-4 py-3 text-left">Points</th>
                                            <th className="px-4 py-3 text-left">Visits</th>
                                            <th className="px-4 py-3 text-left">Last Visit</th>
                                            <th className="px-4 py-3 text-left">Favorite</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-dark">
                                        {customers.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-black-primary/50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <div className="font-medium">{customer.username}</div>
                                                        <div className="text-sm text-gray-light">{customer.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-lg text-gold-primary">
                                                        {customer.points}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                                                        {customer.visits}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-light">
                                                    {formatDate(customer.lastVisit)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-light">
                                                        {customer.favoriteReward || 'None'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'analytics' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Business Analytics</h3>
                                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                    <FaChartLine className="inline mr-2" />
                                    Export Report
                                </button>
                            </div>
                            <p className="text-gray-light">Analytics dashboard coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CafeOwnerDashboard;
