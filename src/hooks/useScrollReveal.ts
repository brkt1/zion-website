import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top immediately on route change to assist observer
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '10% 0px', // More standard margin
      threshold: 0.1
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    
    const observedElements = new WeakSet();

    const observeElements = () => {
      // Find all reveal wrappers that aren't yet revealed
      const elements = document.querySelectorAll('.reveal-wrapper:not(.is-revealed)');
      
      elements.forEach(el => {
        // Skip if already being observed by THIS observer instance
        if (observedElements.has(el)) return;
        
        observedElements.add(el);
        intersectionObserver.observe(el);
        
        // Immediate check: if element is already in viewport, reveal it
        // This is crucial for SPA navigation where elements might already be in view
        const rect = el.getBoundingClientRect();
        const isInViewport = rect.top < (window.innerHeight || document.documentElement.clientHeight) && 
                            rect.bottom > 0;
        
        if (isInViewport) {
          el.classList.add('is-revealed');
          intersectionObserver.unobserve(el);
        }
      });
    };

    // Multiple scans to catch elements at different stages of the lifecycle
    const t1 = setTimeout(observeElements, 50);
    const t2 = setTimeout(observeElements, 200);
    const t3 = setTimeout(observeElements, 500);
    const t4 = setTimeout(observeElements, 1000); // Catch late lazy-loaded content

    // Also observe DOM changes
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Backup scroll listener
    const handleScroll = () => observeElements();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);
};
