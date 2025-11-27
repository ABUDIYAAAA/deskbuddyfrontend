import React, { useEffect, useRef } from "react";
import "../styles/Toast.css";

const ToastPortal = ({ toasts, removeToast }) => {
  // Track timeouts for auto-removal
  const timeouts = useRef({});

  useEffect(() => {
    // Set up auto-remove for each toast
    toasts.forEach((toast) => {
      if (!timeouts.current[toast.id]) {
        timeouts.current[toast.id] = setTimeout(() => {
          removeToast(toast.id);
          delete timeouts.current[toast.id];
        }, toast.duration || 3500);
      }
    });
    // Clean up on unmount
    return () => {
      Object.values(timeouts.current).forEach(clearTimeout);
      timeouts.current = {};
    };
    // eslint-disable-next-line
  }, [toasts, removeToast]);

  return (
    <div className="toast-portal">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type || "info"}`}
          style={{ animationDuration: `${toast.duration || 3500}ms` }}
        >
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            {toast.message && <div className="toast-message">{toast.message}</div>}
          </div>
          <button className="toast-close" aria-label="Close notification" onClick={() => removeToast(toast.id)}>&times;</button>
          <div
            className="toast__progress"
            style={{
              transitionDuration: `${toast.duration || 3500}ms`,
              transform: "scaleX(1)",
              animation: `toast-progress-bar linear forwards`,
              animationDuration: `${toast.duration || 3500}ms`
            }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default ToastPortal; 