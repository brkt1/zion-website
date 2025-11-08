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

const Hero = () => {
  const { destinations: apiDestinations } = useDestinations();
  const { content: homeContent } = useHomeContent();
  const destinations = apiDestinations.length > 0 ? apiDestinations : fallbackDestinations;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoChangeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const nextIndexRef = useRef(1);

  // Keep refs in sync with state
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    currentIndexRef.current = currentIndex;
    nextIndexRef.current = nextIndex;
  }, [isAnimating, currentIndex, nextIndex]);

  const getRandomDestination = useCallback((excludeIndex?: number): number => {
    let randomId = Math.floor(Math.random() * destinations.length);
    while (randomId === excludeIndex) {
      randomId = Math.floor(Math.random() * destinations.length);
    }
    return randomId;
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
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    const bodyElement = document.body;
    bodyElement.classList.add("body--animated");

    setTimeout(() => {
      const currentIdx = currentIndexRef.current;
      const nextDestinationIndex = getRandomDestination(currentIdx);
      setCurrentIndex(nextDestinationIndex);
      currentIndexRef.current = nextDestinationIndex;
      updateCSSVariables(destinations[nextDestinationIndex], destinations[nextIndexRef.current]);

      setTimeout(() => {
        bodyElement.classList.remove("body--animated");
        const newNextIndex = getRandomDestination(nextDestinationIndex);
        setNextIndex(newNextIndex);
        nextIndexRef.current = newNextIndex;
        updateCSSVariables(destinations[nextDestinationIndex], destinations[newNextIndex]);

        setTimeout(() => {
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }, 1000);
      }, 1000);
    }, 1000);
  }, [updateCSSVariables, destinations, getRandomDestination]);

  // Initialize CSS variables on mount
  useEffect(() => {
    if (rootRef.current) {
      updateCSSVariables(destinations[currentIndex], destinations[nextIndex]);
    }
  }, [updateCSSVariables, currentIndex, destinations, nextIndex]);

  // Auto-change functionality
  useEffect(() => {
    // Initial animation after component mounts
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
  }, [displayNextContent]);

  return (
    <div ref={rootRef} className="hero-container">
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

