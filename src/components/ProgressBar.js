import React from 'react';
import { calculateProgress } from '../utils/alphabetUtils';

/**
 * Progress bar component showing learning progress
 */
const ProgressBar = ({ learnedLetters }) => {
  const progress = calculateProgress(learnedLetters);
  
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      <div 
        className="progress-fill" 
        style={{ width: `${progress}%` }}
        aria-label={`${Math.round(progress)}% of letters learned`}
      />
    </div>
  );
};

export default ProgressBar;
