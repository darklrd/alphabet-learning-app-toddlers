import { shuffle, generateRound, pickDistractors, buildChoices } from './quizUtils';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// A deterministic RNG: cycles through a fixed list of [0,1) values so tests are repeatable.
const seededRandom = (values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('quizUtils', () => {
  describe('shuffle', () => {
    test('returns a permutation containing exactly the same items', () => {
      const result = shuffle(LETTERS, seededRandom([0.1, 0.4, 0.7, 0.2, 0.9]));
      expect(result).toHaveLength(LETTERS.length);
      expect([...result].sort()).toEqual([...LETTERS].sort());
    });

    test('does not mutate the input array', () => {
      const input = ['A', 'B', 'C', 'D'];
      const copy = [...input];
      shuffle(input, seededRandom([0.9, 0.1, 0.5]));
      expect(input).toEqual(copy);
    });

    test('is deterministic for a given random sequence', () => {
      const seq = [0.3, 0.6, 0.1, 0.8, 0.2];
      const a = shuffle(LETTERS, seededRandom(seq));
      const b = shuffle(LETTERS, seededRandom(seq));
      expect(a).toEqual(b);
    });
  });

  describe('generateRound', () => {
    test('returns all 26 letters, each exactly once', () => {
      const round = generateRound(LETTERS, seededRandom([0.5, 0.2, 0.8, 0.1]));
      expect(round).toHaveLength(26);
      expect(new Set(round).size).toBe(26);
      expect([...round].sort()).toEqual([...LETTERS].sort());
    });
  });

  describe('pickDistractors', () => {
    test('returns the requested count of unique items', () => {
      const distractors = pickDistractors(LETTERS, 'A', 3, seededRandom([0.1, 0.5, 0.9, 0.3]));
      expect(distractors).toHaveLength(3);
      expect(new Set(distractors).size).toBe(3);
    });

    test('never includes the target', () => {
      const distractors = pickDistractors(LETTERS, 'M', 3, seededRandom([0.0, 0.4, 0.99, 0.6]));
      expect(distractors).not.toContain('M');
    });

    test('caps at the pool size when count exceeds available items', () => {
      const items = ['A', 'B', 'C']; // pool excluding target has 2 items
      const distractors = pickDistractors(items, 'A', 5, seededRandom([0.1, 0.9, 0.4]));
      expect(distractors).toHaveLength(2);
      expect(distractors).not.toContain('A');
    });
  });

  describe('buildChoices', () => {
    test('includes the target plus 3 unique distractors (4 total)', () => {
      const choices = buildChoices('Q', LETTERS, 4, seededRandom([0.2, 0.7, 0.1, 0.5, 0.9]));
      expect(choices).toHaveLength(4);
      expect(choices).toContain('Q');
      expect(new Set(choices).size).toBe(4);
    });

    test('all choices are valid letters from the item set', () => {
      const choices = buildChoices('B', LETTERS, 4, seededRandom([0.3, 0.8, 0.6, 0.1]));
      choices.forEach(choice => expect(LETTERS).toContain(choice));
    });
  });
});
