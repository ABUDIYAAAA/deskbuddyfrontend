import React from "react";
import "../styles/StudentInfoCard.css";
import avatar from "../assets/avitar.webp";

const stageLabels = {
  arrival: {
    label: "Arrival",
    statusKey: "arrival",
    verifiedByKey: "arrivalVerifiedBy",
    icon: "🏠",
  },
  hostel: {
    label: "Hostel",
    statusKey: "hostelVerified",
    verifiedByKey: "hostelVerifiedBy",
    icon: "🏢",
  },
  documents: {
    label: "Documents",
    statusKey: "documentsVerified",
    verifiedByKey: "documentsVerifiedBy",
    icon: "📄",
  },
  kit: {
    label: "Kit",
    statusKey: "kitReceived",
    verifiedByKey: "kitReceivedBy",
    icon: "📦",
  },
};

const StudentInfoCard = ({ student, currentStage }) => {
  const stage = stageLabels[currentStage];

  let status = null;
  let completedStages = 0;
  const totalStages = 4;

  if (student) {
    completedStages = Object.values(stageLabels).filter(
      (s) => student[s.statusKey]
    ).length;
  }

  const completionPercentage = (completedStages / totalStages) * 100;

  if (stage && student) {
    status = {
      label: stage.label,
      completed: !!student[stage.statusKey],
      verifiedBy: student[stage.verifiedByKey],
      icon: stage.icon,
    };
  }

  const getCardColorClass = () => {
    if (!student) return "neutral";
    if (completionPercentage === 100) return "completed";
    if (completionPercentage >= 50) return "in-progress";
    return "pending";
  };

  if (!student) {
    return (
      <div
        className={`student-card professional-card fade-in wide big neutral`}
      >
        <div className="student-card-header big">
          <div className="avatar-container">
            <img
              src={avatar}
              alt="Student Avatar"
              className="student-avatar big"
            />
            <div className="avatar-status neutral">⏳</div>
          </div>
          <div className="student-header-info">
            <span className="student-name big">No Student Data</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "0%" }}></div>
            </div>
          </div>
        </div>

        <div className="student-fields empty">
          <div className="student-row">
            <span className="student-label">Status:</span>
            <span className="student-value">Please scan a QR code</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`student-card professional-card fade-in wide big ${getCardColorClass()}`}
    >
      <div className="student-card-header big">
        <div className="avatar-container">
          <img
            src={student.image || avatar}
            alt={student.name}
            className="student-avatar big"
          />
          <div
            className={`avatar-status ${
              completionPercentage === 100
                ? "completed"
                : completionPercentage >= 50
                ? "in-progress"
                : "pending"
            }`}
          >
            {completionPercentage === 100
              ? "✅"
              : completionPercentage >= 50
              ? "🔄"
              : "⏳"}
          </div>
        </div>

        <div className="student-header-info">
          <span className="student-name big">{student.name}</span>

          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {completedStages}/{totalStages} stages completed
            </div>
          </div>
        </div>
      </div>

      {/* UPDATED QUICK STATS */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Role</span>
          <span className="stat-value">{student.role}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Gender</span>
          <span className="stat-value">{student.gender}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Year</span>
          <span className="stat-value">{student.yearOfStudy}</span>
        </div>
      </div>

      {/* UPDATED MAIN FIELDS */}
      <div className="student-main-fields">
        <div className="student-row">
          <span className="student-label">Email:</span>
          <span className="student-value">{student.email}</span>
        </div>

        <div className="student-row">
          <span className="student-label">WhatsApp:</span>
          <span className="student-value">{student.whatsappNumber}</span>
        </div>

        <div className="student-row">
          <span className="student-label">College:</span>
          <span className="student-value">{student.collegeName}</span>
        </div>

        <div className="student-row">
          <span className="student-label">City:</span>
          <span className="student-value">{student.city}</span>
        </div>

        <div className="student-row">
          <span className="student-label">State:</span>
          <span className="student-value">{student.state}</span>
        </div>
      </div>

      {/* VERIFIED STAGE */}
      {status && (
        <div className="scan-status-section single">
          <div className="scan-status-title">
            {status.icon} {status.label} Status
          </div>

          <div className="scan-status-row single">
            <span className="scan-status-label">{status.label}:</span>

            <span
              className={`scan-status-chip animated-chip ${
                status.completed ? "yes" : "no"
              }`}
            >
              {status.completed ? "Completed" : "Pending"}
            </span>

            <span className="scan-status-by">
              {status.completed
                ? `by ${status.verifiedBy || "Unknown"}`
                : "Not assigned"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInfoCard;
