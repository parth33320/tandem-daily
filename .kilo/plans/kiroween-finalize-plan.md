# Casino Felt UI Port Plan: Match `tandem-app` Visual Design in `tandem-daily`

## Overview
Port the exact Casino Felt & Parchment Card Table UI from `tandem-ref/tandem-app/client/src/` to `tandem-daily/src/client/`, preserving all existing `data-testid` attributes, game logic, and passing `npm run verify`.

## Non-Negotiable Rules
- Output ASCII wireframes for desktop (1280×800) and mobile (375×667) BEFORE any UI changes
- Never use `cursor: none`, `HandCursor`, `Hand3D`, or click-blocking overlays
- Preserve all `data-testid` attributes (`direction-*`, `start-button`, `question-card`, `answer-option-0..3`, `lifeline-*`, `reveal-card`, `next-card-button`, `play-again-button`)
- Preserve `<input type="radio">` accessibility roles
- **DO NOT modify `src/client/__tests__/gameFlow.test.tsx`.** Keep the exact strings and labels it asserts:
  - `Guess the JAPANESE meaning`, `Guess the CHINESE meaning`
  - `Correct!`, `Wrong`
  - `Next Card →`, `See Final Score →`
  - `Share Score to Comments`, `Play Again`
  - `aria-label="Disable timer"` / `"Enable timer"`
- Run `npm run verify` after each phase

### Critical Constraints (Zero Test Regressions)

**DO NOT modify `src/client/__tests__/gameFlow.test.tsx`.** The following exact strings, classes, and aria-labels must be preserved:

1. **StartScreen:** `Tandem Daily` text, radios with names `/I know Chinese → guess Japanese/i`, `/I know Japanese → guess Chinese/i`, `/I know neither — Visual Detective/i`, button `/Play Today/i`. **CRITICAL: Do NOT change these strings in `StartScreen.tsx` — only restyle the container/chips to match the Casino Felt aesthetic.**

2. **CardView:** Text `/Guess the JAPANESE meaning/i`, kanji matching `/^[\u4e00-\u9fff]+$/`

3. **Lifelines (CRITICAL — exact emoji + class names):**
   - 50/50 button: `name: /✂️ 50\/50/i` (must include ✂️)
   - 20-Q button: `name: /20-Q/i` (must include 🎭 in clue text)
   - Poll button: `name: /Poll/i`
   - Eliminated choices: `b.className.includes('opacity-25') || b.className.includes('line-through')` — **MUST use `opacity-25` or `line-through` class** (NOT `opacity-15`)
   - 20-Q clue text: `/🎭/i` (must include 🎭 emoji)
   - Poll stats text: `/Community Picks/i`

10. **RevealView:**
   - Text: `/Japanese/i` and `/Chinese/i`
   - Button: `/Next Card →/i` or `/See Final Score →/i`
   - Result text: `/Correct!|Wrong/i`

11. **EndScreen:**
   - Heading: `/Perfect|Good Job|Keep Learning|Wrong/i`
   - Button: `/Share Score to Comments/i`
   - Button: `/Play Again/i`

12. **Timer:**
   - Text: `/15s/`
   - Toggle button: `name: /Disable timer/i`
   - When disabled: text `/OFF/`

13. **ChoiceButtons:** Buttons must NOT contain text: `✂️`, `🔍`, `🎭`, `📊`, `⏱️` (these are filtered out by the test)

14. **`RevealView.tsx` Surface:** Render on the cream `.paper-card` surface with high-contrast dark `text-paper-ink` text. Keep the `TRUE FRIEND`/`FALSE FRIEND`/`HALF FRIEND` crimson pill badge (`bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest`) text-only with no emojis.

15. **Mobile `375×667` Viewport Fit:** Keep the header, `.paper-card`, 2×2 `.paper-card` choice grid, and timer compact inside `h-[100dvh] overflow-hidden` on mobile so all 4 `data-testid="answer-option-0..3"` buttons stay 100% visible inside the viewport without scrolling.

---

## ASCII Wireframes

