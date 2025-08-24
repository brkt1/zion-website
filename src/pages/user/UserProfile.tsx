import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaChartLine,
    FaClock,
    FaCog,
    FaCrown,
    FaEdit,
    FaGamepad,
    FaHistory,
    FaMedal,
    FaQrcode,
    FaSignOutAlt,
    FaStar,
    FaTrophy,
    FaUser,
    FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLeaderboard } from '../../contexts/LeaderboardContext';
import { useReward } from '../../contexts/RewardContext';

interface UserStats {
  totalGames: number;
  totalPoints: number;
  averageScore: number;
  bestScore: number;
  gamesWon: number;
  winRate: number;
  totalPlayTime: number;
  rank: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

const UserProfile: React.FC = () => {
  const { user, signOut, updateUserProfile } = useAuth();
  const { getUserStats } = useLeaderboard();
  const { userRewards } = useReward();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'rewards' | 'history'>('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      // Load user stats
      const userStats = await getUserStats(user!.id);
      setStats(userStats);

      // Load achievements (mock data for now)
      setAchievements([
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first game',
          icon: '🎯',
          unlocked: true,
          unlockedAt: new Date(Date.now() - 86400000)
        },
        {
          id: '2',
          name: 'Point Collector',
          description: 'Earn 1000 points',
          icon: '💰',
          unlocked: stats?.totalPoints ? stats.totalPoints >= 1000 : false,
          progress: stats?.totalPoints || 0,
          maxProgress: 1000
        },
        {
          id: '3',
          name: 'Game Master',
          description: 'Win 50 games',
          icon: '🏆',
          unlocked: stats?.gamesWon ? stats.gamesWon >= 50 : false,
          progress: stats?.gamesWon || 0,
          maxProgress: 50
        },
        {
          id: '4',
          name: 'Speed Demon',
          description: 'Complete a game in under 2 minutes',
          icon: '⚡',
          unlocked: false
        },
        {
          id: '5',
          name: 'Social Butterfly',
          description: 'Play with 10 different players',
          icon: '🦋',
          unlocked: false
        },
        {
          id: '6',
          name: 'Consistent Player',
          description: 'Play for 7 consecutive days',
          icon: '📅',
          unlocked: false
        }
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editUsername.trim()) return;

    setIsUpdating(true);
    try {
      await updateUserProfile({ username: editUsername.trim() });
      setIsEditing(false);
      setEditUsername('');
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaCrown className="text-yellow-400 text-2xl" />;
    if (rank === 2) return <FaMedal className="text-gray-300 text-xl" />;
    if (rank === 3) return <FaMedal className="text-amber-600 text-xl" />;
    return <FaStar className="text-blue-400 text-lg" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    if (rank <= 10) return 'text-blue-400';
    if (rank <= 50) return 'text-green-400';
    return 'text-gray-400';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black-primary text-white">
      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto">
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
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full mb-6">
              <FaUser className="text-black-primary text-6xl" />
            </div>
            
            <div className="mb-6">
              {isEditing ? (
                <div className="flex items-center justify-center space-x-3">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="text-3xl font-bold bg-transparent border-b-2 border-gold-primary text-center focus:outline-none"
                    placeholder="Enter username"
                  />
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditUsername('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <h1 className="text-3xl font-bold">{user.username || 'Anonymous Player'}</h1>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditUsername(user.username || '');
                    }}
                    className="p-2 text-gray-light hover:text-white transition-colors"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
              
              <p className="text-gray-light mt-2">{user.email}</p>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                  <div className="text-2xl font-bold text-gold-primary">{stats.totalPoints}</div>
                  <div className="text-sm text-gray-light">Total Points</div>
                </div>
                
                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                  <div className="text-2xl font-bold text-blue-400">{stats.totalGames}</div>
                  <div className="text-sm text-gray-light">Games Played</div>
                </div>
                
                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                  <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
                  <div className="text-sm text-gray-light">Win Rate</div>
                </div>
                
                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                  <div className="text-2xl font-bold text-purple-400">{stats.rank}</div>
                  <div className="text-sm text-gray-light">Global Rank</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-center space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: FaUser },
                { id: 'achievements', label: 'Achievements', icon: FaTrophy },
                { id: 'rewards', label: 'Rewards', icon: FaStar },
                { id: 'history', label: 'History', icon: FaHistory }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary'
                      : 'bg-gray-dark text-gray-light hover:bg-gray-medium hover:text-white'
                  }`}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Detailed Stats */}
                <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <FaChartLine className="mr-3 text-gold-primary" />
                    Performance Stats
                  </h3>
                  
                  {stats ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-light">Best Score</span>
                        <span className="font-semibold">{stats.bestScore}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-light">Average Score</span>
                        <span className="font-semibold">{stats.averageScore}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-light">Games Won</span>
                        <span className="font-semibold">{stats.gamesWon}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-light">Total Play Time</span>
                        <span className="font-semibold">{Math.round(stats.totalPlayTime / 60)} min</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-light">Global Ranking</span>
                        <div className="flex items-center space-x-2">
                          {getRankIcon(stats.rank)}
                          <span className={`font-semibold ${getRankColor(stats.rank)}`}>
                            #{stats.rank}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-light">Loading stats...</p>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <FaClock className="mr-3 text-gold-primary" />
                    Recent Activity
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-dark/50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <FaGamepad className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Played Emoji Game</p>
                        <p className="text-sm text-gray-light">2 hours ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-gold-primary font-bold">+150</div>
                        <div className="text-xs text-gray-light">points</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-dark/50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <FaUsers className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Joined Multiplayer Room</p>
                        <p className="text-sm text-gray-light">1 day ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">Won</div>
                        <div className="text-xs text-gray-light">+200 pts</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-dark/50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <FaQrcode className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Scanned QR Code</p>
                        <p className="text-sm text-gray-light">3 days ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-bold">Access</div>
                        <div className="text-xs text-gray-light">Granted</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <FaTrophy className="mr-3 text-gold-primary" />
                  Achievements
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map(achievement => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-xl border transition-all duration-200 ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-gold-primary/20 to-gold-secondary/20 border-gold-primary'
                          : 'bg-gray-dark/50 border-gray-dark'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-4xl mb-3 ${
                          achievement.unlocked ? 'animate-bounce' : 'opacity-50'
                        }`}>
                          {achievement.icon}
                        </div>
                        
                        <h4 className={`font-semibold mb-2 ${
                          achievement.unlocked ? 'text-gold-primary' : 'text-gray-light'
                        }`}>
                          {achievement.name}
                        </h4>
                        
                        <p className="text-sm text-gray-light mb-3">
                          {achievement.description}
                        </p>
                        
                        {achievement.unlocked ? (
                          <div className="text-xs text-gold-primary">
                            Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                          </div>
                        ) : achievement.progress !== undefined ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-light">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-gray-dark rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-gold-primary to-gold-secondary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-light">Locked</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <FaStar className="mr-3 text-gold-primary" />
                  Available Rewards
                </h3>
                
                {userRewards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaStar className="text-gray-medium text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Rewards Available</h3>
                    <p className="text-gray-light">
                      Play more games to unlock rewards and redeem them at partner cafés
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userRewards.map(reward => (
                      <div
                        key={reward.id}
                        className="bg-gray-dark/50 rounded-xl p-6 border border-gray-medium hover:border-gold-primary transition-colors"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaStar className="text-black-primary text-2xl" />
                          </div>
                          
                          <h4 className="font-semibold mb-2">{reward.name}</h4>
                          
                          <p className="text-sm text-gray-light mb-4">
                            {reward.description}
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-light">Points Required:</span>
                              <span className="font-semibold">{reward.points_required}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-light">Available:</span>
                              <span className="font-semibold text-green-400">
                                {reward.max_redemptions - reward.current_redemptions}
                              </span>
                            </div>
                            
                            <button className="w-full px-4 py-2 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200">
                              Redeem Reward
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <FaHistory className="mr-3 text-gold-primary" />
                  Game History
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-dark/50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      😊
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Emoji Game - Solo Mode</h4>
                      <p className="text-sm text-gray-light">Completed 2 days ago</p>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-primary font-bold">+180</div>
                      <div className="text-xs text-gray-light">points</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-dark/50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      🧠
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Trivia Challenge - Multiplayer</h4>
                      <p className="text-sm text-gray-light">Completed 1 week ago</p>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-primary font-bold">+250</div>
                      <div className="text-xs text-gray-light">points</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-dark/50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                      💕
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Truth or Dare - Friends Mode</h4>
                      <p className="text-sm text-gray-light">Completed 2 weeks ago</p>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-primary font-bold">+120</div>
                      <div className="text-xs text-gray-light">points</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="bg-black-secondary rounded-2xl p-8 border border-gray-dark max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">Account Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/user/settings')}
                  className="px-6 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <FaCog />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
