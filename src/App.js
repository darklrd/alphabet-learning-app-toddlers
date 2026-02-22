import React, { useEffect } from 'react';
import './App.css';

// Import components
import {
  AlphabetGrid,
  CelebrationModal,
  Confetti,
  Controls,
  ImageDisplay,
  LetterDisplay,
  ProgressBar,
  WordDisplay
} from './components';

// Import hooks
import { useAlphabetLearning } from './hooks/useAlphabetLearning';
import { useCelebration } from './hooks/useCelebration';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { useImagePreloader } from './hooks/useImagePreloader';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

function App() {
  // Initialize celebration hook first so we can pass the callback
  const celebration = useCelebration();
  
  // Initialize other hooks
  const alphabetLearning = useAlphabetLearning(celebration.celebrateNewLetter);
  useImagePreloader(); // Initialize image preloading
  useSpeechSynthesis(); // Initialize speech synthesis

  // Destructure values from hooks
  const {
    currentLetter,
    learnedLetters,
    isLoading,
    showEmojiFallback,
    keyAnimation,
    isAllLearned,
    currentData,
    displayLetter,
    handleImageLoad,
    handleImageError,
    handlePlaySound,
    handleNextLetter,
    handleKeyDown,
    handleReset
  } = alphabetLearning;

  const {
    showCelebration,
    confettiElements,
    celebrateCompletion,
    closeCelebration,
    removeConfetti,
    resetCelebration
  } = celebration;

  // Set up keyboard input handling
  useKeyboardInput(handleKeyDown);

  // Handle completion celebration
  useEffect(() => {
    if (isAllLearned && !showCelebration) {
      setTimeout(() => {
        celebrateCompletion();
      }, 1000);
    }
  }, [isAllLearned, showCelebration, celebrateCompletion]);

  return (
    <div className="container" tabIndex={0} style={{outline: 'none'}}>
      <header>
        <h1>🌟 Alphabet Learning Adventure! 🌟</h1>
        <p>Type any letter on your keyboard to see its picture!</p>
      </header>
      
      <main>
        <div className="display-area">
          <LetterDisplay 
            letter={currentLetter} 
            isAnimated={keyAnimation} 
          />
          
          <div className="image-container">
            <ImageDisplay
              imageUrl={currentData?.image}
              altText={currentData?.word}
              letter={currentLetter}
              isLoading={isLoading}
              showEmojiFallback={showEmojiFallback}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
            />
          </div>
          
          <WordDisplay word={currentData?.word} />
        </div>
        
        <Controls
          onPlaySound={handlePlaySound}
          onNextLetter={handleNextLetter}
          onReset={() => { handleReset(); resetCelebration(); }}
        />
        
        <ProgressBar learnedLetters={learnedLetters} />
        
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
        <CelebrationModal onClose={closeCelebration} />
      )}
    </div>
  );
}

export default App;
