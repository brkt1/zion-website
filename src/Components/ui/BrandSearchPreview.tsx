import React from 'react';
import { FaInstagram, FaLinkedin, FaYoutube, FaFacebook, FaSearch } from 'react-icons/fa';

const BrandSearchPreview: React.FC = () => {
  return (
    <div className="serp-simulation" style={{
      background: '#202124',
      padding: '40px',
      borderRadius: '24px',
      color: '#bdc1c6',
      fontFamily: 'arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
    }}>
      <style>{`
        .serp-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          border-bottom: 1px solid #3c4043;
          padding-bottom: 20px;
        }
        .serp-search-bar {
          background: #303134;
          border-radius: 24px;
          padding: 8px 20px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
        }
        .serp-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }
        .serp-main-title {
          font-size: 20px;
          color: #8ab4f8;
          margin: 0 0 4px 0;
          cursor: pointer;
        }
        .serp-main-title:hover { text-decoration: underline; }
        .serp-url {
          font-size: 14px;
          color: #dadce0;
          margin-bottom: 8px;
        }
        .serp-snippet {
          font-size: 14px;
          color: #bdc1c6;
          line-height: 1.58;
          margin-bottom: 20px;
        }
        .serp-sitelinks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-left: 20px;
        }
        .serp-sitelink-title {
          color: #8ab4f8;
          font-size: 16px;
          margin-bottom: 4px;
          cursor: pointer;
        }
        .serp-sitelink-desc {
          font-size: 12px;
          color: #bdc1c6;
        }
        
        /* Knowledge Panel Styling */
        .kp-card {
          border: 1px solid #3c4043;
          border-radius: 8px;
          padding: 16px;
          background: #171717;
        }
        .kp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .kp-brand-name {
          font-size: 24px;
          color: #fff;
          margin: 0;
        }
        .kp-type {
          font-size: 14px;
          color: #bdc1c6;
        }
        .kp-img {
          width: 60px;
          height: 60px;
          background: #fff;
          border-radius: 4px;
          padding: 5px;
        }
        .kp-detail-row {
          padding: 10px 0;
          border-bottom: 1px solid #3c4043;
          font-size: 14px;
          display: flex;
          gap: 10px;
        }
        .kp-label { color: #969ba1; font-weight: bold; width: 100px; flex-shrink: 0; }
        .kp-value { color: #8ab4f8; }
        .kp-socials {
          margin-top: 20px;
        }
        .kp-social-icons {
          display: flex;
          gap: 20px;
          margin-top: 15px;
        }
        .kp-social-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #bdc1c6;
          text-decoration: none;
        }
        .kp-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #3c4043;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .serp-container { grid-template-columns: 1fr; }
          .serp-sitelinks { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="serp-header">
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>Google</div>
        <div className="serp-search-bar">
          <FaSearch size={14} color="#9aa0a6" />
          <span>yenege events</span>
        </div>
      </div>

      <div className="serp-container">
        {/* Main Result */}
        <div>
          <div className="serp-url">https://www.yenege.com</div>
          <h2 className="serp-main-title">YENEGE | One of East Africa's Leading Event Architects</h2>
          <p className="serp-snippet">
            Professional event management training and world-class production in Ethiopia. Join the Yenege Event Academy to master the art of execution.
          </p>

          <div className="serp-sitelinks">
            <div>
              <div className="serp-sitelink-title">Event Academy</div>
              <div className="serp-sitelink-desc">Professional certification for the next generation of event architects.</div>
            </div>
            <div>
              <div className="serp-sitelink-title">Our Portfolio</div>
              <div className="serp-sitelink-desc">Explore our curated experiences and bespoke event productions.</div>
            </div>
            <div>
              <div className="serp-sitelink-title">About Yenege</div>
              <div className="serp-sitelink-desc">Learn about our vision to professionalize the creative industry.</div>
            </div>
            <div>
              <div className="serp-sitelink-title">Contact Us</div>
              <div className="serp-sitelink-desc">Ready to lead? Connect with our expert team today.</div>
            </div>
          </div>
        </div>

        {/* Knowledge Panel */}
        <div className="kp-card">
          <div className="kp-header">
            <div>
              <h3 className="kp-brand-name">YENEGE</h3>
              <div className="kp-type">Event Production & Academy</div>
            </div>
            <div className="kp-img">
              <img src="/logo.png" alt="Yenege" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          
          <div className="kp-snippet" style={{ fontSize: '13px', marginBottom: '15px' }}>
            YENEGE is a premier Ethiopian institution dedicated to the professionalization of the event industry. Founded by Bereket Yosef, it operates at the intersection of world-class production and expert education.
          </div>
          <div style={{ fontSize: '12px', color: '#bdc1c6', marginBottom: '15px' }}>Source: <span style={{ color: '#8ab4f8' }}>Official Brand Profile</span></div>

          <div className="kp-detail-row">
            <span className="kp-label">Founder</span>
            <span className="kp-value">Bereket Yosef</span>
          </div>
          <div className="kp-detail-row">
            <span className="kp-label">Headquarters</span>
            <span className="kp-value">Addis Ababa, Ethiopia</span>
          </div>
          <div className="kp-detail-row">
            <span className="kp-label">Founded</span>
            <span className="kp-value">2019</span>
          </div>
          <div className="kp-detail-row">
            <span className="kp-label">Education</span>
            <span className="kp-value">YENEGE Event Academy</span>
          </div>

          <div className="kp-socials">
            <div style={{ color: '#fff', fontSize: '14px' }}>Profiles</div>
            <div className="kp-social-icons">
              <a href="https://instagram.com/yenege_event" target="_blank" rel="noopener noreferrer" className="kp-social-item">
                <div className="kp-icon-circle"><FaInstagram /></div>
                <span>Instagram</span>
              </a>
              <a href="https://linkedin.com/company/yenege" target="_blank" rel="noopener noreferrer" className="kp-social-item">
                <div className="kp-icon-circle"><FaLinkedin /></div>
                <span>LinkedIn</span>
              </a>
              <a href="https://youtube.com/@yenegeevents" target="_blank" rel="noopener noreferrer" className="kp-social-item">
                <div className="kp-icon-circle"><FaYoutube /></div>
                <span>YouTube</span>
              </a>
              <a href="https://facebook.com/yenege" target="_blank" rel="noopener noreferrer" className="kp-social-item">
                <div className="kp-icon-circle"><FaFacebook /></div>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSearchPreview;
