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
   * Speak a letter and its associated word
   * @param {string} letter - The letter to speak
   * @param {Object} options - Speech options
   */
  speakLetter(letter, options = {}) {
    if (!this.isAvailable || !alphabetData[letter]) {
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance();
    const data = alphabetData[letter];
    
    // Configure utterance
    utterance.text = `${letter}. ${data.word}`;
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
