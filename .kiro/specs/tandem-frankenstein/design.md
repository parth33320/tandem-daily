# Tandem Daily - Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Reddit Devvit Platform                    │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │  Client (iframe)│    │  Server (Hono + tRPC)           │ │
│  │  React 19 + TS  │    │  Devvit Redis + Reddit API      │ │
│  └────────┬────────┘    └──────────────┬──────────────────┘ │
│           │                              │                  │
│           └──────────────┬───────────────┘                  │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Shared Game Engine (src/shared/game/)      │   │
│  │  words.ts, content.ts, daily.ts, hints.ts, scoring.ts│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
GameScreen (orchestrator)
├── Cinematic (spotlight, haze, vignette, grain)
├── Deck (7-card stack animation)
├── PageCard (3D flip: .card-back → .paper-card)
│   ├── StartScreen (direction radios + Start button)
│   ├── CardView (question face)
│   │   ├── TimerBar
│   │   ├── KanjiRadicalDisplay
│   │   ├── TargetLanguagePrompt
│   │   ├── TrapBadge
│   │   ├── CluesDisplay
│   │   ├── CommunityStatsDisplay
│   │   └── LifelineBar (4 lifelines)
│   ├── ChoiceButtons (4 fanned .paper-card buttons)
│   ├── RevealView (reveal face)
│   │   ├── Relation badge (True/False/Half Friend)
│   │   ├── JP ↔ CN side-by-side columns
│   │   ├── Radical breakdown
│   │   ├── Fun Fact box
│   │   └── Next Card / See Final Score button
│   └── EndScreen (Victory/Defeat, Similarity meter, Play Again)
```

## Data Flow

### Client → Server (tRPC)
1. `GET /api/daily` → Returns daily cards + stats
2. `POST /api/score` → Submit score, returns streak + flair
3. `POST /api/share` → Post score to Reddit comments

### Server → Redis
- `streak:{username}` - Current streak count
- `played:{username}:{puzzleNumber}` - Daily play flag
- `stats:{puzzleNumber}:{cardIndex}` - Community poll stats

### Client State (useDailyGame)
```typescript
interface UseDailyGameState {
  loading: boolean;
  daily: DailyResponse | null;
  currentCard: number;
  score: number;
  phase: "start" | "playing" | "revealed" | "ended";
  timer: number;              // 15-second countdown
  lifelinesUsed: LifelinesUsed;
  showRadicalOverlay: boolean;
  showClues: string[];
  eliminatedIndices: number[];
}
```

## UI Design System (Casino Felt & Parchment)

### Color Palette (OKLCH)
```css
--background: oklch(0.16 0.03 160);    /* Deep felt bg */
--foreground: oklch(0.95 0.02 90);     /* Warm off-white */
--card: oklch(0.22 0.04 160);          /* Elevated surface */
--primary: oklch(0.78 0.13 80);        /* Gold accent */
--accent: oklch(0.55 0.15 25);         /* Crimson */
--paper: oklch(0.95 0.03 85);          /* Warm parchment */
--paper-ink: oklch(0.22 0.03 50);      /* Dark ink */
--felt: oklch(0.32 0.08 160);          /* Felt table */
--gold: oklch(0.80 0.13 82);           /* Bright gold */
```

### 5 Table Themes
- `felt` (default): Deep green felt
- `library`: Warm wood
- `neon`: Dark neon
- `ink`: Ink wash
- `lacquer`: Red lacquer

### Key Utility Classes
- `.paper-card` - Warm parchment with deep shadow
- `.card-back` - Crimson diagonal stripes + cream border
- `.glass` - Backdrop blur translucent surface
- `.gold-text` - Vertical gold gradient text
- `.cine-*` - Cinematic layers (spot, haze, vignette, grain, flares)

## Mobile Viewport Constraints
- **Viewport**: 375×667 (Devvit mobile modal)
- **Layout**: Flex column, `min-h-[100dvh] max-h-[100dvh]`
- **PageCard**: No fixed aspect ratio, `max-h-[60vh] sm:max-h-[70vh]`
- **ChoiceButtons**: 4 fanned buttons fit in single row (344px < 375px)
- **All 4 answer buttons** must be `toBeVisible()` AND `toBeInViewport()` without scrolling

## Game Logic (Shared Engine)

### Card Generation (`daily.ts`)
```typescript
dealDailyCards(puzzleNum, direction, WORDS, seed?)
→ RoundContent[] (5 cards)
```

### Scoring (`scoring.ts`)
```typescript
calculateRoundPoints(correct, usedHints, lifelinesUsed)
→ BASE_POINTS (100) - hint costs - lifeline costs
```

### Similarity Calculation (`content.ts`)
```typescript
similarity(seenWords[])
→ { total, same, partial, different, pct }
```

## Lifeline Implementation

| Lifeline | Cost | Effect | Implementation |
|----------|------|--------|----------------|
| 50/50 | -20 | Eliminate 2 wrong | `eliminated(code, round, correct)` |
| X-Ray | -20 | Show radical | `showRadicalOverlay = true` |
| 20-Q | -15 each | Progressive clues | `showClues.push(clue[0])`, then `clue[1]` |
| Poll | -20 | Community % bars | `stats[cardIndex][choice]` |

## Web Audio Synthesis
All sounds generated procedurally via Web Audio API:
- **Card swoosh**: White noise + bandpass filter sweep
- **Correct chime**: Sine wave (523Hz → 784Hz)
- **Wrong thud**: Low sine (100Hz) + gain envelope
- **Lifeline tick**: Short square wave
- **Timer heartbeat**: Periodic 100Hz pulse
- **Victory fanfare**: Arpeggiated major chord

## Testing Strategy
- **Unit**: Vitest (26 tests)
- **E2E**: Playwright (mobile + desktop)
- **Type-check**: TypeScript strict mode
- **Lint**: ESLint + Prettier

## CI/CD Gates
1. `npm run lint` - ESLint
2. `npm run test:types` - TypeScript
3. `npm test` - Vitest (26 tests)
4. `npm run test:e2e` - Playwright (mobile + desktop)
5. `npm run build` - Vite production build

All must pass before `git push` (pre-push hook).