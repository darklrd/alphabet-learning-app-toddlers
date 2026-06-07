import React, { useEffect } from 'react';

import CelebrationModal from './CelebrationModal';
import Confetti from './Confetti';
import Controls from './Controls';
import ImageDisplay from './ImageDisplay';
import ItemGrid from './ItemGrid';
import LetterDisplay from './LetterDisplay';
import ProgressBar from './ProgressBar';
import WordDisplay from './WordDisplay';

import { useLearning } from '../hooks/useLearning';
import { useCelebration } from '../hooks/useCelebration';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

/**
 * Self-contained learning view for one topic. Owns its own learning + celebration
 * state, so each topic keeps independent progress. Only the active view listens to
 * the keyboard; inactive views stay mounted (hidden) to preserve progress on tab switch.
 *
 * @param {Object} topic - Topic config from constants/topics.js
 * @param {boolean} isActive - Whether this view's tab is currently selected
 */
const LearningView = ({ topic, isActive }) => {
  const celebration = useCelebration();
  const learning = useLearning(topic, celebration.celebrateNewLetter);

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
    confettiElements,
    celebrateCompletion,
    closeCelebration,
    removeConfetti,
    resetCelebration
  } = celebration;

  // Only the active view captures keyboard input
  useKeyboardInput(handleKeyDown, isActive);

  // Handle completion celebration
  useEffect(() => {
    if (isActive && isAllLearned && !showCelebration) {
      setTimeout(() => {
        celebrateCompletion();
      }, 1000);
    }
  }, [isActive, isAllLearned, showCelebration, celebrateCompletion]);

  return (
    <div
      className={`learning-view ${isActive ? '' : 'hidden'}`}
      hidden={!isActive}
      role="tabpanel"
      aria-label={`${topic.label} learning area`}
    >
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

      {/* Confetti elements */}
      {confettiElements.map(id => (
        <Confetti key={id} onComplete={() => removeConfetti(id)} />
      ))}

      {/* Celebration modal */}
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
