import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVisit } from '../services/analytics';

/**
 * Component to track page visits
 * Should be placed in the App component to track all route changes
 */
const VisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Track the visit
    trackVisit(location.pathname);
  }, [location.pathname]);

  return null;
};

export default VisitTracker;

