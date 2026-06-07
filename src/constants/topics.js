// Topic configuration: a "topic" bundles everything the generic learning hook and
// components need to teach one set of items (letters or numbers). Adding a new topic
// is as simple as defining a data map, emoji map, item list, and key handling here.
import { alphabetData, emojiMap, ALL_LETTERS } from './alphabetData';
import { numbersData, numberEmojiMap, ALL_NUMBERS } from './numbersData';

export const ALPHABET_TOPIC = {
  id: 'alphabet',
  label: 'Letters',
  tabEmoji: '🔤',
  data: alphabetData,
  emojiMap,
  items: ALL_LETTERS,
  ariaPrefix: 'Letter',
  welcomeHint: 'Try pressing: A, B, C...',
  normalizeKey: (key) => key.toUpperCase(),
  isValidKey: (key) => /^[A-Z]$/.test(key.toUpperCase())
};

export const NUMBERS_TOPIC = {
  id: 'numbers',
  label: 'Numbers',
  tabEmoji: '🔢',
  data: numbersData,
  emojiMap: numberEmojiMap,
  items: ALL_NUMBERS,
  ariaPrefix: 'Number',
  welcomeHint: 'Try pressing: 1, 2, 3...',
  normalizeKey: (key) => key,
  isValidKey: (key) => ALL_NUMBERS.includes(key)
};

export const TOPICS = [ALPHABET_TOPIC, NUMBERS_TOPIC];
