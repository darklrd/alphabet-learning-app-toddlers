import React from 'react';
import { calculateProgress } from '../utils/learningUtils';

/**
 * Progress bar showing learning progress for a topic.
 * @param {Array<string>} items - All items in the topic
 * @param {Set} learnedItems - Learned items
 * @param {string} itemNoun - Plural noun for the aria label ("letters" or "numbers")
 */
const ProgressBar = ({ items, learnedItems, itemNoun = 'letters' }) => {
  const progress = calculateProgress(items, learnedItems);

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      <div
        className="progress-fill"
        style={{ width: `${progress}%` }}
        aria-label={`${Math.round(progress)}% of ${itemNoun} learned`}
      />
    </div>
  );
};

export default ProgressBar;