### Desktop Layout (1280×800) — Game Round
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CHINESE × JAPANESE          Tandem Daily                    [🔊] [⚙️] [?]  │  ← Header Bar
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌──────────────┐    ┌─────────────────────────────────┐    ┌─────────────┐ │
│   │              │    │  CARD 1 / 5                     │    │             │ │
│   │  ┌────────┐  │    │                                 │    │   ⏱️ 15s   │ │
│   │  │ 縁     │  │    │  🇯🇵 Guess the JAPANESE       │    │  (circular) │ │
│   │  │ (card  │  │    │                                 │    │             │ │
│   │  │  back) │  │    │        手紙                     │    │             │ │
│   │  └────────┘  │    │     (Noto Serif JP, 6xl)        │    │             │ │
│   │   Deck       │    │                                 │    │             │ │
│   │   (7 cards)  │    │  What does it mean in Japanese? │    │             │ │
│   │              │    │                                 │    │             │ │
│   │              │    │  [✂️ 50/50] [🔍 X-Ray]        │    │             │ │
│   │              │    │  [🎭 20-Q]  [📊 Poll]          │    │             │ │
│   └──────────────┘    └─────────────────────────────────┘    └─────────────┘ │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐  │
│   │   [A: 手紙]    [B: 汽车]    [C: 学校]    [D: 先生]                  │  │
│   │   (paper-card) (paper-card) (paper-card) (paper-card)                  │  │
│   │   (fanned, rotate -6deg/-2deg/2deg/6deg)                              │  │
│   └─────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375×667) — Game Round (3-Zone Compact, Zero Scrollbars)
```
┌─────────────────────────────────────────────┐
│  Tandem Daily                    ⏱️ 15s    │  ← Zone 1: Top Bar (shrink-0, ≤52px)
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  CARD 1 / 5                         │   │  ← Zone 2: Cream .paper-card
│  │  🇯🇵 Guess the JAPANESE           │   │     (flex-1 min-h-0, NO overflow)
│  │        手紙                          │   │
│  │  What does it mean in Japanese?     │   │
│  │  💡 Clue 1 (compact 1-line pill)    │   │
│  │  [amber X-Ray badge if active]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Community Picks (1-line eyebrow if poll)   │  ← Zone 3: Bottom (shrink-0)
│  ┌──────────┐ ┌──────────┐                │
│  │ A: 手紙  │ │ B: 汽车  │  25% ← inside │  ← 2×2 grid
│  └──────────┘ └──────────┘                │     top-right badge
│  ┌──────────┐ ┌──────────┐                │
│  │ C: 学校  │ │ D: 先生  │                │
│  └──────────┘ └──────────┘                │
│  ┌─────────────────────────────────────┐   │
│  │ ✂️ 50/50 │ 🔍 X-Ray │ 🎭 20-Q │ 📊 Poll│  │  ← .glass 4-col tray
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Copy Table Felt Asset
1. Copy `C:\Users\Parth\Desktop\repo\tandem-ref\tandem-app\client\src\assets\table-felt.jpg` to `src/client/assets/table-felt.jpg`

### Phase 2: Update `src/client/index.css`
Add the exact OKLCH Casino Felt tokens and utility classes from `tandem-app/styles.css`:
- Copy all `@theme inline` tokens (`--font-display`, `--font-sans`, `--color-*`)
- Copy all 5 theme definitions (`[data-theme="felt"]`, `library`, `neon`, `ink`, `lacquer`)
- Copy `@utility` classes: `paper-card`, `card-back`, `glass`, `gold-text`, `camera-drift`, `camera-push`, `cine-*`, `hand-shadow`
- Copy `@keyframes`: `drift`, `haze`, `tension`, `grain`, `push`
- Keep existing game-specific utilities (`btn-primary`, `lifeline-pill`, etc.)

### Phase 3: Create `Deck.tsx` Component
Port `tandem-app/client/src/components/Deck.tsx` to `src/client/components/Deck.tsx`:
- 7-card stacked `.card-back` deck with deal-flick motion
- `pointer-events-none` to avoid blocking clicks
- `round` prop for deal animation trigger

### Phase 4: Create `Cinematic.tsx` & `RevealFlare.tsx`
Port from `tandem-app/client/src/components/Cinematic.tsx`:
- `Cinematic` with spotlight, haze, vignette, film grain, opening letterbox bars
- `RevealFlare` on answer reveal (gold flare for good, crimson for bad)
- All layers with `pointer-events-none`

### Phase 5: Update `CardView.tsx`
Replace current card styling with exact `tandem-app` visual:
- `.paper-card` background with `text-paper-ink`
- `CARD X / 5` uppercase tracking header
- Large `Noto Serif JP` Kanji/Hanzi (6xl desktop, 4xl mobile) with amber X-Ray `clipPath` glow
- Target language pill with **exact text** `Guess the JAPANESE meaning` / `Guess the CHINESE meaning` (must match Vitest assertions)
- Italic `Cormorant Garamond` prompt (`What does it mean in Japanese?`)
- Compact `.glass` clues/lifelines tray with `Worth X if correct`
- Timer toggle button with `aria-label="Disable timer"` / `"Enable timer"` (must match Vitest assertions)
- **Mobile:** `.paper-card` max height `max-h-[45dvh]` so ChoiceButtons fit below within `100dvh`
- **CRITICAL — Lifeline button text must include emojis:** `✂️ 50/50`, `🔍 X-Ray`, `🎭 20-Q`, `📊 Poll` (Vitest queries these by name)
- **CRITICAL — Eliminated choices:** Must use `opacity-25` or `line-through` classes (NOT `opacity-15 grayscale`). Vitest checks `b.className.includes('opacity-25') || b.className.includes('line-through')`
- **CRITICAL — 20-Q clues:** Must render `🎭` emoji in clue text (Vitest checks `screen.getAllByText(/🎭/i)`)
- **CRITICAL — Poll stats:** Must render text `Community Picks` (Vitest checks `screen.getByText(/Community Picks/i)`)
- **CRITICAL — Timer OFF state:** When timer disabled, must render text `OFF` (Vitest checks `screen.getByText(/OFF/)`)

### Phase 6: Update `ChoiceButtons.tsx`
Replace current grid with fanned `.paper-card` playing cards:
- 4 cards with `A/B/C/D` corner indices in `Cormorant Garamond`
- Slight fan tilt on desktop (`rotate: (i - 1.5) * 6deg`)
- **Mobile:** 2×2 grid (`grid-cols-2`) with compact sizing (`h-28 sm:h-36`) so all 4 buttons fit within `100dvh`
- **CRITICAL — Eliminated choices:** MUST use `opacity-25 line-through` classes (NOT `opacity-15 grayscale`). The test checks `b.className.includes('opacity-25') || b.className.includes('line-through')`. Keep `data-testid="answer-option-${idx}"` on ALL buttons, use `disabled={true}` for eliminated.
- Correct: `ring-4 ring-success`, Wrong: `ring-4 ring-destructive`
- All 4 buttons must pass `toBeInViewport()` on 375×667
- Buttons must NOT contain text: `✂️`, `🔍`, `🎭`, `📊`, `⏱️` (test filters these out)

### Phase 7: Update `RevealView.tsx`
Replace current styling with exact `tandem-app` visual:
- **CRITICAL:** Render on cream `.paper-card` surface with `text-paper-ink` (NOT dark background)
- Prominent top-center `Correct!`/`Wrong` banner (exact text must match Vitest: `Correct!` and `Wrong`)
- Centered crimson pill badge (`bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest`) displaying `TRUE FRIEND`/`FALSE FRIEND`/`HALF FRIEND` — text-only, NO emojis
- Centered side-by-side `JAPANESE ↔ CHINESE` columns (`form`, reading, English meaning) — **must include text `Japanese` and `Chinese`** (Vitest checks `screen.getAllByText(/Japanese/i)` and `screen.getAllByText(/Chinese/i)`)
- `✦` personalized fun fact box at bottom
- Next button with exact text `Next Card →` / `See Final Score →` (must match Vitest)
- Keep `data-testid="reveal-card"` and `data-testid="next-card-button"`

### Phase 8: Update `GameScreen.tsx`
Add header bar and decorative elements:
- Gold `Cormorant Garamond` **Tandem Daily** brand on left
- Compact `.glass` pills on right: **How to play** modal, **Sound mute/unmute (`🔊`/`🔇`)**, **Settings (`⚙️`)**
- Left decorative `Deck` (hidden on mobile)
- Right circular `.glass` timer (`rounded-full font-display font-bold text-primary`, `text-destructive` at `<= 5s`)
- `<RevealFlare />` overlay on answer reveal
- `camera-drift` stage animation
- **CRITICAL Mobile Fit:** Use `h-[100dvh] overflow-hidden flex flex-col` on the outer container. Header shrinks to compact size on mobile. Main content area uses `flex-1 min-h-0` with the `.paper-card` constrained to `max-h-[45dvh]` and ChoiceButtons in a `shrink-0` bottom section so all 4 answer buttons stay in viewport.
- **Preserve exact button text:** `Share Score to Comments`, `Play Again` (must match Vitest)

### Phase 9: Update `EndScreen.tsx`
Replace with `Final` and `SimilarityMeter` from `room.$code.tsx`:
- Large `Cormorant Garamond` **Victory** (`.gold-text`) / **Defeat** heading
- **CRITICAL — Heading text:** Must match Vitest `/Perfect|Good Job|Keep Learning|Wrong/i` (NOT `Victory`/`Defeat`). Use `Perfect!` for 500, `Good Job!` for >=300, `Keep Learning!` otherwise.
- `.glass` **Similarity meter** progress bar with breakdown sentence
- Streak & Reddit shareable emoji scorecard
- Gold **Share Score to Comments** button (exact text must match Vitest)
- **Play Again** (`data-testid="play-again-button"`, exact text must match Vitest)

### Phase 10: Fix Timeout Reveal & "Correct" Label Bug (`useDailyGame.ts` & `RevealView.tsx`)
- **`useDailyGame.ts`:** When the 15-second countdown hits `0`, append `{ cardIdx: s.currentCard, choiceIdx: -1, correct: false }` to `s.answers` so `answers` always matches the current card and `selectedIdx` is `-1` on timeout.
- **`RevealView.tsx`:**
  - Show a prominent top-center banner: **`⏰ Time's Up!`** (amber) when `selectedIdx === -1`, **`Correct!`** (emerald) when `correct === true`, and **`Wrong`** (crimson) when `selectedIdx !== -1 && !correct`.
  - On the correct answer row, only show `"✓ Correct answer"` when `correct === true`; when `selectedIdx === -1` or `!correct`, label it `"Correct answer: <option>"` without a green checkmark so it never looks like the player answered correctly.

