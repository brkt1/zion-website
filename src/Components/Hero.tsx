import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDestinations, useHomeContent } from "../hooks/useApi";
import { Destination } from "../services/api";
import { optimizeImageUrl, preloadOptimizedImage } from "../utils/imageOptimizer";
import "./Hero.css";

// Fallback destinations if API fails
const fallbackDestinations = [
  {
    id: "1",
    name: "Sahara",
    location: "Marrakech",
    img: "https://cdn.pixabay.com/photo/2021/11/26/17/26/dubai-desert-safari-6826298_1280.jpg"
  },
  {
    id: "2",
    name: "Maldives",
    location: "Indian Ocean",
    img: "https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg"
  },
  {
    id: "3",
    name: "Dolomites",
    location: "Italy",
    img: "https://cdn.pixabay.com/photo/2020/03/29/09/24/pale-di-san-martino-4979964_1280.jpg"
  },
];

const Hero = () => {
  const { destinations: apiDestinations } = useDestinations();
  const { content: homeContent } = useHomeContent();
  const destinations = apiDestinations.length > 0 ? apiDestinations : fallbackDestinations;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoChangeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileChangeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const nextIndexRef = useRef(0);
  const destinationsRef = useRef(destinations);
  const hasInitializedRef = useRef(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keep refs in sync with state and destinations
  useEffect(() => {
    destinationsRef.current = destinations;
  }, [destinations]);

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    currentIndexRef.current = currentIndex;
    nextIndexRef.current = nextIndex;
  }, [isAnimating, currentIndex, nextIndex]);

  const getNextDestinationIndex = useCallback((excludeIndex: number): number => {
    const dests = destinationsRef.current;
    if (dests.length === 0) return 0;
    if (dests.length === 1) return 0;
    
    // Cycle to next index, wrapping around
    const next = (excludeIndex + 1) % dests.length;
    return next;
  }, []);

  const updateCSSVariables = useCallback((current: Destination, next: Destination) => {
    if (rootRef.current && !isAnimatingRef.current) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        if (rootRef.current) {
          rootRef.current.style.setProperty("--img-current", `url(${current.img})`);
          rootRef.current.style.setProperty("--text-current-title", `"${current.name}"`);
          rootRef.current.style.setProperty("--text-current-subtitle", `"${current.location}"`);
          rootRef.current.style.setProperty("--img-next", `url(${next.img})`);
          rootRef.current.style.setProperty("--text-next-title", `"${next.name}"`);
          rootRef.current.style.setProperty("--text-next-subtitle", `"${next.location}"`);
        }
      });
    }
  }, []);

  const displayNextContentRef = useRef<() => void>(() => {});
  
  // Update the ref callback whenever dependencies change
  useEffect(() => {
    displayNextContentRef.current = () => {
      const dests = destinationsRef.current;
      // Don't animate if no destinations or only one destination
      if (dests.length === 0 || dests.length === 1) return;
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      setIsAnimating(true);
      const bodyElement = document.body;
      bodyElement.classList.add("body--animated");

      // Update CSS variables before animation starts
      const newCurrentIndex = nextIndexRef.current;
      const newNextIndex = getNextDestinationIndex(newCurrentIndex);
      const currentDest = dests[newCurrentIndex];
      const nextDest = dests[newNextIndex];
      
      if (currentDest && nextDest) {
        // Optimize image URLs for better performance
        // Use lower quality for better compression (reduced to 55/50)
        const optimizedCurrentImg = optimizeImageUrl(currentDest.img, { width: 1920, quality: 55, format: 'auto' });
        const optimizedNextImg = optimizeImageUrl(nextDest.img, { width: 1920, quality: 50, format: 'auto' });
        
        // Preload optimized next image before setting CSS variable to avoid layout shift
        const preloadImg = new Image();
        preloadImg.loading = 'eager';
        preloadImg.fetchPriority = 'high';
        preloadImg.crossOrigin = 'anonymous';
        preloadImg.onload = () => {
          // Only update CSS variables after image is loaded
          if (rootRef.current) {
            rootRef.current.style.setProperty("--img-current", `url(${optimizedCurrentImg})`);
            rootRef.current.style.setProperty("--text-current-title", `"${currentDest.name}"`);
            rootRef.current.style.setProperty("--text-current-subtitle", `"${currentDest.location}"`);
            rootRef.current.style.setProperty("--img-next", `url(${optimizedNextImg})`);
            rootRef.current.style.setProperty("--text-next-title", `"${nextDest.name}"`);
            rootRef.current.style.setProperty("--text-next-subtitle", `"${nextDest.location}"`);
          }
        };
        preloadImg.onerror = () => {
          // Fallback: use optimized URLs (not original) to prevent direct pixabay connection
          // Re-optimize in case the first optimization failed
          const fallbackCurrent = optimizeImageUrl(currentDest.img, { width: 1920, quality: 55, format: 'auto' });
          const fallbackNext = optimizeImageUrl(nextDest.img, { width: 1920, quality: 50, format: 'auto' });
          if (rootRef.current) {
            rootRef.current.style.setProperty("--img-current", `url(${fallbackCurrent})`);
            rootRef.current.style.setProperty("--text-current-title", `"${currentDest.name}"`);
            rootRef.current.style.setProperty("--text-current-subtitle", `"${currentDest.location}"`);
            rootRef.current.style.setProperty("--img-next", `url(${fallbackNext})`);
            rootRef.current.style.setProperty("--text-next-title", `"${nextDest.name}"`);
            rootRef.current.style.setProperty("--text-next-subtitle", `"${nextDest.location}"`);
          }
        };
        preloadImg.src = optimizedNextImg;
        
        // Update CSS variables immediately (image will load in background)
        if (rootRef.current) {
          rootRef.current.style.setProperty("--img-current", `url(${optimizedCurrentImg})`);
          rootRef.current.style.setProperty("--text-current-title", `"${currentDest.name}"`);
          rootRef.current.style.setProperty("--text-current-subtitle", `"${currentDest.location}"`);
          rootRef.current.style.setProperty("--img-next", `url(${optimizedNextImg})`);
          rootRef.current.style.setProperty("--text-next-title", `"${nextDest.name}"`);
          rootRef.current.style.setProperty("--text-next-subtitle", `"${nextDest.location}"`);
        }
      }

      // Wait for animation to complete before updating state
      setTimeout(() => {
        setCurrentIndex(newCurrentIndex);
        currentIndexRef.current = newCurrentIndex;
        
        setNextIndex(newNextIndex);
        nextIndexRef.current = newNextIndex;

        setTimeout(() => {
          bodyElement.classList.remove("body--animated");

          setTimeout(() => {
            isAnimatingRef.current = false;
            setIsAnimating(false);
          }, 50); // Reduced delay for faster state reset
        }, 50); // Reduced delay
      }, 1000);
    };
  }, [getNextDestinationIndex]);

  // Preload only the first destination image (LCP optimization)
  // Automatically optimizes images to WebP/AVIF format
  useEffect(() => {
    if (destinations.length > 0 && destinations[0]?.img) {
      // Preload optimized first image for LCP with high priority
      // Use lower quality (55) for better compression while maintaining visual quality
      preloadOptimizedImage(destinations[0].img, {
        width: 1920, // Full width for hero
        quality: 55, // Reduced for better compression
        priority: 'high',
      }).catch((error) => {
        console.warn('Failed to preload optimized image, using optimized fallback:', error);
        // Fallback to optimized version (not original) to prevent direct pixabay connection
        const optimizedFallback = optimizeImageUrl(destinations[0].img, { width: 1920, quality: 55, format: 'auto' });
        const img = new Image();
        img.loading = 'eager';
        img.fetchPriority = 'high';
        img.crossOrigin = 'anonymous';
        img.src = optimizedFallback;
      });
      
      // Preload second image only (needed for animation transition)
      // Other images will load on-demand when animation cycles to them
      if (destinations.length > 1 && destinations[1]?.img) {
        // Delay loading second image to prioritize first (LCP)
        const timeoutId = setTimeout(() => {
          preloadOptimizedImage(destinations[1].img, {
            width: 1920,
            quality: 50, // Lower quality for non-LCP images
            priority: 'low',
          }).catch(() => {
            // Fallback to optimized version (not original) to prevent direct pixabay connection
            const optimizedFallback = optimizeImageUrl(destinations[1].img, { width: 1920, quality: 50, format: 'auto' });
            const secondImg = new Image();
            secondImg.loading = 'lazy';
            secondImg.fetchPriority = 'low';
            secondImg.crossOrigin = 'anonymous';
            secondImg.src = optimizedFallback;
          });
        }, 2000); // Increased delay to prioritize LCP image
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [destinations]);

  // Initialize CSS variables and indices only once when destinations are loaded
  // Use optimized image URLs for better performance
  useEffect(() => {
    if (rootRef.current && destinations.length > 0 && !hasInitializedRef.current) {
      const current = destinations[0];
      const next = destinations.length > 1 ? destinations[1] : destinations[0];
      
      if (current && next) {
        // Optimize image URLs before setting CSS variables
        // Use lower quality for better compression (reduced to 55/50)
        const optimizedCurrent = {
          ...current,
          img: optimizeImageUrl(current.img, { width: 1920, quality: 55, format: 'auto' }),
        };
        const optimizedNext = {
          ...next,
          img: optimizeImageUrl(next.img, { width: 1920, quality: 50, format: 'auto' }),
        };
        
        updateCSSVariables(optimizedCurrent, optimizedNext);
        setCurrentIndex(0);
        setNextIndex(destinations.length > 1 ? 1 : 0);
        currentIndexRef.current = 0;
        nextIndexRef.current = destinations.length > 1 ? 1 : 0;
        hasInitializedRef.current = true;
      }
    }
  }, [destinations, updateCSSVariables]);

  // Reset initialization flag when destinations change significantly
  useEffect(() => {
    if (destinations.length > 0 && destinationsRef.current.length !== destinations.length) {
      hasInitializedRef.current = false;
    }
  }, [destinations.length]);

  // Mobile carousel - simple image cycling
  useEffect(() => {
    if (!isMobile || destinations.length <= 1) {
      if (mobileChangeIntervalRef.current) {
        clearInterval(mobileChangeIntervalRef.current);
        mobileChangeIntervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval
    if (mobileChangeIntervalRef.current) {
      clearInterval(mobileChangeIntervalRef.current);
    }

    // Start cycling through destinations on mobile (change every 5 seconds)
    mobileChangeIntervalRef.current = setInterval(() => {
      setMobileImageIndex((prev) => (prev + 1) % destinations.length);
    }, 5000);

    return () => {
      if (mobileChangeIntervalRef.current) {
        clearInterval(mobileChangeIntervalRef.current);
        mobileChangeIntervalRef.current = null;
      }
    };
  }, [isMobile, destinations.length]);

  // Auto-change functionality - only depends on destinations length
  // Disable on mobile for better performance
  useEffect(() => {
    // Disable animation on mobile
    if (isMobile) {
      if (autoChangeIntervalRef.current) {
        clearInterval(autoChangeIntervalRef.current);
        autoChangeIntervalRef.current = null;
      }
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
        initialTimeoutRef.current = null;
      }
      return;
    }

    // Only set up auto-change if we have more than 1 destination
    if (destinations.length <= 1) {
      // Clear any existing intervals
      if (autoChangeIntervalRef.current) {
        clearInterval(autoChangeIntervalRef.current);
        autoChangeIntervalRef.current = null;
      }
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
        initialTimeoutRef.current = null;
      }
      return;
    }

    // Clear any existing intervals/timeouts first
    if (autoChangeIntervalRef.current) {
      clearInterval(autoChangeIntervalRef.current);
    }
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
    }

    // Wait a bit before starting to ensure initialization is complete
    initialTimeoutRef.current = setTimeout(() => {
      if (!isAnimatingRef.current && hasInitializedRef.current) {
        displayNextContentRef.current?.();
      }
    }, 3000); // Increased initial delay

    // Set up auto-change interval (change every 8 seconds)
    autoChangeIntervalRef.current = setInterval(() => {
      if (!isAnimatingRef.current) {
        displayNextContentRef.current?.();
      }
    }, 8000);

    return () => {
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
        initialTimeoutRef.current = null;
      }
      if (autoChangeIntervalRef.current) {
        clearInterval(autoChangeIntervalRef.current);
        autoChangeIntervalRef.current = null;
      }
    };
  }, [destinations.length, isMobile]);

  // Get destinations for mobile carousel
  const getMobileDestination = (offset: number) => {
    const index = (mobileImageIndex + offset) % destinations.length;
    return destinations[index] || destinations[0];
  };

  const mobileDest1 = getMobileDestination(0);
  const mobileDest2 = getMobileDestination(1);
  const mobileDest3 = getMobileDestination(2);

  return (
    <div ref={rootRef} className={`hero-container ${isMobile ? 'hero-mobile' : ''}`}>
      <main>
        {isMobile ? (
          /* Mobile: Simple changing background similar to CTA section */
          <>
            <div 
              className="hero-mobile-background hero-mobile-bg-1"
              style={{
                backgroundImage: mobileDest1 ? `url(${optimizeImageUrl(mobileDest1.img, { width: 1920, quality: 55, format: 'auto' })})` : undefined,
              }}
            ></div>
            <div 
              className="hero-mobile-background hero-mobile-background--2 hero-mobile-bg-2"
              style={{
                backgroundImage: mobileDest2 ? `url(${optimizeImageUrl(mobileDest2.img, { width: 1920, quality: 55, format: 'auto' })})` : undefined,
              }}
            ></div>
            <div 
              className="hero-mobile-background hero-mobile-background--3 hero-mobile-bg-3"
              style={{
                backgroundImage: mobileDest3 ? `url(${optimizeImageUrl(mobileDest3.img, { width: 1920, quality: 55, format: 'auto' })})` : undefined,
              }}
            ></div>
          </>
        ) : (
          /* Desktop: Animated backgrounds */
          <>
            <div className="background"></div>
            <div className="background background--2"></div>
            <div className="background background--3"></div>
          </>
        )}
        
        {/* Hero Content Overlay */}
        <div className="hero-content-overlay">
          <div className="hero-text-content">
            <h1 className="hero-slogan">{homeContent?.hero?.slogan || "Bringing Happiness to Life"}</h1>
            
            {homeContent?.hero?.categories && homeContent.hero.categories.length > 0 && (
              <div className="hero-categories">
                {homeContent.hero.categories.map((category, index) => (
                  <span key={index}>
                    <Link to={category.path} className="category-link">
                      {category.label}
                    </Link>
                    {index < homeContent.hero.categories.length - 1 && (
                      <span className="category-separator">|</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            <p className="hero-intro">
              {homeContent?.hero?.intro || "Yenege is a vibrant community dedicated to creating unforgettable experiences. We bring people together through exciting game nights, amazing travel adventures, and meaningful connections that celebrate life's beautiful moments."}
            </p>

            {homeContent?.cta?.buttons && homeContent.cta.buttons.length > 0 ? (
              <div className="hero-cta-buttons">
                {homeContent.cta.buttons.map((button, index) => (
                  <Link
                    key={index}
                    to={button.link}
                    className={`cta-button ${button.type === 'primary' ? 'cta-primary' : 'cta-secondary'}`}
                  >
                    {button.text}
                    <FaArrowRight className="ml-2" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="hero-cta-buttons">
                <Link to="/events" className="cta-button cta-primary">
                  Explore Events
                  <FaArrowRight className="ml-2" />
                </Link>
                <Link to="/community" className="cta-button cta-secondary">
                  Join Our Community
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;


