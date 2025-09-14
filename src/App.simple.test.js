import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Alphabet Learning App - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Critical Functionality Tests', () => {
    test('renders without crashing', () => {
      render(<App />);
      expect(screen.getByText('🌟 Alphabet Learning Adventure! 🌟')).toBeInTheDocument();
    });

    test('shows welcome message initially', () => {
      render(<App />);
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
      expect(screen.getByText('Press any letter key to start learning!')).toBeInTheDocument();
    });

    test('renders all alphabet buttons', () => {
      render(<App />);
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      letters.forEach(letter => {
        expect(screen.getByRole('button', { name: letter })).toBeInTheDocument();
      });
    });

    test('responds to keyboard input', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('shows emoji fallback immediately', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'B', code: 'KeyB' });
      
      await waitFor(() => {
        expect(screen.getByText('⚽')).toBeInTheDocument();
        expect(screen.getByText('Ball')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('responds to button clicks', async () => {
      render(<App />);
      
      const buttonC = screen.getByRole('button', { name: 'C' });
      fireEvent.click(buttonC);
      
      await waitFor(() => {
        expect(screen.getByText('C')).toBeInTheDocument();
        expect(screen.getByText('🐱')).toBeInTheDocument();
        expect(screen.getByText('Cat')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Edge Case Handling', () => {
    test('handles invalid key presses gracefully', () => {
      render(<App />);
      
      // Press non-letter keys
      fireEvent.keyDown(document, { key: '1', code: 'Digit1' });
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      fireEvent.keyDown(document, { key: 'Shift', code: 'ShiftLeft' });
      
      // Should still show welcome message
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
    });

    test('handles undefined/null key events', () => {
      render(<App />);
      
      // These should not crash the app
      fireEvent.keyDown(document, { key: undefined });
      fireEvent.keyDown(document, { key: null });
      fireEvent.keyDown(document, { key: '' });
      
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
    });

    test('handles rapid key presses', async () => {
      render(<App />);
      
      // Rapid fire - should handle gracefully
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      fireEvent.keyDown(document, { key: 'B', code: 'KeyB' });
      fireEvent.keyDown(document, { key: 'C', code: 'KeyC' });
      fireEvent.keyDown(document, { key: 'D', code: 'KeyD' });
      
      // Should eventually show the last letter
      await waitFor(() => {
        expect(screen.getByText('D')).toBeInTheDocument();
      }, { timeout: 2000 });
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
      fireEvent.keyDown(document, { key: 'Z', code: 'KeyZ' });
      await waitFor(() => {
        expect(screen.getByText('Z')).toBeInTheDocument();
        expect(screen.getByText('Zebra')).toBeInTheDocument();
      });
    });

    test('speech synthesis handles missing voices gracefully', async () => {
      // Override mock to return empty array
      mockGetVoices.mockReturnValueOnce([]);
      
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
      
      // Should not crash even with no voices
      const soundButton = screen.getByText('🔊 Play Sound');
      fireEvent.click(soundButton);
      
      expect(mockSpeak).toHaveBeenCalled();
    });

    test('speech synthesis handles null getVoices return', async () => {
      // Override mock to return null
      mockGetVoices.mockReturnValueOnce(null);
      
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'B', code: 'KeyB' });
      
      await waitFor(() => {
        expect(screen.getByText('Ball')).toBeInTheDocument();
      });
      
      // Should handle null voices gracefully
      const soundButton = screen.getByText('🔊 Play Sound');
      expect(() => fireEvent.click(soundButton)).not.toThrow();
    });

    test('handles component unmount without errors', () => {
      const { unmount } = render(<App />);
      
      // Trigger some interactions
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      // Should unmount without throwing
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('UI State Management', () => {
    test('progress bar starts at 0%', () => {
      render(<App />);
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 0%');
    });

    test('maintains focus and accessibility', () => {
      render(<App />);
      
      const container = document.querySelector('.container');
      expect(container).toHaveAttribute('tabIndex', '0');
      
      // All alphabet buttons should be accessible
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      letters.forEach(letter => {
        const button = screen.getByRole('button', { name: letter });
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveAttribute('aria-disabled');
      });
    });

    test('sound button works when no letter selected', () => {
      render(<App />);
      
      const soundButton = screen.getByText('🔊 Play Sound');
      fireEvent.click(soundButton);
      
      // Should not crash, but also should not call speak
      expect(mockSpeak).not.toHaveBeenCalled();
    });

    test('next letter button works', async () => {
      render(<App />);
      
      const nextButton = screen.getByText('Next Letter ➡️');
      fireEvent.click(nextButton);
      
      // Should select some letter
      await waitFor(() => {
        const letterElement = screen.queryByText(/^[A-Z]$/);
        expect(letterElement).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Emoji Display Logic', () => {
    test('shows correct emoji for each letter', async () => {
      render(<App />);
      
      const testCases = [
        { key: 'A', emoji: '🍎', word: 'Apple' },
        { key: 'B', emoji: '⚽', word: 'Ball' },
        { key: 'C', emoji: '🐱', word: 'Cat' },
        { key: 'Z', emoji: '🦓', word: 'Zebra' },
      ];

      for (const testCase of testCases) {
        fireEvent.keyDown(document, { key: testCase.key, code: `Key${testCase.key}` });
        
        await waitFor(() => {
          expect(screen.getByText(testCase.emoji)).toBeInTheDocument();
          expect(screen.getByText(testCase.word)).toBeInTheDocument();
        }, { timeout: 500 });
      }
    });

    test('emoji fallback always shows when no image URL', async () => {
      render(<App />);
      
      // Test multiple letters to ensure consistent behavior
      const letters = ['M', 'N', 'O', 'P'];
      
      for (const letter of letters) {
        fireEvent.keyDown(document, { key: letter, code: `Key${letter}` });
        
        await waitFor(() => {
          expect(screen.getByText(letter)).toBeInTheDocument();
          // Should show emoji immediately, not loading spinner
          expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        }, { timeout: 500 });
      }
    });
  });

  describe('Error Boundaries and Resilience', () => {
    test('handles malformed keyboard events', () => {
      render(<App />);
      
      // Create malformed events
      const malformedEvents = [
        { key: 'A'.repeat(100) }, // Very long key
        { key: '🍎' }, // Emoji as key
        { code: 'KeyA' }, // Missing key
        { key: 'A', code: null }, // Null code
      ];
      
      malformedEvents.forEach(eventData => {
        expect(() => {
          fireEvent.keyDown(document, eventData);
        }).not.toThrow();
      });
      
      // App should still be functional
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
    });

    test('maintains state consistency during errors', async () => {
      render(<App />);
      
      // Trigger normal interaction
      fireEvent.keyDown(document, { key: 'A', code: 'KeyA' });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
      
      // Trigger potential error condition
      fireEvent.keyDown(document, { key: null });
      
      // Should maintain previous state
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });
});
