import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Html5QrScanner from "../../components/Html5QrScanner";
import StudentInfoCard from "../../components/StudentInfoCard";
import ConfirmButton from "../../components/ConfirmButton";
import ScanErrorAnimation from "../../components/ScanErrorAnimation";
import { useScanHandler } from "../../components/useScanHandler";
import Loader from '../../components/Loader';

const ArrivalScan = () => {
  const navigate = useNavigate();
  const scan = useScanHandler('Arrival');
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);

  const handleReset = (mode) => {
    if (mode === "refresh") {
      scan.showScanNext = true;
    } else {
      scan.studentId = null;
      scan.studentData = null;
      scan.scanning = false;
      scan.scanSuccess = false;
      scan.isLoading = false;
      scan.showScanNext = false;
    }
    scan.processingRef.current = false;
  };

  const handleScanNext = () => {
    scan.studentId = null;
    scan.studentData = null;
    scan.scanning = false;
    scan.scanSuccess = false;
    scan.isLoading = false;
    scan.showScanNext = false;
  };

  const handleScanToggle = () => {
    scan.setScanning(prev => !prev);
    scan.setScanSuccess(false);
    scan.setIsLoading(false);
  };

  const getCurrentCameraName = () => {
    if (!scan.cameraId) return "Select Camera";
    const camera = scan.cameras.find(cam => cam.id === scan.cameraId);
    return camera ? camera.label || camera.id : "Select Camera";
  };

  const getButtonText = () => {
    if (scan.isLoading) return "Loading...";
    if (scan.scanning) return "Stop Scanning";
    return "Start Scanning";
  };

  const isButtonDisabled = () => {
    return !scan.cameraId || scan.isLoading;
  };

  useEffect(() => {
    if (scan.studentData && window.innerWidth <= 900) setShowInfoOverlay(true);
    else setShowInfoOverlay(false);
  }, [scan.studentData]);

  return (
    <div className="scanner-page">
      <div className="scanner-container">
        <header className="scanner-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="btn btn-secondary back-btn"
                onClick={() => navigate("/arrival")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Arrival
              </button>
              <div className="page-info">
                <h1 className="page-title">Arrival Verification Scanner</h1>
                <p className="page-description">
                  Scan student QR codes to verify arrival
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="scanner-main">
          <div className="scanner-flex-layout" style={window.innerWidth <= 900 ? {flexDirection: 'column', alignItems: 'center', gap: 0, marginLeft: 0, width: '100vw', minHeight: '100vh', justifyContent: 'flex-start'} : {flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start', gap: '3rem', marginLeft: '-2rem'}}>
            <div className="scanner-left" style={window.innerWidth <= 900 ? {width: '100vw', minWidth: 0, maxWidth: '100vw', padding: '1.2rem 0.5rem 0.5rem 0.5rem', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'} : {flex: 1, maxWidth: 540, minWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div className="scanner-container" style={window.innerWidth <= 900 ? {width: '100vw', height: 'auto', padding: 0, margin: 0, background: '#eaf1fb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'} : {}}>
                <div className="camera-dropdown-container" style={window.innerWidth <= 900 ? {width: '100%', marginBottom: 12} : {}}>
                  <button 
                    className="camera-dropdown-btn"
                    onClick={() => scan.setShowCameraDropdown(!scan.showCameraDropdown)}
                    disabled={scan.isLoading}
                  >
                    <span className="camera-icon">📹</span>
                    <span className="camera-text">{getCurrentCameraName()}</span>
                    <span className={`dropdown-arrow ${scan.showCameraDropdown ? 'rotated' : ''}`}>▼</span>
                  </button>
                  {scan.showCameraDropdown && (
                    <div className="camera-dropdown-menu">
                      {scan.cameras.map((cam) => (
                        <button
                          key={cam.id}
                          className={`camera-option ${scan.cameraId === cam.id ? 'selected' : ''}`}
                          onClick={() => scan.handleCameraSelect(cam.id)}
                        >
                          {cam.label || cam.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`scanner-box ${scan.scanning ? 'scanning' : ''} ${scan.scanSuccess ? 'scan-success' : ''} ${scan.isLoading ? 'loading' : ''}`} style={window.innerWidth <= 900 ? {width: 320, height: 320, maxWidth: '95vw', maxHeight: 320, borderRadius: 16, padding: 0, margin: '0 auto', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'} : {}}>
                  <Html5QrScanner
                    onScanSuccess={scan.handleScanSuccess}
                    cameraId={scan.cameraId}
                    scanning={scan.scanning}
                    onCameras={scan.setCameras}
                  />
                  {scan.scanning && <div className="laser-line"></div>}
                  {scan.scanSuccess && <div className="scan-pulse"></div>}
                  {scan.showCheckmark && (
                    <div className="checkmark-pulse-overlay">
                      <div className="checkmark-circle">
                        <svg width="64" height="64" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="30" fill="#10b981" opacity="0.15" />
                          <circle cx="32" cy="32" r="24" fill="#10b981" opacity="0.25" />
                          <polyline points="22,34 30,42 44,26" fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {scan.isLoading && <Loader />}
                  <ScanErrorAnimation trigger={scan.scanErrorTrigger} />
                </div>
                <div className="scanner-controls" style={window.innerWidth <= 900 ? {width: '100%', marginTop: 18, display: 'flex', justifyContent: 'center'} : {}}>
                  <button 
                    className={`scanner-action-btn ${isButtonDisabled() ? 'disabled' : ''}`} 
                    onClick={handleScanToggle}
                    disabled={isButtonDisabled()}
                  >
                    {getButtonText()}
                  </button>
                </div>
                {!scan.cameraId && window.innerWidth <= 900 && (
                  <p className="scanner-hint" style={{marginTop: 10}}>Please select a camera first</p>
                )}
              </div>
            </div>
            {window.innerWidth > 900 && (
              <div className="scanner-right" style={{flex: 1, maxWidth: 480, minWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: '1.5rem'}}>
                {scan.studentData && (
                  <>
                    <StudentInfoCard student={scan.studentData} currentStage="arrival" />
                    <ConfirmButton
                      studentId={scan.studentId}
                      stage="arrival"
                      onReset={handleReset}
                      showScanNext={scan.showScanNext}
                      onScanNext={handleScanNext}
                      studentData={scan.studentData}
                    />
                  </>
                )}
              </div>
            )}
            {window.innerWidth <= 900 && showInfoOverlay && (
              <div className="scanner-info-overlay">
                <button className="scanner-info-close" onClick={() => setShowInfoOverlay(false)} aria-label="Close Info Card">×</button>
                <div className="scanner-info-card-wrapper">
                  <StudentInfoCard student={scan.studentData} currentStage="arrival" />
                  <ConfirmButton
                    studentId={scan.studentId}
                    stage="arrival"
                    onReset={handleReset}
                    showScanNext={scan.showScanNext}
                    onScanNext={handleScanNext}
                    studentData={scan.studentData}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArrivalScan;
