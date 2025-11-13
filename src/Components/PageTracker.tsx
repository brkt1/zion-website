import { usePageTracking } from '../hooks/usePageTracking';

/**
 * Component to track page views in Google Analytics
 * This component should be placed inside the Router
 */
const PageTracker = () => {
  usePageTracking();
  return null;
};

export default PageTracker;

