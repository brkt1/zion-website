import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaBell,
  FaChartLine,
  FaCog,
  FaCrown,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaGift,
  FaPlus,
  FaTrash,
  FaTrophy,
  FaUserCheck,
  FaUsers,
  FaUserTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

interface SuperAdminStats {
    totalUsers: number;
    totalAdmins: number;
    totalCafes: number;
    totalRewards: number;
    pendingApprovals: number;
    systemAlerts: number;
    activeEvents: number;
    totalRevenue: number;
}

interface UserRole {
    id: string;
    username: string;
    email: string;
    currentRole: string;
    requestedRole?: string;
    status: 'active' | 'suspended' | 'pending';
    lastActive: string;
    joinDate: string;
}

interface GlobalReward {
    id: string;
    name: string;
    description: string;
    pointsRequired: number;
    value: number;
    type: 'weekly' | 'monthly' | 'special';
    status: 'active' | 'inactive' | 'draft';
    startDate: string;
    endDate: string;
    participants: number;
}

const SuperAdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { getSuperAdminStats, getUsers, getGlobalRewards } = useAdmin();
    const navigate = useNavigate();

    const [stats, setStats] = useState<SuperAdminStats | null>(null);
    const [users, setUsers] = useState<UserRole[]>([]);
    const [rewards, setRewards] = useState<GlobalReward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'rewards' | 'system'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'super_admin') {
            navigate('/');
            return;
        }
        loadSuperAdminData();
    }, [user, navigate]);

    const loadSuperAdminData = async () => {
        try {
            setIsLoading(true);
            
            // Mock data for demonstration
            const mockStats: SuperAdminStats = {
                totalUsers: 15420,
                totalAdmins: 45,
                totalCafes: 128,
                totalRewards: 89,
                pendingApprovals: 23,
                systemAlerts: 5,
                activeEvents: 8,
                totalRevenue: 2847560
            };

            const mockUsers: UserRole[] = [
                {
                    id: '1',
                    username: 'admin_user1',
                    email: 'admin1@yenege.com',
                    currentRole: 'admin',
                    status: 'active',
                    lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
                },
                {
                    id: '2',
                    username: 'cafe_owner1',
                    email: 'cafe1@yenege.com',
                    currentRole: 'cafe_owner',
                    requestedRole: 'admin',
                    status: 'pending',
                    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
                },
                {
                    id: '3',
                    username: 'waiter_user1',
                    email: 'waiter1@yenege.com',
                    currentRole: 'waiter',
                    status: 'active',
                    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
                    joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
                }
            ];

            const mockRewards: GlobalReward[] = [
                {
                    id: '1',
                    name: 'Weekly Champion',
                    description: 'Top player of the week gets exclusive rewards',
                    pointsRequired: 1000,
                    value: 500,
                    type: 'weekly',
                    status: 'active',
                    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
                    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
                    participants: 1247
                },
                {
                    id: '2',
                    name: 'Monthly Master',
                    description: 'Monthly leaderboard winner gets premium package',
                    pointsRequired: 5000,
                    value: 2000,
                    type: 'monthly',
                    status: 'active',
                    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
                    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
                    participants: 892
                }
            ];

            setStats(mockStats);
            setUsers(mockUsers);
            setRewards(mockRewards);
        } catch (error) {
            console.error('Error loading super admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            // Mock role update
            setUsers(prev => prev.map(user => 
                user.id === userId 
                    ? { ...user, currentRole: newRole, requestedRole: undefined, status: 'active' }
                    : user
            ));
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleUserStatusToggle = async (userId: string) => {
        try {
            setUsers(prev => prev.map(user => 
                user.id === userId 
                    ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
                    : user
            ));
        } catch (error) {
            console.error('Error toggling user status:', error);
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
                    <p className="text-xl">Loading super admin dashboard...</p>
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
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                                <FaCrown className="text-black-primary text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Super Admin Dashboard
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
                            Manage users, rewards, and system-wide configurations
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
                                    <span className="text-sm text-gray-light">Total Users</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    {stats.totalAdmins} admins
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
                                    <span className="text-sm text-gray-light">Global Rewards</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalRewards}</div>
                                <div className="text-sm text-yellow-400 mt-2">
                                    {stats.pendingApprovals} pending
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
                                        <FaTrophy className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Active Events</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.activeEvents}</div>
                                <div className="text-sm text-blue-400 mt-2">
                                    {stats.totalCafes} cafes
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
                                        <FaChartLine className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Total Revenue</span>
                                </div>
                                <div className="text-3xl font-bold">ETB {stats.totalRevenue.toLocaleString()}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    System-wide
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
                            { id: 'users', label: 'User Management', icon: FaUsers },
                            { id: 'rewards', label: 'Global Rewards', icon: FaGift },
                            { id: 'system', label: 'System', icon: FaCog }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                                    selectedTab === tab.id
                                        ? 'bg-yellow-400 text-black-primary font-medium'
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
                                    <button className="p-4 bg-gradient-to-r from-green-500 to-green-700 rounded-lg text-white font-medium hover:from-green-600 hover:to-green-800 transition-all">
                                        <FaPlus className="inline mr-2" />
                                        Create Reward
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg text-white font-medium hover:from-blue-600 hover:to-blue-800 transition-all">
                                        <FaUsers className="inline mr-2" />
                                        Manage Users
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg text-white font-medium hover:from-purple-600 hover:to-purple-800 transition-all">
                                        <FaCog className="inline mr-2" />
                                        System Settings
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg text-white font-medium hover:from-orange-600 hover:to-orange-800 transition-all">
                                        <FaBell className="inline mr-2" />
                                        View Alerts
                                    </button>
                                </div>
                            </div>

                            {/* System Alerts */}
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-6">System Alerts</h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <FaExclamationTriangle className="text-red-400" />
                                            <span className="text-sm">High memory usage on server-01</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <FaBell className="text-yellow-400" />
                                            <span className="text-sm">23 pending reward approvals</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <FaUsers className="text-blue-400" />
                                            <span className="text-sm">5 new admin role requests</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'users' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">User Management</h3>
                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-4 py-2 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                    />
                                    <button className="px-4 py-2 bg-yellow-400 text-black-primary rounded-lg hover:bg-yellow-500 transition-colors">
                                        <FaPlus className="inline mr-2" />
                                        Add User
                                    </button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black-primary">
                                        <tr>
                                            <th className="px-4 py-3 text-left">User</th>
                                            <th className="px-4 py-3 text-left">Current Role</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Last Active</th>
                                            <th className="px-4 py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-dark">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-black-primary/50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <div className="font-medium">{user.username}</div>
                                                        <div className="text-sm text-gray-light">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-gray-dark rounded text-sm">
                                                        {user.currentRole}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-sm ${
                                                        user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                        user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-light">
                                                    {getTimeAgo(user.lastActive)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex space-x-2">
                                                        <button className="text-blue-400 hover:text-blue-300">
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUserStatusToggle(user.id)}
                                                            className="text-yellow-400 hover:text-yellow-300"
                                                        >
                                                            {user.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'rewards' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Global Rewards</h3>
                                <button className="px-4 py-2 bg-yellow-400 text-black-primary rounded-lg hover:bg-yellow-500 transition-colors">
                                    <FaPlus className="inline mr-2" />
                                    Create Reward
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rewards.map((reward) => (
                                    <div key={reward.id} className="bg-black-primary rounded-lg p-4 border border-gray-dark">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold">{reward.name}</h4>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                reward.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                reward.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {reward.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-light mb-3">{reward.description}</p>
                                        <div className="space-y-2 text-sm">
                                            <div>Points Required: {reward.pointsRequired}</div>
                                            <div>Value: ETB {reward.value}</div>
                                            <div>Type: {reward.type}</div>
                                            <div>Participants: {reward.participants}</div>
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

                    {selectedTab === 'system' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">System Configuration</h3>
                                <button className="px-4 py-2 bg-yellow-400 text-black-primary rounded-lg hover:bg-yellow-500 transition-colors">
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

export default SuperAdminDashboard;
