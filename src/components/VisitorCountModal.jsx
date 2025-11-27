import React, { useState } from "react";
import { useToast } from "./ToastProvider";
import "./VisitorCountModal.css";

const VisitorCountModal = ({
  isOpen,
  onClose,
  studentName,
  studentId,
  onVisitorCountSet,
  onGenerateLanyards,
}) => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (visitorCount < 0) {
      addToast({
        type: "error",
        title: "Visitor count cannot be negative",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/scan/arrival/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, visitorCount }),
      });

      // Handle 204 No Content response
      if (response.status === 204) {
        addToast({
          type: "success",
          title: `Visitor count updated: ${visitorCount} visitors`,
          duration: 3000,
        });

        onVisitorCountSet(visitorCount);
        onGenerateLanyards();
        onClose();
        return;
      }

      // For other responses, try to parse JSON
      let data;
      try {
        data = await response.json();
      } catch {
        // If JSON parsing fails, treat as error
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to update visitor count");
      }

      addToast({
        type: "success",
        title: `Visitor count updated: ${visitorCount} visitors`,
        duration: 3000,
      });

      onVisitorCountSet(visitorCount);
      onGenerateLanyards();
      onClose();
    } catch (error) {
      // Fallback: Allow lanyard generation even if API fails (for testing)
      console.warn(
        "API call failed, but allowing lanyard generation for testing:",
        error.message
      );

      addToast({
        type: "warning",
        title: `API temporarily unavailable. Generating lanyards for ${visitorCount} visitors...`,
        duration: 4000,
      });

      onVisitorCountSet(visitorCount);
      onGenerateLanyards();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="visitor-modal-overlay" onClick={handleClose}>
      <div className="visitor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="visitor-modal-header">
          <img
            src="/title.png"
            alt="DeskBuddy"
            className="visitor-modal-logo"
          />
          <h2 className="visitor-modal-title">
            Welcome to Our College Family!
          </h2>
        </div>

        <div className="visitor-modal-content">
          <div className="visitor-message">
            <p className="visitor-greeting">
              Thank you for bringing <strong>{studentName}</strong> to our
              college!
            </p>
            <p className="visitor-instruction">
              Please confirm the number of guests accompanying the student:
            </p>
          </div>

          <div className="visitor-count-section">
            <label htmlFor="visitorCount" className="visitor-count-label">
              Number of Visitors/Parents:
            </label>
            <div className="visitor-count-controls">
              <button
                type="button"
                className="visitor-count-btn"
                onClick={() => setVisitorCount(Math.max(0, visitorCount - 1))}
                disabled={isLoading}
              >
                -
              </button>
              <input
                type="number"
                id="visitorCount"
                value={visitorCount}
                onChange={(e) =>
                  setVisitorCount(Math.max(0, parseInt(e.target.value) || 0))
                }
                min="0"
                max="10"
                className="visitor-count-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className="visitor-count-btn"
                onClick={() => setVisitorCount(Math.min(10, visitorCount + 1))}
                disabled={isLoading}
              >
                +
              </button>
            </div>
            <p className="visitor-count-hint">
              Maximum 10 visitors per student
            </p>
          </div>
        </div>

        <div className="visitor-modal-footer">
          <button
            type="button"
            className="visitor-modal-btn visitor-modal-btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="visitor-modal-btn visitor-modal-btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Generate Lanyards"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorCountModal;
