# Tandem Daily - Requirements

## Overview
Tandem Daily is a Chinese × Japanese word-overlap quiz game built for Reddit's Devvit platform. Players identify True Friends (same meaning), False Friends (different meanings), and Half Friends (partial overlap) across 5 daily cards.

## Core Requirements

### 1. Devvit Serverless Architecture
- Runs inside Reddit's cross-origin iframe sandbox
- Uses Devvit Redis for streak/score storage
- Uses Devvit Reddit API for flair/comments
- Serverless Hono + tRPC backend

### 2. Bilingual Chinese × Japanese Etymology System
- 308 words with clues & radical data
- Three relationship types: True Friend, False Friend, Half Friend
- Progressive 20-Questions clue system (2 clues per word)
- Radical X-Ray overlays with animated glow

### 3. Web Audio API Sound Synthesis
- Zero external audio files
- Procedural foley: card swoosh, correct chime, wrong thud, lifeline tick, timer heartbeat, victory fanfare
- All sounds generated procedurally via Web Audio API

### 4. Autonomous Browser Agent Runtime
- Playwright E2E tests run in CI/CD
- Tests run on mobile (375×667) and desktop (1280×800) viewports
- Tests validate full 5-card game flow including all 4 lifelines

## Functional Requirements

### Game Modes
- **Chinese → Japanese** (zh2ja): See Chinese, guess Japanese meaning
- **Japanese → Chinese** (ja2zh): See Japanese, guess Chinese meaning
- **Visual Detective** (en): See kanji/hanzi, deduce meaning from form

### Lifelines (4 total)
1. **50/50** - Eliminates 2 wrong answers (-20 pts)
2. **X-Ray** - Reveals radical overlay/breakdown (-20 pts)
3. **20 Questions** - Progressive clues (2 per word, -15 pts each)
4. **Ask Subreddit** - Community poll percentage bars (-20 pts)

### Game Flow
1. Splash screen → Start screen → 5 cards → Reveal → End screen
2. 15-second timer per card with pause/resume on lifeline use
3. Score submission with streak tracking
4. Share to Reddit comments

## Non-Functional Requirements
- Must fit within 100dvh on 375×667 mobile viewport
- All 4 answer buttons must be visible without scrolling
- PageCard must auto-flip to reveal cream .paper-card content
- No custom cursors (breaks Devvit iframe)
- Red-Green TDD always
- ASCII wireframes required before UI work