### Phase 11: Prevent Clues/Poll from Pushing Answer Options Out of Viewport (`GameScreen.tsx`, `CardView.tsx`, `ChoiceButtons.tsx`)

**Problem:** The `CommunityStatsDisplay` (4-row COMMUNITY PICKS box) and `LifelineBar` are rendered INSIDE `.paper-card` (CardView.tsx lines 131-154), causing the card to grow beyond `100dvh` on mobile 375×667 and spawn a grey inner scrollbar.

**Fix — 3-Zone Compact Layout:**

**Zone 1 — Top Bar (`shrink-0`, ≤52px tall):**
- Compact single-row header: "Tandem Daily" brand on left + circular `.glass` timer on right
- Timer: `rounded-full font-display font-bold text-primary` (turns `text-destructive` at ≤5s), shows `15s` or `OFF`
- `aria-label="Disable timer"` / `"Enable timer"` (must match Vitest)

**Zone 2 — Center Cream `.paper-card` (`flex-1 min-h-0`, NO `overflow-y-auto`):**
- Contains ONLY:
  - `CARD X / 5` header label
  - `TargetLanguagePrompt` pill (`Guess the JAPANESE meaning`)
  - Large `Noto Serif JP` Kanji (`text-4xl sm:text-5xl md:text-6xl`) with on-top clipped crimson radical glow
  - Compact 1-line X-Ray radical badge (warm parchment tint `bg-amber-900/10 border-amber-900/25 text-paper-ink`)
  - Compact 1-line `🎭` clue pills (NOT a multi-row list)
  - `TrapBadge` (for en mode false friends)
- **REMOVE from inside `.paper-card`:**
  - `CommunityStatsDisplay` (entire component)
  - `LifelineBar` (entire component)
  - `CluesDisplay` multi-row list (replace with compact 1-line pills)

**Zone 3 — Bottom (`shrink-0`):**
- **Above ChoiceButtons:** Compact `"Community Picks"` eyebrow label (1-line, only when `communityStats` active)
- **ChoiceButtons:** `grid grid-cols-2 md:flex md:justify-center gap-2` of `.paper-card` buttons
  - `A/B/C/D` in top-left corner
  - Poll `%` badge in top-right corner (inside the card, NOT hanging outside)
  - `opacity-25 line-through` when eliminated
- **Below ChoiceButtons:** `LifelineBar` in `.glass` tray (`grid grid-cols-4 gap-1.5`)
  - 4 buttons: `✂️ 50/50`, `🔍 X-Ray`, `🎭 20-Q`, `📊 Poll`
  - Revealed `🎭` clue pills appear inside this glass tray (high-contrast `text-foreground`)

### Phase 12: Enforce Full-Viewport Bounding Box Check in `tests/e2e/fullGame.spec.ts`

Add a helper `assertAllChoicesFullyInViewport(page)` that activates **all available lifelines (`50/50`, `X-Ray` if enabled, `20-Q` twice, and `Poll`) on a single card**, and then asserts for all 4 `answer-option-0..3` buttons that:
- `box.y >= 0`
- `box.y + box.height <= viewport.height`
- `box.x >= 0`
- `box.x + box.width <= viewport.width`
- **Zero vertical scrollbars:** `document.documentElement.scrollHeight <= window.innerHeight`
- **Zero inner scrollable overflow:** `[data-testid="question-card"]` `scrollHeight <= clientHeight + 2`
- **All 4 `lifeline-*` buttons** have `boundingBox()` 100% inside `window.innerHeight`

