import React, { createContext, useContext, useEffect, useState } from 'react';

const AnalyticsContext = createContext();

// Backend API base URL
const API_BASE_URL = 'https://deskbuddy.codesetu.in/api/analytics';

export function AnalyticsProvider({ children }) {
  const [analyticsData, setAnalyticsData] = useState({
    summary: null,
    pendingCounts: null,
    volunteerStats: null,
    peakHours: null,
    stageTiming: null,
    studentJourneys: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch analytics data from backend
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics endpoints in parallel
      const [summaryRes, pendingRes, volunteerRes, peakHoursRes, stageTimingRes, studentJourneysRes] = await Promise.all([
        fetch(`${API_BASE_URL}/summary`),
        fetch(`${API_BASE_URL}/pending-counts`),
        fetch(`${API_BASE_URL}/volunteer-stats`),
        fetch(`${API_BASE_URL}/peak-hours`),
        fetch(`${API_BASE_URL}/stage-timing`),
        fetch(`${API_BASE_URL}/student-journey`)
      ]);

      // Parse responses
      const [summary, pendingCounts, volunteerStats, peakHours, stageTiming, studentJourneys] = await Promise.all([
        summaryRes.json(),
        pendingRes.json(),
        volunteerRes.json(),
        peakHoursRes.json(),
        stageTimingRes.json(),
        studentJourneysRes.json()
      ]);

      setAnalyticsData({
        summary,
        pendingCounts,
        volunteerStats,
        peakHours,
        stageTiming,
        studentJourneys
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 1800000); // Refresh every 30 minutes (1,800,000ms)

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Refresh analytics data
  const refreshData = () => {
    fetchAnalyticsData();
  };

  // Get processed logs for charts (convert backend data to frontend format)
  const getProcessedLogs = () => {
    if (!analyticsData.studentJourneys) return [];
    
    const logs = [];
    analyticsData.studentJourneys.forEach(student => {
      // Add arrival log
      if (student.arrivalTime) {
        logs.push({
          id: `${student.studentId}-arrival`,
          studentId: student.studentId,
          studentName: student.name,
          stage: 'arrival',
          volunteerName: student.arrivalVerifiedBy,
          timestamp: student.arrivalTime
        });
      }
      // Add hostel log
      if (student.hostelVerifiedTime) {
        logs.push({
          id: `${student.studentId}-hostel`,
          studentId: student.studentId,
          studentName: student.name,
          stage: 'hostel',
          volunteerName: student.hostelVerifiedBy,
          timestamp: student.hostelVerifiedTime
        });
      }
      // Add documents log
      if (student.documentsVerifiedTime) {
        logs.push({
          id: `${student.studentId}-documents`,
          studentId: student.studentId,
          studentName: student.name,
          stage: 'documents',
          volunteerName: student.documentsVerifiedBy,
          timestamp: student.documentsVerifiedTime
        });
      }
      // Add kit log
      if (student.kitReceivedTime) {
        logs.push({
          id: `${student.studentId}-kit`,
          studentId: student.studentId,
          studentName: student.name,
          stage: 'kit',
          volunteerName: student.kitReceivedBy,
          timestamp: student.kitReceivedTime
        });
      }
    });
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Get analytics summary (compatible with old format)
  const getAnalyticsSummary = () => {
    if (!analyticsData.summary) return {
      totalScans: 0,
      uniqueStudents: 0,
      uniqueVolunteers: 0
    };

    return {
      totalScans: analyticsData.summary.totalScans || 0,
      uniqueStudents: analyticsData.summary.totalStudents || 0,
      uniqueVolunteers: analyticsData.summary.uniqueVolunteers || 0
    };
  };

  // Export logs as CSV (using processed logs)
  const exportLogs = () => {
    const logs = getProcessedLogs();
    if (!logs.length) return;
    
    const header = ['Student Name', 'Student ID', 'Stage', 'Volunteer', 'Timestamp'];
    const csvRows = [header.join(',')];
    logs.forEach(log => {
      csvRows.push([
        log.studentName || '',
        log.studentId || '',
        log.stage || '',
        log.volunteerName || '',
        new Date(log.timestamp).toLocaleString()
      ].map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const value = {
    // Backward compatibility
    logs: getProcessedLogs(),
    loading,
    error,
    // New backend data
    analyticsData,
    refreshData,
    exportLogs,
    getAnalyticsSummary,
    // Live data features
    lastUpdated,
    autoRefresh,
    setAutoRefresh,
    // Legacy methods for compatibility
    resetToEmptyData: refreshData,
    clearLogs: refreshData
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
