import React from 'react';

/**
 * Component for displaying topic images with loading states and emoji fallback.
 * `emoji` and `welcomeHint` are supplied by the caller so this stays topic-agnostic.
 */
const ImageDisplay = ({
  imageUrl,
  altText,
  item,
  emoji,
  isLoading,
  onImageLoad,
  onImageError,
  showEmojiFallback,
  welcomeHint = 'Try pressing: A, B, C...'
}) => {
  // Show emoji fallback only if explicitly requested (after image fails or times out)
  if (showEmojiFallback && item) {
    return (
      <div className="emoji-fallback">
        <div className="emoji">{emoji}</div>
        <div className="fallback-word">{altText}</div>
      </div>
    );
  }

  // Show welcome message only when no item is selected
  if (!item) {
    return (
      <div className="welcome-message">
        <h2>Welcome! 👋</h2>
        <p>Press any key to start learning!</p>
        <div className="keyboard-hint">
          <span>{welcomeHint}</span>
        </div>
      </div>
    );
  }

  // Always try to render the image if we have a URL and item
  // Show loading spinner on top of the image container while loading
  if (imageUrl && item) {
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
  if (item) {
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