Also test a timeout reveal (`selectedIdx === -1`) or verify `RevealView` never displays `"Correct!"` when wrong.

### Phase 12b (Red-Green TDD): Explicit E2E Tests for Phases 5, 10, 13 & 14

Add the following tests to `tests/e2e/fullGame.spec.ts` (RED first, then implement GREEN):

#### Test 1: X-Ray Clip-Path Overlay (Phase 5)
```typescript
test('X-Ray radical overlay renders clipped crimson glow on kanji', async ({ page }) => {
  // ... navigate to Card 2 (where radical is available)
  const xrayBtn = page.locator('[data-testid="lifeline-xray"]');
  await xrayBtn.click();
  
  // Assert overlay is visible with clipPath
  const overlay = page.locator('[data-testid="xray-radical-overlay"]');
  await expect(overlay).toBeVisible({ timeout: 5000 });
  
  const clipPath = await overlay.evaluate(el => getComputedStyle(el).clipPath);
  expect(clipPath).toContain('inset(');
  
  // Assert overlay bounding box sits inside kanji character bounds
  const kanjiBox = await page.locator('[data-testid="question-card"] .kanji-display').boundingBox();
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox.x).toBeGreaterThanOrEqual(kanjiBox.x);
  expect(overlayBox.width).toBeLessThanOrEqual(kanjiBox.width);
});
```

#### Test 2: 20-Q Non-Empty Clues (Phase 5)
```typescript
test('20-Q clues are never blank', async ({ page }) => {
  // ... navigate to Card 3
  const twentyQBtn = page.locator('[data-testid="lifeline-20q"]');
  await twentyQBtn.click();
  await twentyQBtn.click(); // use twice
      
  const clueElements = page.locator('[data-testid="question-card"] .clue-pill');
  const count = await clueElements.count();
  expect(count).toBeGreaterThanOrEqual(2);
  
  for (let i = 0; i < count; i++) {
    const text = await clueElements.nth(i).innerText();
    expect(text.trim().length).toBeGreaterThan(5); // never blank
    expect(text).toContain('🎭'); // must include emoji
  }
});
```

#### Test 3: 15s Timeout Reveal (Phase 10)
```typescript
test('timer expiry shows Time\'s Up without Correct! banner', async ({ page }) => {
  // Install clock before navigation
  await page.clock.install();
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__TEST_PAUSE_TIMER__ = false;
  });
  
  await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="start-button"]').click();
  await page.locator('[data-testid="question-card"]').waitFor({ state: 'visible', timeout: 10000 });
  
  // Fast-forward 16 seconds (past the 15s timer)
  await page.clock.fastForward(16000);
  
  // Assert reveal-card appears
  await expect(page.locator('[data-testid="reveal-card"]')).toBeVisible({ timeout: 5000 });
  
  // Assert "Time's Up!" banner appears
  await expect(page.locator('text=/Time\'s Up!/i')).toBeVisible();
  
  // Assert "Correct!" banner does NOT appear
  await expect(page.locator('[data-testid="reveal-card"]')).not.toContainText('Correct!');
  
  // Assert "✓ Correct answer" label does NOT appear
  const revealCard = page.locator('[data-testid="reveal-card"]');
  await expect(revealCard).not.toContainText('✓ Correct answer');
});
```

#### Test 4: Auto-Submit Score on Game End (Phase 13)
```typescript
test('score is auto-submitted on game end with all 5 answers', async ({ page }) => {
  // ... play through all 5 cards quickly
  
  // Intercept the POST /api/score request
  const scoreRequestPromise = page.waitForRequest('**/api/score');
  
  // Click "See Final Score →" on Card 5
  await page.locator('[data-testid="next-card-button"]').click();
  
  // Await the score request
  const scoreRequest = await scoreRequestPromise;
  expect(scoreRequest.url()).toContain('/api/score');
  expect(scoreRequest.method()).toBe('POST');
  
  // Verify payload includes all 5 answers
  const payload = scoreRequest.postDataJSON();
  expect(payload.answers).toHaveLength(5);
});
```

**RED → GREEN TDD:**
1. Add all 4 tests to `tests/e2e/fullGame.spec.ts`
2. Run `npx playwright test --reporter=line` — confirm they FAIL (RED)
3. Implement the features to make them pass:
   - `KanjiRadicalDisplay.tsx`: Add `data-testid="xray-radical-overlay"` to the overlay span
   - `useDailyGame.ts`: Ensure clues array is populated with non-empty text
   - `useDailyGame.ts`: On timer expiry, append `{ cardIdx, choiceIdx: -1, correct: false }` to answers
   - `RevealView.tsx`: Show `"Time's Up!"` banner when `selectedIdx === -1`
   - `GameScreen.tsx`: Auto-submit score is already wired (Phase 13)
4. Run `npx playwright test --reporter=line` — confirm they PASS (GREEN)

### Phase 13: Auto-Submit Daily Score & Poll Votes on Game End (`GameScreen.tsx`)
- Add a `useEffect` in `GameScreen.tsx` that automatically calls `void game.submitScore()` once when `game.phase === "ended"` and `!game.practiceMode` (guarded by a `submittedRef` so it never fires twice), rather than waiting for the user to click "Share Score to Comments".

### Phase 14: Add Early-Day Seeded Poll Priors & Global Redis (`src/server/routes/api.ts`)
- **`getStats(puzzleNumber, cards)`:** If the total real Redis votes for a card (`Object.values(cardStats).reduce(...)`) is fewer than 5, seed realistic initial vote weights (e.g., 3 votes on the correct answer and 2 votes on the false-friend trap option, or 1 vote on other options) and add the real Redis votes on top so the very first players on a newly installed live subreddit still see a helpful breakdown while real player votes immediately shift the percentages.
- **Use `redis.global` for Poll Stats (with fallback guard):** In `getStats(puzzleNumber)`, use `const pollRedis = redis.global ?? redis;` then read `await pollRedis.hGetAll(key)`. In `POST /api/score`, increment votes using `await pollRedis.hIncrBy(statKey, ans.choiceIdx.toString(), 1)`. **CRITICAL:** The `?? redis` fallback ensures unit test mocks (which only mock `redis`, not `redis.global`) continue passing without modifying `gameFlow.test.tsx`.

