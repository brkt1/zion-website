import { motion } from 'framer-motion';
import React from 'react';
import {
  FaArrowLeft,
  FaBug,
  FaExclamationTriangle,
  FaHome,
  FaRedo,
  FaServer,
  FaUserShield,
  FaWifi
} from 'react-icons/fa';
import { useNavigate, useRouteError } from 'react-router-dom';

interface ErrorInfo {
    status?: number;
    statusText?: string;
    message?: string;
    stack?: string;
}

interface ErrorPageProps {
    error?: ErrorInfo;
    errorType?: 'network' | 'server' | 'auth' | 'notFound' | 'general';
    title?: string;
    message?: string;
    showRetry?: boolean;
    showHome?: boolean;
    showBack?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
    error,
    errorType = 'general',
    title,
    message,
    showRetry = true,
    showHome = true,
    showBack = true
}) => {
    const navigate = useNavigate();
    const routeError = useRouteError() as ErrorInfo;
    
    // Use provided error or route error
    const currentError = error || routeError;
    
    // Determine error type if not provided
    const getErrorType = (): string => {
        if (errorType !== 'general') return errorType;
        
        if (currentError?.status === 404) return 'notFound';
        if (currentError?.status === 401 || currentError?.status === 403) return 'auth';
        if (currentError?.status >= 500) return 'server';
        if (currentError?.status >= 400) return 'network';
        
        return 'general';
    };
    
    const finalErrorType = getErrorType();
    
    // Get error details based on type
    const getErrorDetails = () => {
        switch (finalErrorType) {
            case 'network':
                return {
                    icon: <FaWifi className="w-20 h-20 text-yellow-400" />,
                    title: title || 'Connection Error',
                    message: message || 'Unable to connect to the server. Please check your internet connection and try again.',
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-400/10',
                    borderColor: 'border-yellow-400/20'
                };
            case 'server':
                return {
                    icon: <FaServer className="w-20 h-20 text-red-400" />,
                    title: title || 'Server Error',
                    message: message || 'Something went wrong on our end. Our team has been notified and is working to fix the issue.',
                    color: 'text-red-400',
                    bgColor: 'bg-red-400/10',
                    borderColor: 'border-red-400/20'
                };
            case 'auth':
                return {
                    icon: <FaUserShield className="w-20 h-20 text-blue-400" />,
                    title: title || 'Access Denied',
                    message: message || 'You don\'t have permission to access this resource. Please log in or contact support.',
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-400/10',
                    borderColor: 'border-blue-400/20'
                };
            case 'notFound':
                return {
                    icon: <FaBug className="w-20 h-20 text-purple-400" />,
                    title: title || 'Page Not Found',
                    message: message || 'The page you\'re looking for doesn\'t exist. It may have been moved or deleted.',
                    color: 'text-purple-400',
                    bgColor: 'bg-purple-400/10',
                    borderColor: 'border-purple-400/20'
                };
            default:
                return {
                    icon: <FaExclamationTriangle className="w-20 h-20 text-orange-400" />,
                    title: title || 'Something Went Wrong',
                    message: message || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
                    color: 'text-orange-400',
                    bgColor: 'bg-orange-400/10',
                    borderColor: 'border-orange-400/20'
                };
        }
    };
    
    const errorDetails = getErrorDetails();
    
    const handleRetry = () => {
        window.location.reload();
    };
    
    const handleGoHome = () => {
        navigate('/');
    };
    
    const handleGoBack = () => {
        navigate(-1);
    };
    
    const handleReportError = () => {
        // In a real app, this would open a bug report form or contact support
        const errorReport = {
            type: finalErrorType,
            message: currentError?.message || 'Unknown error',
            status: currentError?.status,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        console.log('Error Report:', errorReport);
        
        // You could send this to your error tracking service
        // Example: Sentry.captureException(new Error(errorReport.message));
        
        alert('Error report logged. Thank you for helping us improve!');
    };

    return (
        <div className="min-h-screen bg-black-primary text-white flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl w-full"
            >
                {/* Error Icon and Title */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="mb-6"
                    >
                        {errorDetails.icon}
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {errorDetails.title}
                    </h1>
                    
                    <p className="text-xl text-gray-light leading-relaxed">
                        {errorDetails.message}
                    </p>
                </div>

                {/* Error Details (for developers) */}
                {process.env.NODE_ENV === 'development' && currentError && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`${errorDetails.bgColor} ${errorDetails.borderColor} border rounded-xl p-6 mb-8`}
                    >
                        <h3 className="text-lg font-semibold mb-3 text-gray-light">Error Details (Development)</h3>
                        <div className="space-y-2 text-sm font-mono">
                            {currentError.status && (
                                <div>
                                    <span className="text-gray-light">Status:</span> {currentError.status}
                                </div>
                            )}
                            {currentError.statusText && (
                                <div>
                                    <span className="text-gray-light">Status Text:</span> {currentError.statusText}
                                </div>
                            )}
                            {currentError.message && (
                                <div>
                                    <span className="text-gray-light">Message:</span> {currentError.message}
                                </div>
                            )}
                            {currentError.stack && (
                                <details className="cursor-pointer">
                                    <summary className="text-gray-light hover:text-white">
                                        Stack Trace
                                    </summary>
                                    <pre className="mt-2 text-xs text-gray-400 overflow-auto max-h-32">
                                        {currentError.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    {showRetry && (
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-semibold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all flex items-center justify-center"
                        >
                            <FaRedo className="mr-2" />
                            Try Again
                        </button>
                    )}
                    
                    {showBack && (
                        <button
                            onClick={handleGoBack}
                            className="px-6 py-3 bg-gray-dark text-white font-semibold rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center"
                        >
                            <FaArrowLeft className="mr-2" />
                            Go Back
                        </button>
                    )}
                    
                    {showHome && (
                        <button
                            onClick={handleGoHome}
                            className="px-6 py-3 bg-gray-dark text-white font-semibold rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center"
                        >
                            <FaHome className="mr-2" />
                            Go Home
                        </button>
                    )}
                </motion.div>

                {/* Additional Help */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <button
                        onClick={handleReportError}
                        className="text-gray-light hover:text-white transition-colors underline"
                    >
                        Report this error
                    </button>
                    
                    <p className="text-sm text-gray-light mt-4">
                        If this problem persists, please contact our support team
                    </p>
                </motion.div>

                {/* Error Code Display */}
                {currentError?.status && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <div className="inline-block px-4 py-2 bg-gray-dark rounded-lg">
                            <span className="text-sm text-gray-light">Error Code:</span>
                            <span className="ml-2 font-mono font-bold text-lg">
                                {currentError.status}
                            </span>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ErrorPage;
