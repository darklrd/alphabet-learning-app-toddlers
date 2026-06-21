import React from 'react';

import QuizChoiceGrid from './QuizChoiceGrid';

/**
 * Presentational view for the "Find the Letter" quiz. All state comes from the
 * useFindLetterQuiz hook (owned by LearningView) via the `quiz` prop.
 *
 * @param {Object} quiz - Return value of useFindLetterQuiz
 * @param {string} ariaPrefix - aria noun, e.g. "Letter"
 * @param {Function} onBackToLearn - Switch back to Learn mode
 */
const FindLetterQuiz = ({ quiz, ariaPrefix, onBackToLearn }) => {
  const {
    currentTarget,
    choices,
    correctCount,
    incorrectChoicesForCurrent,
    feedback,
    isRoundComplete,
    totalQuestions,
    currentQuestionNumber,
    submitAnswer,
    repeatPrompt,
    startRound
  } = quiz;

  const noun = ariaPrefix.toLowerCase();

  if (isRoundComplete) {
    return (
      <div className="quiz-view quiz-complete" role="region" aria-label="Quiz complete">
        <h2 className="quiz-complete-title">You found them all! 🎉</h2>
        <p className="quiz-complete-score">
          {correctCount} of {totalQuestions} correct
        </p>
        <div className="quiz-complete-actions">
          <button className="quiz-play-again-btn" onClick={startRound}>
            🔁 Play Again
          </button>
          <button className="quiz-back-btn" onClick={onBackToLearn}>
            📖 Back to Learn
          </button>
        </div>
      </div>
    );
  }

  // Brief transient before the first round is generated.
  if (!currentTarget) {
    return <div className="quiz-view" role="region" aria-label="Find the letter quiz" />;
  }

  const awaitingAdvance = feedback.type === 'correct';

  return (
    <div className="quiz-view" role="region" aria-label="Find the letter quiz">
      <div className="quiz-prompt-row">
        <h2 className="quiz-prompt">
          Find <span className="quiz-prompt-target">{currentTarget}</span>
        </h2>
        <button
          className="quiz-repeat-btn"
          onClick={repeatPrompt}
          aria-label={`Repeat the prompt: find ${noun} ${currentTarget}`}
        >
          🔊 Repeat
        </button>
      </div>

      <QuizChoiceGrid
        choices={choices}
        target={currentTarget}
        incorrectChoices={incorrectChoicesForCurrent}
        feedbackType={feedback.type}
        onChoose={submitAnswer}
        ariaPrefix={ariaPrefix}
        disabled={awaitingAdvance}
      />

      <div className="quiz-status">
        <span className="quiz-progress-text">
          Question {currentQuestionNumber} of {totalQuestions}
        </span>
        <span className="quiz-score-text">Score: {correctCount}</span>
      </div>

      <div className={`quiz-feedback ${feedback.type}`} role="status" aria-live="polite">
        {feedback.message}
      </div>
    </div>
  );
};

export default FindLetterQuiz;