### Phase 15: Verify & Commit (Solo Baseline)
- Run `npm run verify` (`lint`, `test:types`, `test`, `test:e2e`, `build`)
- Fix any issues until all pass
- Commit to `main`

---

### Phase 16 (Red-Green TDD): Voice Host + Multiplayer Rooms & Table Chat + E2E Tests

**Goal:** Add multilingual Voice Host (`window.speechSynthesis`) AND multiplayer rooms (`Create Room`, `Join via 5-Letter Code`, synchronized 5-card rounds, live player scores, collapsible `Table Chat`) using Devvit Redis (`redis.global ?? redis`), following strict **Red → Green TDD**.

**Non-Negotiable:** Solo Daily/Practice mode, all existing `data-testid` contracts, `gameFlow.test.tsx` selectors, and `fullGame.spec.ts` playthrough remain untouched. No `Socket.IO`, no `@devvit/public-api`, no `cursor: none`.

#### ASCII Wireframe: StartScreen (Solo + Multiplayer)

```
┌─────────────────────────────────────────────┐
│  CHINESE × JAPANESE      Tandem Daily       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🎮 SOLO MODE                       │   │
│  │  🇨🇳→🇯🇵  🇯🇵→🇨🇳  🕵️ English    │   │
│  │  [▶ Play Today]                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  👥 MULTIPLAYER TABLE               │   │
│  │  [Create Room]                      │   │
│  │  ┌─────┐ [Join]                    │   │
│  │  │ ABCDE│                           │   │
│  │  └─────┘                            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### ASCII Wireframe: Multiplayer Lobby (Mobile 375×667)

```
┌─────────────────────────────────────────────┐
│  Tandem Daily  🔊  ⏱️ OFF  🚪 Leave       │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐  │
│  │  ROOM: ABCDE  [📋 Copy]            │  │  ← Room code pill
│  │                                     │  │
│  │  PLAYERS (3/8)                      │  │
│  │  🥇 @alice    0 pts   ✓ Ready      │  │  ← Live scoreboard
│  │  🥈 @bob      0 pts   ✓ Ready      │  │
│  │  🥉 @charlie  0 pts   ✓ Ready      │  │
│  │                                     │  │
│  │  💬 Table Chat                      │  │  ← Collapsible chat
│  │  ┌─────────────────────────────┐   │  │
│  │  │ @alice: anyone else here?   │   │  │
│  │  └─────────────────────────────┘   │  │
│  │  [Type a message...] [Send]        │  │
│  │                                     │  │
│  │  [▶ Start Match (Host Only)]       │  │  ← data-testid="start-room-button"
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### ASCII Wireframe: Voice Host in Game

