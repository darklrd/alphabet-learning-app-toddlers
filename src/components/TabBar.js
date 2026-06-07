import React from 'react';

/**
 * Big, kid-friendly tabs to switch between learning topics (Letters / Numbers).
 * @param {Array<Object>} topics - Topic configs ({ id, label, tabEmoji })
 * @param {string} activeTopicId - Currently active topic id
 * @param {Function} onSelect - Called with a topic id when a tab is clicked
 */
const TabBar = ({ topics, activeTopicId, onSelect }) => {
  return (
    <div className="tab-bar" role="tablist" aria-label="Learning topics">
      {topics.map(topic => {
        const isActive = topic.id === activeTopicId;
        return (
          <button
            key={topic.id}
            role="tab"
            aria-selected={isActive}
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(topic.id)}
          >
            <span className="tab-emoji" aria-hidden="true">{topic.tabEmoji}</span>
            {topic.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
