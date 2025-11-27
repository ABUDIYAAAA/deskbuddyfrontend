import React, { useEffect, useRef } from 'react';
import './SummaryCard.css';

const SummaryCard = ({ title, value, icon, color, delay = 0 }) => {
  const cardRef = useRef(null);
  const valueRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // Animate the number counting up
            const valueElement = entry.target.querySelector('.summary-value');
            if (valueElement) {
              const finalValue = parseInt(value);
              let currentValue = 0;
              const increment = finalValue / 50;
              const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                  currentValue = finalValue;
                  clearInterval(timer);
                }
                valueElement.textContent = Math.floor(currentValue);
              }, 20);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <div 
      ref={cardRef}
      className="summary-card"
      style={{ 
        '--delay': `${delay}ms`,
        '--card-color': color 
      }}
    >
      <div className="card-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-icon">
          {icon}
        </div>
        
        <div className="card-text">
          <h3 className="card-title">{title}</h3>
          <div className="summary-value" ref={valueRef}>0</div>
        </div>
        
        <div className="card-glow"></div>
      </div>
    </div>
  );
};

export default SummaryCard; 