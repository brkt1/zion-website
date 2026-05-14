import React, { useState, useEffect } from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

export const NetworkStatus: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-bounce">
      <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <FaWifi className="text-xl text-white/40" />
        </div>
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest leading-none">Connection Lost</h4>
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-tighter mt-1">You are currently offline</p>
        </div>
        <div className="ml-4">
          <FaExclamationTriangle className="text-white animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const NetworkErrorBanner: React.FC<{ message?: string; onRetry?: () => void }> = ({ 
  message = "Network connection issue detected. Some features may be limited.",
  onRetry 
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
          <FaExclamationTriangle />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900">{message}</p>
          <p className="text-xs text-amber-600">Please check your internet or try refreshing.</p>
        </div>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
        >
          Retry
        </button>
      )}
    </div>
  );
};
