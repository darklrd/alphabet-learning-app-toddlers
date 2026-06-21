import { useState, useCallback, useRef, useEffect } from 'react';

import { APP_CONFIG } from '../constants/alphabetData';
import { speechService } from '../services/speechService';
import { generateRound, buildChoices } from '../utils/quizUtils';

// Kid-friendly success phrases, rotated deterministically so feedback stays varied
// without pulling randomness into the answer-handling path.
const SUCCESS_PHRASES = ['Great job!', 'Well done!', 'You got it!', 'Awesome!'];
const TRY_AGAIN_PHRASE = 'Try again';

/**
 * Generic "Find the item" quiz hook. Owns one round of active-recall practice for a topic:
 * round generation, answer handling, scoring, feedback, and reset. Topic-agnostic — it reads
 * items / key handling / aria noun from the topic config, so the same hook can later back a
 * "Find the Number" quiz.
 *
 * @param {Object} topic - Topic config from constants/topics.js
 * @param {Object} callbacks
 * @param {Function} [callbacks.onCorrectAnswer] - Fired on each correct answer (e.g. confetti)
 * @param {Function} [callbacks.onRoundComplete] - Fired once when the round finishes
 */
export const useFindLetterQuiz = (topic, { onCorrectAnswer, onRoundComplete } = {}) => {
  const [roundTargets, setRoundTargets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState({});
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState({ type: 'idle', message: '' });
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  // Timer for auto-advancing after a correct answer (cleared on unmount / new round)
  const advanceTimerRef = useRef(null);

  const choiceCount = APP_CONFIG.QUIZ_CHOICE_COUNT;
  const itemNoun = topic.ariaPrefix.toLowerCase(); // "letter" / "number"

  // Speak the prompt for a given target, e.g. "Find the letter A".
  const speakPrompt = useCallback(
    (target) => {
      speechService.speakText(`Find the ${itemNoun} ${target}`);
    },
    [itemNoun]
  );

  /**
   * Start (or restart) a round: shuffle all items into targets, reset score/state, build the
   * first question's choices, and speak the first prompt.
   */
  const startRound = useCallback(() => {
    clearTimeout(advanceTimerRef.current);

    const targets = generateRound(topic.items);
    const firstTarget = targets[0];

    setRoundTargets(targets);
    setCurrentIndex(0);
    setChoices(buildChoices(firstTarget, topic.items, choiceCount));
    setCorrectCount(0);
    setIncorrectAttempts({});
    setSelectedChoice(null);
    setFeedback({ type: 'idle', message: '' });
    setIsRoundComplete(false);

    speakPrompt(firstTarget);
  }, [topic.items, choiceCount, speakPrompt]);

  /**
   * Advance to the next question, or finish the round if there are no targets left.
   * Reads currentIndex from the closure; the callback is recreated when currentIndex changes,
   * so the advance timer always captures a fresh copy.
   */
  const goToNextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= roundTargets.length) {
      setIsRoundComplete(true);
      setFeedback({ type: 'complete', message: '' });
      setChoices([]);
      setSelectedChoice(null);
      if (onRoundComplete) {
        onRoundComplete();
      }
      return;
    }

    const nextTarget = roundTargets[nextIndex];
    setCurrentIndex(nextIndex);
    setChoices(buildChoices(nextTarget, topic.items, choiceCount));
    setSelectedChoice(null);
    setFeedback({ type: 'idle', message: '' });
    speakPrompt(nextTarget);
  }, [currentIndex, roundTargets, topic.items, choiceCount, onRoundComplete, speakPrompt]);

  /**
   * Handle an answer (from click/tap or keyboard). Correct answers score and auto-advance;
   * incorrect answers give gentle feedback and keep the same target active.
   */
  const submitAnswer = useCallback(
    (choice) => {
      // Ignore input once complete, or while a correct answer is animating toward the next one.
      if (isRoundComplete || feedback.type === 'correct') {
        return;
      }

      const target = roundTargets[currentIndex];
      if (!target) {
        return;
      }

      if (choice === target) {
        const phrase = SUCCESS_PHRASES[correctCount % SUCCESS_PHRASES.length];
        setCorrectCount((count) => count + 1);
        setSelectedChoice(choice);
        setFeedback({ type: 'correct', message: `${phrase} 🎉` });
        speechService.speakText(phrase);

        if (onCorrectAnswer) {
          onCorrectAnswer();
        }

        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => {
          goToNextQuestion();
        }, APP_CONFIG.QUIZ_ADVANCE_DELAY_MS);
      } else {
        setSelectedChoice(choice);
        setIncorrectAttempts((prev) => {
          const existing = prev[target] || [];
          if (existing.includes(choice)) {
            return prev;
          }
          return { ...prev, [target]: [...existing, choice] };
        });
        setFeedback({ type: 'incorrect', message: 'Try again! 👀' });
        speechService.speakText(TRY_AGAIN_PHRASE);
      }
    },
    [
      isRoundComplete,
      feedback.type,
      roundTargets,
      currentIndex,
      correctCount,
      onCorrectAnswer,
      goToNextQuestion
    ]
  );

  // Re-speak the current prompt (🔊 Repeat button).
  const repeatPrompt = useCallback(() => {
    const target = roundTargets[currentIndex];
    if (target) {
      speakPrompt(target);
    }
  }, [roundTargets, currentIndex, speakPrompt]);

  /**
   * Keyboard answering: accept only valid topic keys that match one of the displayed choices,
   * so button highlighting stays coherent. Non-letter / off-board keys are ignored.
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (isRoundComplete) {
        return;
      }
      const key = topic.normalizeKey(event.key);
      if (!topic.isValidKey(key) || !choices.includes(key)) {
        return;
      }
      event.preventDefault();
      submitAnswer(key);
    },
    [isRoundComplete, topic, choices, submitAnswer]
  );

  // Clear any pending advance timer on unmount.
  useEffect(() => () => clearTimeout(advanceTimerRef.current), []);

  const currentTarget = roundTargets[currentIndex] || null;

  return {
    // State
    currentTarget,
    choices,
    correctCount,
    incorrectAttempts,
    incorrectChoicesForCurrent: incorrectAttempts[currentTarget] || [],
    selectedChoice,
    feedback,
    isRoundComplete,
    totalQuestions: roundTargets.length,
    currentQuestionNumber: roundTargets.length === 0 ? 0 : Math.min(currentIndex + 1, roundTargets.length),

    // Actions
    startRound,
    submitAnswer,
    repeatPrompt,
    handleKeyDown
  };
};
