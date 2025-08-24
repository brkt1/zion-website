import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft,
    FaUser,
    FaBell,
    FaShieldAlt,
    FaPalette,
    FaGamepad,
    FaLanguage,
    FaSave,
    FaTimes,
    FaCheck,
    FaEye,
    FaEyeSlash,
    FaTrash,
    FaDownload,
    FaUpload,
    FaCog,
    FaKey,
    FaEnvelope,
    FaPhone
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../components/notifications/NotificationSystem';

interface UserSettings {
    profile: {
        username: string;
        email: string;
        phone?: string;
        bio?: string;
        avatar?: string;
    };
    preferences: {
        theme: 'dark' | 'light' | 'auto';
        language: 'en' | 'am' | 'or';
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            gameUpdates: boolean;
            rewardAlerts: boolean;
            leaderboardUpdates: boolean;
        };
        privacy: {
            profileVisibility: 'public' | 'friends' | 'private';
            showOnlineStatus: boolean;
            allowFriendRequests: boolean;
            showGameHistory: boolean;
        };
        gaming: {
            autoSave: boolean;
            soundEnabled: boolean;
            musicVolume: number;
            sfxVolume: number;
            difficulty: 'easy' | 'medium' | 'hard';
            autoJoinMultiplayer: boolean;
        };
    };
    security: {
        twoFactorEnabled: boolean;
        loginNotifications: boolean;
        sessionTimeout: number;
        passwordChangeRequired: boolean;
    };
}

