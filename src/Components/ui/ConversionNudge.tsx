import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaTimes, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { BRAND } from '../../styles/theme';

const ConversionNudge: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Show nudge after 5 seconds
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('nudge_dismissed');
      if (!isClosed && !dismissed) {
        setIsVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isClosed]);

  const handleDismiss = () => {
    setIsClosed(true);
    sessionStorage.setItem('nudge_dismissed', 'true');
  };

  if (!isVisible || isClosed) return null;

  return (
    <div 
      className="conversion-nudge"
      style={{
        position: 'fixed',
        bottom: '110px', // Higher to avoid MobileBottomNav
        right: '20px',
        zIndex: 1000,
        maxWidth: '340px',
        width: 'calc(100vw - 40px)',
        background: BRAND.navy,
        border: '1px solid rgba(255, 212, 71, 0.2)',
        borderRadius: '28px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'nudgeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <style>{`
        @keyframes nudgeSlideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 768px) {
          .conversion-nudge {
            bottom: 32px !important;
            right: 32px !important;
          }
        }
      `}</style>
      
      {/* High-visibility Close Button */}
      <button 
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          zIndex: 10
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        aria-label="Dismiss"
      >
        <FaTimes size={16} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div 
          style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1C2951',
            boxShadow: '0 8px 16px rgba(255, 111, 94, 0.3)'
          }}
        >
          <FaGraduationCap size={26} />
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ready to Lead?
          </h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', margin: '4px 0 0', lineHeight: 1.4 }}>
            Join our next Event Academy Masterclass.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link 
          to="/masterclass-registration"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '14px',
            background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)',
            borderRadius: '16px',
            color: BRAND.navy,
            fontSize: '13px',
            fontWeight: 800,
            textDecoration: 'none',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(255, 111, 94, 0.2)'
          }}
        >
          Enroll Now
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href="https://wa.me/251978639887"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: '#25D366',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
          >
            <FaWhatsapp size={16} /> WhatsApp
          </a>
          <button 
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionNudge;
