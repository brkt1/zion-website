import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Optionally unobserve to only animate once
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    
    // Function to observe all current elements
    const observeElements = () => {
      const elements = document.querySelectorAll('.reveal-wrapper:not(.is-revealed):not(.is-observing)');
      elements.forEach(el => {
        el.classList.add('is-observing');
        intersectionObserver.observe(el);
      });
    };

    // Initial observer scan with slight delay
    const initialTimeout = setTimeout(observeElements, 100);

    // Watch for DOM changes to catch dynamically added reveal-wrappers (e.g. after SWR loading completes)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(initialTimeout);
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]); // Re-run when route changes
};
