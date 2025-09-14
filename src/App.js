import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Alphabet data with words and local images
const alphabetData = {
  'A': { word: 'Apple', image: '/images/alphabet/A-apple.jpg' },
  'B': { word: 'Ball', image: '/images/alphabet/B-ball.jpg' },
  'C': { word: 'Cat', image: '/images/alphabet/C-cat.jpg' },
  'D': { word: 'Dog', image: '/images/alphabet/D-dog.jpg' },
  'E': { word: 'Elephant', image: '/images/alphabet/E-elephant.jpg' },
  'F': { word: 'Fish', image: '/images/alphabet/F-fish.jpg' },
  'G': { word: 'Giraffe', image: '/images/alphabet/G-giraffe.jpg' },
  'H': { word: 'Horse', image: '/images/alphabet/H-horse.jpg' },
  'I': { word: 'Ice Cream', image: '/images/alphabet/I-icecream.jpg' },
  'J': { word: 'Jellyfish', image: '/images/alphabet/J-jellyfish.jpg' },
  'K': { word: 'Kite', image: '/images/alphabet/K-kite.jpg' },
  'L': { word: 'Lion', image: '/images/alphabet/L-lion.jpg' },
  'M': { word: 'Monkey', image: '/images/alphabet/M-monkey.jpg' },
  'N': { word: 'Nest', image: '/images/alphabet/N-nest.jpg' },
  'O': { word: 'Orange', image: '/images/alphabet/O-orange.jpg' },
  'P': { word: 'Penguin', image: '/images/alphabet/P-penguin.jpg' },
  'Q': { word: 'Queen', image: '/images/alphabet/Q-queen.jpg' },
  'R': { word: 'Rabbit', image: '/images/alphabet/R-rabbit.jpg' },
  'S': { word: 'Sun', image: '/images/alphabet/S-sun.jpg' },
  'T': { word: 'Tiger', image: '/images/alphabet/T-tiger.jpg' },
  'U': { word: 'Umbrella', image: '/images/alphabet/U-umbrella.jpg' },
  'V': { word: 'Violin', image: '/images/alphabet/V-violin.jpg' },
  'W': { word: 'Whale', image: '/images/alphabet/W-whale.jpg' },
  'X': { word: 'Xylophone', image: '/images/alphabet/X-xylophone.jpg' },
  'Y': { word: 'Yacht', image: '/images/alphabet/Y-yacht.jpg' },
  'Z': { word: 'Zebra', image: '/images/alphabet/Z-zebra.jpg' }
};

// Get emoji representation for letters
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

// Confetti component
const Confetti = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="confetti" style={{
      position: 'fixed',
      width: '10px',
      height: '10px',
      background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)],
      left: `${Math.random() * 100}vw`,
      top: '-10px',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 1000,
      animation: 'fall 3s linear forwards'
    }} />
  );
};

// Celebration Modal component
const CelebrationModal = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="celebration-modal">
      <div className="celebration-content">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You've learned all 26 letters!</p>
        <button onClick={onClose}>Keep Learning! 🌟</button>
      </div>
    </div>
  );
};

