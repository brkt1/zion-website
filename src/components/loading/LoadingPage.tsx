import React from 'react';
import { motion } from 'framer-motion';
import {
    FaGamepad,
    FaSpinner,
    FaCircle,
    FaDice,
    FaTrophy,
    FaUsers,
    FaStar
} from 'react-icons/fa';

interface LoadingPageProps {
    type?: 'default' | 'game' | 'auth' | 'payment' | 'admin' | 'event';
    message?: string;
    showProgress?: boolean;
    progress?: number;
    size?: 'small' | 'medium' | 'large';
    fullScreen?: boolean;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
    type = 'default',
    message,
    showProgress = false,
    progress = 0,
    size = 'medium',
    fullScreen = true
}) => {
    const getLoadingContent = () => {
        switch (type) {
            case 'game':
                return {
                    icon: <FaGamepad className="text-gold-primary" />,
                    title: 'Loading Game',
                    description: 'Preparing your gaming experience...',
                    color: 'text-gold-primary',
                    bgColor: 'bg-gold-primary/10',
                    borderColor: 'border-gold-primary/20'
                };
            case 'auth':
                return {
                    icon: <FaUsers className="text-blue-400" />,
                    title: 'Authenticating',
                    description: 'Verifying your credentials...',
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-400/10',
                    borderColor: 'border-blue-400/20'
                };
            case 'payment':
                return {
                    icon: <FaStar className="text-green-400" />,
                    title: 'Processing Payment',
                    description: 'Securing your transaction...',
                    color: 'text-green-400',
                    bgColor: 'bg-green-400/10',
                    borderColor: 'border-green-400/20'
                };
            case 'admin':
                return {
                    icon: <FaTrophy className="text-purple-400" />,
                    title: 'Loading Admin Panel',
                    description: 'Preparing administrative tools...',
                    color: 'text-purple-400',
                    bgColor: 'bg-purple-400/10',
                    borderColor: 'border-purple-400/20'
                };
            case 'event':
                return {
                    icon: <FaDice className="text-orange-400" />,
                    title: 'Setting Up Event',
                    description: 'Preparing game night...',
                    color: 'text-orange-400',
                    bgColor: 'bg-orange-400/10',
                    borderColor: 'border-orange-400/20'
                };
            default:
                return {
                    icon: <FaSpinner className="text-gray-light" />,
                    title: 'Loading',
                    description: 'Please wait...',
                    color: 'text-gray-light',
                    bgColor: 'bg-gray-light/10',
                    borderColor: 'border-gray-light/20'
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return {
                    container: 'p-4',
                    icon: 'w-8 h-8',
                    title: 'text-lg',
                    description: 'text-sm'
                };
            case 'large':
                return {
                    container: 'p-12',
                    icon: 'w-24 h-24',
                    title: 'text-3xl',
                    description: 'text-xl'
                };
            default:
                return {
                    container: 'p-8',
                    icon: 'w-16 h-16',
                    title: 'text-2xl',
                    description: 'text-lg'
                };
        }
    };

    const loadingContent = getLoadingContent();
    const sizeClasses = getSizeClasses();

    const containerClasses = fullScreen 
        ? 'min-h-screen bg-black-primary text-white flex items-center justify-center'
        : 'w-full h-full bg-black-primary text-white flex items-center justify-center';

    const LoadingSpinner = () => (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses.icon} ${loadingContent.color}`}
        >
            {loadingContent.icon}
        </motion.div>
    );

    const PulsingDots = () => (
        <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2
                    }}
                    className={`w-2 h-2 ${loadingContent.color} rounded-full`}
                />
            ))}
        </div>
    );

    const ProgressBar = () => (
        <div className="w-full max-w-xs">
            <div className="w-full bg-gray-dark rounded-full h-2 mb-2">
                <motion.div
                    className={`h-2 rounded-full ${loadingContent.color.replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <div className="text-center text-sm text-gray-light">
                {progress}% Complete
            </div>
        </div>
    );

    const BouncingBalls = () => (
        <div className="flex space-x-2">
            {[0, 1, 2, 3].map((index) => (
                <motion.div
                    key={index}
                    animate={{
                        y: [0, -20, 0]
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: index * 0.1
                    }}
                    className={`w-3 h-3 ${loadingContent.color.replace('text-', 'bg-')} rounded-full`}
                />
            ))}
        </div>
    );

    const WaveLoader = () => (
        <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
                <motion.div
                    key={index}
                    animate={{
                        height: [20, 40, 20]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: index * 0.1
                    }}
                    className={`w-1 ${loadingContent.color.replace('text-', 'bg-')} rounded-full`}
                    style={{ height: '20px' }}
                />
            ))}
        </div>
    );

    const LoadingAnimation = () => {
        const animations = [
            { component: <LoadingSpinner />, name: 'spinner' },
            { component: <PulsingDots />, name: 'dots' },
            { component: <BouncingBalls />, name: 'balls' },
            { component: <WaveLoader />, name: 'wave' }
        ];

        // Cycle through animations every 3 seconds
        const [currentAnimation, setCurrentAnimation] = React.useState(0);

        React.useEffect(() => {
            const interval = setInterval(() => {
                setCurrentAnimation((prev) => (prev + 1) % animations.length);
            }, 3000);

            return () => clearInterval(interval);
        }, []);

        return (
            <motion.div
                key={currentAnimation}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
            >
                {animations[currentAnimation].component}
            </motion.div>
        );
    };

    return (
        <div className={containerClasses}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-center ${sizeClasses.container}`}
            >
                {/* Loading Animation */}
                <LoadingAnimation />

                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`font-bold mb-3 ${sizeClasses.title}`}
                >
                    {message || loadingContent.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`text-gray-light mb-6 ${sizeClasses.description}`}
                >
                    {loadingContent.description}
                </motion.p>

                {/* Progress Bar */}
                {showProgress && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-6"
                    >
                        <ProgressBar />
                    </motion.div>
                )}

                {/* Additional Loading Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-gray-light"
                >
                    <div className="flex items-center justify-center space-x-2">
                        <FaCircle className="w-1 h-1 text-green-400" />
                        <span>Secure connection</span>
                        <FaCircle className="w-1 h-1 text-blue-400" />
                        <span>Fast loading</span>
                        <FaCircle className="w-1 h-1 text-purple-400" />
                        <span>Optimized</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoadingPage;
