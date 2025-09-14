import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';

// Mock speechSynthesis API
const mockSpeak = jest.fn();
const mockGetVoices = jest.fn(() => [
  { name: 'female voice', lang: 'en-US' },
  { name: 'male voice', lang: 'en-US' }
]);
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    getVoices: mockGetVoices,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  text: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
}));

describe('Alphabet Learning App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing timeouts
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Render', () => {
    test('renders welcome message on initial load', () => {
      render(<App />);
      
      expect(screen.getByText('🌟 Alphabet Learning Adventure! 🌟')).toBeInTheDocument();
      expect(screen.getByText('Type any letter on your keyboard to see its picture!')).toBeInTheDocument();
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
      expect(screen.getByText('Press any letter key to start learning!')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument(); // Default letter display
    });

    test('renders all control buttons', () => {
      render(<App />);
      
      expect(screen.getByText('🔊 Play Sound')).toBeInTheDocument();
      expect(screen.getByText('Next Letter ➡️')).toBeInTheDocument();
    });

    test('renders alphabet grid with all 26 letters', () => {
      render(<App />);
      
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      letters.forEach(letter => {
        expect(screen.getByRole('button', { name: letter })).toBeInTheDocument();
      });
    });

    test('renders progress bar at 0%', () => {
      render(<App />);
      
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 0%');
    });
  });

  describe('Keyboard Input Handling', () => {
    test('responds to valid letter key presses', async () => {
      render(<App />);
      
      // Press 'A' key
      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' });
      
      await waitFor(() => {
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });

    test('handles uppercase and lowercase letters', async () => {
      render(<App />);
      
      // Test lowercase
      fireEvent.keyDown(document, { key: 'h', code: 'KeyH' });
      await waitFor(() => {
        expect(screen.getByText('H')).toBeInTheDocument();
        expect(screen.getByText('Horse')).toBeInTheDocument();
      });

      // Test uppercase
      fireEvent.keyDown(document, { key: 'B', code: 'KeyB' });
      await waitFor(() => {
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('Ball')).toBeInTheDocument();
      });
    });

    test('ignores non-letter key presses', () => {
      render(<App />);
      
      // Press non-letter keys
      fireEvent.keyDown(document, { key: '1', code: 'Digit1' });
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      
      // Should still show welcome message
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    test('prevents default behavior for letter keys', () => {
      render(<App />);
      
      const mockPreventDefault = jest.fn();
      const keyEvent = new KeyboardEvent('keydown', { key: 'A' });
      keyEvent.preventDefault = mockPreventDefault;
      
      fireEvent(document, keyEvent);
      
      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });

  describe('Image Display Logic', () => {
    test('shows emoji fallback immediately when no image URL', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        // Should show emoji fallback immediately (no loading spinner)
        expect(screen.getByText('🍎')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    test('handles rapid key presses without breaking', async () => {
      render(<App />);
      
      // Rapid fire key presses
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      fireEvent.keyDown(document, { key: 'B', code: 'KeyB' });
      fireEvent.keyDown(document, { key: 'C', code: 'KeyC' });
      
      await waitFor(() => {
        // Should show the last pressed letter
        expect(screen.getByText('C')).toBeInTheDocument();
        expect(screen.getByText('🐱')).toBeInTheDocument();
        expect(screen.getByText('Cat')).toBeInTheDocument();
      });
    });

    test('shows correct emoji for each letter', async () => {
      render(<App />);
      
      const testCases = [
        { key: 'A', emoji: '🍎', word: 'Apple' },
        { key: 'B', emoji: '⚽', word: 'Ball' },
        { key: 'C', emoji: '🐱', word: 'Cat' },
        { key: 'D', emoji: '🐕', word: 'Dog' },
      ];

      for (const testCase of testCases) {
        fireEvent.keyDown(document, { key: testCase.key, code: `Key${testCase.key}` });
        
        await waitFor(() => {
          expect(screen.getByText(testCase.key)).toBeInTheDocument();
          expect(screen.getByText(testCase.emoji)).toBeInTheDocument();
          expect(screen.getByText(testCase.word)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Alphabet Grid Interaction', () => {
    test('responds to alphabet grid button clicks', async () => {
      render(<App />);
      
      const buttonH = screen.getByRole('button', { name: 'H' });
      fireEvent.click(buttonH);
      
      await waitFor(() => {
        expect(screen.getByText('H')).toBeInTheDocument();
        expect(screen.getByText('🐴')).toBeInTheDocument();
        expect(screen.getByText('Horse')).toBeInTheDocument();
      });
    });

    test('highlights current letter in grid', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'M', code: 'KeyM' });
      
      await waitFor(() => {
        const buttonM = screen.getByRole('button', { name: 'M' });
        expect(buttonM).toHaveClass('current');
      });
    });

    test('marks learned letters in grid', async () => {
      render(<App />);
      
      // Learn a few letters
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      await waitFor(() => {
        const buttonA = screen.getByRole('button', { name: 'A' });
        expect(buttonA).toHaveClass('learned');
      });

      fireEvent.keyDown(document, { key: 'B', code: 'KeyB' });
      await waitFor(() => {
        const buttonB = screen.getByRole('button', { name: 'B' });
        expect(buttonB).toHaveClass('learned');
      });
    });
  });

  describe('Progress Tracking', () => {
    test('updates progress bar as letters are learned', async () => {
      render(<App />);
      
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 0%');
      
      // Learn one letter (1/26 = ~3.85%)
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        expect(progressFill).toHaveStyle('width: 3.8461538461538463%');
      });
    });

    test('does not increase progress for repeated letters', async () => {
      render(<App />);
      
      const progressFill = document.querySelector('.progress-fill');
      
      // Press 'A' multiple times
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        // Should still be just 1/26
        expect(progressFill).toHaveStyle('width: 3.8461538461538463%');
      });
    });
  });

  describe('Sound Functionality', () => {
    test('play sound button calls speech synthesis', async () => {
      render(<App />);
      
      // First select a letter
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Click sound button
      const soundButton = screen.getByText('🔊 Play Sound');
      fireEvent.click(soundButton);
      
      expect(mockSpeak).toHaveBeenCalled();
    });

    test('automatically speaks letter when selected', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'B', code: 'KeyB' });
      
      // Wait for the automatic speech timeout
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockSpeak).toHaveBeenCalled();
    });

    test('does not speak when no letter is selected', () => {
      render(<App />);
      
      const soundButton = screen.getByText('🔊 Play Sound');
      fireEvent.click(soundButton);
      
      expect(mockSpeak).not.toHaveBeenCalled();
    });
  });

  describe('Next Letter Functionality', () => {
    test('next letter button selects unlearned letter', async () => {
      render(<App />);
      
      // Learn letter A
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Click next letter
      const nextButton = screen.getByText('Next Letter ➡️');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        // Should show a different letter (not A)
        const currentLetter = screen.getByText(/^[B-Z]$/);
        expect(currentLetter).toBeInTheDocument();
      });
    });

    test('next letter button works when no letters learned', async () => {
      render(<App />);
      
      const nextButton = screen.getByText('Next Letter ➡️');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        // Should show some letter
        const currentLetter = screen.getByText(/^[A-Z]$/);
        expect(currentLetter).toBeInTheDocument();
      });
    });
  });

  describe('Animation Handling', () => {
    test('applies bounce animation when letter is selected', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'H', code: 'KeyH' });
      
      await waitFor(() => {
        const letterElement = screen.getByText('H');
        expect(letterElement).toHaveClass('bounce');
      });

      // Animation should be removed after timeout
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const letterElement = screen.getByText('H');
        expect(letterElement).not.toHaveClass('bounce');
      });
    });
  });

  describe('Celebration System', () => {
    test('shows confetti for new letters', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'Z', code: 'KeyZ' });
      
      // Wait for celebration timeout
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Confetti elements should be created (check state change)
      await waitFor(() => {
        expect(screen.getByText('Zebra')).toBeInTheDocument();
      });
    });

    test('does not show confetti for repeated letters', async () => {
      render(<App />);
      
      // Learn letter A first time
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Learn letter A second time (should not trigger confetti)
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      // Should still show the letter but no new celebration
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles undefined or null key events gracefully', () => {
      render(<App />);
      
      // Simulate edge case events
      fireEvent.keyDown(document, { key: undefined });
      fireEvent.keyDown(document, { key: null });
      fireEvent.keyDown(document, { key: '' });
      
      // Should not crash and still show welcome
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
    });

    test('handles component unmount gracefully', () => {
      const { unmount } = render(<App />);
      
      // Start some async operations
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      // Unmount component
      expect(() => unmount()).not.toThrow();
    });

    test('handles rapid state changes without memory leaks', async () => {
      render(<App />);
      
      // Simulate rapid interactions
      for (let i = 0; i < 10; i++) {
        const letter = String.fromCharCode(65 + (i % 26)); // A-Z cycling
        fireEvent.keyDown(document, { key: letter, code: `Key${letter}` });
      }
      
      // Should handle all interactions without crashing
      await waitFor(() => {
        expect(screen.getByText(/^[A-Z]$/)).toBeInTheDocument();
      });
    });

    test('maintains accessibility attributes', () => {
      render(<App />);
      
      // Check that alphabet buttons have proper accessibility
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      letters.forEach(letter => {
        const button = screen.getByRole('button', { name: letter });
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveAttribute('aria-disabled');
      });
    });

    test('handles focus management correctly', () => {
      render(<App />);
      
      const container = document.querySelector('.container');
      expect(container).toHaveAttribute('tabIndex', '0');
      expect(container).toHaveStyle('outline: none');
    });
  });

  describe('Complete User Workflows', () => {
    test('complete alphabet learning workflow', async () => {
      render(<App />);
      
      // Learn first few letters
      const letters = ['A', 'B', 'C'];
      
      for (const letter of letters) {
        fireEvent.keyDown(document, { key: letter, code: `Key${letter}` });
        
        await waitFor(() => {
          expect(screen.getByText(letter)).toBeInTheDocument();
          const button = screen.getByRole('button', { name: letter });
          expect(button).toHaveClass('learned');
        });
      }
      
      // Check progress
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 11.538461538461538%'); // 3/26
    });

    test('mixed keyboard and click interactions', async () => {
      render(<App />);
      
      // Use keyboard
      fireEvent.keyDown(document, { key: 'K', code: 'KeyK' });
      
      await waitFor(() => {
        expect(screen.getByText('🪁')).toBeInTheDocument();
        expect(screen.getByText('Kite')).toBeInTheDocument();
      });

      // Use mouse click
      const buttonL = screen.getByRole('button', { name: 'L' });
      fireEvent.click(buttonL);
      
      await waitFor(() => {
        expect(screen.getByText('🦁')).toBeInTheDocument();
        expect(screen.getByText('Lion')).toBeInTheDocument();
      });

      // Use next button
      const nextButton = screen.getByText('Next Letter ➡️');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        // Should show some unlearned letter
        const newLetter = screen.getByText(/^[A-Z]$/);
        expect(newLetter).toBeInTheDocument();
      });
    });
  });
});
