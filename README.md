# Tandem Daily

A Chinese × Japanese word-overlap quiz game on Reddit Devvit. Players identify **True Friends** (same meaning in both languages), **False Friends** (different meanings), and **Half Friends** (partial overlap) across 5 daily cards.

## 🧟 Frankenstein Architecture (Kiroween 2026)

Tandem Daily is a Frankenstein creation that stitches together seemingly incompatible technologies:

- **Devvit Serverless Posts**: Runs inside Reddit's cross-origin iframe sandbox with Redis for streak/score storage
- **Bilingual Radical X-Ray Scanner**: 308 Chinese-Japanese cognates with SVG radical overlays for deep character analysis
- **Zero-Asset Web Audio Synthesis**: All sound effects (card flips, chimes, ticks) generated procedurally — no audio files

## Game Modes

- **Chinese → Japanese** (zh2ja): See Chinese, guess Japanese meaning
- **Japanese → Chinese** (ja2zh): See Japanese, guess Chinese meaning
- **Visual Detective** (en): See kanji/hanzi, deduce meaning from form

## Implemented Features

- Daily puzzle mode (5 cards, seeded per day)
- Practice mode with seeded generation
- 4 Lifelines: 50/50, X-Ray (radical reveal), 20 Questions (progressive clues), Ask Subreddit (community stats)
- 15-second timer with pause/resume per lifeline use
- Score submission with streak tracking and flair rewards
- Share results to Reddit comments
- Procedural sound effects (no audio files)
- Radical overlay with animated glow + breakdown
- Progressive clue system (20 Questions)
- Playwright E2E tests (mobile 375×667 + desktop 1280×800)

## Starter Templates & Frameworks

This project was initialized from the official **Reddit Devvit React Starter template** (`@devvit/web`, React 19, Hono, Tailwind CSS) and extended with:

- **Framer Motion** (`^14.14.0`) — animations
- **Vitest** — unit testing
- **Playwright** — E2E testing

All game logic, 308 bilingual words/clues, radical X-Ray overlays, Web Audio foley synthesizer, and UI styling were built custom for Kiroween 2026.

## Architecture

```
/src
├── client/          # React frontend (game.html, splash.html entrypoints)
│   ├── components/  # GameScreen, CardView, ChoiceButtons, RevealView, StartScreen, EndScreen
│   ├── hooks/       # useDailyGame, useCountdown, useSound
│   ├── lib/         # daily.ts, content.ts, words.ts, hints.ts, scoring.ts
│   └── __tests__/   # gameFlow.test.tsx
├── server/          # Hono + tRPC backend
│   ├── routes/      # api.ts (daily, score, share), menu.ts, forms.ts, triggers.ts
│   └── core/        # post.ts
└── shared/          # Shared types & game logic
    ├── api.ts       # API contracts (DailyResponse, ScoreRequest, etc.)
    ├── wordPool.ts  # 308 kanji/hanzi entries with clues & radicals
    └── game/        # Pure game logic (words.ts, content.ts, daily.ts, hints.ts, scoring.ts)
```

**Devvit Platform**: Redis for streak/score storage, Reddit API for flair/comments

## Local Setup

```bash
npm install
npm run login        # Devvit authentication
npm run dev          # Local development (playtest)
npm run dev:local    # Standalone local dev (no Devvit server, for Playwright)
npm run build        # Production build
npm run test:types   # TypeScript type check
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run verify       # Full verification suite (lint + types + test + e2e + build)
npm run deploy       # Deploy to Devvit (runs type-check + lint + tests)
```

## Attribution / Data Sources

- Word pool: CC-CEDICT, JMdict, KanjiVG
- Radical data: KanjiVG
- License: BSD-3-Clause (see LICENSE)

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Devvit playtest session |
| `npm run dev:local` | Start standalone local dev server (no Reddit) |
| `npm run build` | Build client + server |
| `npm run test:types` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run verify` | Full verification suite |
| `npm run deploy` | Deploy (type-check → lint → test → upload) |
| `npm run launch` | Deploy + publish for review |
| `npm run prettier` | Format code |