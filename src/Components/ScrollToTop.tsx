import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component handles scroll restoration:
 * - Scrolls to top when navigating to a new page
 * - Restores scroll position when using browser back/forward buttons
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const scrollPositions = useRef<{ [key: string]: number }>({});
  const isRestoring = useRef(false);
  const previousPath = useRef<string | null>(null);
  const navigationType = useRef<'push' | 'pop'>('push');

  // Detect navigation type (push vs pop/back)
  useEffect(() => {
    const handlePopState = () => {
      navigationType.current = 'pop';
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    // Save scroll position of previous page before navigation
    if (previousPath.current && previousPath.current !== pathname) {
      scrollPositions.current[previousPath.current] = window.scrollY;
    }

    // Check if we should restore scroll position (back/forward navigation)
    const shouldRestore = 
      navigationType.current === 'pop' && 
      scrollPositions.current[pathname] !== undefined;

    if (shouldRestore) {
      // Restore scroll position for back/forward navigation
      isRestoring.current = true;
      const savedPosition = scrollPositions.current[pathname];
      
      // Wait for DOM to be ready, then restore position
      const restoreScroll = () => {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedPosition,
            left: 0,
            behavior: 'auto', // Instant scroll for restoration
          });
          // Reset after a short delay
          setTimeout(() => {
            isRestoring.current = false;
            navigationType.current = 'push'; // Reset for next navigation
          }, 100);
        });
      };

      // If page is still loading, wait a bit longer
      if (document.readyState === 'complete') {
        restoreScroll();
      } else {
        window.addEventListener('load', restoreScroll, { once: true });
        // Fallback timeout
        setTimeout(restoreScroll, 300);
      }
    } else {
      // New page navigation - scroll to top
      isRestoring.current = false;
      navigationType.current = 'push';
      
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }

    // Save scroll position as user scrolls (only if not restoring)
    const handleScroll = () => {
      if (!isRestoring.current) {
        scrollPositions.current[pathname] = window.scrollY;
      }
    };

    // Throttle scroll events for better performance
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Update previous path
    previousPath.current = pathname;

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;

