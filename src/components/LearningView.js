import React, { useEffect, useState } from 'react';

import CelebrationModal from './CelebrationModal';
import Confetti from './Confetti';
import Controls from './Controls';
import FindLetterQuiz from './FindLetterQuiz';
import ImageDisplay from './ImageDisplay';
import ItemGrid from './ItemGrid';
import LetterDisplay from './LetterDisplay';
import ModeToggle from './ModeToggle';
import ProgressBar from './ProgressBar';
import WordDisplay from './WordDisplay';

import { APP_CONFIG } from '../constants/alphabetData';
import { useLearning } from '../hooks/useLearning';
import { useCelebration } from '../hooks/useCelebration';
import { useFindLetterQuiz } from '../hooks/useFindLetterQuiz';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

/**
 * Self-contained learning view for one topic. Owns its own learning + celebration
 * state, so each topic keeps independent progress. Only the active view listens to
 * the keyboard; inactive views stay mounted (hidden) to preserve progress on tab switch.
 *
 * Topics that opt in (topic.supportsQuiz) get a Learn / Quiz mode switch. Learn is the
 * default, preserving the original experience. Quiz mode renders the Find-the-Letter quiz.
 *
 * @param {Object} topic - Topic config from constants/topics.js
 * @param {boolean} isActive - Whether this view's tab is currently selected
 */
const LearningView = ({ topic, isActive }) => {
  // 'learn' | 'quiz'. Default Learn preserves existing behavior; resets on tab switch
  // because App keys this view by topic.id (remounted on switch).
  const [mode, setMode] = useState('learn');

  const celebration = useCelebration();
  const learning = useLearning(topic, celebration.celebrateNewLetter);

  // Quiz hook is always created (hooks can't be conditional); it stays idle for topics
  // without supportsQuiz since the mode toggle never appears and a round is never started.
  const quiz = useFindLetterQuiz(topic, {
    onCorrectAnswer: celebration.celebrateNewLetter,
    onRoundComplete: () =>
      celebration.createCelebrationEffect(APP_CONFIG.BIG_CELEBRATION_CONFETTI_COUNT)
  });

  const {
    handleKeyDown: quizHandleKeyDown,
    currentTarget: quizCurrentTarget,
    isRoundComplete: quizRoundComplete,
    startRound: startQuizRound
  } = quiz;

  const {
    currentItem,
    learnedItems,
    isLoading,
    showEmojiFallback,
    keyAnimation,
    isAllLearned,
    currentData,
    currentEmoji,
    displayItem,
    handleImageLoad,
    handleImageError,
    handlePlaySound,
    handleNextItem,
    handleKeyDown,
    handleReset
  } = learning;

  const {
    showCelebration,
    hasCelebratedCompletion,
    confettiElements,
    celebrateCompletion,
    closeCelebration,
    removeConfetti,
    resetCelebration
  } = celebration;

  const isQuizMode = mode === 'quiz';

  // Only the active view captures keyboard input, routed to the active mode's handler.
  useKeyboardInput(isQuizMode ? quizHandleKeyDown : handleKeyDown, isActive);

  // Start a quiz round when entering quiz mode with no round in progress. After a round
  // completes, currentTarget is null but isRoundComplete is true, so the summary stays put
  // until the user taps Play Again.
  useEffect(() => {
    if (isActive && isQuizMode && quizCurrentTarget === null && !quizRoundComplete) {
      startQuizRound();
    }
  }, [isActive, isQuizMode, quizCurrentTarget, quizRoundComplete, startQuizRound]);

  // Learn-mode completion celebration — fire once per completion so closing the modal
  // ("Keep Learning!") doesn't immediately re-trigger it (infinite loop). Guarded to Learn
  // mode so the generic modal never appears during the quiz.
  useEffect(() => {
    if (isActive && !isQuizMode && isAllLearned && !hasCelebratedCompletion) {
      const timer = setTimeout(() => {
        celebrateCompletion();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, isQuizMode, isAllLearned, hasCelebratedCompletion, celebrateCompletion]);

  return (
    <div
      className={`learning-view ${isActive ? '' : 'hidden'}`}
      hidden={!isActive}
      role="tabpanel"
      aria-label={`${topic.label} learning area`}
    >
      {topic.supportsQuiz && (
        <ModeToggle mode={mode} onModeChange={setMode} />
      )}

      {isQuizMode ? (
        <FindLetterQuiz
          quiz={quiz}
          ariaPrefix={topic.ariaPrefix}
          onBackToLearn={() => setMode('learn')}
        />
      ) : (
        <>
          <div className="display-area">
            <LetterDisplay letter={currentItem} isAnimated={keyAnimation} />

            <div className="image-container">
              <ImageDisplay
                imageUrl={currentData?.image}
                altText={currentData?.word}
                item={currentItem}
                emoji={currentEmoji}
                isLoading={isLoading}
                showEmojiFallback={showEmojiFallback}
                welcomeHint={topic.welcomeHint}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
              />
            </div>

            <WordDisplay word={currentData?.word} />
          </div>

          <Controls
            onPlaySound={handlePlaySound}
            onNextItem={handleNextItem}
            onReset={() => { handleReset(); resetCelebration(); }}
            itemNoun={topic.ariaPrefix}
          />

          <ProgressBar
            items={topic.items}
            learnedItems={learnedItems}
            itemNoun={`${topic.label.toLowerCase()}`}
          />

          <ItemGrid
            items={topic.items}
            learnedItems={learnedItems}
            currentItem={currentItem}
            onItemClick={displayItem}
            ariaPrefix={topic.ariaPrefix}
          />
        </>
      )}

      {/* Confetti elements (shared by learn + quiz) */}
      {confettiElements.map(id => (
        <Confetti key={id} onComplete={() => removeConfetti(id)} />
      ))}

      {/* Learn-mode completion modal */}
      {showCelebration && (
        <CelebrationModal
          onClose={closeCelebration}
          message={`You've learned all ${topic.items.length} ${topic.label.toLowerCase()}!`}
        />
      )}
    </div>
  );
};

export default LearningView;
