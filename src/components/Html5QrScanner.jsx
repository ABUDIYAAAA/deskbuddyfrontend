import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const Html5QrScanner = ({ onScanSuccess, cameraId, scanning, onCameras }) => {
  const qrRef = useRef();
  const html5Qr = useRef();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Enumerate cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras().then((devices) => {
      if (onCameras) onCameras(devices);
    }).catch((err) => {
      console.error("Error getting cameras:", err);
    });
  }, [onCameras]);

  // Start/stop scanner based on scanning prop
  useEffect(() => {
    if (!scanning) {
      if (html5Qr.current && isInitialized) {
        setIsStarting(false);
        html5Qr.current.stop()
          .then(() => {
            html5Qr.current = null;
            setIsInitialized(false);
          })
          .catch((err) => {
            if (html5Qr.current) {
              html5Qr.current = null;
            }
            setIsInitialized(false);
            setIsStarting(false);
          });
      }
      return;
    }

    if (isInitialized || isStarting) return;

    const startScanner = async () => {
      try {
        setIsStarting(true);
        if (qrRef.current && !qrRef.current.querySelector('video')) {
          qrRef.current.innerHTML = '';
        }
        const qr = new Html5Qrcode(qrRef.current.id);
        html5Qr.current = qr;
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 }, // square box for best detection
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment"
          }
        };
        await qr.start(
          cameraId || { facingMode: "environment" },
          config,
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignore scanning errors, just keep scanning
          }
        );
        setIsInitialized(true);
        setIsStarting(false);
      } catch (err) {
        setIsInitialized(false);
        setIsStarting(false);
        if (html5Qr.current) {
          html5Qr.current = null;
        }
      }
    };
    startScanner();
    return () => {
      if (html5Qr.current && isInitialized) {
        html5Qr.current.stop()
          .then(() => {
            html5Qr.current = null;
          })
          .catch(() => {
            if (html5Qr.current) {
              html5Qr.current = null;
            }
          });
      }
    };
  }, [scanning, cameraId, onScanSuccess, isInitialized, isStarting]);

  useEffect(() => {
    return () => {
      if (html5Qr.current) {
        html5Qr.current.stop().catch(() => {});
        html5Qr.current = null;
      }
    };
  }, []);

  return (
    <div
      id="qr-reader"
      ref={qrRef}
      style={{
        width: 320,
        height: 320,
        margin: '0 auto',
        borderRadius: '12px',
        backgroundColor: 'rgba(240,244,255,0.85)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        position: 'relative'
      }}
    />
  );
};

export default Html5QrScanner;
