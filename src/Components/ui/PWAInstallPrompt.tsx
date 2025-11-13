import { useEffect, useState } from 'react';
import { FaBell, FaBolt, FaCheckCircle, FaDownload, FaMobileAlt, FaTimes, FaWifi } from 'react-icons/fa';
import { requestPushPermissionAndSubscribe } from '../../services/pushNotifications';
import { safeMatchMedia, safeStorage } from '../../utils/polyfills';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const standaloneQuery = safeMatchMedia('(display-mode: standalone)');
    if ((standaloneQuery && standaloneQuery.matches) || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Check localStorage to see if user has dismissed the prompt
    const dismissed = safeStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const minutesSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60);
    
    // Show prompt if not dismissed or dismissed more than 5 minutes ago
    if (!dismissed || minutesSinceDismissed > 5) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Show prompt after a short delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
      
      // Request push notification permission and subscribe after installation
      // Wait a bit for the install to complete
      setTimeout(async () => {
        await requestPushPermissionAndSubscribe();
      }, 1000);
    } else {
      console.log('User dismissed the install prompt');
      // Save dismissal to localStorage
      safeStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Save dismissal to localStorage
    safeStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Popup - slides up from bottom */}
      <div 
        className="relative bg-white rounded-t-3xl shadow-2xl w-full overflow-hidden transform transition-all duration-300 pointer-events-auto border-t-4"
        style={{
          animation: 'slideUpFromBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          borderTopColor: '#FF6F5E',
        }}
      >
        {/* Header with gradient accent */}
        <div 
          className="relative h-2"
            style={{
              background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
            }}
        />

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              >
                <FaMobileAlt size={20} className="text-white" />
              </div>
              <div>
                <h3 
                  className="text-lg sm:text-xl font-bold"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Install Yenege App
          </h3>
                <p className="text-xs text-gray-500">Get the full experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700 flex-shrink-0"
              aria-label="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
          {/* Features - Horizontal layout on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <FaBolt size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Lightning Fast</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                <FaWifi size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Works Offline</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <FaCheckCircle size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Easy Access</p>
              </div>
            </div>
          </div>
          
          {/* Additional feature - Notifications */}
          <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                <FaBell size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">Get notified about new events & reminders</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3 mt-4">
          <button
            onClick={handleDismiss}
              className="px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all duration-200 text-sm"
          >
              Later
          </button>
          <button
            onClick={handleInstallClick}
              className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 text-sm relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                boxShadow: "0 2px 8px rgba(255, 111, 94, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth >= 768) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 111, 94, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 111, 94, 0.3)";
            }}
          >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FaDownload size={12} />
                Install Now (1MB)
              </span>
          </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFromBottom {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;

