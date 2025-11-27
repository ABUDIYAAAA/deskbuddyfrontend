import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LanyardPreview.css';

const LanyardPreview = ({ 
  isOpen, 
  onClose, 
  studentName, 
  visitorCount, 
  onPrint 
}) => {
  const { user } = useAuth();
  const volunteerName = user?.displayName || "Anonymous";
  const [showDropdown, setShowDropdown] = useState(false);
  
  const formatDateParts = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { day, date, time };
  };

  const generateLanyards = () => {
    const lanyards = [];
    const { day, date, time } = formatDateParts();
    for (let i = 0; i < visitorCount; i++) {
      lanyards.push(
        <div key={i} className="lanyard-page" id={`lanyard-${i}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            background: 'radial-gradient(circle at 70% 30%, #e0e7ef 60%, #38bdf8 100%), linear-gradient(135deg, #f0f4ff 0%, #cfd9e9 100%)',
            boxShadow: '0 8px 32px rgba(56,189,248,0.10), 0 2px 8px rgba(37,99,235,0.08)',
            border: '2.5px solid #2563eb',
            overflow: 'hidden',
            minHeight: '100%',
          }}>
          {/* Decorative background shape */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '-40px',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            opacity: 0.13,
            borderRadius: '50%',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            right: '-30px',
            width: '90px',
            height: '90px',
            background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
            opacity: 0.10,
            borderRadius: '50%',
            zIndex: 0
          }} />
          {/* Accent Bar */}
          <div style={{ height: 10, width: '100%', background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)', borderRadius: '12px 12px 0 0', marginBottom: 8 }} />
          {/* Watermark */}
          <div className="lanyard-watermark">
            <img src="/title.webp" alt="DeskBuddy" />
          </div>
          {/* Main Content */}
          <div className="lanyard-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
            {/* Header with Logo and Branding */}
            <div className="lanyard-header" style={{ textAlign: 'center', marginBottom: 0 }}>
              <img src="/title.png" alt="DeskBuddy" className="lanyard-logo" style={{ height: 48, marginBottom: 4 }} />
              <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#2563eb', letterSpacing: '0.08em', marginBottom: 8, textShadow: '0 2px 8px #cfd9e9' }}>DeskBuddy</div>
            </div>
            {/* Welcome Message */}
            <div className="lanyard-message" style={{ margin: '0.5rem 0 1.2rem 0', textAlign: 'center' }}>
              <h2 className="lanyard-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.3, letterSpacing: '0.01em', textShadow: '0 1px 2px #fff' }}>Welcome to Our College Family!</h2>
              <div className="lanyard-subtitle" style={{ fontSize: '1rem', color: '#475569', margin: '0.3rem 0 0 0', fontWeight: 600 }}>
                You're not just dropping off a student today.<br />You're joining our extended family!
              </div>
            </div>
            {/* Visitor Info Section */}
            <div className="lanyard-info" style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 10, padding: '1.1rem 1.2rem', margin: '0 auto 0.7rem auto', boxShadow: '0 2px 8px rgba(0,123,255,0.08)', border: '1.5px solid #e0e7ef', maxWidth: 320 }}>
              <div className="lanyard-info-item" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
                Guest of: <span className="lanyard-value" style={{ color: '#1e293b', fontWeight: 800, marginLeft: 8 }}>{studentName}</span>
              </div>
              <div className="lanyard-info-item" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
                Scanned by: <span className="lanyard-value" style={{ color: '#1e293b', fontWeight: 800, marginLeft: 8 }}>{volunteerName}</span>
              </div>
              <div className="lanyard-info-item" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
                Date: <span className="lanyard-value" style={{ color: '#1e293b', fontWeight: 800, marginLeft: 8 }}>{date}</span>
              </div>
              <div className="lanyard-info-item" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
                Day: <span className="lanyard-value" style={{ color: '#1e293b', fontWeight: 800, marginLeft: 8 }}>{day}</span>
              </div>
              <div className="lanyard-info-item" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb' }}>
                Time: <span className="lanyard-value" style={{ color: '#1e293b', fontWeight: 800, marginLeft: 8 }}>{time}</span>
              </div>
            </div>
            {/* Footer */}
            <div className="lanyard-footer" style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid #e0e7ef', marginTop: 8 }}>
              <p className="lanyard-footer-text" style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, margin: 0, letterSpacing: '0.01em' }}>
                Please wear this lanyard during your visit
              </p>
            </div>
          </div>
        </div>
      );
    }
    return lanyards;
  };

  if (!isOpen) return null;

  return (
    <div className="lanyard-preview-overlay" onClick={onClose}>
      <div className="lanyard-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lanyard-preview-header">
          <h2 className="lanyard-preview-title">Visitor Lanyards Preview</h2>
          <p className="lanyard-preview-subtitle">
            {visitorCount} lanyard{visitorCount !== 1 ? 's' : ''} for {studentName}
          </p>
        </div>
        
        <div className="lanyard-preview-content">
          <div className="lanyard-preview-grid">
            {generateLanyards()}
          </div>
        </div>
        
        <div className="lanyard-preview-footer">
          <button 
            className="lanyard-preview-btn lanyard-preview-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="lanyard-preview-btn lanyard-preview-btn-primary"
              onClick={() => setShowDropdown((v) => !v)}
              style={{ minWidth: 180 }}
            >
              🖨️ Print ▼
            </button>
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                zIndex: 100,
                minWidth: 160
              }}>
                <button
                  className="lanyard-preview-btn lanyard-preview-btn-primary"
                  style={{ width: '100%', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}
                  onClick={() => { setShowDropdown(false); onPrint('a6'); }}
                >Print A6</button>
                <button
                  className="lanyard-preview-btn lanyard-preview-btn-primary"
                  style={{ width: '100%', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}
                  onClick={() => { setShowDropdown(false); onPrint('a5'); }}
                >Print A5</button>
                <button
                  className="lanyard-preview-btn lanyard-preview-btn-primary"
                  style={{ width: '100%', borderRadius: '0 0 10px 10px' }}
                  onClick={() => { setShowDropdown(false); onPrint('a4'); }}
                >Print A4</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanyardPreview; 