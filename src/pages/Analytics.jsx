import React, { useState, useMemo, useRef } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import logo from '../assets/Login.svg';
import '../styles/Analytics.css';
import pdfExportService from '../services/pdfExportService';
import { useToast } from '../components/ToastProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Import modular components
import SummaryCard from '../components/analytics/SummaryCard';
import AdvancedFilter from '../components/analytics/AdvancedFilter';
import ChartCard from '../components/analytics/ChartCard';
import DataTable from '../components/analytics/DataTable';
import ExportButton from '../components/analytics/ExportButton';

// Import chart components
import ScansByStageChart from '../components/analytics/charts/ScansByStageChart';
import ScansByVolunteerChart from '../components/analytics/charts/ScansByVolunteerChart';
import ScansOverTimeChart from '../components/analytics/charts/ScansOverTimeChart';
import HourlyDistributionChart from '../components/analytics/charts/HourlyDistributionChart';
import LiveStageCounts from '../components/analytics/LiveStageCounts';

const Analytics = () => {
  const { logs, loading, resetToEmptyData, analyticsData, error, lastUpdated, autoRefresh, setAutoRefresh } = useAnalytics();
  const { addToast } = useToast();
  
  // Chart refs for PDF export
  const scansByStageRef = useRef(null);
  const scansByVolunteerRef = useRef(null);
  const scansOverTimeRef = useRef(null);
  const hourlyDistributionRef = useRef(null);

  // Filter states
  const [filters, setFilters] = useState({
    stage: '',
    volunteer: '',
    dateRange: '',
    searchTerm: ''
  });

  // Time frame for hourly distribution
  const [timeFrame] = useState('24h');

  // View all toggle for data table
  const [viewAll, setViewAll] = useState(false);

  // Calculate analytics summary from backend data
  const stats = useMemo(() => {
    if (!analyticsData.summary) {
      return {
        totalScans: 0,
        uniqueStudents: 0,
        uniqueVolunteers: 0,
        completedStudents: 0
      };
    }

    // Calculate completed students from stage distribution
    const completedStudents = analyticsData.summary.stageDistribution?.completed || 0;

    return {
      totalScans: analyticsData.summary.totalScans || 0,
      uniqueStudents: analyticsData.summary.totalStudents || 0,
      uniqueVolunteers: analyticsData.summary.uniqueVolunteers || 0,
      completedStudents: completedStudents
    };
  }, [analyticsData.summary]);

  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Filter by stage
    if (filters.stage) {
      filtered = filtered.filter(log => log.stage === filters.stage);
    }
    
    // Filter by volunteer
    if (filters.volunteer) {
      filtered = filtered.filter(log => log.volunteerName === filters.volunteer);
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
      }
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        (log.studentName && log.studentName.toLowerCase().includes(searchLower)) ||
        (log.studentId && log.studentId.toLowerCase().includes(searchLower)) ||
        (log.volunteerName && log.volunteerName.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [logs, filters]);

  // Get unique stages and volunteers for filter options
  const filterOptions = useMemo(() => {
    const stages = [...new Set(logs.map(log => log.stage).filter(Boolean))];
    const volunteers = [...new Set(logs.map(log => log.volunteerName).filter(Boolean))];
    
    return { stages, volunteers };
  }, [logs]);

  const handleExport = async (type) => {
    if (type === 'csv') {
      // CSV export logic
      const csvContent = [
        ['Student Name', 'Student ID', 'Stage', 'Volunteer', 'Timestamp'],
        ...filteredLogs.map(log => [
          log.studentName || '',
          log.studentId || '',
          log.stage || '',
          log.volunteerName || '',
          new Date(log.timestamp).toLocaleString()
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-data.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      addToast({
        type: 'success',
        title: 'CSV exported successfully!',
        duration: 3000
      });
    } else if (type === 'pdf') {
      try {
        // Show loading toast
        addToast({
          type: 'info',
          title: 'Generating PDF report...',
          message: 'This may take a few moments',
          duration: 5000
        });

        // Prepare chart refs
        const chartsRefs = {
          scansByStage: scansByStageRef,
          scansByVolunteer: scansByVolunteerRef,
          scansOverTime: scansOverTimeRef,
          hourlyDistribution: hourlyDistributionRef
        };

        // Prepare analytics data
        const analyticsData = {
          ...stats,
          logs: filteredLogs
        };

        // Generate PDF
        await pdfExportService.generateAnalyticsReport(analyticsData, chartsRefs);
        
        addToast({
          type: 'success',
          title: 'PDF report generated successfully!',
          duration: 4000
        });
      } catch (error) {
        console.error('PDF export failed:', error);
        addToast({
          type: 'error',
          title: 'PDF export failed',
          message: 'Please try again or contact support',
          duration: 5000
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem',
          color: '#64748b'
        }}>
          Loading analytics data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem',
          color: '#ef4444'
        }}>
          <p>Error loading analytics data: {error}</p>
          <button 
            onClick={resetToEmptyData}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header - Matching Dashboard Style */}
      <div className="dashboard-glass-header">
        <div className="dashboard-header-left">
          <img src={logo} alt="DeskBuddy Logo" className="dashboard-header-logo" />
          <div>
            <div className="dashboard-header-title">Analytics Dashboard</div>
            <div className="dashboard-header-welcome">Real-time scan activity and volunteer performance analytics</div>
          </div>
        </div>
        <div className="dashboard-header-right">
          {/* Live Update Toggle */}
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              border: `1px solid ${autoRefresh ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: autoRefresh ? '#10b981' : '#64748b',
              cursor: 'pointer',
              marginRight: '1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: autoRefresh ? '#10b981' : '#64748b',
              animation: autoRefresh ? 'pulse 2s infinite' : 'none'
            }} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          
          <button 
            onClick={resetToEmptyData}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#64748b',
              cursor: 'pointer',
              marginRight: '1rem',
              fontSize: '0.875rem'
            }}
          >
            Refresh Data
          </button>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-container">
        <SummaryCard
          title="Total Students"
          value={stats.uniqueStudents}
          icon="👥"
          color="#10b981"
          delay={100}
        />
        <SummaryCard
          title="Completed Journey"
          value={stats.completedStudents}
          icon="✅"
          color="#059669"
          delay={200}
        />
        <SummaryCard
          title="Active Volunteers"
          value={stats.uniqueVolunteers}
          icon="🤝"
          color="#f59e0b"
          delay={300}
        />
      </div>

      {/* Live Stage Counts */}
      <LiveStageCounts 
        analyticsData={analyticsData}
        autoRefresh={autoRefresh}
        lastUpdated={lastUpdated}
      />

      {/* Show message when no data */}
      {!analyticsData.summary || stats.totalScans === 0 ? (
        <div className="no-data">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
          </svg>
          <p>No analytics data available yet</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Start scanning students to see real-time analytics and performance metrics
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="filters-card">
      <AdvancedFilter
              searchTerm={filters.searchTerm}
              onSearchChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
              selectedStage={filters.stage || 'all'}
              onStageChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}
              selectedVolunteer={filters.volunteer || 'all'}
              onVolunteerChange={(value) => setFilters(prev => ({ ...prev, volunteer: value }))}
              stages={['all', ...filterOptions.stages]}
              volunteers={['all', ...filterOptions.volunteers]}
            />
          </div>

          {/* Key Insights Section */}
          {analyticsData.summary && (
            <div className="insights-section">
              <div className="insights-header">
                <h3>📊 Key Insights</h3>
                <p>Real-time analytics from your onboarding system</p>
              </div>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon">🎯</div>
                  <div className="insight-content">
                    <h4>Completion Rate</h4>
                    <p className="insight-value">{((stats.completedStudents / stats.uniqueStudents) * 100).toFixed(1)}%</p>
                    <p className="insight-desc">Students completed all stages</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">⚡</div>
                  <div className="insight-content">
                    <h4>Biggest Bottleneck</h4>
                    <p className="insight-value">{analyticsData.summary.insights?.biggestDropoff?.stage || 'N/A'}</p>
                    <p className="insight-desc">{analyticsData.summary.insights?.biggestDropoff?.percentage || 'N/A'} progression rate</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">⏰</div>
                  <div className="insight-content">
                    <h4>Peak Activity</h4>
                    <p className="insight-value">
                      {analyticsData.peakHours?.overallPeakInterval?.label || 'N/A'}
                      {autoRefresh && (
                        <span style={{ 
                          fontSize: '0.6rem', 
                          color: '#10b981', 
                          marginLeft: '0.5rem',
                          fontWeight: 'normal'
                        }}>
                          LIVE
                        </span>
                      )}
                    </p>
                    <p className="insight-desc">{analyticsData.peakHours?.overallPeakInterval?.count || 0} scans at peak</p>
                    {lastUpdated && (
                      <p style={{ 
                        fontSize: '0.7rem', 
                        color: '#64748b', 
                        marginTop: '0.25rem' 
                      }}>
                        Updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">🚀</div>
                  <div className="insight-content">
                    <h4>Avg Journey Time</h4>
                    <p className="insight-value">{analyticsData.stageTiming?.stageTimings?.overallJourney?.average || 'N/A'}</p>
                    <p className="insight-desc">From arrival to completion</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="chart-display-card">
            <div className="chart-header">
              <h3>Analytics Overview</h3>
              <p>Visual insights into scan patterns and volunteer performance</p>
        </div>
            
            <div className="charts-grid">
              <ChartCard title="Scans by Stage" icon="📋">
                <div ref={scansByStageRef}>
                  <ScansByStageChart data={filteredLogs} />
                </div>
              </ChartCard>
              
              <ChartCard title="Top Volunteers" icon="👤">
                <div ref={scansByVolunteerRef}>
                  <ScansByVolunteerChart data={filteredLogs} />
                </div>
              </ChartCard>
              
              <ChartCard title="Activity Timeline" icon="📈">
                <div ref={scansOverTimeRef}>
                  <ScansOverTimeChart data={filteredLogs} />
                </div>
              </ChartCard>
        
        <ChartCard
                title="Peak Hours Analysis" 
                icon="⏰"
                subtitle="Hourly scan distribution across all stages"
                expandable={false}
                defaultExpanded={true}
              >
                <div ref={hourlyDistributionRef}>
                  <HourlyDistributionChart data={filteredLogs} timeFrame={timeFrame} />
                </div>
              </ChartCard>
            </div>
      </div>

      {/* Data Table */}
          <div className="data-table-container">
        <DataTable 
              data={filteredLogs} 
              searchTerm={filters.searchTerm}
              onSearchChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
              showAllData={viewAll}
              onShowAllDataChange={setViewAll}
        />
      </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 