const Settings: React.FC = () => {
    const { user, updateUserProfile } = useAuth();
    const { success, error, warning, info } = useNotification();
    const navigate = useNavigate();

    const [settings, setSettings] = useState<UserSettings>({
        profile: {
            username: user?.username || '',
            email: user?.email || '',
            phone: '',
            bio: '',
            avatar: ''
        },
        preferences: {
            theme: 'dark',
            language: 'en',
            notifications: {
                email: true,
                push: true,
                sms: false,
                gameUpdates: true,
                rewardAlerts: true,
                leaderboardUpdates: false
            },
            privacy: {
                profileVisibility: 'public',
                showOnlineStatus: true,
                allowFriendRequests: true,
                showGameHistory: true
            },
            gaming: {
                autoSave: true,
                soundEnabled: true,
                musicVolume: 70,
                sfxVolume: 80,
                difficulty: 'medium',
                autoJoinMultiplayer: false
            }
        },
        security: {
            twoFactorEnabled: false,
            loginNotifications: true,
            sessionTimeout: 30,
            passwordChangeRequired: false
        }
    });

    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'gaming' | 'privacy' | 'security' | 'data'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        loadUserSettings();
    }, [user, navigate]);

    const loadUserSettings = async () => {
        try {
            // In a real app, you would fetch user settings from the backend
            // For now, we'll use the default settings
            console.log('Loading user settings...');
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            setIsLoading(true);
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            success('Profile Updated', 'Your profile has been updated successfully!');
        } catch (err) {
            error('Update Failed', 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.new !== passwordData.confirm) {
            error('Password Mismatch', 'New passwords do not match.');
            return;
        }

        if (passwordData.new.length < 8) {
            error('Weak Password', 'Password must be at least 8 characters long.');
            return;
        }

        try {
            setIsLoading(true);
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            success('Password Changed', 'Your password has been updated successfully!');
            setShowPasswordModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            error('Password Change Failed', 'Failed to change password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDataExport = async () => {
        try {
            setIsLoading(true);
            // Mock data export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const exportData = {
                profile: settings.profile,
                preferences: settings.preferences,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `yenege-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            success('Data Exported', 'Your settings have been exported successfully!');
        } catch (err) {
            error('Export Failed', 'Failed to export data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDataReset = async () => {
        if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            try {
                setIsLoading(true);
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                warning('Settings Reset', 'All settings have been reset to default values.');
                // Reload default settings
                loadUserSettings();
            } catch (err) {
                error('Reset Failed', 'Failed to reset settings. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderProfileTab = () => (
        <div className="space-y-6">
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <input
                            type="text"
                            value={settings.profile.username}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                profile: { ...prev.profile, username: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={settings.profile.email}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                profile: { ...prev.profile, email: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                            type="tel"
                            value={settings.profile.phone || ''}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                profile: { ...prev.profile, phone: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            placeholder="Optional"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Bio</label>
                        <textarea
                            value={settings.profile.bio || ''}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                profile: { ...prev.profile, bio: e.target.value }
                            }))}
                            rows={3}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>
                <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="mt-6 px-6 py-3 bg-gold-primary text-black-primary font-medium rounded-lg hover:bg-gold-secondary transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
            </div>

            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Account Security</h3>
                <div className="space-y-4">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <FaKey className="inline mr-2" />
                        Change Password
                    </button>
                    <div className="flex items-center justify-between p-4 bg-black-primary rounded-lg">
                        <div>
                            <h4 className="font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-light">Add an extra layer of security</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.security.twoFactorEnabled}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                security: { ...prev.security, twoFactorEnabled: e.target.checked }
                            }))}
                            className="w-5 h-5 text-gold-primary bg-black-primary border-gray-dark rounded focus:ring-gold-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPreferencesTab = () => (
        <div className="space-y-6">
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Appearance & Language</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Theme</label>
                        <select
                            value={settings.preferences.theme}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, theme: e.target.value as any }
                            }))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <select
                            value={settings.preferences.language}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, language: e.target.value as any }
                            }))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        >
                            <option value="en">English</option>
                            <option value="am">Amharic</option>
                            <option value="or">Oromo</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                    {Object.entries(settings.preferences.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-black-primary rounded-lg">
                            <div>
                                <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                <p className="text-sm text-gray-light">Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    preferences: {
                                        ...prev.preferences,
                                        notifications: {
                                            ...prev.preferences.notifications,
                                            [key]: e.target.checked
                                        }
                                    }
                                }))}
                                className="w-5 h-5 text-gold-primary bg-black-primary border-gray-dark rounded focus:ring-gold-primary"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderGamingTab = () => (
        <div className="space-y-6">
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Gaming Preferences</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                        <select
                            value={settings.preferences.gaming.difficulty}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                preferences: {
                                    ...prev.preferences,
                                    gaming: { ...prev.preferences.gaming, difficulty: e.target.value as any }
                                }
                            }))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Music Volume: {settings.preferences.gaming.musicVolume}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.preferences.gaming.musicVolume}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                preferences: {
                                    ...prev.preferences,
                                    gaming: { ...prev.preferences.gaming, musicVolume: parseInt(e.target.value) }
                                }
                            }))}
                            className="w-full h-2 bg-gray-dark rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Sound Effects Volume: {settings.preferences.gaming.sfxVolume}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.preferences.gaming.sfxVolume}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                preferences: {
                                    ...prev.preferences,
                                    gaming: { ...prev.preferences.gaming, sfxVolume: parseInt(e.target.value) }
                                }
                            }))}
                            className="w-full h-2 bg-gray-dark rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black-primary rounded-lg">
                            <div>
                                <h4 className="font-medium">Auto-Save</h4>
                                <p className="text-sm text-gray-light">Automatically save game progress</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.preferences.gaming.autoSave}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    preferences: {
                                        ...prev.preferences,
                                        gaming: { ...prev.preferences.gaming, autoSave: e.target.checked }
                                    }
                                }))}
                                className="w-5 h-5 text-gold-primary bg-black-primary border-gray-dark rounded focus:ring-gold-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black-primary rounded-lg">
                            <div>
                                <h4 className="font-medium">Sound Enabled</h4>
                                <p className="text-sm text-gray-light">Enable game sounds and music</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.preferences.gaming.soundEnabled}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    preferences: {
                                        ...prev.preferences,
                                        gaming: { ...prev.preferences.gaming, soundEnabled: e.target.checked }
                                    }
                                }))}
                                className="w-5 h-5 text-gold-primary bg-black-primary border-gray-dark rounded focus:ring-gold-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPrivacyTab = () => (
        <div className="space-y-6">
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                        <select
                            value={settings.preferences.privacy.profileVisibility}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                preferences: {
                                    ...prev.preferences,
                                    privacy: { ...prev.preferences.privacy, profileVisibility: e.target.value as any }
                                }
                            }))}
                            className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                        >
                            <option value="public">Public</option>
                            <option value="friends">Friends Only</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(settings.preferences.privacy).map(([key, value]) => {
                            if (key === 'profileVisibility') return null;
                            return (
                                <div key={key} className="flex items-center justify-between p-4 bg-black-primary rounded-lg">
                                    <div>
                                        <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                        <p className="text-sm text-gray-light">
                                            {key === 'showOnlineStatus' ? 'Show when you are online' :
                                             key === 'allowFriendRequests' ? 'Allow others to send friend requests' :
                                             key === 'showGameHistory' ? 'Show your game history to others' : ''}
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={value as boolean}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            preferences: {
                                                ...prev.preferences,
                                                privacy: {
                                                    ...prev.preferences.privacy,
                                                    [key]: e.target.checked
                                                }
                                            }
                                        }))}
                                        className="w-5 h-5 text-gold-primary bg-black-primary border-gray-dark rounded focus:ring-gold-primary"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDataTab = () => (
        <div className="space-y-6">
            <div className="bg-black-secondary rounded-xl border border-gray-dark p-6">
                <h3 className="text-xl font-bold mb-4">Data Management</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-black-primary rounded-lg">
                        <h4 className="font-medium mb-2">Export Your Data</h4>
                        <p className="text-sm text-gray-light mb-4">
                            Download a copy of your settings, preferences, and account data
                        </p>
                        <button
                            onClick={handleDataExport}
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            <FaDownload className="inline mr-2" />
                            {isLoading ? 'Exporting...' : 'Export Data'}
                        </button>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <h4 className="font-medium mb-2 text-red-400">Reset All Settings</h4>
                        <p className="text-sm text-gray-light mb-4">
                            This will reset all your preferences to default values. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleDataReset}
                            disabled={isLoading}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            <FaTrash className="inline mr-2" />
                            {isLoading ? 'Resetting...' : 'Reset All Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
                                <FaCog className="text-black-primary text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                                Settings
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Account Settings</h1>
                        <p className="text-xl text-gray-light">
                            Manage your preferences, privacy, and account settings
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-1 bg-black-secondary rounded-lg p-1 overflow-x-auto">
                        {[
                            { id: 'profile', label: 'Profile', icon: FaUser },
                            { id: 'preferences', label: 'Preferences', icon: FaPalette },
                            { id: 'gaming', label: 'Gaming', icon: FaGamepad },
                            { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
                            { id: 'data', label: 'Data', icon: FaDownload }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                                    activeTab === tab.id
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
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'preferences' && renderPreferencesTab()}
                    {activeTab === 'gaming' && renderGamingTab()}
                    {activeTab === 'privacy' && renderPrivacyTab()}
                    {activeTab === 'data' && renderDataTab()}
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black-primary/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black-secondary rounded-xl border border-gray-dark p-6 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Change Password</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-light hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg text-white focus:border-gold-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-dark text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-gold-primary text-black-primary font-medium rounded-lg hover:bg-gold-secondary transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Settings;
