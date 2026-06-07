// Generic, topic-agnostic learning utilities. These work on any item list / emoji map,
// so they back both the alphabet and numbers topics. alphabetUtils delegates to these.

/**
 * Get emoji representation for an item
 * @param {Object} emojiMap - Map of item -> emoji
 * @param {string} item - The item to get emoji for
 * @returns {string} - The corresponding emoji (or a default)
 */
export const getEmoji = (emojiMap, item) => {
  return emojiMap[item] || '📝';
};

/**
 * Get a random item from the unlearned items, or any item if all are learned
 * @param {Array<string>} items - All items for the topic
 * @param {Set} learnedItems - Set of learned items
 * @returns {string} - A random item
 */
export const getRandomItem = (items, learnedItems) => {
  const unlearned = items.filter(item => !learnedItems.has(item));

  if (unlearned.length > 0) {
    return unlearned[Math.floor(Math.random() * unlearned.length)];
  }

  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Calculate learning progress as percentage
 * @param {Array<string>} items - All items for the topic
 * @param {Set} learnedItems - Set of learned items
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProgress = (items, learnedItems) => {
  if (items.length === 0) {
    return 0;
  }
  return (learnedItems.size / items.length) * 100;
};

/**
 * Check if all items have been learned
 * @param {Array<string>} items - All items for the topic
 * @param {Set} learnedItems - Set of learned items
 * @returns {boolean} - True if all items are learned
 */
export const isAllLearned = (items, learnedItems) => {
  return learnedItems.size === items.length;
};
