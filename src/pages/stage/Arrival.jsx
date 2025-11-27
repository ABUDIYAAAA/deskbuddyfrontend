import React from "react";
import { useNavigate } from "react-router-dom";
import scanQR from '../../assets/scanQR.svg';
import HistoryPNG from '../../assets/History.png';
import "../../styles/StagePage.css";

const ArrivalPage = () => {
  const navigate = useNavigate();

  return (
    <div className="stage-page">
      <div className="stage-container">
        <header className="stage-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="btn btn-secondary back-btn"
                onClick={() => navigate("/dashboard")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Dashboard
              </button>
              <div className="page-info">
                <h1 className="page-title">Arrival Check-In</h1>
                <p className="page-description">
                  Process student arrivals and manage check-in procedures
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="stage-main">
          <div className="stage-cards">
            <div className="stage-card primary" onClick={() => navigate("/arrival/scan")}>
              <div className="card-icon">
                <img src={scanQR} alt="Scan QR" />
              </div>
              <div className="card-content">
                <h3 className="card-title">Scan QR Code</h3>
                <p className="card-description">
                  Scan student QR codes to process arrivals and check-ins
                </p>
              </div>
              <div className="card-action">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </div>

            <div className="stage-card secondary">
              <div className="card-icon">
                <img src={HistoryPNG} alt="History" />
              </div>
              <div className="card-content">
                <h3 className="card-title">View History</h3>
                <p className="card-description">
                  Access arrival records and check-in history
                </p>
                <span className="coming-soon">Coming Soon</span>
              </div>
              <div className="card-action">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArrivalPage;
