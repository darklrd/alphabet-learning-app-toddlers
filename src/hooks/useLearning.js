import { useState, useCallback, useEffect } from 'react';
import { APP_CONFIG } from '../constants/alphabetData';
import { getRandomItem, isAllLearned, getEmoji } from '../utils/learningUtils';
import { speechService } from '../services/speechService';

/**
 * Generic learning hook. Driven by a `topic` config (see constants/topics.js) so it
 * can teach letters, numbers, or any future item set. Manages the current item, the
 * learned-items Set, image loading/emoji-fallback state, and the handle* callbacks.
 *
 * @param {Object} topic - Topic config: { data, emojiMap, items, isValidKey, normalizeKey }
 * @param {Function} onNewItemLearned - Callback fired when a brand-new item is learned
 */
export const useLearning = (topic, onNewItemLearned) => {
  const { data, emojiMap, items, isValidKey, normalizeKey } = topic;

  const [currentItem, setCurrentItem] = useState('');
  const [learnedItems, setLearnedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiFallback, setShowEmojiFallback] = useState(false);
  const [imageTimeoutId, setImageTimeoutId] = useState(null);
  const [keyAnimation, setKeyAnimation] = useState(false);

  /**
   * Display an item with its image and sound
   */
  const displayItem = useCallback((item) => {
    if (!data[item]) {
      return;
    }

    // Clear any existing timeout
    if (imageTimeoutId) {
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }

    setCurrentItem(item);
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

    // Mark item as learned and trigger callback for new items
    const isNewItem = !learnedItems.has(item);
    if (isNewItem) {
      setLearnedItems(prev => new Set([...prev, item]));
      if (onNewItemLearned) {
        setTimeout(() => {
          onNewItemLearned();
        }, APP_CONFIG.CELEBRATION_DELAY_MS);
      }
    }

    // Speak the item and its word
    setTimeout(() => {
      speechService.speak(item, data[item].word);
    }, APP_CONFIG.SPEECH_DELAY_MS);
  }, [data, learnedItems, imageTimeoutId, onNewItemLearned]);

  /**
   * Get next unlearned item
   */
  const getNextItem = useCallback(() => {
    return getRandomItem(items, learnedItems);
  }, [items, learnedItems]);

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
   * Handle play sound for current item
   */
  const handlePlaySound = useCallback(() => {
    if (currentItem) {
      speechService.speak(currentItem, data[currentItem]?.word);
    }
  }, [currentItem, data]);

  /**
   * Handle next item button click
   */
  const handleNextItem = useCallback(() => {
    const nextItem = getNextItem();
    if (nextItem) {
      displayItem(nextItem);
    }
  }, [getNextItem, displayItem]);

  /**
   * Handle keyboard input
   */
  const handleKeyDown = useCallback((event) => {
    const key = normalizeKey(event.key);
    if (isValidKey(key)) {
      displayItem(key);
      event.preventDefault();
    }
  }, [displayItem, isValidKey, normalizeKey]);

  /**
   * Reset all learned items and current item state
   */
  const handleReset = useCallback(() => {
    if (imageTimeoutId) {
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }
    setLearnedItems(new Set());
    setCurrentItem('');
    setIsLoading(false);
    setShowEmojiFallback(false);
    setKeyAnimation(false);
  }, [imageTimeoutId]);

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
    currentItem,
    learnedItems,
    isLoading,
    showEmojiFallback,
    keyAnimation,

    // Computed values
    isAllLearned: isAllLearned(items, learnedItems),
    currentData: currentItem ? data[currentItem] : null,
    currentEmoji: currentItem ? getEmoji(emojiMap, currentItem) : '',

    // Actions
    displayItem,
    getNextItem,
    handleImageLoad,
    handleImageError,
    handlePlaySound,
    handleNextItem,
    handleKeyDown,
    handleReset
  };
};
