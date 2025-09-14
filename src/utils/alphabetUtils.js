import { emojiMap, ALL_LETTERS } from '../constants/alphabetData';

/**
 * Get emoji representation for a letter
 * @param {string} letter - The letter to get emoji for
 * @returns {string} - The corresponding emoji
 */
export const getEmojiForLetter = (letter) => {
  return emojiMap[letter] || '📝';
};

/**
 * Check if a key is a valid alphabet letter
 * @param {string} key - The key to validate
 * @returns {boolean} - True if valid letter
 */
export const isValidLetter = (key) => {
  const upperKey = key.toUpperCase();
  return upperKey >= 'A' && upperKey <= 'Z';
};

/**
 * Get a random letter from unlearned letters, or any letter if all are learned
 * @param {Set} learnedLetters - Set of learned letters
 * @returns {string} - A random letter
 */
export const getRandomLetter = (learnedLetters) => {
  const unlearned = ALL_LETTERS.filter(letter => !learnedLetters.has(letter));
  
  if (unlearned.length > 0) {
    return unlearned[Math.floor(Math.random() * unlearned.length)];
  }
  
  return ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
};

/**
 * Calculate learning progress as percentage
 * @param {Set} learnedLetters - Set of learned letters
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProgress = (learnedLetters) => {
  return (learnedLetters.size / ALL_LETTERS.length) * 100;
};

/**
 * Check if all letters have been learned
 * @param {Set} learnedLetters - Set of learned letters
 * @returns {boolean} - True if all letters are learned
 */
export const isAllLettersLearned = (learnedLetters) => {
  return learnedLetters.size === ALL_LETTERS.length;
};
