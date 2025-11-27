import React from 'react';
import '../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader-inner-wrapper">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="shadow" />
        <div className="shadow" />
        <div className="shadow" />
      </div>
    </div>
  );
};

export default Loader; 