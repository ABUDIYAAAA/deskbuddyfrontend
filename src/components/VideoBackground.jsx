import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const DEMO_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-night-city-drive-145.mp4'; // Demo video, swap as needed

const VideoBackground = ({ videoUrl = DEMO_VIDEO }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <StyledBg>
      <video
        ref={videoRef}
        className="bg-video"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="https://github.com/3ncryptor/DeskBuddy/releases/download/login-video/LOGIN.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="bg-overlay" />
    </StyledBg>
  );
};

const StyledBg = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  .bg-video {
    position: absolute;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    z-index: 1;
  }
  .bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 2;
  }
`;

export default VideoBackground; 