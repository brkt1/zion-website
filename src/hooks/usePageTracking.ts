import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/googleAnalytics';

/**
 * Hook to track page views in Google Analytics when route changes
 * 
 * Usage: Add this hook to your App component or Layout component
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
};

