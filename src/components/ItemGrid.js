import React from 'react';

/**
 * Generic clickable grid of topic items (letters or numbers) with learned/current state.
 * @param {Array<string>} items - All items to render
 * @param {Set} learnedItems - Set of learned items
 * @param {string} currentItem - Currently selected item
 * @param {Function} onItemClick - Called with the item when a button is clicked
 * @param {string} ariaPrefix - aria-label prefix, e.g. "Letter" or "Number"
 */
const ItemGrid = ({ items, learnedItems, currentItem, onItemClick, ariaPrefix }) => {
  return (
    <div className="alphabet-grid">
      {items.map(item => (
        <button
          key={item}
          className={`alphabet-btn ${learnedItems.has(item) ? 'learned' : ''} ${currentItem === item ? 'current' : ''}`}
          onClick={() => onItemClick(item)}
          aria-label={`${ariaPrefix} ${item}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default ItemGrid;
