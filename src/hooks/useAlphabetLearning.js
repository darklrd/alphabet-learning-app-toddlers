import { useState, useCallback, useEffect } from 'react';
import { alphabetData, APP_CONFIG } from '../constants/alphabetData';
import { getRandomLetter, isAllLettersLearned, isValidLetter } from '../utils/alphabetUtils';
import { speechService } from '../services/speechService';

/**
 * Custom hook for managing alphabet learning state and logic
 */
export const useAlphabetLearning = (onNewLetterLearned) => {
  const [currentLetter, setCurrentLetter] = useState('');
  const [learnedLetters, setLearnedLetters] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiFallback, setShowEmojiFallback] = useState(false);
  const [imageTimeoutId, setImageTimeoutId] = useState(null);
  const [keyAnimation, setKeyAnimation] = useState(false);

  /**
   * Display a letter with its image and sound
   */
  const displayLetter = useCallback((letter) => {
    if (!alphabetData[letter]) {
      return;
    }
    
    // Clear any existing timeout
    if (imageTimeoutId) {
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }
    
    setCurrentLetter(letter);
    setKeyAnimation(true);
    
    // Reset animation
    setTimeout(() => setKeyAnimation(false), APP_CONFIG.ANIMATION_DURATION_MS);
    
    // Set up image loading state
    setIsLoading(true);
    setShowEmojiFallback(false);
    
    // Set timeout for image loading (fallback to emoji after timeout)
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setShowEmojiFallback(true);
    }, APP_CONFIG.IMAGE_TIMEOUT_MS);
    
    setImageTimeoutId(timeoutId);
    
    // Mark letter as learned and trigger callback for new letters
    const isNewLetter = !learnedLetters.has(letter);
    if (isNewLetter) {
      setLearnedLetters(prev => new Set([...prev, letter]));
      // Call the callback for new letter celebration
      if (onNewLetterLearned) {
        setTimeout(() => {
          onNewLetterLearned();
        }, APP_CONFIG.CELEBRATION_DELAY_MS);
      }
    }
    
    // Speak the letter and word
    setTimeout(() => {
      speechService.speakLetter(letter);
    }, APP_CONFIG.SPEECH_DELAY_MS);
  }, [learnedLetters, imageTimeoutId]);

  /**
   * Get next unlearned letter
   */
  const getNextLetter = useCallback(() => {
    return getRandomLetter(learnedLetters);
  }, [learnedLetters]);

  /**
   * Handle image load success
   */
  const handleImageLoad = useCallback(() => {
    if (imageTimeoutId) {
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }
    setIsLoading(false);
    setShowEmojiFallback(false);
  }, [imageTimeoutId]);

  /**
   * Handle image load error
   */
  const handleImageError = useCallback(() => {
    if (imageTimeoutId) {
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }
    setIsLoading(false);
    setShowEmojiFallback(true);
  }, [imageTimeoutId]);

  /**
   * Handle play sound for current letter
   */
  const handlePlaySound = useCallback(() => {
    if (currentLetter) {
      speechService.speakLetter(currentLetter);
    }
  }, [currentLetter]);

  /**
   * Handle next letter button click
   */
  const handleNextLetter = useCallback(() => {
    const nextLetter = getNextLetter();
    if (nextLetter) {
      displayLetter(nextLetter);
    }
  }, [getNextLetter, displayLetter]);

  /**
   * Handle keyboard input
   */
  const handleKeyDown = useCallback((event) => {
    const key = event.key.toUpperCase();
    if (isValidLetter(key)) {
      displayLetter(key);
      event.preventDefault();
    }
  }, [displayLetter]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (imageTimeoutId) {
        clearTimeout(imageTimeoutId);
      }
    };
  }, [imageTimeoutId]);

  return {
    // State
    currentLetter,
    learnedLetters,
    isLoading,
    showEmojiFallback,
    keyAnimation,
    
    // Computed values
    isAllLearned: isAllLettersLearned(learnedLetters),
    currentData: currentLetter ? alphabetData[currentLetter] : null,
    
    // Actions
    displayLetter,
    getNextLetter,
    handleImageLoad,
    handleImageError,
    handlePlaySound,
    handleNextLetter,
    handleKeyDown
  };
};