```
┌─────────────────────────────────────────────┐
│  Tandem Daily  🔊  ⏱️ 15s                 │  ← 🔊 = voice toggle
├─────────────────────────────────────────────┤
│  (Voice Host speaks:                       │
│   "The word is 手紙. Is it A, tegami?     │
│    B, arigatou? C, gakkou? Or D, sensei?")│
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  CARD 1 / 5                         │   │
│  │  🇯🇵 Guess the JAPANESE           │   │
│  │        手紙                          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### Step 1 (RED): Write Failing Playwright E2E Tests (`tests/e2e/voiceAndMultiplayer.spec.ts`)

Create `tests/e2e/voiceAndMultiplayer.spec.ts` covering both mobile (`375×667`) and desktop (`1280×800`):

**1. Voice Host Test (`window.speechSynthesis` spy):**
- In `page.addInitScript`, stub `window.speechSynthesis` (`speak`, `cancel`, `getVoices`) and record spoken utterances in `window.__SPOKEN_LINES__` and cancel calls in `window.__CANCEL_COUNT__`.
- Click `Play Today` (`data-testid="start-button"`): assert `window.__SPOKEN_LINES__.length > 0` (unlocks audio on click and narrates Card 1).
- Click `[data-testid="host-mute-toggle"]` to mute: assert `window.__CANCEL_COUNT__ > 0` and advancing to reveal does not push new utterances while muted.

**2. Multiplayer Room Creation, Join, Chat & Match Start Test:**
- Stateful route mock for `/api/rooms`, `/api/rooms/:code/join`, `/api/rooms/:code/start`, `/api/rooms/:code/chat`, and `GET /api/rooms/:code`.
- Click `[data-testid="create-room-button"]`: assert `[data-testid="room-lobby"]` renders with a 5-letter room code (`[data-testid="room-code-display"]`) and host player listed.
- Type `"Hello table!"` into `[data-testid="room-chat-input"]` and submit: assert `"Hello table!"` appears in `[data-testid="room-chat-messages"]`.
- Click `[data-testid="start-room-button"]`: assert transition to `[data-testid="question-card"]` with all 4 `answer-option-0..3` buttons 100% inside the `375×667` viewport (`box.y + box.height <= viewport.height`) and zero scrollbars.

**Run `npx playwright test tests/e2e/voiceAndMultiplayer.spec.ts` and confirm it FAILS (RED) before writing implementation code.**

#### Step 2 (GREEN): Implement Voice Host & Multiplayer Rooms

**2A. Multilingual Voice Host (`src/client/lib/host.ts` & `src/client/hooks/useVoiceHost.ts`):**
- Port `HOST_LANGS` (`en`, `zh`, `ja`, `es`, `ar`, `fr`), `LINES`, and `splitScripts` from `tandem-ref/tandem-app/client/src/lib/host.ts`.
- Unlock audio on `Play Today` / mute button click (`AudioContext.resume()` + silent `SpeechSynthesisUtterance('')`) so Reddit iframes allow speech.
- Narrate new cards, reveals (`Correct!` / `Wrong` + meanings), and end-of-round scores; cancel speech immediately when `[data-testid="host-mute-toggle"]` is muted.

**2B. Multiplayer Rooms & Table Chat:**
- **`src/shared/room.ts`:** `RoomPlayer`, `RoomChatMessage`, `RoomState` types + `canStart`, `canAdvance`, `everyoneAnswered`, `generateRoomCode` (excludes I/O/0/1).
- **`src/server/routes/api.ts`:** `const store = redis.global ?? redis;` (2-hour TTL `expire(key, 7200)`):
  - `POST /api/rooms` — Create room, deal 5 cards, add host
  - `POST /api/rooms/:code/join` — Add player (max 8)
  - `GET /api/rooms/:code` — Return room snapshot (404 if expired)
  - `POST /api/rooms/:code/start` — Host-only: `"lobby"` → `"playing"`
  - `POST /api/rooms/:code/answer` — Record `{ choiceIdx, correct, pointsDelta }`
  - `POST /api/rooms/:code/next` — Advance `currentCard` or set `"ended"` after card 5
  - `POST /api/rooms/:code/chat` — Append sanitized message (max 140 chars, latest 30)
- **`src/client/hooks/useMultiplayerRoom.ts`:** Poll `GET /api/rooms/${room.code}` every 1500ms while room is active.
- **`StartScreen.tsx`:** Keep existing solo radios + `start-button` untouched. Add `.glass` **Multiplayer Table** bar with `create-room-button`, `room-code-input`, `join-room-button`.
- **`GameScreen.tsx`:** When `room?.status === "lobby"`: render Room Lobby with `room-lobby`, `room-code-display`, player list, `room-chat-input`/`room-chat-messages`, `start-room-button`. During multiplayer rounds: reuse `CardView`, `ChoiceButtons`, `RevealView`, `LifelineBar` + compact player scoreboard strip + collapsible `💬` Chat toggle.

#### Step 3 (VERIFY): Run Full Verification Gate
- Run ONLY `npm run verify` (`lint`, `test:types`, `test`, `test:e2e`, `build`) until all unit tests and both Playwright E2E specs (`fullGame.spec.ts` + `voiceAndMultiplayer.spec.ts`) pass with 0 errors.
- Commit to `main`.

---

### Phase 17 (Red-Green TDD): Community Word Pool + Personal Traps + Leaderboard + Settings/HowToPlay Modals

**Goal:** Add Community Word Pool CRUD + voting, Personal Missed Words ("My Traps") with trap practice mode, Direction-Split Leaderboard, 5-Theme Switcher, How to Play modal, and Toast notifications — following strict **Red → Green TDD**.

**Non-Negotiable:** All modal trigger buttons live on `StartScreen` and `EndScreen` ONLY (hidden during `phase === "playing"` so `gameFlow.test.tsx`'s choice-button filter is untouched). No `@devvit/public-api`.

#### ASCII Wireframe: StartScreen with Modal Triggers (Mobile 375×667)

```
┌─────────────────────────────────────────────┐
│  CHINESE × JAPANESE      Tandem Daily       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🎮 SOLO MODE                       │   │
│  │  🇨🇳→🇯🇵  🇯🇵→🇨🇳  🕵️ English    │   │
│  │  [▶ Play Today]                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🏆 Leaderboard  📖 Word Pool      │   │  ← Modal triggers
│  │  🎯 My Traps     ❓ How to Play    │   │
│  │  ⚙️ Settings                        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  👥 MULTIPLAYER TABLE               │   │
│  │  [Create Room]  [ABC__] [Join]      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### ASCII Wireframe: Settings Modal (5-Theme Switcher)

```
┌─────────────────────────────────────────────┐
│  ⚙️ SETTINGS                        [X]    │
├─────────────────────────────────────────────┤
│                                             │
│  TABLE THEME                                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│  │Felt │ │Lib  │ │Neon │ │Ink  │ │Lacq ││  ← data-testid="theme-option-*"
│  │ ✓   │ │     │ │     │ │     │ │     ││
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘│
│                                             │
│  HOST LANGUAGE                              │
│  [EN] [中文] [日本語] [ES] [AR] [FR]     │
│                                             │
│  [Done]                                     │
└─────────────────────────────────────────────┘
```

#### ASCII Wireframe: Leaderboard Modal

```
┌─────────────────────────────────────────────┐
│  🏆 LEADERBOARD                    [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  [🇨🇳→🇯🇵 zh2ja] [🇯🇵→🇨🇳 ja2zh] [🕵️ en] │  ← Direction tabs
│                                             │
│  🥇 @alice    500/500  🔥7                │
│  🥈 @bob      480/500  🔥5                │
│  🥉 @charlie  450/500  🔥3                │
│  4. @dave     420/500  🔥2                │
│  5. @eve      400/500  🔥1                │
│                                             │
└─────────────────────────────────────────────┘
```

#### ASCII Wireframe: Community Word Pool Modal

