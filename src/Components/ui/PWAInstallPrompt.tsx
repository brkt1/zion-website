import { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

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
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Check localStorage to see if user has dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Show prompt if not dismissed or dismissed more than 7 days ago
    if (!dismissed || daysSinceDismissed > 7) {
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
    } else {
      console.log('User dismissed the install prompt');
      // Save dismissal to localStorage
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Save dismissal to localStorage
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
        onClick={handleDismiss}
      />
      
      {/* Popup */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all duration-300 pointer-events-auto"
        style={{
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FaTimes size={16} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
            }}
          >
            <FaDownload size={24} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 
            className="text-2xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Install Yenege App
          </h3>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Install our app for a better experience. Get quick access, offline support, and faster loading times.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 text-sm sm:text-base"
            style={{
              background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
              boxShadow: "0 4px 15px rgba(255, 111, 94, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth >= 768) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 111, 94, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 111, 94, 0.3)";
            }}
          >
            Install Now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;

