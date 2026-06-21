import React from 'react';

/**
 * The answer choices for one quiz question. Large, semantic buttons with accessible labels.
 * Correct/incorrect states use BOTH color and a ✓/✗ glyph so color isn't the only signal.
 *
 * @param {Array<string>} choices - The items to show as choices
 * @param {string} target - The correct answer
 * @param {Array<string>} incorrectChoices - Choices the user has picked wrong for this target
 * @param {string} feedbackType - 'idle' | 'correct' | 'incorrect' | 'complete'
 * @param {Function} onChoose - Called with the chosen item
 * @param {string} ariaPrefix - aria noun, e.g. "Letter"
 * @param {boolean} disabled - Disable all choices (during advance delay / completion)
 */
const QuizChoiceGrid = ({
  choices,
  target,
  incorrectChoices = [],
  feedbackType,
  onChoose,
  ariaPrefix,
  disabled = false
}) => {
  const noun = ariaPrefix.toLowerCase();

  return (
    <div className="quiz-choice-grid">
      {choices.map((choice) => {
        const isCorrect = feedbackType === 'correct' && choice === target;
        const isIncorrect = incorrectChoices.includes(choice);
        const stateClass = isCorrect ? 'correct' : isIncorrect ? 'incorrect' : '';

        return (
          <button
            key={choice}
            className={`quiz-choice ${stateClass}`}
            onClick={() => onChoose(choice)}
            disabled={disabled}
            aria-label={`Choose ${noun} ${choice}`}
          >
            <span className="quiz-choice-letter">{choice}</span>
            {isCorrect && <span className="quiz-choice-mark" aria-hidden="true">✓</span>}
            {isIncorrect && <span className="quiz-choice-mark" aria-hidden="true">✗</span>}
          </button>
        );
      })}
    </div>
  );
};

export default QuizChoiceGrid;
