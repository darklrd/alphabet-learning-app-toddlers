import React from 'react';

/**
 * Component for displaying the current letter with animation
 */
const LetterDisplay = ({ letter, isAnimated }) => {
  return (
    <div className="letter-display">
      <span className={`big-letter ${isAnimated ? 'bounce' : ''}`}>
        {letter || '?'}
      </span>
    </div>
  );
};

export default LetterDisplay;
