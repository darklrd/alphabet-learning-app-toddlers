// Generic, topic-agnostic helpers for the "Find the item" quiz. These work on any item
// list (letters, numbers, or future topics), so the quiz hook can stay topic-generic.
//
// Every helper accepts an optional `randomFn` (defaulting to Math.random) so tests can inject
// a deterministic generator. This mirrors learningUtils, which uses Math.random directly.

/**
 * Pick a random index in [0, length) using the provided random function.
 * @param {number} length - Exclusive upper bound
 * @param {Function} randomFn - Returns a float in [0, 1)
 * @returns {number} - A random integer index
 */
const randomIndex = (length, randomFn) => Math.floor(randomFn() * length);

/**
 * Fisher–Yates shuffle. Returns a NEW array; the input is never mutated.
 * @param {Array} array - The array to shuffle
 * @param {Function} randomFn - Returns a float in [0, 1)
 * @returns {Array} - A shuffled copy
 */
export const shuffle = (array, randomFn = Math.random) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Build a round of targets: a shuffled copy of all items so each appears exactly once.
 * @param {Array<string>} items - All items for the topic
 * @param {Function} randomFn - Returns a float in [0, 1)
 * @returns {Array<string>} - Shuffled targets
 */
export const generateRound = (items, randomFn = Math.random) => shuffle(items, randomFn);

/**
 * Pick `count` unique distractors from items, never equal to the target.
 * @param {Array<string>} items - All items for the topic
 * @param {string} target - The correct answer to exclude
 * @param {number} count - How many distractors to pick
 * @param {Function} randomFn - Returns a float in [0, 1)
 * @returns {Array<string>} - Up to `count` unique distractors
 */
export const pickDistractors = (items, target, count, randomFn = Math.random) => {
  const pool = items.filter(item => item !== target);
  const distractors = [];

  // Cap at what the pool can actually provide so we never loop forever.
  const limit = Math.min(count, pool.length);
  while (distractors.length < limit) {
    const candidate = pool[randomIndex(pool.length, randomFn)];
    if (!distractors.includes(candidate)) {
      distractors.push(candidate);
    }
  }

  return distractors;
};

/**
 * Build the answer choices for one question: the target plus unique distractors, shuffled.
 * @param {string} target - The correct answer
 * @param {Array<string>} items - All items for the topic
 * @param {number} choiceCount - Total number of choices to show (target included)
 * @param {Function} randomFn - Returns a float in [0, 1)
 * @returns {Array<string>} - Shuffled, unique choices including the target
 */
export const buildChoices = (target, items, choiceCount, randomFn = Math.random) => {
  const distractors = pickDistractors(items, target, choiceCount - 1, randomFn);
  return shuffle([target, ...distractors], randomFn);
};
