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

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal-wrapper');
    
    // Slight delay to allow DOM to render to catch all elements
    setTimeout(() => {
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [location.pathname]); // Re-run when route changes
};
