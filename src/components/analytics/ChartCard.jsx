import React, { useState } from 'react';

const ChartCard = ({ title, subtitle, icon, children, expandable = true, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title-wrapper">
            {icon && <span className="chart-icon">{icon}</span>}
            <h3 className="chart-title">{title}</h3>
          </div>
          {subtitle && (
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
        {expandable && (
          <div className="chart-controls">
            <button 
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse chart' : 'Expand chart'}
            >
              <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded ? '−' : '+'}
              </span>
            </button>
          </div>
        )}
      </div>
      
      <div className="chart-content">
        <div className="chart-container" style={{ height: (!expandable || isExpanded) ? '800px' : '600px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartCard; 