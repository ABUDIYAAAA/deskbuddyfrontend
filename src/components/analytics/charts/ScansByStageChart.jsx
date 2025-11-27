import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';

const ScansByStageChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#64748b'],
          borderWidth: 3,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          hoverOffset: 8,
        }]
      };
    }

    const stageCounts = {};
    data.forEach(log => {
      const stage = log.stage || 'Unknown';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });
    
    const colors = [
      '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6',
      '#ef4444', '#06b6d4', '#84cc16', '#f97316'
    ];
    
    return {
      labels: Object.keys(stageCounts),
      datasets: [{
        data: Object.values(stageCounts),
        backgroundColor: colors.slice(0, Object.keys(stageCounts).length),
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        hoverOffset: 8,
      }]
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#1e293b',
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(8px)'
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  };

  const analysis = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
          <p>No data available for analysis</p>
        </div>
      );
    }

    const stageCounts = {};
    data.forEach(log => {
      const stage = log.stage || 'Unknown';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });
    
    const total = Object.values(stageCounts).reduce((a, b) => a + b, 0);
    const sortedStages = Object.entries(stageCounts)
      .sort(([,a], [,b]) => b - a);
    
    const mostPopular = sortedStages[0];
    const leastPopular = sortedStages[sortedStages.length - 1];
    
    return (
      <div style={{ padding: '1rem', fontSize: '0.9rem', lineHeight: '1.6', color: '#1e293b' }}>
        <p><strong>Total Scans:</strong> {total}</p>
        <p><strong>Most Popular Stage:</strong> {mostPopular[0]} ({mostPopular[1]} scans, {((mostPopular[1] / total) * 100).toFixed(1)}%)</p>
        <p><strong>Least Popular Stage:</strong> {leastPopular[0]} ({leastPopular[1]} scans, {((leastPopular[1] / total) * 100).toFixed(1)}%)</p>
        <p><strong>Stage Distribution:</strong> The data shows {Object.keys(stageCounts).length} different stages with varying completion rates.</p>
      </div>
    );
  }, [data]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        // 3D container effects
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        borderRadius: '16px',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.1),
          0 4px 16px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        padding: '1rem'
      }}>
        {/* 3D inner glow effect */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          borderRadius: '16px',
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <Doughnut data={chartData} options={options} />
      </div>
      {analysis}
    </div>
  );
};

export default ScansByStageChart; 