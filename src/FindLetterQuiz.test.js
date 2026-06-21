import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { APP_CONFIG } from './constants/alphabetData';

// Mock speechSynthesis API (mirrors App.test.js so we can inspect spoken text)
const mockSpeak = jest.fn();
const mockGetVoices = jest.fn(() => [
  { name: 'female voice', lang: 'en-US' },
  { name: 'male voice', lang: 'en-US' }
]);
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: jest.fn(),
    getVoices: mockGetVoices,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }
});

global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  text: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null
}));

// ---- helpers --------------------------------------------------------------

const enterQuiz = () => {
  fireEvent.click(screen.getByRole('tab', { name: /^Quiz$/i }));
};

const backToLearn = () => {
  fireEvent.click(screen.getByRole('tab', { name: /^Learn$/i }));
};

const goToNumbers = () => {
  fireEvent.click(screen.getByRole('tab', { name: /Numbers/i }));
};

// The prompt renders the current target inside .quiz-prompt-target.
const getTarget = () => document.querySelector('.quiz-prompt-target').textContent;

const getChoiceLetters = () =>
  screen
    .getAllByRole('button', { name: /^Choose letter /i })
    .map((btn) => btn.getAttribute('aria-label').replace(/^Choose letter /i, ''));

const answer = (letter) =>
  fireEvent.click(screen.getByRole('button', { name: `Choose letter ${letter}` }));

const advancePastDelay = () => {
  act(() => {
    jest.advanceTimersByTime(APP_CONFIG.QUIZ_ADVANCE_DELAY_MS);
  });
};

// Spoken utterance texts captured so far.
const spokenTexts = () => mockSpeak.mock.calls.map((call) => call[0].text);

