import React from 'react';

/**
 * Component for displaying the word associated with the current letter
 */
const WordDisplay = ({ word }) => {
  return (
    <div className="word-display">
      <span className="word-text">
        {word || ''}
      </span>
    </div>
  );
};

export default WordDisplay;
