import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDestinations, useHomeContent } from "../hooks/useApi";
import { Destination } from "../services/api";
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

// Helper function to preload an image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

// Preload all destination images
const preloadDestinationImages = async (destinations: Destination[]): Promise<void> => {
  // Get unique image URLs to avoid duplicate preloads
  const uniqueImageUrls = Array.from(new Set(destinations.map(dest => dest.img).filter(Boolean)));
  const imagePromises = uniqueImageUrls.map(url => preloadImage(url));
  await Promise.allSettled(imagePromises);
};

const Hero = () => {
  const { destinations: apiDestinations } = useDestinations();
  const { content: homeContent } = useHomeContent();
  const destinations = apiDestinations.length > 0 ? apiDestinations : fallbackDestinations;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoChangeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const nextIndexRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    currentIndexRef.current = currentIndex;
    nextIndexRef.current = nextIndex;
  }, [isAnimating, currentIndex, nextIndex]);

  // Preload images when destinations change
  useEffect(() => {
    if (destinations.length === 0) {
      setImagesLoaded(false);
      return;
    }

    setImagesLoaded(false);
    preloadDestinationImages(destinations)
      .then(() => {
        setImagesLoaded(true);
      })
      .catch((error) => {
        console.error("Error preloading images:", error);
        // Still set images loaded to true to show fallback/default images
        setImagesLoaded(true);
      });
  }, [destinations]);

  // Initialize next index when destinations change
  useEffect(() => {
    if (destinations.length > 1) {
      const initialNext = 1;
      setNextIndex(initialNext);
      nextIndexRef.current = initialNext;
    } else if (destinations.length === 1) {
      setNextIndex(0);
      nextIndexRef.current = 0;
    }
  }, [destinations.length]);

  const getNextDestinationIndex = useCallback((excludeIndex: number): number => {
    if (destinations.length === 0) return 0;
    if (destinations.length === 1) return 0;
    
    // Cycle to next index, wrapping around
    const next = (excludeIndex + 1) % destinations.length;
    return next;
  }, [destinations]);

  const updateCSSVariables = useCallback((current: Destination, next: Destination) => {
    if (rootRef.current) {
      rootRef.current.style.setProperty("--img-current", `url(${current.img})`);
      rootRef.current.style.setProperty("--text-current-title", `"${current.name}"`);
      rootRef.current.style.setProperty("--text-current-subtitle", `"${current.location}"`);
      rootRef.current.style.setProperty("--img-next", `url(${next.img})`);
      rootRef.current.style.setProperty("--text-next-title", `"${next.name}"`);
      rootRef.current.style.setProperty("--text-next-subtitle", `"${next.location}"`);
    }
  }, []);

  const displayNextContent = useCallback(() => {
    // Don't animate if no destinations or only one destination
    if (destinations.length === 0 || destinations.length === 1) return;
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    const bodyElement = document.body;
    bodyElement.classList.add("body--animated");

    setTimeout(() => {
      // Move to the next destination (which was previously the "next")
      const newCurrentIndex = nextIndexRef.current;
      setCurrentIndex(newCurrentIndex);
      currentIndexRef.current = newCurrentIndex;
      
      // Calculate the new next destination
      const newNextIndex = getNextDestinationIndex(newCurrentIndex);
      setNextIndex(newNextIndex);
      nextIndexRef.current = newNextIndex;
      
      const currentDest = destinations[newCurrentIndex];
      const nextDest = destinations[newNextIndex];
      if (currentDest && nextDest) {
        updateCSSVariables(currentDest, nextDest);
      }

      setTimeout(() => {
        bodyElement.classList.remove("body--animated");

        setTimeout(() => {
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }, 1000);
      }, 1000);
    }, 1000);
  }, [updateCSSVariables, destinations, getNextDestinationIndex]);

  // Initialize CSS variables on mount or when destinations change (only after images are loaded)
  useEffect(() => {
    if (rootRef.current && destinations.length > 0 && imagesLoaded) {
      const current = destinations[currentIndex];
      const next = destinations[nextIndex] || destinations[0];
      if (current && next) {
        updateCSSVariables(current, next);
      }
    }
  }, [updateCSSVariables, currentIndex, nextIndex, destinations, imagesLoaded]);

  // Auto-change functionality (only start after images are loaded)
  useEffect(() => {
    // Only set up auto-change if we have more than 1 destination and images are loaded
    if (destinations.length <= 1 || !imagesLoaded) return;

    // Initial animation after component mounts and images are loaded
    const initialTimeout = setTimeout(() => {
      displayNextContent();
    }, 2000);

    // Set up auto-change interval (change every 8 seconds)
    autoChangeIntervalRef.current = setInterval(() => {
      displayNextContent();
    }, 8000);

    return () => {
      clearTimeout(initialTimeout);
      if (autoChangeIntervalRef.current) {
        clearInterval(autoChangeIntervalRef.current);
      }
    };
  }, [displayNextContent, destinations.length, imagesLoaded]);

  return (
    <div ref={rootRef} className={`hero-container ${imagesLoaded ? 'images-loaded' : 'images-loading'}`}>
      <main>
        <div className="background"></div>
        <div className="background background--2"></div>
        <div className="background background--3"></div>
        
        {/* Hero Content Overlay */}
        <div className="hero-content-overlay">
          <div className="hero-logo">
            <img src="/logo.png" alt="Zion Logo" />
          </div>
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