describe('Find the Letter Quiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Mode switching', () => {
    test('Learn mode is the default; the quiz is not shown initially', () => {
      render(<App />);

      expect(screen.getByRole('tab', { name: /^Learn$/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /^Quiz$/i })).toHaveAttribute('aria-selected', 'false');
      // Learn UI is present; quiz prompt is not.
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
      expect(document.querySelector('.quiz-prompt-target')).not.toBeInTheDocument();
    });

    test('the Learn/Quiz toggle appears on Letters but not on Numbers', () => {
      render(<App />);

      expect(screen.getByRole('tab', { name: /^Quiz$/i })).toBeInTheDocument();

      goToNumbers();
      expect(screen.queryByRole('tab', { name: /^Quiz$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /^Learn$/i })).not.toBeInTheDocument();
    });

    test('selecting Quiz marks Quiz active and shows the quiz view', () => {
      render(<App />);
      enterQuiz();

      expect(screen.getByRole('tab', { name: /^Quiz$/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('region', { name: /Find the letter quiz/i })).toBeInTheDocument();
    });
  });

  describe('Question setup', () => {
    test('shows a prompt and exactly 4 choices, including the target', () => {
      render(<App />);
      enterQuiz();

      expect(document.querySelector('.quiz-prompt-target')).toBeInTheDocument();
      const target = getTarget();

      const choices = getChoiceLetters();
      expect(choices).toHaveLength(4);
      expect(choices).toContain(target);
    });

    test('choices are the target plus 3 unique distractors', () => {
      render(<App />);
      enterQuiz();

      const target = getTarget();
      const choices = getChoiceLetters();

      expect(new Set(choices).size).toBe(4); // all unique
      const distractors = choices.filter((c) => c !== target);
      expect(distractors).toHaveLength(3);
      expect(distractors).not.toContain(target);
    });

    test('shows starting progress and score', () => {
      render(<App />);
      enterQuiz();

      expect(screen.getByText('Question 1 of 26')).toBeInTheDocument();
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
    });
  });

  describe('Answering', () => {
    test('a correct choice scores and advances after the delay', () => {
      render(<App />);
      enterQuiz();

      const target = getTarget();
      answer(target);

      // Scored immediately; feedback is positive.
      expect(screen.getByText('Score: 1')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/🎉/);
      // The chosen button is marked correct (not color-only — has a ✓).
      const correctBtn = screen.getByRole('button', { name: `Choose letter ${target}` });
      expect(correctBtn).toHaveClass('correct');
      expect(correctBtn).toHaveTextContent('✓');

      advancePastDelay();
      expect(screen.getByText('Question 2 of 26')).toBeInTheDocument();
    });

    test('an incorrect choice gives feedback, does not advance, keeps the target', () => {
      render(<App />);
      enterQuiz();

      const target = getTarget();
      const wrong = getChoiceLetters().find((c) => c !== target);
      answer(wrong);

      expect(screen.getByRole('status')).toHaveTextContent(/Try again/i);
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 26')).toBeInTheDocument();
      expect(getTarget()).toBe(target); // same target still active

      const wrongBtn = screen.getByRole('button', { name: `Choose letter ${wrong}` });
      expect(wrongBtn).toHaveClass('incorrect');
      expect(wrongBtn).toHaveTextContent('✗');

      // No auto-advance scheduled for a wrong answer.
      advancePastDelay();
      expect(screen.getByText('Question 1 of 26')).toBeInTheDocument();
    });

    test('after a wrong answer, the correct choice still completes the question', () => {
      render(<App />);
      enterQuiz();

      const target = getTarget();
      const wrong = getChoiceLetters().find((c) => c !== target);
      answer(wrong);
      answer(target);

      expect(screen.getByText('Score: 1')).toBeInTheDocument();
      advancePastDelay();
      expect(screen.getByText('Question 2 of 26')).toBeInTheDocument();
    });
  });

  describe('Keyboard input', () => {
    test('answering with the keyboard works in quiz mode', () => {
      render(<App />);
      enterQuiz();

      const target = getTarget();
      // lowercase to exercise normalizeKey
      fireEvent.keyDown(document, { key: target.toLowerCase(), code: `Key${target}` });

      expect(screen.getByText('Score: 1')).toBeInTheDocument();
      advancePastDelay();
      expect(screen.getByText('Question 2 of 26')).toBeInTheDocument();
    });

    test('non-letter keys are ignored in quiz mode', () => {
      render(<App />);
      enterQuiz();

      fireEvent.keyDown(document, { key: '5', code: 'Digit5' });
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText('Score: 0')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 26')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('');
    });

    test('a valid letter that is not one of the choices is ignored', () => {
      render(<App />);
      enterQuiz();

      const target = getTarget();
      const choices = getChoiceLetters();
      const offBoard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        .split('')
        .find((letter) => !choices.includes(letter));

      fireEvent.keyDown(document, { key: offBoard, code: `Key${offBoard}` });

      // Nothing happened: still question 1, score 0, same target, no incorrect marks.
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 26')).toBeInTheDocument();
      expect(getTarget()).toBe(target);
      expect(document.querySelector('.quiz-choice.incorrect')).not.toBeInTheDocument();
    });

    test('Learn mode keyboard still works after returning from Quiz', async () => {
      render(<App />);
      enterQuiz();
      backToLearn();

      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' });

      await waitFor(() => {
        expect(screen.getByTestId('letter-display')).toHaveTextContent('A');
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });
  });

  describe('Completion', () => {
    const completeRound = () => {
      for (let i = 0; i < 26; i++) {
        answer(getTarget());
        advancePastDelay();
      }
    };

    test('finishing all 26 targets shows the completion summary', () => {
      render(<App />);
      enterQuiz();

      completeRound();

      expect(screen.getByText(/You found them all/i)).toBeInTheDocument();
      expect(screen.getByText('26 of 26 correct')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
    });

    test('Play Again resets the quiz to a fresh round', () => {
      render(<App />);
      enterQuiz();

      completeRound();
      fireEvent.click(screen.getByRole('button', { name: /Play Again/i }));

      expect(screen.getByText('Question 1 of 26')).toBeInTheDocument();
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
      expect(document.querySelector('.quiz-prompt-target')).toBeInTheDocument();
    });
  });

  describe('Speech', () => {
    test('the prompt is spoken when a new question appears', () => {
      render(<App />);
      enterQuiz();

      expect(spokenTexts().some((text) => /^Find the letter [A-Z]$/.test(text))).toBe(true);
    });

    test('feedback is spoken for correct and incorrect answers', () => {
      render(<App />);
      enterQuiz();

      const target = getTarget();
      const wrong = getChoiceLetters().find((c) => c !== target);

      answer(wrong);
      expect(spokenTexts()).toContain('Try again');

      answer(target);
      // One of the rotating success phrases is spoken.
      expect(
        spokenTexts().some((text) => ['Great job!', 'Well done!', 'You got it!', 'Awesome!'].includes(text))
      ).toBe(true);
    });
  });

  describe('Accessibility', () => {
    test('choice buttons are semantic with accessible labels', () => {
      render(<App />);
      enterQuiz();

      getChoiceLetters().forEach((letter) => {
        const btn = screen.getByRole('button', { name: `Choose letter ${letter}` });
        expect(btn.tagName).toBe('BUTTON');
      });
    });

    test('feedback is exposed via a polite live region', () => {
      render(<App />);
      enterQuiz();

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });
});
