import { AnimatePresence, motion } from 'framer-motion';
import React, { createContext, useContext, useState } from 'react';
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaWarning
} from 'react-icons/fa';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    autoClose?: boolean;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        autoClose: true,
        defaultDuration: 5000,
        maxNotifications: 5,
        soundEnabled: true,
        position: 'top-right' as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    });

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false,
            autoClose: notification.autoClose ?? settings.autoClose,
            duration: notification.duration ?? settings.defaultDuration
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            if (updated.length > settings.maxNotifications) {
                updated.pop();
            }
            return updated;
        });

        // Auto-close notification if enabled
        if (newNotification.autoClose && newNotification.duration) {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, newNotification.duration);
        }

        // Play sound if enabled
        if (settings.soundEnabled) {
            playNotificationSound(newNotification.type);
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const playNotificationSound = (type: string) => {
        // In a real app, you would play different sounds for different notification types
        const audio = new Audio();
        audio.src = type === 'error' ? '/sounds/error.mp3' : '/sounds/notification.mp3';
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Ignore errors if audio fails to play
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-green-400" />;
            case 'error': return <FaExclamationTriangle className="text-red-400" />;
            case 'warning': return <FaWarning className="text-yellow-400" />;
            case 'info': return <FaInfoCircle className="text-blue-400" />;
            default: return <FaBell className="text-gray-400" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-green-500/20 bg-green-500/10';
            case 'error': return 'border-red-500/20 bg-red-500/10';
            case 'warning': return 'border-yellow-500/20 bg-yellow-500/10';
            case 'info': return 'border-blue-500/20 bg-blue-500/10';
            default: return 'border-gray-500/20 bg-gray-500/10';
        }
    };

    const getPositionClasses = () => {
        switch (settings.position) {
            case 'top-left': return 'top-4 left-4';
            case 'top-right': return 'top-4 right-4';
            case 'bottom-left': return 'bottom-4 left-4';
            case 'bottom-right': return 'bottom-4 right-4';
            default: return 'top-4 right-4';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const value: NotificationContextType = {
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            
            {/* Notification Bell */}
            <div className={`fixed ${getPositionClasses()} z-50`}>
                <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    className="relative w-12 h-12 bg-black-secondary border border-gray-dark rounded-full flex items-center justify-center text-white hover:bg-gray-dark transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaBell />
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.div>
                    )}
                </motion.button>

                {/* Settings Panel */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-16 right-0 w-80 bg-black-secondary border border-gray-dark rounded-xl shadow-xl"
                        >
                            <div className="p-4 border-b border-gray-dark">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold">Notifications</h3>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="text-gray-light hover:text-white"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Auto-close</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.autoClose}
                                        onChange={(e) => setSettings(prev => ({ ...prev, autoClose: e.target.checked }))}
                                        className="w-4 h-4 text-gold-primary bg-black-primary border-gray-dark rounded focus:ring-gold-primary"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Sound</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.soundEnabled}
                                        onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                                        className="w-4 h-4 text-gold-primary bg-black-primary border-gray-dark rounded focus:ring-gold-primary"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Max notifications</span>
                                    <select
                                        value={settings.maxNotifications}
                                        onChange={(e) => setSettings(prev => ({ ...prev, maxNotifications: parseInt(e.target.value) }))}
                                        className="px-2 py-1 bg-black-primary border border-gray-dark rounded text-sm"
                                    >
                                        <option value={3}>3</option>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-dark">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Mark All Read
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Notifications List */}
            <div className={`fixed ${getPositionClasses()} z-40 pt-20`}>
                <AnimatePresence>
                    {notifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-80 mb-3 p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                                !notification.read ? 'ring-2 ring-gold-primary/50' : ''
                            }`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-white">
                                            {notification.title}
                                        </h4>
                                        <button
                                            onClick={() => removeNotification(notification.id)}
                                            className="text-gray-light hover:text-white transition-colors"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-light mt-1">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-gray-light">
                                            {notification.timestamp.toLocaleTimeString()}
                                        </span>
                                        <div className="flex space-x-2">
                                            {notification.action && (
                                                <button
                                                    onClick={notification.action.onClick}
                                                    className="text-xs text-gold-primary hover:text-gold-secondary transition-colors"
                                                >
                                                    {notification.action.label}
                                                </button>
                                            )}
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

// Hook for easy notification creation
export const useNotification = () => {
    const { addNotification } = useNotifications();

    return {
        success: (title: string, message: string, options?: Partial<Notification>) => 
            addNotification({ type: 'success', title, message, ...options }),
        error: (title: string, message: string, options?: Partial<Notification>) => 
            addNotification({ type: 'error', title, message, ...options }),
        warning: (title: string, message: string, options?: Partial<Notification>) => 
            addNotification({ type: 'warning', title, message, ...options }),
        info: (title: string, message: string, options?: Partial<Notification>) => 
            addNotification({ type: 'info', title, message, ...options })
    };
};

export default NotificationSystem;
