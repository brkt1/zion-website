import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCalendar,
    FaCoins,
    FaEye,
    FaGamepad,
    FaGift,
    FaHistory,
    FaMapMarkerAlt,
    FaSearch
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useReward } from '../../contexts/RewardContext';

interface Reward {
    id: string;
    name: string;
    description: string;
    type: 'cafe' | 'global' | 'weekly' | 'monthly' | 'event';
    pointsRequired: number;
    value: number;
    currency: string;
    category: 'food' | 'drink' | 'discount' | 'freebie' | 'premium' | 'exclusive';
    cafeId?: string;
    cafeName?: string;
    eventId?: string;
    eventName?: string;
    status: 'active' | 'inactive' | 'expired';
    startDate: string;
    endDate?: string;
    maxRedemptions: number;
    currentRedemptions: number;
    image?: string;
    terms?: string;
}

interface RewardRedemption {
    id: string;
    rewardId: string;
    rewardName: string;
    userId: string;
    username: string;
    pointsSpent: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    redeemedAt: string;
    approvedAt?: string;
    completedAt?: string;
    adminNotes?: string;
    cafeId?: string;
    cafeName?: string;
}

const Rewards: React.FC = () => {
    const { user } = useAuth();
    const { availableRewards, userRewards, fetchAvailableRewards, fetchUserRewards } = useReward();
    const navigate = useNavigate();

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
    const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedCafe, setSelectedCafe] = useState<string>('all');
    const [showRewardDetails, setShowRewardDetails] = useState<string | null>(null);
    const [showRedemptionHistory, setShowRedemptionHistory] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

    const rewardTypes = {
        cafe: { name: 'Café Rewards', icon: '☕', color: 'from-orange-500 to-orange-700' },
        global: { name: 'Global Rewards', icon: '🌍', color: 'from-blue-500 to-blue-700' },
        weekly: { name: 'Weekly Rewards', icon: '📅', color: 'from-green-500 to-green-700' },
        monthly: { name: 'Monthly Rewards', icon: '🏆', color: 'from-purple-500 to-purple-700' },
        event: { name: 'Event Rewards', icon: '🎉', color: 'from-pink-500 to-pink-700' }
    };

    const categories = {
        food: { name: 'Food', icon: '🍕', color: 'from-red-500 to-red-700' },
        drink: { name: 'Drinks', icon: '🥤', color: 'from-blue-500 to-blue-700' },
        discount: { name: 'Discounts', icon: '💰', color: 'from-green-500 to-green-700' },
        freebie: { name: 'Free Items', icon: '🎁', color: 'from-yellow-500 to-yellow-700' },
        premium: { name: 'Premium', icon: '💎', color: 'from-purple-500 to-purple-700' },
        exclusive: { name: 'Exclusive', icon: '👑', color: 'from-gold-primary to-gold-secondary' }
    };

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
        loadRewardsData();
    }, [user, navigate]);

    useEffect(() => {
        filterRewards();
    }, [rewards, searchTerm, selectedType, selectedCategory, selectedCafe]);

    const loadRewardsData = async () => {
        try {
            setIsLoading(true);
            
            // Mock data for demonstration
            const mockRewards: Reward[] = [
                {
                    id: '1',
                    name: 'Free Coffee',
                    description: 'Get a free coffee of your choice',
                    type: 'cafe',
                    pointsRequired: 100,
                    value: 50,
                    currency: 'ETB',
                    category: 'drink',
                    cafeId: 'cafe1',
                    cafeName: 'Coffee Corner',
                    status: 'active',
                    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
                    maxRedemptions: 50,
                    currentRedemptions: 23,
                    terms: 'Valid for 30 days after redemption. Cannot be combined with other offers.'
                },
                {
                    id: '2',
                    name: '50% Off Pizza',
                    description: 'Half price on any pizza',
                    type: 'cafe',
                    pointsRequired: 200,
                    value: 150,
                    currency: 'ETB',
                    category: 'food',
                    cafeId: 'cafe2',
                    cafeName: 'Game Hub',
                    status: 'active',
                    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
                    maxRedemptions: 30,
                    currentRedemptions: 12,
                    terms: 'Valid for 14 days after redemption. Applies to regular menu items only.'
                },
                {
                    id: '3',
                    name: 'Weekly Champion Badge',
                    description: 'Exclusive badge for top weekly performers',
                    type: 'weekly',
                    pointsRequired: 500,
                    value: 0,
                    currency: 'Badge',
                    category: 'exclusive',
                    status: 'active',
                    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
                    maxRedemptions: 10,
                    currentRedemptions: 3,
                    terms: 'Limited to top 10 players. Badge expires at end of week.'
                },
                {
                    id: '4',
                    name: 'Premium Gaming Session',
                    description: '2-hour premium gaming session with priority access',
                    type: 'global',
                    pointsRequired: 1000,
                    value: 200,
                    currency: 'ETB',
                    category: 'premium',
                    status: 'active',
                    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
                    maxRedemptions: 20,
                    currentRedemptions: 8,
                    terms: 'Valid at any participating location. Must be booked in advance.'
                },
                {
                    id: '5',
                    name: 'Event VIP Pass',
                    description: 'VIP access to next game night event',
                    type: 'event',
                    pointsRequired: 800,
                    value: 300,
                    currency: 'ETB',
                    category: 'exclusive',
                    eventId: 'event1',
                    eventName: 'Friday Game Night',
                    status: 'active',
                    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
                    maxRedemptions: 15,
                    currentRedemptions: 7,
                    terms: 'Includes priority seating, exclusive game access, and refreshments.'
                }
            ];

            const mockRedemptions: RewardRedemption[] = [
                {
                    id: '1',
                    rewardId: '1',
                    rewardName: 'Free Coffee',
                    userId: user?.id || '',
                    username: user?.username || '',
                    pointsSpent: 100,
                    status: 'completed',
                    redeemedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    cafeId: 'cafe1',
                    cafeName: 'Coffee Corner'
                },
                {
                    id: '2',
                    rewardId: '3',
                    rewardName: 'Weekly Champion Badge',
                    userId: user?.id || '',
                    username: user?.username || '',
                    pointsSpent: 500,
                    status: 'approved',
                    redeemedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
                }
            ];

            setRewards(mockRewards);
            setRedemptions(mockRedemptions);
        } catch (error) {
            console.error('Error loading rewards data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterRewards = () => {
        let filtered = rewards.filter(reward => {
            const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                reward.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'all' || reward.type === selectedType;
            const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
            const matchesCafe = selectedCafe === 'all' || reward.cafeId === selectedCafe;
            
            return matchesSearch && matchesType && matchesCategory && matchesCafe;
        });

        setFilteredRewards(filtered);
    };

    const handleRedeem = async (reward: Reward) => {
        if (!user) return;
        
        if (user.points < reward.pointsRequired) {
            alert('Insufficient points to redeem this reward');
            return;
        }

        try {
            setIsRedeeming(reward.id);
            // Mock redemption process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Add to redemptions
            const newRedemption: RewardRedemption = {
                id: Date.now().toString(),
                rewardId: reward.id,
                rewardName: reward.name,
                userId: user.id,
                username: user.username || '',
                pointsSpent: reward.pointsRequired,
                status: 'pending',
                redeemedAt: new Date().toISOString(),
                cafeId: reward.cafeId,
                cafeName: reward.cafeName
            };

            setRedemptions(prev => [newRedemption, ...prev]);
            alert('Reward redeemed successfully! Awaiting approval.');
        } catch (error) {
            console.error('Error redeeming reward:', error);
            alert('Failed to redeem reward. Please try again.');
        } finally {
            setIsRedeeming(null);
        }
    };

    const canRedeem = (reward: Reward) => {
        if (!user) return false;
        if (reward.status !== 'active') return false;
        if (user.points < reward.pointsRequired) return false;
        if (reward.currentRedemptions >= reward.maxRedemptions) return false;
        if (reward.endDate && new Date(reward.endDate) < new Date()) return false;
        return true;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'inactive': return 'text-gray-400';
            case 'expired': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Active';
            case 'inactive': return 'Inactive';
            case 'expired': return 'Expired';
            default: return 'Unknown';
        }
    };

    const getRedemptionStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-400';
            case 'approved': return 'text-green-400';
            case 'rejected': return 'text-red-400';
            case 'completed': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const getRedemptionStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending Approval';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            case 'completed': return 'Completed';
            default: return 'Unknown';
        }
    };

    const getTimeRemaining = (endDate: string) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffMs = end.getTime() - now.getTime();
        
        if (diffMs <= 0) return 'Expired';
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
        if (diffHours > 0) return `${diffHours}h left`;
        return 'Less than 1h left';
    };

    const getTypeIcon = (type: string) => {
        return rewardTypes[type as keyof typeof rewardTypes]?.icon || '🎁';
    };

    const getTypeColor = (type: string) => {
        return rewardTypes[type as keyof typeof rewardTypes]?.color || 'from-gray-500 to-gray-700';
    };

    const getCategoryIcon = (category: string) => {
        return categories[category as keyof typeof categories]?.icon || '🎁';
    };

    const getCategoryColor = (category: string) => {
        return categories[category as keyof typeof categories]?.color || 'from-gray-500 to-gray-700';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl">Loading rewards...</p>
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
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Rewards</h1>
                        <p className="text-xl text-gray-light">
                            Redeem your points for amazing rewards and exclusive offers
                        </p>
                    </div>
                </div>
            </div>

            {/* User Points Display */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-gold-primary to-gold-secondary rounded-xl p-6 text-black-primary">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-black-primary rounded-full flex items-center justify-center">
                                    <FaCoins className="text-gold-primary text-3xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Your Points</h2>
                                    <p className="text-black-primary/80">Available for redemption</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold">{user?.points || 0}</div>
                                <div className="text-black-primary/80">Total Points</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light" />
                                <input
                                    type="text"
                                    placeholder="Search rewards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white placeholder-gray-light focus:border-gold-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all">All Types</option>
                                {Object.entries(rewardTypes).map(([key, type]) => (
                                    <option key={key} value={key}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-black-secondary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            >
                                <option value="all">All Categories</option>
                                {Object.entries(categories).map(([key, category]) => (
                                    <option key={key} value={key}>{category.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Café Filter */}
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
                    </div>
                </div>
            </div>

            {/* Toggle Buttons */}
            <div className="px-6 mb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setShowRedemptionHistory(false)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                !showRedemptionHistory
                                    ? 'bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary'
                                    : 'bg-gray-dark text-white hover:bg-gray-medium'
                            }`}
                        >
                            <FaGift className="inline mr-2" />
                            Available Rewards
                        </button>
                        <button
                            onClick={() => setShowRedemptionHistory(true)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                showRedemptionHistory
                                    ? 'bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary'
                                    : 'bg-gray-dark text-white hover:bg-gray-medium'
                            }`}
                        >
                            <FaHistory className="inline mr-2" />
                            Redemption History
                        </button>
                    </div>
                </div>
            </div>

            {/* Available Rewards */}
            {!showRedemptionHistory && (
                <div className="px-6 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {filteredRewards.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaGift className="text-gray-light text-4xl" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No rewards found</h3>
                                <p className="text-gray-light mb-6">
                                    {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedCafe !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'No rewards available at the moment'
                                    }
                                </p>
                                <button
                                    onClick={loadRewardsData}
                                    className="px-6 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-medium transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRewards.map((reward, index) => (
                                    <motion.div
                                        key={reward.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-black-secondary rounded-xl border border-gray-dark p-6 hover:border-gold-primary/50 transition-all duration-200"
                                    >
                                        {/* Reward Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${getTypeColor(reward.type)} rounded-xl flex items-center justify-center`}>
                                                <span className="text-3xl">{getTypeIcon(reward.type)}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reward.status)} bg-${getStatusColor(reward.status).replace('text-', '')}/20`}>
                                                    {getStatusLabel(reward.status)}
                                                </div>
                                                {reward.endDate && (
                                                    <div className="text-xs text-gray-light mt-1">
                                                        {getTimeRemaining(reward.endDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reward Info */}
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold mb-2">{reward.name}</h3>
                                            <p className="text-gray-light mb-3">{reward.description}</p>
                                            
                                            <div className="flex items-center space-x-4 text-sm mb-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded bg-gradient-to-r ${getCategoryColor(reward.category)} text-white`}>
                                                    {getCategoryIcon(reward.category)} {categories[reward.category as keyof typeof categories]?.name}
                                                </span>
                                                {reward.cafeName && (
                                                    <span className="text-gray-light flex items-center">
                                                        <FaMapMarkerAlt className="mr-1" />
                                                        {reward.cafeName}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-light">Points Required:</span>
                                                <span className="font-bold text-gold-primary">{reward.pointsRequired}</span>
                                            </div>
                                            
                                            {reward.value > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-light">Value:</span>
                                                    <span className="font-bold">{reward.value} {reward.currency}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-light">Available:</span>
                                                <span className="font-bold">{reward.maxRedemptions - reward.currentRedemptions} left</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setShowRewardDetails(showRewardDetails === reward.id ? null : reward.id)}
                                                className="w-full px-4 py-2 bg-gray-dark text-white rounded-lg hover:bg-gray-medium transition-colors"
                                            >
                                                <FaEye className="inline mr-2" />
                                                View Details
                                            </button>

                                            <button
                                                onClick={() => handleRedeem(reward)}
                                                disabled={!canRedeem(reward) || isRedeeming === reward.id}
                                                className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                                    canRedeem(reward)
                                                        ? 'bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary hover:from-gold-secondary hover:to-gold-primary'
                                                        : 'bg-gray-dark text-gray-light cursor-not-allowed'
                                                }`}
                                            >
                                                {isRedeeming === reward.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin inline mr-2"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaGift className="inline mr-2" />
                                                        {canRedeem(reward) ? 'Redeem Reward' : 'Cannot Redeem'}
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Expanded Details */}
                                        {showRewardDetails === reward.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-gray-dark"
                                            >
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-light">Reward ID:</span>
                                                        <span className="ml-2 font-mono">{reward.id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-light">Start Date:</span>
                                                        <span className="ml-2">{new Date(reward.startDate).toLocaleDateString()}</span>
                                                    </div>
                                                    {reward.terms && (
                                                        <div>
                                                            <span className="text-gray-light">Terms:</span>
                                                            <p className="mt-1 text-gray-light">{reward.terms}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Redemption History */}
            {showRedemptionHistory && (
                <div className="px-6 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {redemptions.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaHistory className="text-gray-light text-4xl" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No redemptions yet</h3>
                                <p className="text-gray-light mb-6">
                                    Start redeeming rewards to see your history here!
                                </p>
                                <button
                                    onClick={() => setShowRedemptionHistory(false)}
                                    className="px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
                                >
                                    Browse Rewards
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {redemptions.map((redemption, index) => (
                                    <motion.div
                                        key={redemption.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-black-secondary rounded-xl border border-gray-dark p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                                                    <FaGift className="text-black-primary text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold">{redemption.rewardName}</h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-light">
                                                        <span className="flex items-center">
                                                            <FaCoins className="mr-1" />
                                                            {redemption.pointsSpent} points
                                                        </span>
                                                        <span className="flex items-center">
                                                            <FaCalendar className="mr-1" />
                                                            {new Date(redemption.redeemedAt).toLocaleDateString()}
                                                        </span>
                                                        {redemption.cafeName && (
                                                            <span className="flex items-center">
                                                                <FaMapMarkerAlt className="mr-1" />
                                                                {redemption.cafeName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRedemptionStatusColor(redemption.status)} bg-${getRedemptionStatusColor(redemption.status).replace('text-', '')}/20`}>
                                                    {getRedemptionStatusLabel(redemption.status)}
                                                </div>
                                                {redemption.status === 'approved' && redemption.approvedAt && (
                                                    <div className="text-xs text-gray-light mt-1">
                                                        Approved: {new Date(redemption.approvedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {redemption.status === 'completed' && redemption.completedAt && (
                                                    <div className="text-xs text-gray-light mt-1">
                                                        Completed: {new Date(redemption.completedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rewards;
