import React from 'react';
import { ALL_LETTERS } from '../constants/alphabetData';

/**
 * Grid component displaying all alphabet letters with learned status
 */
const AlphabetGrid = ({ learnedLetters, currentLetter, onLetterClick }) => {
  return (
    <div className="alphabet-grid">
      {ALL_LETTERS.map(letter => (
        <button
          key={letter}
          className={`alphabet-btn ${learnedLetters.has(letter) ? 'learned' : ''} ${currentLetter === letter ? 'current' : ''}`}
          onClick={() => onLetterClick(letter)}
          aria-label={`Letter ${letter}`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetGrid;
