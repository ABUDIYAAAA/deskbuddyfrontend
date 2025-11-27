import React, { useEffect, useState } from "react";
import "../styles/ScanErrorAnimation.css";

const ScanErrorAnimation = ({ trigger }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return <div className="scan-error-animation" />;
};

export default ScanErrorAnimation; 