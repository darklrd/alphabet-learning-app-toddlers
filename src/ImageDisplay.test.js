import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Extract ImageDisplay component for isolated testing
const getEmojiForLetter = (letter) => {
  const emojiMap = {
    'A': '🍎', 'B': '⚽', 'C': '🐱', 'D': '🐕', 'E': '🐘',
    'F': '🐠', 'G': '🦒', 'H': '🐴', 'I': '🍦', 'J': '🎐',
    'K': '🪁', 'L': '🦁', 'M': '🐵', 'N': '🪺', 'O': '🍊',
    'P': '🐧', 'Q': '👑', 'R': '🐰', 'S': '☀️', 'T': '🐅',
    'U': '☂️', 'V': '🎻', 'W': '🐋', 'X': '🎵', 'Y': '⛵', 'Z': '🦓'
  };
  return emojiMap[letter] || '📝';
};

const ImageDisplay = ({ imageUrl, altText, letter, isLoading, onImageLoad, onImageError, showEmojiFallback }) => {
  if (isLoading) {
    return (
      <div className="loading-spinner-container" data-testid="loading-spinner">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Show emoji fallback if requested OR if no imageUrl and we have a letter
  if ((showEmojiFallback || !imageUrl) && letter) {
    const emoji = getEmojiForLetter(letter);
    return (
      <div className="emoji-fallback" data-testid="emoji-fallback">
        <div className="emoji">{emoji}</div>
        <div className="fallback-word">{altText}</div>
      </div>
    );
  }

  // Show welcome message only when no letter is selected
  if (!letter) {
    return (
      <div className="welcome-message" data-testid="welcome-message">
        <h2>Welcome! 👋</h2>
        <p>Press any letter key to start learning!</p>
        <div className="keyboard-hint">
          <span>Try pressing: A, B, C...</span>
        </div>
      </div>
    );
  }

  // Try to load image if we have a URL
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={altText} 
        className="alphabet-image"
        data-testid="alphabet-image"
        onLoad={() => {
          console.log('Image loaded successfully:', imageUrl);
          onImageLoad();
        }}
        onError={(e) => {
          console.log('Image failed to load:', imageUrl, e);
          onImageError();
        }}
      />
    );
  }

  // Fallback - should not reach here, but show emoji just in case
  if (letter) {
    const emoji = getEmojiForLetter(letter);
    return (
      <div className="emoji-fallback" data-testid="emoji-fallback-final">
        <div className="emoji">{emoji}</div>
        <div className="fallback-word">{altText}</div>
      </div>
    );
  }

  return null;
};

describe('ImageDisplay Component', () => {
  const mockOnImageLoad = jest.fn();
  const mockOnImageError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    test('shows loading spinner when isLoading is true', () => {
      render(
        <ImageDisplay 
          isLoading={true}
          letter="A"
          altText="Apple"
          imageUrl="test-url"
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('emoji-fallback')).not.toBeInTheDocument();
      expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
    });

    test('does not show loading spinner when isLoading is false', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl={null}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Welcome Message', () => {
    test('shows welcome message when no letter is selected', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter=""
          altText=""
          imageUrl={null}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
      expect(screen.getByText('Welcome! 👋')).toBeInTheDocument();
      expect(screen.getByText('Press any letter key to start learning!')).toBeInTheDocument();
    });

    test('does not show welcome message when letter is selected', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl={null}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
    });
  });

  describe('Emoji Fallback', () => {
    test('shows emoji fallback when showEmojiFallback is true', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl="test-url"
          showEmojiFallback={true}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('emoji-fallback')).toBeInTheDocument();
      expect(screen.getByText('🍎')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    test('shows emoji fallback when no imageUrl and letter exists', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="B"
          altText="Ball"
          imageUrl={null}
          showEmojiFallback={false}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('emoji-fallback')).toBeInTheDocument();
      expect(screen.getByText('⚽')).toBeInTheDocument();
      expect(screen.getByText('Ball')).toBeInTheDocument();
    });

    test('shows correct emoji for each letter', () => {
      const testCases = [
        { letter: 'C', emoji: '🐱', word: 'Cat' },
        { letter: 'D', emoji: '🐕', word: 'Dog' },
        { letter: 'E', emoji: '🐘', word: 'Elephant' },
        { letter: 'Z', emoji: '🦓', word: 'Zebra' },
      ];

      testCases.forEach(({ letter, emoji, word }) => {
        const { rerender } = render(
          <ImageDisplay 
            isLoading={false}
            letter={letter}
            altText={word}
            imageUrl={null}
            onImageLoad={mockOnImageLoad}
            onImageError={mockOnImageError}
          />
        );

        expect(screen.getByText(emoji)).toBeInTheDocument();
        expect(screen.getByText(word)).toBeInTheDocument();
      });
    });
  });

  describe('Image Loading', () => {
    test('renders image when imageUrl is provided and not showing fallback', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl="https://example.com/apple.jpg"
          showEmojiFallback={false}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      const image = screen.getByTestId('alphabet-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/apple.jpg');
      expect(image).toHaveAttribute('alt', 'Apple');
    });

    test('calls onImageLoad when image loads successfully', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl="https://example.com/apple.jpg"
          showEmojiFallback={false}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      const image = screen.getByTestId('alphabet-image');
      fireEvent.load(image);

      expect(mockOnImageLoad).toHaveBeenCalledTimes(1);
    });

    test('calls onImageError when image fails to load', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl="https://example.com/broken-image.jpg"
          showEmojiFallback={false}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      const image = screen.getByTestId('alphabet-image');
      fireEvent.error(image);

      expect(mockOnImageError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Priority Logic', () => {
    test('loading state takes priority over everything', () => {
      render(
        <ImageDisplay 
          isLoading={true}
          letter="A"
          altText="Apple"
          imageUrl="https://example.com/apple.jpg"
          showEmojiFallback={true}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('emoji-fallback')).not.toBeInTheDocument();
      expect(screen.queryByTestId('alphabet-image')).not.toBeInTheDocument();
    });

    test('emoji fallback takes priority over image when requested', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl="https://example.com/apple.jpg"
          showEmojiFallback={true}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('emoji-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('alphabet-image')).not.toBeInTheDocument();
    });

    test('shows image when imageUrl exists and no fallback requested', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="A"
          altText="Apple"
          imageUrl="https://example.com/apple.jpg"
          showEmojiFallback={false}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('alphabet-image')).toBeInTheDocument();
      expect(screen.queryByTestId('emoji-fallback')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty letter gracefully', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter=""
          altText=""
          imageUrl={null}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
    });

    test('handles null/undefined props gracefully', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter={null}
          altText={null}
          imageUrl={null}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
    });

    test('handles unknown letter with default emoji', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="@"
          altText="Special Character"
          imageUrl={null}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      expect(screen.getByTestId('emoji-fallback')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument(); // Default emoji
    });

    test('final fallback shows emoji when all else fails', () => {
      render(
        <ImageDisplay 
          isLoading={false}
          letter="X"
          altText="Xylophone"
          imageUrl=""
          showEmojiFallback={false}
          onImageLoad={mockOnImageLoad}
          onImageError={mockOnImageError}
        />
      );

      // Should still show emoji fallback because imageUrl is empty string (falsy)
      expect(screen.getByTestId('emoji-fallback')).toBeInTheDocument();
      expect(screen.getByText('🎵')).toBeInTheDocument();
    });
  });
});
