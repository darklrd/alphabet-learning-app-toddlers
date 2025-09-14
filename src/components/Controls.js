import React from 'react';

/**
 * Control buttons component for sound and next letter actions
 */
const Controls = ({ onPlaySound, onNextLetter }) => {
  return (
    <div className="controls">
      <button 
        onClick={onPlaySound} 
        className="sound-btn"
        aria-label="Play sound for current letter"
      >
        🔊 Play Sound
      </button>
      <button 
        onClick={onNextLetter} 
        className="next-btn"
        aria-label="Go to next letter"
      >
        Next Letter ➡️
      </button>
    </div>
  );
};

export default Controls;
