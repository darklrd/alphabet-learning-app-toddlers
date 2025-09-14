import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard input events
 */
export const useKeyboardInput = (onKeyDown) => {
  useEffect(() => {
    // Add keyboard event listener
    document.addEventListener('keydown', onKeyDown);
    
    // Focus container for keyboard events
    const container = document.querySelector('.container');
    if (container) {
      container.focus();
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
};
