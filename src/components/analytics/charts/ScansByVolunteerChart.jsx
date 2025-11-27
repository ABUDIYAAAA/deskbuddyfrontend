import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useAnalytics } from '../../../context/AnalyticsContext';

const ScansByVolunteerChart = ({ data }) => {
  const { analyticsData } = useAnalytics();
  
  const chartData = useMemo(() => {
    // Use backend volunteer stats if available, otherwise fall back to processed logs
    const volunteerData = analyticsData?.volunteerStats?.volunteers;
    
    if (!volunteerData || volunteerData.length === 0) {
      // Fallback to processing logs data
      if (!data || data.length === 0) {
        return {
          labels: ['No Data'],
          datasets: [{
            label: 'Scans by Volunteer',
            data: [0],
            backgroundColor: '#64748b',
            borderColor: '#64748b',
            borderWidth: 1,
          }]
        };
      }

      const volunteerCounts = {};
      data.forEach(log => {
        const volunteer = log.volunteerName || 'Unknown';
        volunteerCounts[volunteer] = (volunteerCounts[volunteer] || 0) + 1;
      });
      
      // Sort by count and take top 10
      const sortedVolunteers = Object.entries(volunteerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      const colors = [
        '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6',
        '#ef4444', '#06b6d4', '#84cc16', '#f97316',
        '#ec4899', '#6366f1'
      ];
      
      return {
        labels: sortedVolunteers.map(([name]) => name),
        datasets: [{
          label: 'Students Processed',
          data: sortedVolunteers.map(([, count]) => count),
          backgroundColor: colors.slice(0, sortedVolunteers.length),
          borderColor: colors.slice(0, sortedVolunteers.length).map(color => color),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      };
    }
    
    // Use backend volunteer stats data
    const topVolunteers = volunteerData.slice(0, 10);
    const colors = [
      '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6',
      '#ef4444', '#06b6d4', '#84cc16', '#f97316',
      '#ec4899', '#6366f1'
    ];
    
    return {
      labels: topVolunteers.map(volunteer => volunteer.name),
      datasets: [{
        label: 'Students Processed',
        data: topVolunteers.map(volunteer => volunteer.totalStudents),
        backgroundColor: colors.slice(0, topVolunteers.length),
        borderColor: colors.slice(0, topVolunteers.length).map(color => color),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  }, [data, analyticsData?.volunteerStats]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
            return `${context.label}: ${context.parsed.y} scans`;
          }
        },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(8px)'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          stepSize: 1
        }
      }
    },
    elements: {
      bar: {
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

    const volunteerCounts = {};
    data.forEach(log => {
      const volunteer = log.volunteerName || 'Unknown';
      volunteerCounts[volunteer] = (volunteerCounts[volunteer] || 0) + 1;
    });
    
    const total = Object.values(volunteerCounts).reduce((a, b) => a + b, 0);
    const sortedVolunteers = Object.entries(volunteerCounts)
      .sort(([,a], [,b]) => b - a);
    
    const topVolunteer = sortedVolunteers[0];
    const avgScans = (total / Object.keys(volunteerCounts).length).toFixed(1);
    
    return (
      <div style={{ padding: '1rem', fontSize: '0.9rem', lineHeight: '1.6', color: '#1e293b' }}>
        <p><strong>Total Volunteers:</strong> {Object.keys(volunteerCounts).length}</p>
        <p><strong>Top Performer:</strong> {topVolunteer[0]} ({topVolunteer[1]} scans, {((topVolunteer[1] / total) * 100).toFixed(1)}%)</p>
        <p><strong>Average Scans per Volunteer:</strong> {avgScans}</p>
        <p><strong>Performance Distribution:</strong> Shows volunteer activity levels and identifies high performers.</p>
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
          background: 'radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <Bar data={chartData} options={options} />
      </div>
      {analysis}
    </div>
  );
};

export default ScansByVolunteerChart; 