import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { BRAND, GRADIENT } from '../../styles/theme';
import { FaGlobe, FaChevronRight, FaTimes } from 'react-icons/fa';

const LanguageSelectorModal: React.FC = () => {
  const { setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSelected = localStorage.getItem('language_selected');
    if (!hasSelected) {
      setIsVisible(true);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleSelect = (lang: 'en' | 'am') => {
    setLanguage(lang);
    localStorage.setItem('language_selected', 'true');
    localStorage.setItem('language', lang);
    setIsVisible(false);
    document.body.style.overflow = 'unset';
  };

  const handleClose = () => {
    setIsVisible(false);
    document.body.style.overflow = 'unset';
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '20px'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          background: BRAND.white,
          borderRadius: '40px',
          padding: '48px 40px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'rgba(15, 23, 42, 0.05)',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BRAND.navy,
            cursor: 'pointer',
            zIndex: 10
          }}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255, 212, 71, 0.05)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'rgba(255, 212, 71, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: BRAND.gold, 
            fontSize: '32px', 
            margin: '0 auto 32px' 
          }}>
            <FaGlobe />
          </div>

          <h2 className="yg-font-serif" style={{ fontSize: '32px', fontWeight: 900, color: BRAND.navy, marginBottom: '12px', lineHeight: 1.2 }}>
            Welcome to <span style={{ color: BRAND.gold }}>YENEGE</span>
          </h2>
          <p className="yg-font-sans" style={{ fontSize: '15px', color: BRAND.gray500, marginBottom: '40px', lineHeight: 1.6 }}>
            Please select your preferred language to continue.<br/>
            እባክዎ ለመቀጠል የሚፈልጉትን ቋንቋ ይምረጡ።
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => handleSelect('am')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '24px 32px',
                background: BRAND.navy,
                borderRadius: '20px',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>አማርኛ</div>
                <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amharic</div>
              </div>
              <FaChevronRight size={14} />
            </button>

            <button
              onClick={() => handleSelect('en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '24px 32px',
                background: BRAND.cream,
                borderRadius: '20px',
                border: `1px solid ${BRAND.navy}15`,
                color: BRAND.navy,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>English</div>
                <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>United Kingdom</div>
              </div>
              <FaChevronRight size={14} />
            </button>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', color: BRAND.gray400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Bringing Happiness to Life
            </div>
            
            <button
              onClick={() => {
                handleSelect('en');
                window.location.href = '/masterclass-registration';
              }}
              style={{
                background: 'none',
                border: 'none',
                color: BRAND.gold,
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                opacity: 0.8,
                marginTop: '10px'
              }}
            >
              Ready to Lead? Join our next Event Academy Masterclass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
