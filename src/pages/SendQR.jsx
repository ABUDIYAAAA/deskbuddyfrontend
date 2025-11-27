import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/SendQR.css";
import scanQR from "../assets/scanQR.svg";
import { useToast } from "../components/ToastProvider";
import SendQRLoader from "../components/SendQRLoader";
import authService from "../services/auth";

const SendQR = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const { addToast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Capitalize each word in the name
  const capitalizeName = (name) =>
    name.replace(/\b\w/g, (c) => c.toUpperCase());

  // Get display name for Google, fallback to email/password name or email
  const getUserName = () => {
    if (!user) return "";
    if (user.displayName) return capitalizeName(user.displayName);
    if (user.email) return capitalizeName(user.email.split("@")[0]);
    return "User";
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      addToast({
        type: "error",
        title: "Please upload a CSV file only.",
        duration: 3500,
      });
      return;
    }

    setFileName(file.name);
    setUploadedFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter(Boolean);

      if (lines.length < 2) {
        addToast({
          type: "error",
          title: "CSV file must have at least a header row and one data row.",
          duration: 3500,
        });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Validate required columns
      const requiredColumns = ["name", "email", "userid"];
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col)
      );

      if (missingColumns.length > 0) {
        addToast({
          type: "error",
          title: `Missing required columns: ${missingColumns.join(", ")}`,
          duration: 3500,
        });
        return;
      }

      const students = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const student = {};
          headers.forEach((header, idx) => {
            student[header] = values[idx];
          });
          return student;
        })
        .filter((student) => student.name && student.email && student.userid);

      setCsvData(students);
      addToast({
        type: "success",
        title: `CSV loaded: ${students.length} students found!`,
        duration: 3500,
      });
    };

    reader.readAsText(file);
  };

  const handleSend = async () => {
    if (!uploadedFile) {
      addToast({
        type: "error",
        title: "Please upload a CSV file first.",
        duration: 3500,
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("csvFile", uploadedFile);

      // Get the token manually instead of using makeAuthenticatedRequest
      // because FormData requires special handling
      const token = authService.getToken();

      if (!token) {
        throw new Error("No authentication token");
      }

      const res = await fetch(`${API_BASE_URL}/email/upload-csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to send emails");
      }

      // Show detailed results
      const { summary } = result;
      const { emailSummary } = summary;

      addToast({
        type: "success",
        title: `Emails sent successfully! ${emailSummary.successful} sent, ${emailSummary.failed} failed`,
        duration: 5000,
      });

      // Clear the form
      setCsvData([]);
      setFileName("");
      setUploadedFile(null);
    } catch {
      addToast({
        type: "error",
        title: "Failed to send emails",
        message:
          "There was a problem sending emails. Please try again or contact support.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv"))
    ) {
      const event = { target: { files: [file] } };
      handleCSVUpload(event);
    } else {
      addToast({
        type: "error",
        title: "Please drop a CSV file only.",
        duration: 3500,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="sendqr-page">
      {isLoading && <SendQRLoader />}
      <div className="sendqr-container">
        {/* Header Section */}
        <header className="sendqr-header-section">
          <div className="header-content">
            <div className="header-left">
              <button
                className="btn btn-secondary back-btn"
                onClick={() => navigate("/dashboard")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Dashboard
              </button>
              <div className="page-info">
                <h1 className="page-title">Send QR Codes</h1>
                <p className="page-description">
                  Generate and send QR codes to students via email
                </p>
              </div>
            </div>
            <div className="header-actions">
              <div className="user-info">
                <div className="user-avatar">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{getUserName()}</span>
                  <span className="user-role">Administrator</span>
                </div>
              </div>
              <button
                className="btn btn-secondary logout-btn"
                onClick={handleLogout}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="sendqr-main">
          <div className="sendqr-content premium-glass">
            <div className="sheen"></div>
            <div
              className="sendqr-header"
              style={{
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              <div className="sendqr-heading-icon-badge">
                <img
                  src={scanQR}
                  alt="Send QR"
                  className="sendqr-heading-icon large"
                />
              </div>
            </div>

            <div className="sendqr-content">
              {/* File Upload Section */}
              <div className="upload-section">
                <div
                  className="upload-area"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="upload-icon">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 16L12 8M12 8L15 11M12 8L9 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3>Upload CSV File</h3>
                  <p>Drag and drop your CSV file here or click to browse</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="file-input"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="upload-button">
                    Choose File
                  </label>
                </div>

                {fileName && (
                  <div className="file-info">
                    <div className="file-name">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {fileName}
                    </div>
                  </div>
                )}
              </div>

              {/* Students Preview Section */}
              {csvData.length > 0 && (
                <div className="students-preview">
                  <div className="preview-header">
                    <h3>Students Loaded</h3>
                    <div className="student-count">
                      <span className="count-number">{csvData.length}</span>
                      <span className="count-label">students</span>
                    </div>
                  </div>

                  <div className="students-list">
                    {csvData.slice(0, 5).map((student, index) => (
                      <div key={index} className="student-item">
                        <div className="student-avatar">
                          {student.name
                            ? student.name.charAt(0).toUpperCase()
                            : "S"}
                        </div>
                        <div className="student-info">
                          <span className="student-name">
                            {student.name ||
                              student.email ||
                              `Student ${index + 1}`}
                          </span>
                          <span className="student-email">
                            {student.email || "No email provided"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {csvData.length > 5 && (
                      <div className="more-students">
                        +{csvData.length - 5} more students
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Send Button Section */}
              {csvData.length > 0 && (
                <div className="send-section">
                  <button
                    onClick={handleSend}
                    className={`send-button ${isLoading ? "loading" : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        Sending Emails...
                      </>
                    ) : (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Send QR Codes to All Students
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SendQR;
