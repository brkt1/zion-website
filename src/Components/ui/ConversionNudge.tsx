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
      if (!isClosed) {
        setIsVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isClosed]);

  if (!isVisible || isClosed) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        maxWidth: '320px',
        width: 'calc(100vw - 48px)',
        background: BRAND.navy,
        border: '1px solid rgba(255, 212, 71, 0.3)',
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        animation: 'nudgeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes nudgeSlideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <button 
        onClick={() => setIsClosed(true)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.4)',
          cursor: 'pointer',
        }}
      >
        <FaTimes size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1C2951'
          }}
        >
          <FaGraduationCap size={24} />
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ready to Lead?
          </h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', margin: '4px 0 0' }}>
            Join our next Event Academy Masterclass.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link 
          to="/masterclass"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(255, 212, 71, 0.1)',
            border: '1px solid rgba(255, 212, 71, 0.3)',
            borderRadius: '12px',
            color: '#FFD447',
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.3s'
          }}
        >
          Learn More
        </Link>
        <a 
          href="https://wa.me/251978639887"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            background: '#25D366',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.3s'
          }}
        >
          <FaWhatsapp size={16} /> Chat on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default ConversionNudge;
