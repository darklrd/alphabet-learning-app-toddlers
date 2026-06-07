import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard input events.
 * @param {Function} onKeyDown - Keydown handler
 * @param {boolean} enabled - When false, no listener is bound (used to gate inactive views)
 */
export const useKeyboardInput = (onKeyDown, enabled = true) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

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
  }, [onKeyDown, enabled]);
};
