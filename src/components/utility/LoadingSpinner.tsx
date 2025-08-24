import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gold';
    text?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    color = 'primary', 
    text,
    className = '' 
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const colorClasses = {
        primary: 'border-gold-primary border-t-transparent',
        secondary: 'border-gray-light border-t-transparent',
        white: 'border-white border-t-transparent',
        gold: 'border-gold-primary border-t-transparent'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div 
                className={`${sizeClasses[size]} border-4 rounded-full animate-spin ${colorClasses[color]}`}
            />
            {text && (
                <p className="mt-3 text-center text-gray-light">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
