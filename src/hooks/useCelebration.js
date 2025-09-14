import { useState, useCallback, useEffect } from 'react';
import { APP_CONFIG } from '../constants/alphabetData';

/**
 * Custom hook for managing celebration effects and confetti
 */
export const useCelebration = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiElements, setConfettiElements] = useState([]);

  /**
   * Create confetti effect
   */
  const createCelebrationEffect = useCallback((count = APP_CONFIG.CONFETTI_COUNT) => {
    const newConfetti = [];
    for (let i = 0; i < count; i++) {
      const id = Date.now() + i;
      newConfetti.push({ id, delay: i * 100 });
    }
    
    newConfetti.forEach(({ id, delay }) => {
      setTimeout(() => {
        setConfettiElements(prev => [...prev, id]);
      }, delay);
    });
  }, []);

  /**
   * Remove confetti element
   */
  const removeConfetti = useCallback((id) => {
    setConfettiElements(prev => prev.filter(confettiId => confettiId !== id));
  }, []);

  /**
   * Trigger celebration for new letter learned
   */
  const celebrateNewLetter = useCallback(() => {
    setTimeout(() => {
      createCelebrationEffect();
    }, APP_CONFIG.CELEBRATION_DELAY_MS);
  }, [createCelebrationEffect]);

  /**
   * Trigger big celebration for completing all letters
   */
  const celebrateCompletion = useCallback(() => {
    setShowCelebration(true);
    
    // Create multiple waves of confetti
    for (let i = 0; i < APP_CONFIG.BIG_CELEBRATION_CONFETTI_COUNT; i++) {
      setTimeout(() => {
        createCelebrationEffect();
      }, i * 100);
    }
  }, [createCelebrationEffect]);

  /**
   * Close celebration modal
   */
  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  /**
   * Reset all celebration state
   */
  const resetCelebration = useCallback(() => {
    setShowCelebration(false);
    setConfettiElements([]);
  }, []);

  return {
    // State
    showCelebration,
    confettiElements,
    
    // Actions
    createCelebrationEffect,
    removeConfetti,
    celebrateNewLetter,
    celebrateCompletion,
    closeCelebration,
    resetCelebration
  };
};
