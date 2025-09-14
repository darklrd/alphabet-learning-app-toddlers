import { useEffect } from 'react';
import { imageService } from '../services/imageService';
import { APP_CONFIG } from '../constants/alphabetData';

/**
 * Custom hook for preloading images
 */
export const useImagePreloader = () => {
  useEffect(() => {
    // Start preloading after a short delay to not interfere with initial render
    const timer = setTimeout(() => {
      imageService.preloadAllImages();
    }, APP_CONFIG.PRELOAD_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  return {
    getCacheStats: () => imageService.getCacheStats(),
    clearCache: () => imageService.clearCache()
  };
};
