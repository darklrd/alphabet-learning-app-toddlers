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

Tests currently live in `src/App.test.js`.

## Architecture

The app is built around a strict separation of concerns. `App.js` is pure orchestration: it wires hooks together and renders components, holding no business logic of its own.

**Layered structure (data flows down through these layers):**

- `constants/alphabetData.js` — the single source of truth. Defines the 26 letter→`{ word, image }` mappings, the emoji fallback map, `ALL_LETTERS`, and `APP_CONFIG` (all timing/count constants like `IMAGE_TIMEOUT_MS`, `ANIMATION_DURATION_MS`, `CONFETTI_COUNT`). Change behavior tuning here, not inline in hooks.
- `services/` — singleton class instances with no React dependency. `speechService` wraps the Web Speech API (text-to-speech for letter + word). `imageService` preloads/caches all images via the browser `Image` object. Both export a shared singleton (e.g. `export const speechService = new SpeechService()`).
- `hooks/` — custom React hooks that own all stateful logic. `useAlphabetLearning` is the core hook: it manages `currentLetter`, the `learnedLetters` Set, image loading/fallback state, and exposes all the `handle*` action callbacks. The other hooks are focused: `useCelebration` (confetti + modal state), `useKeyboardInput` (global keydown listener), `useImagePreloader` (kick off preload on mount), `useSpeechSynthesis` (voice initialization).
- `components/` — presentational, props-only components, re-exported through `components/index.js`. They receive data and callbacks; they do not hold app logic.

**Key flow:** `App` creates `useCelebration` first, then passes its `celebrateNewLetter` callback into `useAlphabetLearning` so that learning a new letter can trigger a celebration without the hooks depending on each other directly. `useKeyboardInput(handleKeyDown)` binds the keyboard. Selecting a letter (via key, grid click, or "Next Letter") all funnel through `displayLetter()` in `useAlphabetLearning`.

**Image loading with emoji fallback:** When a letter is shown, `useAlphabetLearning` sets a loading state and starts an `IMAGE_TIMEOUT_MS` timer. If the `<img>` fires `onLoad` first, the timer is cleared and the image shows; if `onError` fires or the timeout elapses, it falls back to the emoji from `emojiMap`. Any code touching image display must keep clearing the stored `imageTimeoutId` to avoid stale fallbacks.

## Deployment & asset paths

The app deploys to GitHub Pages, so image paths must be built with `process.env.PUBLIC_URL` (see `getImagePath` in `alphabetData.js`) — never hardcode a leading `/images/...` path or images will 404 on the deployed `homepage` subpath. Images live in `public/images/alphabet/` named like `A-apple.jpg`. Adding/renaming a letter image means updating both the file and the `alphabetData` entry.
