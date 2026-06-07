import { alphabetData } from '../constants/alphabetData';

/**
 * Speech synthesis service for text-to-speech functionality
 */
export class SpeechService {
  constructor() {
    this.isAvailable = 'speechSynthesis' in window;
    this.voices = [];
    this.loadVoices();
  }

  /**
   * Load available voices
   */
  loadVoices() {
    if (this.isAvailable) {
      this.voices = speechSynthesis.getVoices() || [];
    }
  }

  /**
   * Find the best voice for child-friendly speech
   * @returns {SpeechSynthesisVoice|null} - The selected voice or null
   */
  getChildFriendlyVoice() {
    return this.voices.find(voice => 
      voice.name && (
        voice.name.includes('child') || 
        voice.name.includes('kid') ||
        voice.name.includes('female')
      )
    ) || null;
  }

  /**
   * Speak a symbol and its associated word, e.g. "A. Apple" or "3. Three".
   * Topic-agnostic: works for letters, numbers, or any item.
   * @param {string} symbol - The symbol to speak (letter or number)
   * @param {string} word - The associated word
   * @param {Object} options - Speech options
   */
  speak(symbol, word, options = {}) {
    if (!this.isAvailable || !symbol || !word) {
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance();

    // Configure utterance
    utterance.text = `${symbol}. ${word}`;
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1.2;
    utterance.volume = options.volume || 0.8;

    // Use child-friendly voice if available
    const childVoice = this.getChildFriendlyVoice();
    if (childVoice) {
      utterance.voice = childVoice;
    }

    speechSynthesis.speak(utterance);
  }

  /**
   * Speak a letter and its associated word (back-compat wrapper around speak()).
   * @param {string} letter - The letter to speak
   * @param {Object} options - Speech options
   */
  speakLetter(letter, options = {}) {
    if (!alphabetData[letter]) {
      return;
    }
    this.speak(letter, alphabetData[letter].word, options);
  }

  /**
   * Cancel any ongoing speech
   */
  cancel() {
    if (this.isAvailable) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Set up voice loading event listener
   * @param {Function} callback - Callback to run when voices are loaded
   * @returns {Function} - Cleanup function
   */
  onVoicesChanged(callback) {
    if (!this.isAvailable) {
      return () => {};
    }

    const handleVoicesChanged = () => {
      this.loadVoices();
      callback();
    };

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }
}

// Create and export a singleton instance
export const speechService = new SpeechService();
