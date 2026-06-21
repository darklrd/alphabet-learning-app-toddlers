import React from 'react';

const MODES = [
  { id: 'learn', label: 'Learn', emoji: '📖' },
  { id: 'quiz', label: 'Quiz', emoji: '🎯' }
];

/**
 * Segmented Learn / Quiz switch shown inside a topic that supports the quiz.
 * Uses tab semantics so assistive tech announces the active mode.
 * @param {string} mode - Active mode id ('learn' | 'quiz')
 * @param {Function} onModeChange - Called with a mode id when a button is clicked
 */
const ModeToggle = ({ mode, onModeChange }) => {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Learning mode">
      {MODES.map(({ id, label, emoji }) => {
        const isActive = id === mode;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            className={`mode-btn ${isActive ? 'active' : ''}`}
            onClick={() => onModeChange(id)}
          >
            <span className="mode-emoji" aria-hidden="true">{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