```
┌─────────────────────────────────────────────┐
│  📖 WORD POOL                      [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  [Search words...]                          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  便宜 (JP: convenience)              │   │
│  │  ZH: cheap · FALSE FRIEND           │   │
│  │  👍 5  👎 1  [Edit] [Delete]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  + Add New Word                     │   │
│  │  Form: [___] JP: [___]             │   │
│  │  ZH: [___] Relation: [v]           │   │
│  │  [Submit]                           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### ASCII Wireframe: My Traps Modal

```
┌─────────────────────────────────────────────┐
│  🎯 MY TRAPS                       [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  Words you've missed (3):                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  手紙 · False Friend · missed 3×    │   │
│  │  [Clear]                            │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  学校 · Half Friend · missed 2×    │   │
│  │  [Clear]                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [▶ Practice My Traps]                     │  ← data-testid="practice-traps-button"
│                                             │
└─────────────────────────────────────────────┘
```

#### Step 1 (RED): Write Failing Playwright E2E Tests (`tests/e2e/communityAndPersonal.spec.ts`)

Create `tests/e2e/communityAndPersonal.spec.ts` covering both mobile (`375×667`) and desktop (`1280×800`):

**1. 5-Theme Table Switcher & How to Play Modals:**
- Click `[data-testid="open-settings-button"]`, select `"neon"` (`[data-testid="theme-option-neon"]`), and assert `document.documentElement.getAttribute("data-theme") === "neon"`.
- Click `[data-testid="open-howtoplay-button"]` and assert `[data-testid="howtoplay-modal"]` displays rules for `True Friend`, `False Friend`, and `Half Friend`.

**2. Direction-Split Leaderboard:**
- Mock `GET /api/leaderboard` returning distinct rankings per direction.
- Click `[data-testid="open-leaderboard-button"]`, switch direction tabs (`[data-testid="leaderboard-tab-ja2zh"]`), and assert the Japanese → Chinese rankings render.

**3. Community Word Pool (Full CRUD + Voting + Validation):**
- Mock `GET /api/words`, `POST /api/words`, `PATCH /api/words/:id`, `DELETE /api/words/:id`, and `PUT /api/words/:id/vote`.
- Open `[data-testid="open-wordpool-button"]`, submit a new word (`便宜`, JP `"convenience"`, ZH `"cheap"`, relation `"false"`), verify toast feedback (`"Word added"`), upvote it, edit its meaning, and delete it.

**4. Personal Missed Words ("My Traps") & "Practice My Traps":**
- Mock `GET /api/me/missed` and `DELETE /api/me/missed/:wordId`.
- Open `[data-testid="open-traps-button"]`, verify missed words render with miss count, dismiss one with `[data-testid="clear-trap-button"]`, and click `[data-testid="practice-traps-button"]` to launch a round using those trap words.

**Run `npx playwright test tests/e2e/communityAndPersonal.spec.ts` and confirm it FAILS (RED) before writing implementation code.**

#### Step 2 (GREEN): Implement All Features

**2A. Shared Word Validation (`src/shared/validateWord.ts`):**
- Port `validateWord` from `tandem-ref/tandem-app/client/src/lib/words.ts` (validating 1–8 CJK/kana characters, Latin romaji/pinyin, required meanings, true-friend meaning match, false-friend difference, and duplicate rejection against built-in + community words).

**2B. Serverless Redis Endpoints (`src/server/routes/api.ts` using `const store = redis.global ?? redis;`):**
- **Direction-Split Leaderboard:** Update `POST /api/score` to record each user's best score per direction (`leaderboard:${direction}` sorted set) and add `GET /api/leaderboard?direction=zh2ja|ja2zh|en`.
- **Community Word Pool CRUD & Voting:** Add `GET /api/words` (filter by `relation` and search `q`), `POST /api/words` (validated with `validateWord`, auto-adds author's upvote), `PATCH /api/words/:id` (author-only), `DELETE /api/words/:id` (author-only), and `PUT /api/words/:id/vote`. Merge community words with `>= 2` net votes into `dealDailyCards` tagged `"Community word by @username"`.
- **Personal Missed Words ("My Traps"):** In `POST /api/score` (and `POST /api/me/missed`), increment `missCount` and `lastMissedAt` in Redis (`missed:${username}`) for every wrong or timed-out card. Add `GET /api/me/missed` and `DELETE /api/me/missed/:wordId`.

**2C. UI Modals, 5-Theme Switcher, Toast Banner & Trap Practice (`src/client/`):**
- **Safe Header Placement:** Render the modal trigger pills (`Leaderboard`, `Word Pool`, `My Traps`, `How to Play`, `Settings`) on `StartScreen` and `EndScreen` (and hide them during active `phase === "playing"` rounds so `gameFlow.test.tsx`'s button filter stays untouched).
- **Settings & How to Play (`SettingsModal.tsx`, `HowToPlayModal.tsx`):** Allow switching all 5 table themes (`felt`, `library`, `neon`, `ink`, `lacquer`) live via `document.documentElement.dataset.theme` + `localStorage`, plus a clean modal explaining friend types, lifelines, and scoring.
- **Toast Notifications (`ToastBanner.tsx`):** Lightweight non-blocking `.glass` toast notification for word CRUD, votes, score saves, trap clears, and room code copies.
- **Trap Practice Mode (`useDailyGame.ts`):** Add `startTrapPractice(trapWords)` so clicking `"Practice My Traps"` starts a round dealt directly from the player's missed words.

#### Step 3 (VERIFY): Run Full Verification Gate
- Run ONLY `npm run verify` (`lint`, `test:types`, `test`, `test:e2e`, `build`) until all unit tests and all Playwright E2E specs (`fullGame.spec.ts`, `voiceAndMultiplayer.spec.ts`, `communityAndPersonal.spec.ts`) pass with 0 errors.
- Commit and push to `main`.

---

## Dependencies & Order
```
Phase 1 (table-felt.jpg) → Phase 2 (index.css) → Phase 3 (Deck.tsx) → Phase 4 (Cinematic/RevealFlare) → 
Phase 5 (CardView) → Phase 6 (ChoiceButtons) → Phase 7 (RevealView) → Phase 8 (GameScreen) → 
Phase 9 (EndScreen) → Phase 10 (Timeout reveal fix) → Phase 11 (Viewport fit) → Phase 12 (E2E bounding box) → 
Phase 12b (RED: E2E tests for Phases 5/10/13/14) → Phase 12b (GREEN: implement to pass) → 
Phase 13 (Auto-submit score) → Phase 14 (Global Redis poll) → Phase 15 (Verify & Commit Solo) → 
Phase 16 (RED: voiceAndMultiplayer.spec.ts) → Phase 16 GREEN (Voice Host + Multiplayer) → Phase 16 VERIFY → 
Phase 17 (RED: communityAndPersonal.spec.ts) → Phase 17 GREEN (Community/Traps/Leaderboard/Settings) → Phase 17 VERIFY → Commit & Push
```

---

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Tailwind v4 `@utility` syntax conflicts | Use `@utility` with simple class names, avoid `:hover` in utility names |
| `preserve-3d`/`backface-hidden` not in Tailwind v4 | Add custom utilities or inline styles |
| `color-mix()` browser support | Provide fallback with `oklch()` directly |
| **Vitest tests break due to changed text/classes** | **DO NOT modify `gameFlow.test.tsx`.** Keep exact text strings, emoji, and class names. See Critical Constraints section above for full list. |
| **Eliminated choices class check** | **MUST use `opacity-25` or `line-through`** (NOT `opacity-15 grayscale`). Vitest checks `b.className.includes('opacity-25') || b.className.includes('line-through')` |
| **Mobile viewport overflow** | Use `h-[100dvh] overflow-hidden`, constrain `.paper-card` to `max-h-[45dvh]`, ChoiceButtons in `shrink-0` bottom area |
| `framer-motion` import issues | Ensure `framer-motion` is in `package.json` dependencies |
| **RevealView on dark background** | **CRITICAL:** Render on cream `.paper-card` with `text-paper-ink`, NOT dark background. Badge is `bg-accent text-accent-foreground` text-only, no emojis |
| **EndScreen heading text mismatch** | **MUST use `Perfect!`/`Good Job!`/`Keep Learning!`/`Wrong`** (NOT `Victory`/`Defeat`). Vitest checks `/Perfect|Good Job|Keep Learning|Wrong/i` |
| **Timer OFF text missing** | When timer disabled, **MUST render text `OFF`**. Vitest checks `screen.getByText(/OFF/)` |
| **Poll stats text mismatch** | **MUST render text `Community Picks`**. Vitest checks `screen.getByText(/Community Picks/i)` |
| **20-Q clue emoji missing** | **MUST render `🎭` emoji in clue text**. Vitest checks `screen.getAllByText(/🎭/i)` |
| **Timeout reveal shows "Correct"** | When `selectedIdx === -1`, show `⏰ Time's Up!` banner and `Correct answer: <option>` label (NOT `✓ Correct answer`) |
| **Clues push buttons off-screen** | **3-zone layout:** Zone 1 (top bar, shrink-0) + Zone 2 (flex-1 min-h-0, NO overflow-y-auto) + Zone 3 (bottom, shrink-0 with ChoiceButtons + LifelineBar). CommunityStatsDisplay REMOVED from inside .paper-card. Poll % moved to top-right corner of each answer-option card. |
| **Grey inner scrollbar on mobile** | `GameScreen` outer: `h-[100dvh] overflow-hidden flex flex-col`. Zone 2: `flex-1 min-h-0` (no overflow-y-auto). Zone 3: `shrink-0`. Zero `scrollHeight > clientHeight` on `.paper-card` |
| **Poll stats inside .paper-card** | **REMOVED from CardView.tsx.** Display compact "Community Picks" eyebrow above ChoiceButtons + % badge inside each answer-option card top-right corner |
| **Global Redis not available** | Use `const store = redis.global ?? redis;` — live Reddit uses `redis.global` for cross-subreddit data; unit test mocks (which only mock `redis`) fall back to `redis` automatically |
| **StartScreen label mismatch** | **MUST keep exact strings:** `I know Chinese → guess Japanese`, `I know Japanese → guess Chinese`, `I know neither — Visual Detective`, `Play Today`. Only restyle container/chips, do NOT change label text |
| **Poll has < 5 votes on day 1** | Seed 3 votes on correct + 2 on trap option when total < 5, then add real votes on top |
| **Multiplayer room Redis key collision** | Use `room:${code}` with 2-hour TTL. Room codes are 5 chars from 32-char alphabet (excluding I/O/0/1) = ~33M combinations. Collision probability negligible. |
| **Multiplayer polling overhead** | Poll every 1500ms only while room is active. Single GET request per poll. Redis is in-memory, sub-ms latency. |
| **Voice Host autoplay blocked in iframe** | Call `unlockVoice()` on first user click (Start button). Speaks empty utterance + resumes AudioContext. Subsequent `speechSynthesis.speak()` calls work. |
| **Voice Host speechSynthesis unavailable** | Guard with `typeof window !== "undefined" && "speechSynthesis" in window`. Gracefully degrade to no-op. |
| **Multiplayer chat XSS** | Sanitize message text (strip HTML tags, max 140 chars, escape entities) before storing in Redis. |
| **TDD RED phase tests hang** | Use `test.fail()` or short timeouts (5s) on new E2E tests so RED phase fails fast rather than hanging. |
| **Multiplayer tests interfere with solo E2E** | Route-mock `/api/rooms/*` in `voiceAndMultiplayer.spec.ts` only; `fullGame.spec.ts` continues to use offline fallback with no room state. |
| **Modal triggers break choice button filter** | Render modal trigger pills ONLY on `StartScreen`/`EndScreen` (hidden during `phase === "playing"`). `gameFlow.test.tsx`'s filter excludes buttons with `✂️`/`🔍`/`🎭`/`📊`/`⏱️` text — modal pills use different text. |
| **Theme switcher doesn't persist** | Store in `localStorage["tandem-theme"]` + set `document.documentElement.dataset.theme` on mount and on change. Default: `"felt"`. |
| **Community word CRUD XSS** | Sanitize all text fields (strip HTML, max lengths) before storing in Redis. `validateWord` enforces character set restrictions (CJK/Latin only). |
| **Trap practice mode deals wrong cards** | Use `dealDailyCards` with a seed derived from `Date.now()` and pass the player's trap words as the word pool. If fewer than 5 trap words, supplement with random words. |
| **Leaderboard sorted set per direction** | Use `redis.zAdd("leaderboard:${direction}", { score, value: username })` on `POST /api/score`. Query with `redis.zRange("leaderboard:${direction}", 0, 9, { REV: true })`. |
| **Toast notification overlaps choice buttons** | Render toast as `fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none` so it never blocks clicks on choice buttons. |

---

## Plan File
`.kilo/plans/kiroween-finalize-plan.md`