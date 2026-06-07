import React, { useState } from 'react';
import './App.css';

// Import components
import { LearningView, TabBar } from './components';

// Import hooks
import { useImagePreloader } from './hooks/useImagePreloader';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

// Topic configuration (letters + numbers)
import { TOPICS } from './constants/topics';

function App() {
  // Which topic (Letters / Numbers) is currently active
  const [activeTopicId, setActiveTopicId] = useState(TOPICS[0].id);
  const activeTopic = TOPICS.find(topic => topic.id === activeTopicId);

  // Initialize shared, topic-agnostic concerns once
  useImagePreloader(); // Preloads images for all topics
  useSpeechSynthesis(); // Initialize speech synthesis

  return (
    <div className="container" tabIndex={0} style={{ outline: 'none' }}>
      <header>
        <h1>🌟 Learning Adventure! 🌟</h1>
        <p>Pick Letters or Numbers, then type or tap to start learning!</p>
      </header>

      <TabBar
        topics={TOPICS}
        activeTopicId={activeTopicId}
        onSelect={setActiveTopicId}
      />

      <main>
        {/* Render only the active topic's view. Keyed by topic id so switching
            tabs mounts a fresh view for that topic. */}
        <LearningView
          key={activeTopic.id}
          topic={activeTopic}
          isActive={true}
        />
      </main>

      <footer>
        <p>Keep going to learn them all! 🎉</p>
      </footer>
    </div>
  );
}

export default App;
