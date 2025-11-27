import React, { useState, useMemo } from "react";
import StudentInfoCard from "../StudentInfoCard";
import { useToast } from "../ToastProvider";
import "./DataTable.css";

const DataTable = ({
  data,
  searchTerm,
  onSearchChange,
  showAllData,
  onShowAllDataChange,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [studentInfo, setStudentInfo] = useState({});
  const [loadingStates, setLoadingStates] = useState(new Set());
  const { addToast } = useToast();

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleRowExpansion = async (studentId) => {
    const newExpandedRows = new Set(expandedRows);

    if (newExpandedRows.has(studentId)) {
      newExpandedRows.delete(studentId);
    } else {
      newExpandedRows.add(studentId);

      // Fetch student info if not already loaded
      if (!studentInfo[studentId] && !loadingStates.has(studentId)) {
        try {
          setLoadingStates((prev) => new Set(prev).add(studentId));

          const API_BASE_URL =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
          const response = await fetch(`${API_BASE_URL}/student/${studentId}`);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const studentData = await response.json();
          setStudentInfo((prev) => ({
            ...prev,
            [studentId]: studentData,
          }));

          // Success toast
          addToast({
            type: "success",
            title: "Student Data Loaded",
            message: `Successfully loaded details for ${
              studentData.name || studentId
            }`,
            duration: 3000,
          });
        } catch (error) {
          console.error("Error fetching student info:", error);

          // Set error state for this student
          setStudentInfo((prev) => ({
            ...prev,
            [studentId]: { error: error.message },
          }));

          // Error toast
          addToast({
            type: "error",
            title: "Failed to Load Student Data",
            message: `Could not load details for ${studentId}: ${error.message}`,
            duration: 4000,
          });
        } finally {
          setLoadingStates((prev) => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
          });
        }
      }
    }

    setExpandedRows(newExpandedRows);
  };

  const getStageColor = (stage) => {
    const colors = {
      arrival: "#10b981",
      documents: "#3b82f6",
      hostel: "#f59e0b",
      kit: "#8b5cf6",
    };
    return colors[stage.toLowerCase()] || "#64748b";
  };

  const getVolunteerColor = (volunteer) => {
    // Generate consistent color based on volunteer name
    const hash = volunteer.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="no-data">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
        <p>No scan data available</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="table-search">
        <div className="search-wrapper">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="table-search-input"
            placeholder="Search in table..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {onShowAllDataChange && (
          <button
            className="view-all-button"
            data-showing-all={showAllData}
            onClick={() => onShowAllDataChange(!showAllData)}
          >
            {showAllData ? "Show Recent (10)" : "View All Data"}
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th
                className="sortable"
                onClick={() => handleSort("studentName")}
              >
                Student Name
                <span className="sort-indicator">
                  {sortConfig.key === "studentName" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th className="sortable" onClick={() => handleSort("studentId")}>
                Student ID
                <span className="sort-indicator">
                  {sortConfig.key === "studentId" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th className="sortable" onClick={() => handleSort("stage")}>
                Stage
                <span className="sort-indicator">
                  {sortConfig.key === "stage" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort("volunteerName")}
              >
                Volunteer
                <span className="sort-indicator">
                  {sortConfig.key === "volunteerName" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th className="sortable" onClick={() => handleSort("timestamp")}>
                Timestamp
                <span className="sort-indicator">
                  {sortConfig.key === "timestamp" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <React.Fragment key={`${row.studentId}-${row.stage}-${index}`}>
                <tr
                  className={`table-row ${
                    expandedRows.has(row.studentId) ? "expanded" : ""
                  }`}
                  onClick={() => toggleRowExpansion(row.studentId)}
                >
                  <td>{row.id || index + 1}</td>
                  <td>{row.studentName || "N/A"}</td>
                  <td>{row.studentId || "N/A"}</td>
                  <td>
                    <span
                      className="stage-chip"
                      style={{ backgroundColor: getStageColor(row.stage) }}
                    >
                      {row.stage || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="volunteer-chip"
                      style={{
                        backgroundColor: getVolunteerColor(row.volunteerName),
                      }}
                    >
                      {row.volunteerName || "Unknown"}
                    </span>
                  </td>
                  <td>
                    {row.timestamp
                      ? new Date(row.timestamp).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(row.studentId);
                      }}
                    >
                      <span
                        className={`expand-icon ${
                          expandedRows.has(row.studentId) ? "expanded" : ""
                        }`}
                      >
                        {expandedRows.has(row.studentId) ? "−" : "+"}
                      </span>
                    </button>
                  </td>
                </tr>
                {expandedRows.has(row.studentId) && (
                  <tr className="expanded-row">
                    <td colSpan="7">
                      <div className="expanded-content">
                        {loadingStates.has(row.studentId) ? (
                          <div className="loading-info">
                            <div className="loading-spinner"></div>
                            <p>Loading student details...</p>
                          </div>
                        ) : studentInfo[row.studentId]?.error ? (
                          <div className="no-data">
                            <p>
                              Error loading student data:{" "}
                              {studentInfo[row.studentId].error}
                            </p>
                          </div>
                        ) : studentInfo[row.studentId] ? (
                          <StudentInfoCard
                            student={studentInfo[row.studentId]}
                          />
                        ) : (
                          <div className="no-data">
                            <p>No additional student information available</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
