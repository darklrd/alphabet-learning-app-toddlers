import React from 'react';

/**
 * Control buttons component for sound and next item actions.
 * `itemNoun` adapts the labels per topic ("Letter" or "Number").
 */
const Controls = ({ onPlaySound, onNextItem, onReset, itemNoun = 'Letter' }) => {
  const noun = itemNoun.toLowerCase();

  return (
    <div className="controls">
      <button
        onClick={onPlaySound}
        className="sound-btn"
        aria-label={`Play sound for current ${noun}`}
      >
        🔊 Play Sound
      </button>
      <button
        onClick={onNextItem}
        className="next-btn"
        aria-label={`Go to next ${noun}`}
      >
        Next {itemNoun} ➡️
      </button>
      <button
        onClick={onReset}
        className="reset-btn"
        aria-label={`Reset all learned ${noun}s`}
      >
        🔄 Reset
      </button>
    </div>
  );
};

export default Controls;
