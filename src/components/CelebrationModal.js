import React, { useEffect } from 'react';
import { APP_CONFIG } from '../constants/alphabetData';

/**
 * Modal component for celebrating completion of all letters
 */
const CelebrationModal = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, APP_CONFIG.CELEBRATION_MODAL_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="celebration-modal">
      <div className="celebration-content">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You've learned all 26 letters!</p>
        <button onClick={onClose}>Keep Learning! 🌟</button>
      </div>
    </div>
  );
};

export default CelebrationModal;
