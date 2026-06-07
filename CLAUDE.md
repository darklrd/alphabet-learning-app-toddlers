# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

An interactive alphabet learning web app for young children, built with Create React App (React 18). A child types a letter (or clicks one) and sees a corresponding image and word, with text-to-speech and celebration animations. The app works fully offline using locally cached images.

## Commands

- `npm start` — run the dev server at http://localhost:3000
- `npm test` — run the Jest/React Testing Library test runner in watch mode
- `npm test -- --watchAll=false` — run tests once (CI-style)
- `npm test -- App.test.js` — run a single test file
- `npm test -- -t "name of test"` — run tests matching a name
- `npm run build` — production build into `build/`
- `npm run deploy` — build and publish `build/` to GitHub Pages via `gh-pages` (runs `predeploy` automatically)

Tests live in `src/App.test.js` (alphabet/integration) and `src/NumbersApp.test.js` (numbers mode + tab switching).

## Architecture

The app is built around a strict separation of concerns. `App.js` is pure orchestration: it holds the active-topic state, renders the `TabBar` and the active `LearningView`, and kicks off shared concerns (`useImagePreloader`, `useSpeechSynthesis`). It holds no business logic of its own.

**Topics (the core abstraction):** The app teaches multiple **topics** (currently Letters and Numbers), all driven by the same generic code. A topic config in `constants/topics.js` bundles everything a topic needs: its `data` map, `emojiMap`, `items` list, `ariaPrefix`, `welcomeHint`, and `isValidKey`/`normalizeKey` for keyboard input. Adding a new topic = add a data module + one entry in `TOPICS`. Letters and numbers each keep independent progress; switching tabs remounts a fresh `LearningView` for the selected topic (progress is per-visit, not persisted across switches).

**Layered structure (data flows down through these layers):**

- `constants/` — the single sources of truth. `alphabetData.js` defines the 26 letter→`{ word, image }` mappings, `emojiMap`, `ALL_LETTERS`, and `APP_CONFIG` (timing/count constants like `IMAGE_TIMEOUT_MS`, `ANIMATION_DURATION_MS`, `CONFETTI_COUNT`). `numbersData.js` mirrors it for 1–10 (`numbersData`, `numberEmojiMap` of N-repeated emoji, `ALL_NUMBERS`). `topics.js` wraps both into topic configs. Change behavior tuning in `APP_CONFIG`, not inline in hooks.
- `services/` — singleton class instances with no React dependency. `speechService.speak(symbol, word)` is the generic Web Speech API wrapper (`speakLetter` is a back-compat alias). `imageService.preloadAllImages([datasets])` preloads/caches images for any datasets via the browser `Image` object. Both export a shared singleton.
- `hooks/` — custom React hooks that own all stateful logic. `useLearning(topic, onNewItemLearned)` is the generic core hook: it manages `currentItem`, the `learnedItems` Set, image loading/fallback state, and exposes all the `handle*` callbacks. (`useAlphabetLearning` is now a thin back-compat wrapper around it.) The focused hooks: `useCelebration` (confetti + modal), `useKeyboardInput(handler, enabled)` (global keydown, gated by `enabled`), `useImagePreloader` (preloads all topics' images on mount), `useSpeechSynthesis` (voice init).
- `utils/` — `learningUtils.js` holds the generic, topic-agnostic helpers (`getRandomItem`, `calculateProgress`, `isAllLearned`, `getEmoji`); `alphabetUtils.js` keeps its original signatures but delegates to them.
- `components/` — presentational, props-only components, re-exported through `components/index.js`. `LearningView` composes the display area, `Controls`, `ProgressBar`, `ItemGrid`, confetti and modal for one topic. `TabBar` switches topics. `ItemGrid` is the generic grid (`ariaPrefix` gives buttons labels like `Letter A` / `Number 3`). They receive data and callbacks; they hold no app logic.

**Key flow:** Each `LearningView` creates its own `useCelebration` first, then passes `celebrateNewLetter` into `useLearning` so learning a new item can trigger a celebration without the hooks depending on each other directly. `useKeyboardInput(handleKeyDown, isActive)` binds the keyboard only for the active view. Selecting an item (via key, grid click, or "Next") all funnel through `displayItem()` in `useLearning`.

**Image loading with emoji fallback:** When an item is shown, `useLearning` sets a loading state and starts an `IMAGE_TIMEOUT_MS` timer. If the `<img>` fires `onLoad` first, the timer is cleared and the image shows; if `onError` fires or the timeout elapses, it falls back to the emoji from the topic's `emojiMap` (for numbers this is a counting visual, e.g. `3 → ⭐⭐⭐`). Any code touching image display must keep clearing the stored `imageTimeoutId` to avoid stale fallbacks.

## Deployment & asset paths

The app deploys to GitHub Pages, so image paths must be built with `process.env.PUBLIC_URL` (see `getImagePath` in `alphabetData.js`/`numbersData.js`) — never hardcode a leading `/images/...` path or images will 404 on the deployed `homepage` subpath. Letter images live in `public/images/alphabet/` named like `A-apple.jpg`; number images live in `public/images/numbers/` named like `3-three.jpg`. Adding/renaming an image means updating both the file and the topic's data entry. Number photos are optional — until a file exists, the counting-emoji fallback renders automatically.
