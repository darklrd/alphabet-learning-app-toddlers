// Alphabet data with words and image URLs
const alphabetData = {
    'A': { word: 'Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=250&fit=crop&crop=center' },
    'B': { word: 'Ball', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=250&fit=crop&crop=center' },
    'C': { word: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=250&fit=crop&crop=center' },
    'D': { word: 'Dog', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=250&fit=crop&crop=center' },
    'E': { word: 'Elephant', image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=300&h=250&fit=crop&crop=center' },
    'F': { word: 'Fish', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=250&fit=crop&crop=center' },
    'G': { word: 'Giraffe', image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=250&fit=crop&crop=center' },
    'H': { word: 'Horse', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=300&h=250&fit=crop&crop=center' },
    'I': { word: 'Ice Cream', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&h=250&fit=crop&crop=center' },
    'J': { word: 'Jellyfish', image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=300&h=250&fit=crop&crop=center' },
    'K': { word: 'Kite', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=250&fit=crop&crop=center' },
    'L': { word: 'Lion', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&h=250&fit=crop&crop=center' },
    'M': { word: 'Monkey', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=300&h=250&fit=crop&crop=center' },
    'N': { word: 'Nest', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=250&fit=crop&crop=center' },
    'O': { word: 'Orange', image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=300&h=250&fit=crop&crop=center' },
    'P': { word: 'Penguin', image: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=300&h=250&fit=crop&crop=center' },
    'Q': { word: 'Queen', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=250&fit=crop&crop=center' },
    'R': { word: 'Rabbit', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&h=250&fit=crop&crop=center' },
    'S': { word: 'Sun', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=250&fit=crop&crop=center' },
    'T': { word: 'Tiger', image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=300&h=250&fit=crop&crop=center' },
    'U': { word: 'Umbrella', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=250&fit=crop&crop=center' },
    'V': { word: 'Violin', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=250&fit=crop&crop=center' },
    'W': { word: 'Whale', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=250&fit=crop&crop=center' },
    'X': { word: 'Xylophone', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=250&fit=crop&crop=center' },
    'Y': { word: 'Yacht', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=250&fit=crop&crop=center' },
    'Z': { word: 'Zebra', image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=300&h=250&fit=crop&crop=center' }
};

// Game state
let learnedLetters = new Set();
let currentLetter = '';
let isLoading = false;

// DOM elements
const bigLetter = document.getElementById('bigLetter');
const imageContainer = document.getElementById('imageContainer');
const wordText = document.getElementById('wordText');
const progressFill = document.getElementById('progressFill');
const alphabetGrid = document.getElementById('alphabetGrid');
const playSound = document.getElementById('playSound');
const nextLetter = document.getElementById('nextLetter');

// Initialize the app
function init() {
    createAlphabetGrid();
    setupEventListeners();
    updateProgress();
    
    // Add welcome animation
    setTimeout(() => {
        document.querySelector('.welcome-message').style.animation = 'pulse 2s infinite';
    }, 1000);
}

// Create alphabet grid buttons
function createAlphabetGrid() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    letters.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'alphabet-btn';
        button.textContent = letter;
        button.onclick = () => displayLetter(letter);
        button.setAttribute('data-letter', letter);
        alphabetGrid.appendChild(button);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', (event) => {
        const key = event.key.toUpperCase();
        if (key >= 'A' && key <= 'Z') {
            displayLetter(key);
            event.preventDefault();
        }
    });
    
    // Sound button
    playSound.addEventListener('click', () => {
        if (currentLetter) {
            speakLetter(currentLetter);
        }
    });
    
    // Next letter button
    nextLetter.addEventListener('click', () => {
        const nextLetter = getNextLetter();
        if (nextLetter) {
            displayLetter(nextLetter);
        }
    });
    
    // Focus on document to capture keyboard events
    document.addEventListener('click', () => {
        document.body.focus();
    });
}

// Display letter and its associated image
function displayLetter(letter) {
    if (isLoading) return;
    
    currentLetter = letter;
    const data = alphabetData[letter];
    
    if (!data) return;
    
    // Update letter display
    bigLetter.textContent = letter;
    bigLetter.style.animation = 'none';
    setTimeout(() => {
        bigLetter.style.animation = 'bounce 0.6s ease-in-out';
    }, 10);
    
    // Update word display
    wordText.textContent = data.word;
    
    // Update image
    displayImage(data.image, data.word);
    
    // Mark letter as learned
    if (!learnedLetters.has(letter)) {
        learnedLetters.add(letter);
        markLetterLearned(letter);
        updateProgress();
        
        // Celebration effect for new letter
        setTimeout(() => {
            createCelebrationEffect();
        }, 500);
    }
    
    // Speak the letter and word
    setTimeout(() => {
        speakLetter(letter);
    }, 300);
    
    // Update alphabet grid
    updateAlphabetGrid();
}

// Display image with loading state
function displayImage(imageUrl, altText) {
    isLoading = true;
    
    // Clear current content
    imageContainer.innerHTML = `
        <div class="loading-spinner" style="
            width: 40px; 
            height: 40px; 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #667eea; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
        "></div>
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Load image
    const img = new Image();
    img.onload = () => {
        isLoading = false;
        imageContainer.innerHTML = `
            <img src="${imageUrl}" alt="${altText}" class="alphabet-image">
        `;
    };
    
    img.onerror = () => {
        isLoading = false;
        // Fallback to a colored rectangle with emoji
        const emoji = getEmojiForLetter(currentLetter);
        imageContainer.innerHTML = `
            <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(45deg, #667eea, #764ba2);
                display: flex; 
                align-items: center; 
                justify-content: center; 
                border-radius: 10px;
                flex-direction: column;
            ">
                <div style="font-size: 4rem; margin-bottom: 10px;">${emoji}</div>
                <div style="color: white; font-weight: bold; font-size: 1.2rem;">${altText}</div>
            </div>
        `;
    };
    
    img.src = imageUrl;
}

// Get emoji representation for letters
function getEmojiForLetter(letter) {
    const emojiMap = {
        'A': '🍎', 'B': '⚽', 'C': '🐱', 'D': '🐕', 'E': '🐘',
        'F': '🐠', 'G': '🦒', 'H': '🐴', 'I': '🍦', 'J': '🎐',
        'K': '🪁', 'L': '🦁', 'M': '🐵', 'N': '🪺', 'O': '🍊',
        'P': '🐧', 'Q': '👑', 'R': '🐰', 'S': '☀️', 'T': '🐅',
        'U': '☂️', 'V': '🎻', 'W': '🐋', 'X': '🎵', 'Y': '⛵', 'Z': '🦓'
    };
    return emojiMap[letter] || '📝';
}

// Speak letter using Web Speech API
function speakLetter(letter) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance();
        const data = alphabetData[letter];
        utterance.text = `${letter}. ${data.word}`;
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.volume = 0.8;
        
        // Use a child-friendly voice if available
        const voices = speechSynthesis.getVoices();
        const childVoice = voices.find(voice => 
            voice.name.includes('child') || 
            voice.name.includes('kid') ||
            voice.name.includes('female')
        );
        if (childVoice) {
            utterance.voice = childVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
}

// Mark letter as learned in the grid
function markLetterLearned(letter) {
    const button = document.querySelector(`[data-letter="${letter}"]`);
    if (button) {
        button.classList.add('learned');
    }
}

// Update alphabet grid highlighting
function updateAlphabetGrid() {
    const buttons = document.querySelectorAll('.alphabet-btn');
    buttons.forEach(button => {
        const letter = button.getAttribute('data-letter');
        if (letter === currentLetter) {
            button.style.background = '#ff6b6b';
            button.style.borderColor = '#ff6b6b';
            button.style.color = 'white';
            button.style.transform = 'scale(1.1)';
        } else if (learnedLetters.has(letter)) {
            button.style.background = '#4ecdc4';
            button.style.borderColor = '#4ecdc4';
            button.style.color = 'white';
            button.style.transform = 'scale(1)';
        } else {
            button.style.background = 'rgba(255,255,255,0.2)';
            button.style.borderColor = 'white';
            button.style.color = 'white';
            button.style.transform = 'scale(1)';
        }
    });
}

// Update progress bar
function updateProgress() {
    const progress = (learnedLetters.size / 26) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Completion celebration
    if (learnedLetters.size === 26) {
        setTimeout(() => {
            showCompletionCelebration();
        }, 1000);
    }
}

// Get next unlearned letter
function getNextLetter() {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const unlearned = allLetters.filter(letter => !learnedLetters.has(letter));
    
    if (unlearned.length > 0) {
        return unlearned[Math.floor(Math.random() * unlearned.length)];
    }
    
    // If all learned, return a random letter
    return allLetters[Math.floor(Math.random() * allLetters.length)];
}

// Create celebration effect
function createCelebrationEffect() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: fall 3s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
    
    // Add fall animation if not already present
    if (!document.querySelector('#confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Show completion celebration
function showCompletionCelebration() {
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 1001;
        animation: zoomIn 0.5s ease-out;
    `;
    
    celebration.innerHTML = `
        <h2 style="color: #667eea; margin-bottom: 20px; font-size: 2.5rem;">🎉 Congratulations! 🎉</h2>
        <p style="font-size: 1.3rem; margin-bottom: 20px;">You've learned all 26 letters!</p>
        <button onclick="this.parentElement.remove(); createCelebrationEffect();" style="
            padding: 15px 30px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            cursor: pointer;
            font-family: 'Comic Neue', cursive;
        ">Keep Learning! 🌟</button>
    `;
    
    document.body.appendChild(celebration);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (celebration.parentElement) {
            celebration.remove();
        }
    }, 5000);
    
    // Big celebration effect
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createCelebrationEffect(), i * 100);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Load voices for speech synthesis
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        // Voices loaded, ready to use
    };
}

