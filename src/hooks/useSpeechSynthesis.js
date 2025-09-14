import { useEffect } from 'react';
import { speechService } from '../services/speechService';

/**
 * Custom hook for managing speech synthesis
 */
export const useSpeechSynthesis = () => {
  useEffect(() => {
    // Set up voice loading event listener
    const cleanup = speechService.onVoicesChanged(() => {
      console.log('🔊 Speech voices loaded');
    });

    return cleanup;
  }, []);

  return {
    speak: (letter, options) => speechService.speakLetter(letter, options),
    cancel: () => speechService.cancel(),
    isAvailable: speechService.isAvailable
  };
};
