import React, { useState } from 'react';
import './ExportButton.css';

const ExportButton = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (type) => {
    onExport(type);
    setIsOpen(false);
  };

  return (
    <div className="export-container">
      <button 
        className="export-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Export Data</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="export-dropdown">
          <button 
            className="export-option"
            onClick={() => handleExport('csv')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <div className="option-content">
              <span>Download CSV</span>
              <small>Export raw data as CSV file</small>
            </div>
          </button>
          
          <button 
            className="export-option"
            onClick={() => handleExport('pdf')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <div className="option-content">
              <span>Download PDF Report</span>
              <small>Comprehensive report with charts & analysis</small>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton; 