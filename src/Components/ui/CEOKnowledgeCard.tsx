import React from 'react';
import { FaInstagram, FaLinkedin, FaYoutube, FaFacebook, FaTwitter, FaGlobe } from 'react-icons/fa';
import OptimizedImage from './OptimizedImage';

interface CEOProps {
  name: string;
  title: string;
  bio: string;
  image: string;
  details: {
    label: string;
    value: string;
    link?: string;
  }[];
  socials: {
    platform: string;
    url: string;
  }[];
}

const CEOKnowledgeCard: React.FC<CEOProps> = ({ name, title, bio, image, details, socials }) => {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <FaInstagram />;
      case 'linkedin': return <FaLinkedin />;
      case 'youtube': return <FaYoutube />;
      case 'facebook': return <FaFacebook />;
      case 'twitter': return <FaTwitter />;
      default: return <FaGlobe />;
    }
  };

  return (
    <div className="google-knowledge-panel" style={{
      background: '#171717',
      color: '#bdc1c6',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '380px',
      width: '100%',
      fontFamily: 'arial, sans-serif',
      border: '1px solid #3c4043',
      lineHeight: '1.58'
    }}>
      <style>{`
        .g-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .g-logo {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          overflow: hidden;
          background: #fff;
          flex-shrink: 0;
        }
        .g-title-area {
          flex: 1;
        }
        .g-name {
          font-size: 24px;
          color: #fff;
          margin: 0;
          font-weight: 400;
        }
        .g-subtitle {
          font-size: 14px;
          color: #bdc1c6;
        }
        .g-bio {
          font-size: 14px;
          color: #bdc1c6;
          margin-bottom: 8px;
        }
        .g-source {
          font-size: 12px;
          color: #bdc1c6;
          margin-bottom: 24px;
        }
        .g-source-link {
          color: #8ab4f8;
          text-decoration: none;
        }
        .g-details-table {
          border-top: 1px solid #3c4043;
          margin-bottom: 24px;
        }
        .g-detail-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #3c4043;
          font-size: 14px;
        }
        .g-detail-label {
          width: 100px;
          color: #969ba1;
          flex-shrink: 0;
        }
        .g-detail-value {
          color: #8ab4f8;
          cursor: pointer;
        }
        .g-profiles-header {
          font-size: 16px;
          color: #fff;
          margin: 0 0 16px 0;
          font-weight: 400;
        }
        .g-social-grid {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .g-social-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #bdc1c6;
          width: 56px;
        }
        .g-social-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #3c4043;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: background 0.2s;
        }
        .g-social-item:hover .g-social-circle {
          background: #303134;
        }
        .g-social-label {
          font-size: 11px;
          text-align: center;
        }
      `}</style>

      <div className="g-header">
        <div className="g-logo">
          <OptimizedImage src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="g-title-area">
          <h2 className="g-name">{name}</h2>
          <div className="g-subtitle">{title}</div>
        </div>
      </div>

      <div className="g-bio">
        {bio}
      </div>
      <div className="g-source">
        Source: <a href="https://linkedin.com/in/bereketyosef" className="g-source-link">Official Profile</a>
      </div>

      <div className="g-details-table">
        {details.map((detail, idx) => (
          <div key={idx} className="g-detail-row">
            <div className="g-detail-label">{detail.label}</div>
            <div className="g-detail-value">{detail.value}</div>
          </div>
        ))}
      </div>

      <div className="g-profiles">
        <h3 className="g-profiles-header">Profiles</h3>
        <div className="g-social-grid">
          {socials.map((social, idx) => (
            <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="g-social-item">
              <div className="g-social-circle">
                {getSocialIcon(social.platform)}
              </div>
              <span className="g-social-label">{social.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CEOKnowledgeCard;
