import React, { useMemo, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useAnalytics } from '../../../context/AnalyticsContext';

const HourlyDistributionChart = ({ data, timeFrame: propTimeFrame }) => {
  const { analyticsData, lastUpdated, autoRefresh } = useAnalytics();
  const [timeFrame, setTimeFrame] = useState(propTimeFrame || '60'); // Default to 60 minutes
  const [isLive, setIsLive] = useState(true);
  const [lastDataUpdate, setLastDataUpdate] = useState(null);

  // Track when data actually changes for the chart
  useEffect(() => {
    if (data && data.length > 0) {
      setLastDataUpdate(new Date());
    }
  }, [data]);

  const chartData = useMemo(() => {
    try {
      // Use backend peak hours data if available
      const peakHoursData = analyticsData?.peakHours;
      
      if (peakHoursData && peakHoursData.intervalData && Object.keys(peakHoursData.intervalData).length > 0) {
      // Use backend hourly distribution data
      const allStagesData = peakHoursData.intervalData;
      const labels = allStagesData.arrival?.map(interval => interval.label) || [];
      
      const datasets = [];
      const colors = {
        arrival: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
        hostel: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
        documents: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
        kit: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' }
      };
      
      // Only show stages that have data
      Object.entries(allStagesData).forEach(([stage, intervals]) => {
        if (intervals && Array.isArray(intervals) && intervals.length > 0) {
          const hasData = intervals.some(interval => interval.count > 0);
          if (hasData) {
            datasets.push({
              label: stage.charAt(0).toUpperCase() + stage.slice(1),
              data: intervals.map(interval => interval.count),
              borderColor: colors[stage]?.border || '#64748b',
              backgroundColor: colors[stage]?.bg || 'rgba(100, 116, 139, 0.2)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointBackgroundColor: colors[stage]?.border || '#64748b',
              pointBorderColor: 'white',
              pointBorderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
            });
          }
        }
      });
      
        return { labels, datasets };
      }
      
      // Fallback to processing logs data
      if (!data || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Scans by Time Frame',
          data: [0],
          borderColor: '#64748b',
          backgroundColor: 'rgba(100, 116, 139, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#64748b',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }]
      };
    }

    const timeFrameMinutes = parseInt(timeFrame);
    if (isNaN(timeFrameMinutes) || timeFrameMinutes <= 0) {
      return {
        labels: ['Invalid Time Frame'],
        datasets: [{
          label: 'Invalid Configuration',
          data: [0],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false
        }]
      };
    }

    const intervalsPerHour = 60 / timeFrameMinutes;
    
    // Find the actual time range of the data with better validation
    let minHour = null, maxHour = null;
    
    data.forEach(log => {
      try {
        if (!log.timestamp) return;
        const date = new Date(log.timestamp);
        if (isNaN(date.getTime())) return;
        
        const hour = date.getHours();
        if (hour >= 0 && hour <= 23) {
          minHour = minHour === null ? hour : Math.min(minHour, hour);
          maxHour = maxHour === null ? hour : Math.max(maxHour, hour);
        }
      } catch (error) {
        console.error('Invalid timestamp:', log.timestamp, error);
      }
    });

    // If no valid data, use current time as reference
    if (minHour === null || maxHour === null) {
      const currentHour = new Date().getHours();
      minHour = Math.max(0, currentHour - 6);
      maxHour = Math.min(23, currentHour + 6);
    }

    // Add some padding to the range (1 hour before and after)
    const startHour = Math.max(0, minHour - 1);
    const endHour = Math.min(23, maxHour + 1);
    const totalHours = endHour - startHour + 1;
    const totalIntervals = totalHours * intervalsPerHour;
    
    // Initialize time intervals data for the actual range
    const intervalData = {};
    for (let i = 0; i < totalIntervals; i++) {
      intervalData[i] = 0;
    }

    // Count scans by time interval
    data.forEach(log => {
      try {
        const date = new Date(log.timestamp);
        const hour = date.getHours();
        const minute = date.getMinutes();
        const totalMinutes = (hour - startHour) * 60 + minute;
        const intervalIndex = Math.floor(totalMinutes / timeFrameMinutes);
        
        if (intervalIndex >= 0 && intervalIndex < totalIntervals) {
          intervalData[intervalIndex] = (intervalData[intervalIndex] || 0) + 1;
        }
      } catch {
        console.error('Invalid timestamp:', log.timestamp);
      }
    });

    // Generate labels based on time frame for the actual range
    const labels = Object.keys(intervalData).map(intervalIndex => {
      const intervalNum = parseInt(intervalIndex);
      if (isNaN(intervalNum)) return 'Invalid';
      
      const totalMinutes = intervalNum * timeFrameMinutes;
      const hour = startHour + Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      
      // Validate hour bounds
      if (hour < 0 || hour > 23) return 'Invalid';
      
      if (timeFrameMinutes === 60) {
        // 60-minute intervals (hourly)
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
      } else {
        // Smaller intervals
        if (hour === 0) return `12:${minute.toString().padStart(2, '0')} AM`;
        if (hour === 12) return `12:${minute.toString().padStart(2, '0')} PM`;
        if (hour > 12) return `${hour - 12}:${minute.toString().padStart(2, '0')} PM`;
        return `${hour}:${minute.toString().padStart(2, '0')} AM`;
      }
    });

    const values = Object.values(intervalData);
    const maxValue = values.length > 0 ? Math.max(...values) : 0;

    // Create gradient context for the area
    const createGradient = (ctx) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.9)');
      gradient.addColorStop(0.3, 'rgba(102, 126, 234, 0.6)');
      gradient.addColorStop(0.7, 'rgba(102, 126, 234, 0.3)');
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
      return gradient;
    };

    return {
      labels,
      datasets: [{
        label: `Scans by ${timeFrame}-min intervals`,
        data: values,
        borderColor: '#667eea',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(102, 126, 234, 0.2)';
          return createGradient(ctx);
        },
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: values.map((value) => {
          const intensity = maxValue > 0 ? value / maxValue : 0;
          return `rgba(102, 126, 234, ${0.7 + intensity * 0.3})`;
        }),
        pointBorderColor: 'white',
        pointBorderWidth: 3,
        pointRadius: values.map((value) => {
          const intensity = maxValue > 0 ? value / maxValue : 0;
          return 8 + intensity * 8; // Point size varies from 8 to 16 based on value
        }),
        pointHoverRadius: 16,
        pointHoverBackgroundColor: '#667eea',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 4,
        // 3D effects for the line
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 10,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }]
    };
    } catch (error) {
      console.error('Error processing peak hours data:', error);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Error loading data',
          data: [0],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false
        }]
      };
    }
  }, [data, timeFrame, analyticsData?.peakHours]);

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
            return `${context.parsed.y} scans at ${context.label}`;
          }
        },
        // 3D tooltip effects
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
          font: { size: timeFrame === '60' ? 10 : 8 },
          maxRotation: 45,
          minRotation: 45
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
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverRadius: 12,
        // 3D point effects
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      line: {
        // 3D line effects
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 4,
        shadowOffsetX: 1,
        shadowOffsetY: 1
      }
    },
    // 3D chart container effects
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
    try {
      if (!data || data.length === 0) {
        return (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
            <p>No data available for analysis</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {isLive && autoRefresh ? 'Waiting for new scan data...' : 'Enable live updates to see real-time data'}
            </p>
          </div>
        );
      }

    const timeFrameMinutes = parseInt(timeFrame);
    if (isNaN(timeFrameMinutes) || timeFrameMinutes <= 0) {
      console.error('Invalid timeFrame:', timeFrame);
      return (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#ef4444' }}>
          <p>Invalid time frame configuration</p>
        </div>
      );
    }

    const intervalsPerHour = 60 / timeFrameMinutes;
    
    // Find the actual time range of the data with better validation
    let minHour = null, maxHour = null;
    const validHours = [];
    
    data.forEach(log => {
      try {
        if (!log.timestamp) return;
        const date = new Date(log.timestamp);
        if (isNaN(date.getTime())) return; // Invalid date
        
        const hour = date.getHours();
        if (hour >= 0 && hour <= 23) {
          validHours.push(hour);
          minHour = minHour === null ? hour : Math.min(minHour, hour);
          maxHour = maxHour === null ? hour : Math.max(maxHour, hour);
        }
      } catch (error) {
        console.error('Invalid timestamp:', log.timestamp, error);
      }
    });

    // If no valid data, use current time as reference
    if (minHour === null || maxHour === null || validHours.length === 0) {
      const currentHour = new Date().getHours();
      minHour = Math.max(0, currentHour - 6); // Show 6 hours before current
      maxHour = Math.min(23, currentHour + 6); // Show 6 hours after current
    }

    // Add some padding to the range (1 hour before and after)
    const startHour = Math.max(0, minHour - 1);
    const endHour = Math.min(23, maxHour + 1);
    const totalHours = endHour - startHour + 1;
    const totalIntervals = totalHours * intervalsPerHour;
    
    // Calculate interval statistics for the actual range
    const intervalData = {};
    for (let i = 0; i < totalIntervals; i++) {
      intervalData[i] = 0;
    }

    data.forEach(log => {
      try {
        const date = new Date(log.timestamp);
        const hour = date.getHours();
        const minute = date.getMinutes();
        const totalMinutes = (hour - startHour) * 60 + minute;
        const intervalIndex = Math.floor(totalMinutes / timeFrameMinutes);
        
        if (intervalIndex >= 0 && intervalIndex < totalIntervals) {
          intervalData[intervalIndex] = (intervalData[intervalIndex] || 0) + 1;
        }
      } catch {
        console.error('Invalid timestamp:', log.timestamp);
      }
    });

    const values = Object.values(intervalData);
    const total = values.reduce((a, b) => a + b, 0);
    const maxScans = values.length > 0 ? Math.max(...values) : 0;
    const peakInterval = maxScans > 0 ? Object.keys(intervalData).find(interval => intervalData[interval] === maxScans) : '0';
    
    // Convert peak interval to readable format
    const getReadableTime = (intervalIndex) => {
      if (!intervalIndex || intervalIndex === 'undefined') return 'N/A';
      
      const intervalNum = parseInt(intervalIndex);
      if (isNaN(intervalNum)) return 'N/A';
      
      const totalMinutes = intervalNum * timeFrameMinutes;
      const hour = startHour + Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      
      // Validate hour is within bounds
      if (hour < 0 || hour > 23) return 'N/A';
      
      if (timeFrameMinutes === 60) {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
      } else {
        if (hour === 0) return `12:${minute.toString().padStart(2, '0')} AM`;
        if (hour === 12) return `12:${minute.toString().padStart(2, '0')} PM`;
        if (hour > 12) return `${hour - 12}:${minute.toString().padStart(2, '0')} PM`;
        return `${hour}:${minute.toString().padStart(2, '0')} AM`;
      }
    };

    // Find busiest time periods (adjusted for different time frames)
    const getPeriodStats = () => {
      if (timeFrameMinutes === 60) {
        // For hourly data, use 6-hour periods
        const morningRush = values.slice(6, 12).reduce((a, b) => a + b, 0); // 6 AM - 12 PM
        const afternoonRush = values.slice(12, 18).reduce((a, b) => a + b, 0); // 12 PM - 6 PM
        const eveningRush = values.slice(18, 22).reduce((a, b) => a + b, 0); // 6 PM - 10 PM
        const nightTime = values.slice(22, 24).reduce((a, b) => a + b, 0) + values.slice(0, 6).reduce((a, b) => a + b, 0); // 10 PM - 6 AM

        return [
          { name: 'Morning (6 AM - 12 PM)', count: morningRush },
          { name: 'Afternoon (12 PM - 6 PM)', count: afternoonRush },
          { name: 'Evening (6 PM - 10 PM)', count: eveningRush },
          { name: 'Night (10 PM - 6 AM)', count: nightTime }
        ];
      } else {
        // For smaller intervals, use 4-hour periods
        const intervalsPerPeriod = 4 * intervalsPerHour;
        const periods = [];
        const periodNames = ['Early Morning', 'Late Morning', 'Early Afternoon', 'Late Afternoon', 'Evening', 'Night'];
        
        for (let i = 0; i < 6; i++) {
          const start = i * intervalsPerPeriod;
          const end = Math.min(start + intervalsPerPeriod, values.length);
          const count = values.slice(start, end).reduce((a, b) => a + b, 0);
          periods.push({ name: periodNames[i], count });
        }
        
        return periods;
      }
    };

    const periods = getPeriodStats();
    const busiestPeriod = periods.reduce((max, period) => 
      period.count > max.count ? period : max
    );

    // Get time range display with validation
    const getTimeRangeDisplay = () => {
      if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
        return 'Invalid time range';
      }
      
      const formatHour = (hour) => {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
      };
      
      const startDisplay = formatHour(startHour);
      const endDisplay = formatHour(endHour);
      return `${startDisplay} - ${endDisplay}`;
    };

    // Validate and fix potential calculation issues
    const safeTotal = total || 0;
    const safeTotalIntervals = totalIntervals > 0 ? totalIntervals : 1;
    const safeAverage = safeTotalIntervals > 0 ? (safeTotal / safeTotalIntervals).toFixed(1) : '0.0';

    return (
      <div style={{ padding: '1rem', fontSize: '0.9rem', lineHeight: '1.6', color: '#1e293b' }}>
        <p><strong>Time Range:</strong> {getTimeRangeDisplay()}</p>
        <p><strong>Peak Time:</strong> {getReadableTime(peakInterval)} ({maxScans || 0} scans)</p>
        <p><strong>Busiest Period:</strong> {busiestPeriod?.name || 'No data'} ({busiestPeriod?.count || 0} scans)</p>
        <p><strong>Total Scans:</strong> {safeTotal}</p>
        <p><strong>Average per {timeFrame}-min interval:</strong> {safeAverage} scans</p>
        <p><strong>Insight:</strong> {timeFrame}-minute intervals help identify precise peak arrival times for optimal staffing.</p>
        {safeTotal === 0 && (
          <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#64748b' }}>
            {isLive && autoRefresh ? 'Waiting for scan data to populate analysis...' : 'No scan data available for analysis'}
          </p>
        )}
      </div>
    );
    } catch (error) {
      console.error('Error generating analysis:', error);
      return (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#ef4444' }}>
          <p>Error generating analysis</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Please try refreshing the data or contact support if the issue persists.
          </p>
        </div>
      );
    }
  }, [data, timeFrame, isLive, autoRefresh]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      
      {/* Time Frame Selector */}
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <label style={{ 
          fontSize: '0.9rem', 
          fontWeight: '600', 
          color: '#1e293b',
          whiteSpace: 'nowrap'
        }}>
          Time Frame:
        </label>
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            backgroundColor: 'white',
            color: '#1e293b',
            cursor: 'pointer',
            minWidth: '120px'
          }}
        >
          <option value="60">60 minutes</option>
          <option value="30">30 minutes</option>
          <option value="15">15 minutes</option>
          <option value="10">10 minutes</option>
          <option value="5">5 minutes</option>
        </select>
        
        {/* Live Status Indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginLeft: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            color: isLive && autoRefresh ? '#10b981' : '#64748b'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isLive && autoRefresh ? '#10b981' : '#64748b',
              animation: isLive && autoRefresh ? 'pulse 2s infinite' : 'none'
            }} />
            {isLive && autoRefresh ? 'LIVE' : 'PAUSED'}
          </div>
          {lastUpdated && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748b',
              whiteSpace: 'nowrap'
            }}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        padding: '1rem',
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
        position: 'relative'
      }}>
        {/* 3D inner glow effect */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          borderRadius: '16px',
          background: 'radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <Line data={chartData} options={options} />
      </div>
      {analysis}
    </div>
  );
};

export default HourlyDistributionChart; 