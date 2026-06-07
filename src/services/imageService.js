import { alphabetData } from '../constants/alphabetData';

/**
 * Image service for handling image preloading and caching
 */
export class ImageService {
  constructor() {
    this.preloadedImages = new Map();
    this.isPreloading = false;
  }

  /**
   * Preload all images across the given datasets for faster loading
   * @param {Array<Object>} dataObjects - Topic data maps (item -> { image }); defaults to alphabet
   * @returns {Promise<void>} - Promise that resolves when all images are preloaded
   */
  async preloadAllImages(dataObjects = [alphabetData]) {
    if (this.isPreloading) {
      return;
    }

    this.isPreloading = true;
    console.log('🔄 Starting image preload...');

    const allEntries = dataObjects.flatMap(dataObject => Object.values(dataObject));
    const preloadPromises = allEntries.map(({ image }) => {
      if (image && !this.preloadedImages.has(image)) {
        return this.preloadImage(image);
      }
      return Promise.resolve();
    });

    try {
      await Promise.allSettled(preloadPromises);
      console.log('✅ Image preload completed');
    } catch (error) {
      console.warn('⚠️ Some images failed to preload:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Preload a single image
   * @param {string} imageUrl - URL of the image to preload
   * @returns {Promise<HTMLImageElement>} - Promise that resolves with the loaded image
   */
  preloadImage(imageUrl) {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(imageUrl)) {
        resolve(this.preloadedImages.get(imageUrl));
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.set(imageUrl, img);
        console.log(`📸 Preloaded: ${imageUrl}`);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`❌ Failed to preload: ${imageUrl}`);
        reject(new Error(`Failed to preload image: ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Check if an image is preloaded
   * @param {string} imageUrl - URL of the image to check
   * @returns {boolean} - True if image is preloaded
   */
  isImagePreloaded(imageUrl) {
    return this.preloadedImages.has(imageUrl);
  }

  /**
   * Get preloaded image element
   * @param {string} imageUrl - URL of the image to get
   * @returns {HTMLImageElement|null} - The preloaded image element or null
   */
  getPreloadedImage(imageUrl) {
    return this.preloadedImages.get(imageUrl) || null;
  }

  /**
   * Clear preloaded images cache
   */
  clearCache() {
    this.preloadedImages.clear();
    console.log('🧹 Image cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getCacheStats() {
    return {
      totalImages: Object.keys(alphabetData).length,
      preloadedCount: this.preloadedImages.size,
      isPreloading: this.isPreloading,
      cacheHitRate: this.preloadedImages.size / Object.keys(alphabetData).length
    };
  }
}

// Create and export a singleton instance
export const imageService = new ImageService();
