import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useDestinations, useHomeContent } from "../hooks/useApi";
import { optimizeImageUrl } from "../utils/imageOptimizer";
import "./Hero.css";

// Fallback destinations if API fails or is loading
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

const Hero: React.FC = () => {
  const { destinations: apiDestinations } = useDestinations();
  const { content: homeContent } = useHomeContent();
  const { t, language } = useLanguage();

  const destinations = apiDestinations.length > 0 ? apiDestinations : fallbackDestinations;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-cycle background images seamlessly
  useEffect(() => {
    if (destinations.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [destinations.length]);

  return (
    <div className="hero-container">
      {/* Full-bleed Background Images with Cross-fade & Ken Burns effect */}
      <div className="hero-background-slider">
        {destinations.map((dest, index) => {
          const isActive = index === currentIndex;
          const optImg = optimizeImageUrl(dest.img, { width: 1920, quality: 60, format: "auto" });
          return (
            <div
              key={dest.id || index}
              className={`hero-bg-slide ${isActive ? "active" : ""}`}
              style={{ backgroundImage: `url(${optImg})` }}
              aria-hidden={!isActive}
            />
          );
        })}
        
        {/* Luxury Obsidian Ambient Overlays */}
        <div className="hero-overlay-base" />
        <div className="hero-overlay-glow" />
        <div className="hero-overlay-grid" />
      </div>

      {/* Hero Content Overlay */}
      <div className="hero-content-wrapper">
        <div className="hero-text-content">
          
          {/* Trust Badge */}
          <div className="hero-trust-badge">
            <span className="badge-pulse-ring">
              <span className="badge-pulse-dot" />
            </span>
            <div className="badge-text-group">
              <span className="badge-title">
                {language === "am"
                  ? "በምስራቅ አፍሪካ"
                  : language === "om"
                  ? "Baha Afrikaatti"
                  : "ONE OF EAST AFRICA'S"}
              </span>
              <span className="badge-dot-sep">•</span>
              <span className="badge-label">
                {language === "am"
                  ? "ግንባር ቀደም አካደሚ"
                  : language === "om"
                  ? "Akaadaamii Dursaa"
                  : "LEADING ACADEMIES"}
              </span>
            </div>
          </div>

          {/* Main Tagline Slogan */}
          <h1 className="hero-slogan">{t.hero.tagline}</h1>

          {/* Category Chips */}
          {homeContent?.hero?.categories && homeContent.hero.categories.length > 0 && (
            <div className="hero-categories-chips">
              {homeContent.hero.categories
                .filter((cat) => !["community", "corporate", "game"].includes(cat.label.toLowerCase()))
                .map((category, index) => (
                  <Link key={index} to={category.path} className="category-chip">
                    <span className="chip-indicator" />
                    <span className="chip-label">{category.label}</span>
                  </Link>
                ))}
            </div>
          )}

          {/* Description Paragraph */}
          <p className="hero-intro">{t.hero.description}</p>

          {/* CTA Buttons */}
          <div className="hero-cta-buttons">
            {/* Primary: yenege.events */}
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button cta-primary"
              title="Discover All Events on yenege.events"
            >
              <span>{language === 'am' ? 'ኢቨንቶችን በ yenege.events ይመልከቱ' : 'Discover on yenege.events'}</span>
              <FaArrowRight className="cta-icon" />
            </a>

            {/* Secondary: EventJobs */}
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button cta-secondary"
              title="EventJobs Portal on yenege.events"
            >
              <span>{language === 'am' ? 'የኢቨንት ስራዎች (EventJobs)' : 'EventJobs Portal'}</span>
              <FaArrowRight className="cta-icon" />
            </a>

            {/* Tertiary: Masterclass */}
            <Link
              to="/masterclass"
              className="cta-button cta-secondary hidden sm:inline-flex"
            >
              <span>{language === 'am' ? 'ማስተርክላስ አካደሚ' : 'Academy Masterclass'}</span>
              <FaArrowRight className="cta-icon" />
            </Link>
          </div>

        </div>

        {/* Executive Stats Bar (Social Proof & Wow Factor) */}
        <div className="hero-stats-bar">
          <div className="stat-card">
            <span className="stat-number">50+</span>
            <span className="stat-label">
              {language === "am"
                ? "የተፈጠሩ ኢቨንቶች"
                : language === "om"
                ? "Qophiiwwan Uumaman"
                : "Created Events"}
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">99.4%</span>
            <span className="stat-label">
              {language === "am"
                ? "የአመራሮች እርካታ"
                : language === "om"
                ? "Gammachuu Hogganootaa"
                : "Executive Satisfaction"}
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">50</span>
            <span className="stat-label">
              {language === "am"
                ? "መስራች አርክቴክቶች"
                : language === "om"
                ? "Ijaartota Ragaa Qaban"
                : "Founding Architects"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
