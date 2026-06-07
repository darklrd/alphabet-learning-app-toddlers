// Alphabet-specific utilities. These keep their original signatures (used across the
// app and tests) but delegate to the generic learningUtils bound to the alphabet topic.
import { emojiMap, ALL_LETTERS } from '../constants/alphabetData';
import {
  getEmoji,
  getRandomItem,
  calculateProgress as calculateProgressGeneric,
  isAllLearned
} from './learningUtils';

/**
 * Get emoji representation for a letter
 * @param {string} letter - The letter to get emoji for
 * @returns {string} - The corresponding emoji
 */
export const getEmojiForLetter = (letter) => {
  return getEmoji(emojiMap, letter);
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
  return getRandomItem(ALL_LETTERS, learnedLetters);
};

/**
 * Calculate learning progress as percentage
 * @param {Set} learnedLetters - Set of learned letters
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProgress = (learnedLetters) => {
  return calculateProgressGeneric(ALL_LETTERS, learnedLetters);
};

/**
 * Check if all letters have been learned
 * @param {Set} learnedLetters - Set of learned letters
 * @returns {boolean} - True if all letters are learned
 */
export const isAllLettersLearned = (learnedLetters) => {
  return isAllLearned(ALL_LETTERS, learnedLetters);
};
