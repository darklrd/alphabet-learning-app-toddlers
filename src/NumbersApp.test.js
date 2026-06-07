import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock speechSynthesis API (mirrors App.test.js)
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
    removeEventListener: jest.fn(),
  },
});

global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  text: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
}));

// Switch to the Numbers topic tab
const goToNumbers = () => {
  fireEvent.click(screen.getByRole('tab', { name: /Numbers/i }));
};

describe('Numbers Learning Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Tabs', () => {
    test('renders Letters and Numbers tabs, Letters active by default', () => {
      render(<App />);

      const lettersTab = screen.getByRole('tab', { name: /Letters/i });
      const numbersTab = screen.getByRole('tab', { name: /Numbers/i });

      expect(lettersTab).toBeInTheDocument();
      expect(numbersTab).toBeInTheDocument();
      expect(lettersTab).toHaveAttribute('aria-selected', 'true');
      expect(numbersTab).toHaveAttribute('aria-selected', 'false');

      // Letters grid is shown by default
      expect(screen.getByRole('button', { name: 'Letter A' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Number 1' })).not.toBeInTheDocument();
    });

    test('clicking the Numbers tab shows the 1-10 number grid', () => {
      render(<App />);
      goToNumbers();

      expect(screen.getByRole('tab', { name: /Numbers/i })).toHaveAttribute('aria-selected', 'true');

      for (let n = 1; n <= 10; n++) {
        expect(screen.getByRole('button', { name: `Number ${n}` })).toBeInTheDocument();
      }
      // Letters grid is gone
      expect(screen.queryByRole('button', { name: 'Letter A' })).not.toBeInTheDocument();
    });

    test('switching back to Letters restores the alphabet grid and welcome', () => {
      render(<App />);
      goToNumbers();
      fireEvent.click(screen.getByRole('tab', { name: /Letters/i }));

      expect(screen.getByRole('button', { name: 'Letter A' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Number 1' })).not.toBeInTheDocument();
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
    });
  });

  describe('Number selection', () => {
    test('clicking a number shows its word and counting emoji fallback', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.click(screen.getByRole('button', { name: 'Number 3' }));

      // Advance past the 5s image-load timeout so the emoji fallback renders
      act(() => { jest.advanceTimersByTime(5000); });

      await waitFor(() => {
        expect(screen.getByTestId('letter-display')).toHaveTextContent('3');
        // Counting emoji visual (3 stars) shown as the fallback
        expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument();
      });
      // "Three" appears in both the word display and the fallback caption
      expect(screen.getAllByText('Three').length).toBeGreaterThan(0);
    });

    test('responds to number keyboard input', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.keyDown(document, { key: '5', code: 'Digit5' });

      await waitFor(() => {
        expect(screen.getByTestId('letter-display')).toHaveTextContent('5');
        // Word renders immediately from the word display (before any emoji fallback)
        expect(screen.getByText('Five')).toBeInTheDocument();
      });
    });

    test('speaks the number and its word when selected', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.click(screen.getByRole('button', { name: 'Number 2' }));

      // Speech fires after SPEECH_DELAY_MS
      act(() => { jest.advanceTimersByTime(5000); });

      await waitFor(() => {
        expect(mockSpeak).toHaveBeenCalled();
      });
      // The utterance handed to speechSynthesis.speak carries "<number>. <word>"
      const calls = mockSpeak.mock.calls;
      const utterance = calls[calls.length - 1][0];
      expect(utterance.text).toBe('2. Two');
    });

    test('highlights the current number in the grid', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.click(screen.getByRole('button', { name: 'Number 7' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Number 7' })).toHaveClass('current');
      });
    });
  });

  describe('Progress', () => {
    test('shows 10% after learning one of ten numbers', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.click(screen.getByRole('button', { name: 'Number 4' }));

      await waitFor(() => {
        expect(screen.getByLabelText('10% of numbers learned')).toBeInTheDocument();
      });
    });
  });

  describe('Integration — cross-mode and full workflows', () => {
    const goToLetters = () => {
      fireEvent.click(screen.getByRole('tab', { name: /Letters/i }));
    };

    test('each mode tracks progress independently with its own denominator', async () => {
      render(<App />);

      // Learn two numbers -> 2/10 = 20%
      goToNumbers();
      fireEvent.click(screen.getByRole('button', { name: 'Number 1' }));
      fireEvent.click(screen.getByRole('button', { name: 'Number 2' }));
      await waitFor(() => {
        expect(screen.getByLabelText('20% of numbers learned')).toBeInTheDocument();
      });

      // Switch to Letters and learn one letter -> 1/26 ≈ 4%, labelled "letters"
      goToLetters();
      fireEvent.click(screen.getByRole('button', { name: 'Letter A' }));
      await waitFor(() => {
        expect(screen.getByLabelText('4% of letters learned')).toBeInTheDocument();
      });
    });

    test('switching away and back resets a mode to a fresh start (per-visit progress)', async () => {
      render(<App />);

      goToNumbers();
      fireEvent.click(screen.getByRole('button', { name: 'Number 3' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Number 3' })).toHaveClass('learned');
      });

      // Leave Numbers, then come back — the view remounts fresh
      goToLetters();
      goToNumbers();

      expect(screen.getByLabelText('0% of numbers learned')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Number 3' })).not.toHaveClass('learned');
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
    });

    test('keyboard input is scoped to the active mode', async () => {
      render(<App />);

      // On Letters (default), a digit key is ignored
      fireEvent.keyDown(document, { key: '3', code: 'Digit3' });
      expect(screen.getByTestId('letter-display')).toHaveTextContent('?');

      // On Numbers, a letter key is ignored but a digit is accepted
      goToNumbers();
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      expect(screen.getByTestId('letter-display')).toHaveTextContent('?');

      fireEvent.keyDown(document, { key: '3', code: 'Digit3' });
      await waitFor(() => {
        expect(screen.getByTestId('letter-display')).toHaveTextContent('3');
      });
    });

    test('"Next Number" button selects an unlearned number', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.click(screen.getByRole('button', { name: 'Go to next number' }));

      await waitFor(() => {
        // A real number (1–10) is now displayed instead of the placeholder
        expect(screen.getByTestId('letter-display')).toHaveTextContent(/^(10|[1-9])$/);
      });
      expect(screen.getByLabelText('10% of numbers learned')).toBeInTheDocument();
    });

    test('Reset clears numbers progress and returns to the welcome screen', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.click(screen.getByRole('button', { name: 'Number 5' }));
      await waitFor(() => {
        expect(screen.getByLabelText('10% of numbers learned')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Reset all learned numbers' }));

      await waitFor(() => {
        expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
        expect(screen.getByLabelText('0% of numbers learned')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Number 5' })).not.toHaveClass('learned');
      });
    });

    test('mixed keyboard + click interactions accumulate numbers progress', async () => {
      render(<App />);
      goToNumbers();

      fireEvent.keyDown(document, { key: '1', code: 'Digit1' });
      fireEvent.click(screen.getByRole('button', { name: 'Number 2' }));
      fireEvent.keyDown(document, { key: '8', code: 'Digit8' });

      await waitFor(() => {
        expect(screen.getByTestId('letter-display')).toHaveTextContent('8');
        // 3 distinct numbers learned -> 30%
        expect(screen.getByLabelText('30% of numbers learned')).toBeInTheDocument();
      });
    });

    test('learning all ten numbers triggers a numbers-specific celebration modal', async () => {
      render(<App />);
      goToNumbers();

      for (let n = 1; n <= 10; n++) {
        fireEvent.click(screen.getByRole('button', { name: `Number ${n}` }));
      }

      await waitFor(() => {
        expect(screen.getByLabelText('100% of numbers learned')).toBeInTheDocument();
      });

      // Completion celebration is scheduled ~1s after all are learned
      act(() => { jest.advanceTimersByTime(1500); });

      await waitFor(() => {
        expect(screen.getByText('🎉 Congratulations! 🎉')).toBeInTheDocument();
        expect(screen.getByText("You've learned all 10 numbers!")).toBeInTheDocument();
      });
    });
  });
});
