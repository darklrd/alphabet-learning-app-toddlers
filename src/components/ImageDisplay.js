import React from 'react';
import { getEmojiForLetter } from '../utils/alphabetUtils';

/**
 * Component for displaying alphabet images with loading states and fallbacks
 */
const ImageDisplay = ({ 
  imageUrl, 
  altText, 
  letter, 
  isLoading, 
  onImageLoad, 
  onImageError, 
  showEmojiFallback 
}) => {
  // Show emoji fallback only if explicitly requested (after image fails or times out)
  if (showEmojiFallback && letter) {
    const emoji = getEmojiForLetter(letter);
    return (
      <div className="emoji-fallback">
        <div className="emoji">{emoji}</div>
        <div className="fallback-word">{altText}</div>
      </div>
    );
  }

  // Show welcome message only when no letter is selected
  if (!letter) {
    return (
      <div className="welcome-message">
        <h2>Welcome! 👋</h2>
        <p>Press any letter key to start learning!</p>
        <div className="keyboard-hint">
          <span>Try pressing: A, B, C...</span>
        </div>
      </div>
    );
  }

  // Always try to render the image if we have a URL and letter
  // Show loading spinner on top of the image container while loading
  if (imageUrl && letter) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {isLoading && (
          <div 
            className="loading-spinner-container" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              backgroundColor: 'rgba(249, 249, 249, 0.8)',
              zIndex: 1 
            }}
          >
            <div className="loading-spinner" />
          </div>
        )}
        <img 
          src={imageUrl} 
          alt={altText} 
          className="alphabet-image"
          style={{ opacity: isLoading ? 0.3 : 1 }}
          onLoad={onImageLoad}
          onError={onImageError}
        />
      </div>
    );
  }

  // Fallback - should not reach here, but show emoji just in case
  if (letter) {
    const emoji = getEmojiForLetter(letter);
    return (
      <div className="emoji-fallback">
        <div className="emoji">{emoji}</div>
        <div className="fallback-word">{altText}</div>
      </div>
    );
  }

  return null;
};

export default ImageDisplay;
