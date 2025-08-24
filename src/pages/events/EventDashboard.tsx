import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendar,
  FaClock,
  FaCog,
  FaEye,
  FaPlus,
  FaQrcode,
  FaTablet,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';

interface EventStats {
    totalEvents: number;
    activeEvents: number;
    totalParticipants: number;
    totalTablets: number;
    activeTablets: number;
    upcomingEvents: number;
}

const EventDashboard: React.FC = () => {
    const { user } = useAuth();
    const { getEventStats, getActiveEvents, getUpcomingEvents } = useEvent();
    const navigate = useNavigate();

    const [stats, setStats] = useState<EventStats | null>(null);
    const [activeEvents, setActiveEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'events' | 'tablets' | 'participants'>('overview');

    useEffect(() => {
        if (!user || user.role !== 'game_night_admin') {
            navigate('/');
            return;
        }
        loadEventData();
    }, [user, navigate]);

    const loadEventData = async () => {
        try {
            setIsLoading(true);
            
            // Mock data for demonstration
            const mockStats: EventStats = {
                totalEvents: 24,
                activeEvents: 2,
                totalParticipants: 156,
                totalTablets: 12,
                activeTablets: 8,
                upcomingEvents: 3
            };

            setStats(mockStats);
            setActiveEvents([]);
            setUpcomingEvents([]);
        } catch (error) {
            console.error('Error loading event data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading event dashboard...</p>
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
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                                <FaCalendar className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
                                Event Dashboard
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Game Night Management</h1>
                        <p className="text-xl text-gray-light">
                            Manage events, tablet stations, and participant tracking
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
                                        <FaCalendar className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Total Events</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalEvents}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    {stats.activeEvents} active
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
                                        <FaUsers className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Participants</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalParticipants}</div>
                                <div className="text-sm text-blue-400 mt-2">
                                    Across all events
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
                                        <FaTablet className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Tablets</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.totalTablets}</div>
                                <div className="text-sm text-yellow-400 mt-2">
                                    {stats.activeTablets} active
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
                                        <FaClock className="text-white text-xl" />
                                    </div>
                                    <span className="text-sm text-gray-light">Upcoming</span>
                                </div>
                                <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
                                <div className="text-sm text-green-400 mt-2">
                                    Scheduled events
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
                            { id: 'events', label: 'Events', icon: FaCalendar },
                            { id: 'tablets', label: 'Tablets', icon: FaTablet },
                            { id: 'participants', label: 'Participants', icon: FaUsers }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                                    selectedTab === tab.id
                                        ? 'bg-purple-500 text-white font-medium'
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
                                        Create Event
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg text-white font-medium hover:from-blue-600 hover:to-blue-800 transition-all">
                                        <FaTablet className="inline mr-2" />
                                        Setup Tablets
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg text-white font-medium hover:from-purple-600 hover:to-purple-800 transition-all">
                                        <FaQrcode className="inline mr-2" />
                                        Generate QR
                                    </button>
                                    <button className="p-4 bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg text-white font-medium hover:from-orange-600 hover:to-orange-800 transition-all">
                                        <FaCog className="inline mr-2" />
                                        Settings
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                                <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Event "Friday Night Games" started</span>
                                            <span className="text-xs text-gray-light">2h ago</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Tablet Station 3 activated</span>
                                            <span className="text-xs text-gray-light">1h ago</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-black-primary rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">New participant joined: Player123</span>
                                            <span className="text-xs text-gray-light">30m ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'events' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Event Management</h3>
                                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                    <FaPlus className="inline mr-2" />
                                    Create Event
                                </button>
                            </div>
                            <p className="text-gray-light">Event management interface coming soon...</p>
                        </div>
                    )}

                    {selectedTab === 'tablets' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Tablet Management</h3>
                                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                    <FaPlus className="inline mr-2" />
                                    Add Tablet
                                </button>
                            </div>
                            <p className="text-gray-light">Tablet management interface coming soon...</p>
                        </div>
                    )}

                    {selectedTab === 'participants' && (
                        <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Participant Management</h3>
                                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                    <FaEye className="inline mr-2" />
                                    View All
                                </button>
                            </div>
                            <p className="text-gray-light">Participant management interface coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDashboard;