// Image Display component
const ImageDisplay = ({ imageUrl, altText, letter, isLoading, onImageLoad, onImageError, showEmojiFallback }) => {
  
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
          <div className="loading-spinner-container" style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(249, 249, 249, 0.8)',
            zIndex: 1 
          }}>
            <div className="loading-spinner" />
          </div>
        )}
        <img 
          src={imageUrl} 
          alt={altText} 
          className="alphabet-image"
          style={{ opacity: isLoading ? 0.3 : 1 }}
          onLoad={() => {
            console.log('🖼️ IMG onLoad fired for:', imageUrl);
            onImageLoad();
          }}
          onError={(e) => {
            console.log('🚫 IMG onError fired for:', imageUrl, 'Error:', e.type);
            onImageError(e);
          }}
        />
      </div>
    );
  }

  // Fallback - should not reach here, but show emoji just in case
  if (letter) {
    console.log('🔄 Final fallback - showing emoji');
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

// Alphabet Grid component
const AlphabetGrid = ({ learnedLetters, currentLetter, onLetterClick }) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="alphabet-grid">
      {letters.map(letter => (
        <button
          key={letter}
          className={`alphabet-btn ${learnedLetters.has(letter) ? 'learned' : ''} ${currentLetter === letter ? 'current' : ''}`}
          onClick={() => onLetterClick(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

function App() {
  const [currentLetter, setCurrentLetter] = useState('');
  const [learnedLetters, setLearnedLetters] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiElements, setConfettiElements] = useState([]);
  const [keyAnimation, setKeyAnimation] = useState(false);
  const [showEmojiFallback, setShowEmojiFallback] = useState(false);
  const [imageTimeoutId, setImageTimeoutId] = useState(null);

  // Speak letter using Web Speech API
  const speakLetter = useCallback((letter) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance();
      const data = alphabetData[letter];
      utterance.text = `${letter}. ${data.word}`;
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      
      const voices = speechSynthesis.getVoices() || [];
      const childVoice = voices.find(voice => 
        voice.name && (
          voice.name.includes('child') || 
          voice.name.includes('kid') ||
          voice.name.includes('female')
        )
      );
      
      if (childVoice) {
        utterance.voice = childVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Create celebration effect
  const createCelebrationEffect = useCallback(() => {
    const newConfetti = [];
    for (let i = 0; i < 10; i++) {
      const id = Date.now() + i;
      newConfetti.push({ id, delay: i * 100 });
    }
    
    newConfetti.forEach(({ id, delay }) => {
      setTimeout(() => {
        setConfettiElements(prev => [...prev, id]);
      }, delay);
    });
  }, []);

  // Remove confetti element
  const removeConfetti = useCallback((id) => {
    setConfettiElements(prev => prev.filter(confettiId => confettiId !== id));
  }, []);

  // Display letter and its associated image
  const displayLetter = useCallback((letter) => {
    console.log('displayLetter called with:', letter, 'isLoading:', isLoading); // Debug log
    if (!alphabetData[letter]) {
      console.log('Returning early - no data for letter:', letter); // Debug log
      return;
    }
    
    console.log('Setting letter:', letter); // Debug log
    
    // Clear any existing timeout
    if (imageTimeoutId) {
      console.log('Clearing existing timeout ID:', imageTimeoutId);
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }
    
    setCurrentLetter(letter);
    setKeyAnimation(true);
    
    // Reset animation
    setTimeout(() => setKeyAnimation(false), 600);
    
    // We now have local images, so always try to load them first
    const data = alphabetData[letter];
    console.log('Loading local image:', data.image);
    setIsLoading(true);
    setShowEmojiFallback(false);
    
    // Set timeout for image loading (fallback to emoji after 5 seconds)
    const timeoutId = setTimeout(() => {
      console.log('⏰ Image loading timeout, showing emoji fallback');
      setIsLoading(false);
      setShowEmojiFallback(true);
    }, 5000);
    
    setImageTimeoutId(timeoutId);
    
    // Mark letter as learned
    if (!learnedLetters.has(letter)) {
      setLearnedLetters(prev => new Set([...prev, letter]));
      
      // Celebration effect for new letter
      setTimeout(() => {
        createCelebrationEffect();
      }, 500);
    }
    
    // Speak the letter and word
    setTimeout(() => {
      speakLetter(letter);
    }, 300);
  }, [learnedLetters, speakLetter, createCelebrationEffect, imageTimeoutId]);

  // Get next unlearned letter
  const getNextLetter = useCallback(() => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const unlearned = allLetters.filter(letter => !learnedLetters.has(letter));
    
    if (unlearned.length > 0) {
      return unlearned[Math.floor(Math.random() * unlearned.length)];
    }
    
    return allLetters[Math.floor(Math.random() * allLetters.length)];
  }, [learnedLetters]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    console.log('✅ Image loaded successfully! Clearing timeout and hiding loading spinner');
    if (imageTimeoutId) {
      console.log('Clearing timeout ID:', imageTimeoutId);
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }
    setIsLoading(false);
    setShowEmojiFallback(false); // Ensure we show the image, not emoji
  }, [imageTimeoutId]);

  // Handle image error
  const handleImageError = useCallback((error) => {
    console.log('❌ Image failed to load:', error, 'showing emoji fallback');
    if (imageTimeoutId) {
      console.log('Clearing timeout ID after error:', imageTimeoutId);
      clearTimeout(imageTimeoutId);
      setImageTimeoutId(null);
    }
    setIsLoading(false);
    setShowEmojiFallback(true);
  }, [imageTimeoutId]);

  // Handle play sound
  const handlePlaySound = useCallback(() => {
    if (currentLetter) {
      speakLetter(currentLetter);
    }
  }, [currentLetter, speakLetter]);

  // Handle next letter
  const handleNextLetter = useCallback(() => {
    const nextLetter = getNextLetter();
    if (nextLetter) {
      displayLetter(nextLetter);
    }
  }, [getNextLetter, displayLetter]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      console.log('Key pressed:', key); // Debug log
      if (key >= 'A' && key <= 'Z') {
        console.log('Valid letter, displaying:', key); // Debug log
        displayLetter(key);
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [displayLetter]);

  // Check for completion
  useEffect(() => {
    if (learnedLetters.size === 26 && !showCelebration) {
      setTimeout(() => {
        setShowCelebration(true);
        // Big celebration effect
        for (let i = 0; i < 30; i++) {
          setTimeout(() => createCelebrationEffect(), i * 100);
        }
      }, 1000);
    }
  }, [learnedLetters.size, showCelebration, createCelebrationEffect]);

  // Load voices for speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        speechSynthesis.getVoices();
      };
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }
  }, []);

  // Focus container on mount for keyboard events
  useEffect(() => {
    const container = document.querySelector('.container');
    if (container) {
      container.focus();
    }
  }, []);

  // Preload all alphabet images for faster loading
  useEffect(() => {
    const preloadImages = () => {
      Object.values(alphabetData).forEach(({ image }) => {
        if (image) {
          const img = new Image();
          img.src = image;
        }
      });
    };

    // Start preloading after a short delay to not interfere with initial render
    const timer = setTimeout(preloadImages, 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentData = currentLetter ? alphabetData[currentLetter] : null;
  const progress = (learnedLetters.size / 26) * 100;

  return (
    <div className="container" tabIndex={0} style={{outline: 'none'}}>
      <header>
        <h1>🌟 Alphabet Learning Adventure! 🌟</h1>
        <p>Type any letter on your keyboard to see its picture!</p>
      </header>
      
      <main>
        <div className="display-area">
          <div className="letter-display">
            <span className={`big-letter ${keyAnimation ? 'bounce' : ''}`}>
              {currentLetter || '?'}
            </span>
          </div>
          
          <div className="image-container">
            {currentData ? (
              <ImageDisplay
                imageUrl={currentData.image}
                altText={currentData.word}
                letter={currentLetter}
                isLoading={isLoading}
                showEmojiFallback={showEmojiFallback}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
              />
            ) : (
              <ImageDisplay />
            )}
          </div>
          
          <div className="word-display">
            <span className="word-text">
              {currentData ? currentData.word : ''}
            </span>
          </div>
        </div>
        
        <div className="controls">
          <button onClick={handlePlaySound} className="sound-btn">
            🔊 Play Sound
          </button>
          <button onClick={handleNextLetter} className="next-btn">
            Next Letter ➡️
          </button>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <AlphabetGrid 
          learnedLetters={learnedLetters}
          currentLetter={currentLetter}
          onLetterClick={displayLetter}
        />
      </main>
      
      <footer>
        <p>Keep typing to learn all 26 letters! 🎉</p>
      </footer>

      {/* Confetti elements */}
      {confettiElements.map(id => (
        <Confetti key={id} onComplete={() => removeConfetti(id)} />
      ))}

      {/* Celebration modal */}
      {showCelebration && (
        <CelebrationModal onClose={() => setShowCelebration(false)} />
      )}
    </div>
  );
}

export default App;
