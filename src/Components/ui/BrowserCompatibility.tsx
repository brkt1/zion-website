import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { checkBrowserCompatibility, safeStorage } from '../../utils/polyfills';

/**
 * Browser Compatibility Check Component
 * Shows warnings for unsupported browsers or missing features
 */
export const BrowserCompatibility = () => {
  const [compatibility, setCompatibility] = useState<ReturnType<typeof checkBrowserCompatibility> | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const report = checkBrowserCompatibility();
    setCompatibility(report);
    
    // Check if user has dismissed the warning
    const dismissedStorage = safeStorage.getItem('browser-compat-dismissed');
    if (dismissedStorage === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    safeStorage.setItem('browser-compat-dismissed', 'true');
  };

  // Don't show if dismissed or if browser is fully compatible
  if (dismissed || !compatibility || (compatibility.compatible && compatibility.warnings.length === 0)) {
    return null;
  }

  // Only show if there are critical issues
  if (compatibility.issues.length === 0 && compatibility.warnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-50 border-b border-yellow-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {compatibility.issues.length > 0 ? (
              <FaExclamationTriangle className="text-red-500" size={20} />
            ) : (
              <FaExclamationTriangle className="text-yellow-500" size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {compatibility.issues.length > 0 ? 'Browser Compatibility Issues' : 'Browser Compatibility Warning'}
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              {compatibility.issues.length > 0 && (
                <div>
                  <p className="font-medium text-red-700">Critical issues:</p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    {compatibility.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {compatibility.warnings.length > 0 && (
                <div>
                  <p className="font-medium text-yellow-700">Warnings:</p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    {compatibility.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-2">
                For the best experience, please use a modern browser like Chrome, Firefox, Safari, or Edge.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-yellow-100 transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Dismiss"
          >
            <FaTimes size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

