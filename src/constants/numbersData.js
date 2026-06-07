// Numbers data with words and local images
// Mirrors the structure of alphabetData so the generic learning hook/components
// can drive both topics. Using process.env.PUBLIC_URL to handle both local
// development and GitHub Pages deployment.
import { APP_CONFIG } from './alphabetData';

const getImagePath = (filename) => `${process.env.PUBLIC_URL}/images/numbers/${filename}`;

export const numbersData = {
  '1': { word: 'One', image: getImagePath('1-one.jpg') },
  '2': { word: 'Two', image: getImagePath('2-two.jpg') },
  '3': { word: 'Three', image: getImagePath('3-three.jpg') },
  '4': { word: 'Four', image: getImagePath('4-four.jpg') },
  '5': { word: 'Five', image: getImagePath('5-five.jpg') },
  '6': { word: 'Six', image: getImagePath('6-six.jpg') },
  '7': { word: 'Seven', image: getImagePath('7-seven.jpg') },
  '8': { word: 'Eight', image: getImagePath('8-eight.jpg') },
  '9': { word: 'Nine', image: getImagePath('9-nine.jpg') },
  '10': { word: 'Ten', image: getImagePath('10-ten.jpg') }
};

// All numbers array (string keys so they match keyboard input and grid buttons)
export const ALL_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// Emoji fallback for numbers: a counting visual made of N repeated emoji.
// ImageDisplay renders this string directly, so "3" shows three stars, teaching
// quantity even before real photos are supplied.
const COUNT_EMOJI = '⭐';
export const numberEmojiMap = ALL_NUMBERS.reduce((map, number) => {
  map[number] = COUNT_EMOJI.repeat(Number(number));
  return map;
}, {});

// Re-export shared timing/count constants for convenience.
export { APP_CONFIG };
