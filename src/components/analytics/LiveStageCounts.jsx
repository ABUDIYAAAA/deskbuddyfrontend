import React from 'react';
import './LiveStageCounts.css';

const LiveStageCounts = ({ analyticsData, autoRefresh, lastUpdated }) => {
  // Extract stage counts from analytics data
  const getStageCounts = () => {
    if (!analyticsData.summary) {
      return {
        arrival: 0,
        hostel: 0,
        documents: 0,
        kit: 0,
        notStarted: 0,
        total: 0
      };
    }

    const { stageDistribution, totalStudents } = analyticsData.summary;
    
    // Calculate students who have passed each stage (cumulative)
    const arrivalPassed = (stageDistribution?.arrival || 0) + (stageDistribution?.hostel || 0) + (stageDistribution?.documents || 0) + (stageDistribution?.completed || 0);
    const hostelPassed = (stageDistribution?.hostel || 0) + (stageDistribution?.documents || 0) + (stageDistribution?.completed || 0);
    const documentsPassed = (stageDistribution?.documents || 0) + (stageDistribution?.completed || 0);
    const kitPassed = stageDistribution?.completed || 0;
    
    return {
      arrival: arrivalPassed,
      hostel: hostelPassed,
      documents: documentsPassed,
      kit: kitPassed,
      notStarted: stageDistribution?.notStarted || 0,
      total: totalStudents || 0
    };
  };

  const stageCounts = getStageCounts();

  const stages = [
    {
      key: 'notStarted',
      label: 'Not Started',
      icon: '⏳',
      color: '#6b7280',
      description: 'Students yet to arrive',
      type: 'pending',
      gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)'
    },
    {
      key: 'arrival',
      label: 'Arrival Passed',
      icon: '🚪',
      color: '#3b82f6',
      description: 'Students who completed arrival',
      type: 'completed',
      gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)'
    },
    {
      key: 'hostel',
      label: 'Hostel Passed',
      icon: '🏠',
      color: '#8b5cf6',
      description: 'Students who completed hostel verification',
      type: 'completed',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    },
    {
      key: 'documents',
      label: 'Documents Passed',
      icon: '📄',
      color: '#f59e0b',
      description: 'Students who completed document verification',
      type: 'completed',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
    },
    {
      key: 'kit',
      label: 'Kit Received',
      icon: '📦',
      color: '#10b981',
      description: 'Students who received their kit',
      type: 'completed',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)'
    }
  ];

  return (
    <div className="live-stage-counts">
      <div className="live-stage-counts-header">
        <div className="header-content">
          <div className="header-icon">📊</div>
          <div className="header-text">
            <h3>Live Stage Counts</h3>
            <p>Real-time student progression through onboarding stages</p>
          </div>
        </div>
        <div className="header-status">
          {autoRefresh && (
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>LIVE</span>
            </div>
          )}
          {lastUpdated && (
            <div className="last-updated">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="stage-counts-grid">
        {stages.map((stage, index) => {
          const percentage = stageCounts.total > 0 
            ? ((stageCounts[stage.key] / stageCounts.total) * 100).toFixed(1)
            : '0.0';
          
          return (
            <div 
              key={stage.key}
              className="stage-count-card"
              style={{ 
                '--stage-color': stage.color,
                '--stage-gradient': stage.gradient,
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="card-header">
                <div className="stage-icon" style={{ background: stage.gradient }}>
                  {stage.icon}
                </div>
                <div className="stage-status">
                  <div className="stage-label">{stage.label}</div>
                  <div className="stage-description">{stage.description}</div>
                </div>
              </div>
              
              <div className="card-body">
                <div className="stage-count">
                  <span className="count-number">{stageCounts[stage.key]}</span>
                  <span className="count-total">/ {stageCounts.total}</span>
                </div>
                
                <div className="stage-metrics">
                  <div className="percentage-badge">
                    {percentage}%
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${percentage}%`,
                          background: stage.gradient
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="stage-type-indicator">
                  {stage.type === 'completed' ? '✅ Completed' : '⏳ Pending'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveStageCounts;
