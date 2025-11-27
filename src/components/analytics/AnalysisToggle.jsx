import React from 'react';
import './AnalysisToggle.css';

const AnalysisToggle = ({ activeTab, onTabChange }) => {
  return (
    <div className="analysis-toggle-container">
      <div className="toggle-background">
        <div className={`toggle-slider ${activeTab === 'advanced' ? 'advanced' : 'basic'}`} />
        <button
          className={`toggle-option ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => onTabChange('basic')}
        >
          <div className="option-content">
            <span className="option-icon">📊</span>
            <span>Basic Analysis</span>
          </div>
        </button>
        <button
          className={`toggle-option ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => onTabChange('advanced')}
        >
          <div className="option-content">
            <span className="option-icon">🔬</span>
            <span>Advanced Analysis</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AnalysisToggle; 