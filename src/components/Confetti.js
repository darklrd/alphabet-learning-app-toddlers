import React, { useEffect } from 'react';
import { APP_CONFIG } from '../constants/alphabetData';

/**
 * Individual confetti element component
 */
const Confetti = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, APP_CONFIG.CONFETTI_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div 
      className="confetti" 
      style={{
        position: 'fixed',
        width: '10px',
        height: '10px',
        background: randomColor,
        left: `${Math.random() * 100}vw`,
        top: '-10px',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1000,
        animation: 'fall 3s linear forwards'
      }} 
    />
  );
};

export default Confetti;
