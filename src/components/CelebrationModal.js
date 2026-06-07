import React, { useEffect } from 'react';
import { APP_CONFIG } from '../constants/alphabetData';

/**
 * Modal component for celebrating completion of a topic.
 * `message` is topic-specific (e.g. "You've learned all 10 numbers!").
 */
const CelebrationModal = ({ onClose, message = "You've learned all 26 letters!" }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, APP_CONFIG.CELEBRATION_MODAL_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="celebration-modal">
      <div className="celebration-content">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>{message}</p>
        <button onClick={onClose}>Keep Learning! 🌟</button>
      </div>
    </div>
  );
};

export default CelebrationModal;
