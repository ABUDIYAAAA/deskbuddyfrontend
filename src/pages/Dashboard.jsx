import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";
import ArrivalPNG from "../assets/Arrival.png";
import DocumentScanPNG from "../assets/DocumentScan.png";
import HostelScanPNG from "../assets/HostelScan.png";
import ScanQR from "../assets/scanQR.svg";
import logo from "../assets/Login.svg";

const ADMIN_USERS = ["aryan vibhuti", "piyush", "piyush yadav", "aryan"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getUserName = () => {
    if (!user) return "";
    if (user.displayName) return user.displayName.split(" ")[0];
    if (user.email) return user.email.split("@")[0];
    return "";
  };
  const userName = getUserName();

  const cards = [
    // {
    //   label: "Arrival Check-In",
    //   route: "/arrival",
    //   color: "var(--success-color)",
    //   svg: ArrivalPNG,
    //   description: "Process student arrivals and initial check-ins"
    // },
    {
      label: "Checkin",
      route: "/checkin",
      color: "var(--primary-color)",
      svg: HostelScanPNG,
      description: "Check in user",
    },

    {
      label: "Send QR to Student",
      route: "/sendqr",
      color: "var(--warning-color)",
      svg: ScanQR,
      description: "Generate and send QR codes to students",
    },
    {
      label: "Analytics",
      route: "/analytics",
      color: "var(--info-color)",
      svg: DocumentScanPNG,
      description: "View scan analytics and volunteer stats",
    },
  ];

  return (
    <div className="dashboard dashboard-new">
      {/* Engaging Glassy Header */}
      <div className="dashboard-glass-header simple-animated-header">
        <div className="dashboard-header-left">
          <img
            src={logo}
            alt="DeskBuddy Logo"
            className="dashboard-header-logo animated-logo"
          />
          <div>
            <div className="dashboard-header-title reveal-title">DeskBuddy</div>
            <div className="dashboard-header-welcome">
              Welcome back,{" "}
              <span className="dashboard-header-username">{userName}</span>!
            </div>
          </div>
        </div>
        <div className="dashboard-header-right">
          <button
            className="dashboard-header-signout mobile-only"
            onClick={logout}
            style={{ display: "none" }}
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
      {/* Quick Actions Section */}
      <main className="dashboard-main">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
          <p className="section-description">
            Select an action below to manage student check-ins and verifications
          </p>
        </div>
        <div className="card-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(card.route)}
            >
              <div className="card-header">
                <div
                  className="card-icon"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <img src={card.svg} alt={card.label} />
                </div>
                <div
                  className="card-accent"
                  style={{ backgroundColor: card.color }}
                ></div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{card.label}</h3>
                <p className="card-description">{card.description}</p>
              </div>
              <div className="card-action">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
