import { useLearning } from './useLearning';
import { ALPHABET_TOPIC } from '../constants/topics';

/**
 * Back-compat wrapper around the generic useLearning hook, bound to the alphabet topic.
 * Exposes the original `*Letter` field names so existing callers keep working.
 */
export const useAlphabetLearning = (onNewLetterLearned) => {
  const learning = useLearning(ALPHABET_TOPIC, onNewLetterLearned);

  return {
    // State (aliased to the original names)
    currentLetter: learning.currentItem,
    learnedLetters: learning.learnedItems,
    isLoading: learning.isLoading,
    showEmojiFallback: learning.showEmojiFallback,
    keyAnimation: learning.keyAnimation,

    // Computed values
    isAllLearned: learning.isAllLearned,
    currentData: learning.currentData,

    // Actions
    displayLetter: learning.displayItem,
    getNextLetter: learning.getNextItem,
    handleImageLoad: learning.handleImageLoad,
    handleImageError: learning.handleImageError,
    handlePlaySound: learning.handlePlaySound,
    handleNextLetter: learning.handleNextItem,
    handleKeyDown: learning.handleKeyDown,
    handleReset: learning.handleReset
  };
};
