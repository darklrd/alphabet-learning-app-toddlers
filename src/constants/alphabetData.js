// Alphabet data with words and local images
// Using process.env.PUBLIC_URL to handle both local development and GitHub Pages deployment
const getImagePath = (filename) => `${process.env.PUBLIC_URL}/images/alphabet/${filename}`;

export const alphabetData = {
  'A': { word: 'Apple', image: getImagePath('A-apple.jpg') },
  'B': { word: 'Ball', image: getImagePath('B-ball.jpg') },
  'C': { word: 'Cat', image: getImagePath('C-cat.jpg') },
  'D': { word: 'Dog', image: getImagePath('D-dog.jpg') },
  'E': { word: 'Elephant', image: getImagePath('E-elephant.jpg') },
  'F': { word: 'Fish', image: getImagePath('F-fish.jpg') },
  'G': { word: 'Giraffe', image: getImagePath('G-giraffe.jpg') },
  'H': { word: 'Horse', image: getImagePath('H-horse.jpg') },
  'I': { word: 'Ice Cream', image: getImagePath('I-icecream.jpg') },
  'J': { word: 'Jellyfish', image: getImagePath('J-jellyfish.jpg') },
  'K': { word: 'Kite', image: getImagePath('K-kite.jpg') },
  'L': { word: 'Lion', image: getImagePath('L-lion.jpg') },
  'M': { word: 'Monkey', image: getImagePath('M-monkey.jpg') },
  'N': { word: 'Nest', image: getImagePath('N-nest.jpg') },
  'O': { word: 'Orange', image: getImagePath('O-orange.jpg') },
  'P': { word: 'Penguin', image: getImagePath('P-penguin.jpg') },
  'Q': { word: 'Queen', image: getImagePath('Q-queen.jpg') },
  'R': { word: 'Rabbit', image: getImagePath('R-rabbit.jpg') },
  'S': { word: 'Sun', image: getImagePath('S-sun.jpg') },
  'T': { word: 'Tiger', image: getImagePath('T-tiger.jpg') },
  'U': { word: 'Umbrella', image: getImagePath('U-umbrella.jpg') },
  'V': { word: 'Violin', image: getImagePath('V-violin.jpg') },
  'W': { word: 'Whale', image: getImagePath('W-whale.jpg') },
  'X': { word: 'Xylophone', image: getImagePath('X-xylophone.jpg') },
  'Y': { word: 'Yacht', image: getImagePath('Y-yacht.jpg') },
  'Z': { word: 'Zebra', image: getImagePath('Z-zebra.jpg') }
};

// Emoji mapping for letters
export const emojiMap = {
  'A': '🍎', 'B': '⚽', 'C': '🐱', 'D': '🐕', 'E': '🐘',
  'F': '🐠', 'G': '🦒', 'H': '🐴', 'I': '🍦', 'J': '🎐',
  'K': '🪁', 'L': '🦁', 'M': '🐵', 'N': '🪺', 'O': '🍊',
  'P': '🐧', 'Q': '👑', 'R': '🐰', 'S': '☀️', 'T': '🐅',
  'U': '☂️', 'V': '🎻', 'W': '🐋', 'X': '🎵', 'Y': '⛵', 'Z': '🦓'
};

// All letters array
export const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// App configuration constants
export const APP_CONFIG = {
  IMAGE_TIMEOUT_MS: 5000,
  ANIMATION_DURATION_MS: 600,
  SPEECH_DELAY_MS: 300,
  CELEBRATION_DELAY_MS: 500,
  CONFETTI_COUNT: 10,
  BIG_CELEBRATION_CONFETTI_COUNT: 30,
  PRELOAD_DELAY_MS: 1000,
  CELEBRATION_MODAL_DURATION_MS: 5000,
  CONFETTI_DURATION_MS: 3000
};
