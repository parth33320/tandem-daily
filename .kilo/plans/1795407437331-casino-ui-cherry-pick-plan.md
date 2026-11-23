# Plan: Cherry-pick 4 clean improvements onto `main` (7fbe0a8)

## Goal

Bring exactly four clean improvements from `wip-casino-ui` onto the clean `main`
baseline **without** changing the responsive UI layout and **without** resurrecting
`PageCard`, `Cinematic`, `Deck`, `HandCursor`, `src/shared/game/*`, or any other
part of the large `wip-casino-ui` refactor.

After implementation, `npm run verify` (lint + type-check + unit + Playwright E2E +
build) must pass with 0 errors, and the work is committed to `main`.

## Guardrails (must hold)

- Do **not** `git checkout wip-casino-ui -- <broad paths>`. Only check out the exact
  paths listed below (`.kiro`, `src/shared/wordPool.ts`, `vite.local.config.ts`).
- Do **not** modify the layout/markup of `StartScreen.tsx`, `CardView.tsx`,
  `ChoiceButtons.tsx`, `RevealView.tsx`, `EndScreen.tsx` — only add `data-testid`
  attributes.
- Never remove/rename an existing `data-testid` or radio accessibility role.
- Do not commit the untracked `.audit/` directory.
- After each task, run the relevant checks before moving on.

## Current-state findings (evidence)

- `main` has no `tests/`, `playwright.config.ts`, `vite.local.config.ts`, `.kiro/`,
  `.githooks/`, or `@playwright/test` dependency.
- `src/client/lib/words.d.ts` is stale: it imports `@/data/wordPool` and its `Word`
  interface has **no** `clues` / `radical`. `src/client/lib/words.js` likewise imports
  `@/data/wordPool`. Vite's default `resolve.extensions` puts `.js` before `.ts`, so the
  app currently executes the stale compiled files. Deleting the compiled siblings is the
  actual fix that makes `words.ts` expose all 308 `clues`/`radical` fields.
- `wip-casino-ui:tests/e2e/fullGame.spec.ts` is missing `page.goto('/game.html')` and
  uses CSS selectors (`.clue-pill`, `.similarity-bar`, `.text-gold/30`) that do not exist
  in the clean UI. It must be rewritten, not copied.
- `wip-casino-ui:src/client/hooks/useDailyGame.ts` already contains an AbortController
  fallback and a `__TEST_PAUSE_TIMER__` check, but is coupled to `src/shared/game/*`.
  We reimplement the same behaviour minimally against `src/client/lib/*`.

## Decisions (with rationale)

1. **Compiled-file cleanup scope** — delete compiled siblings in **both**
   `src/client/lib/` and `src/client/data/` (`*.js`, `*.js.map`, `*.d.ts`). The user
   named `src/client/lib/*`, but `src/client/data/wordPool.js|.d.ts` are the stale pool
   that `words.js` imports, so they must go too (matches the
   `no_compiled_shadowing_sources` project constraint).
2. **Timer during E2E** — add a one-line, inert-in-production guard in `startTimer`:
   `if ((window as unknown as { __TEST_PAUSE_TIMER__?: boolean }).__TEST_PAUSE_TIMER__) return;`
   The E2E test sets `window.__TEST_PAUSE_TIMER__ = true` inside `addInitScript`.
   This makes the 5-card run deterministic and matches the existing wip design.
3. **Playwright browsers** — run both `mobile` (375×667) and `desktop` (1280×800)
   projects on **chromium** (`browserName: 'chromium'` override on the iPhone 12 device
   descriptor). Install with `npx playwright install chromium`. This keeps setup small
   and avoids webkit flakiness while still exercising the mobile viewport.
4. **Fallback data** — reuse the exported `getTodaysPuzzleNumber()` / `getTodaysSeed()`
   from `@/lib/daily` and `dealDailyCards(puzzleNumber, direction, WORDS)` so local dev
   and Playwright boot instantly when `/api/daily` is unavailable.
5. **No layout change** — before/after wireframes are identical; only `data-testid`
   attributes are added.

## ASCII wireframe (unchanged layout; testids annotated)

```
┌───────────────────────────────────────┐
│ ⏱️ 15s  ▓▓▓▓▓▓▓░░░                    │  CardView top HUD (timer toggle)
│ ┌───────────────────────────────────┐ │
│ │ [JP] Guess the JAPANESE meaning   │ │
│ │              手紙                 │ │  data-testid="question-card"
│ │  ✂️50/50  🔍X-Ray  🎭20-Q  📊Poll │ │  lifeline-5050 / lifeline-xray /
│ └───────────────────────────────────┘ │  lifeline-20q / lifeline-poll
│ [answer-option-0] [answer-option-1]   │  ChoiceButtons
│ [answer-option-2] [answer-option-3]   │
└───────────────────────────────────────┘
Reveal:  data-testid="reveal-card" … [data-testid="next-card-button"]
End:     [data-testid="play-again-button"]
Start:   (radio) direction-zh2ja | direction-ja2zh | direction-en  [data-testid="start-button"]
```

## Tasks

### Task 1 — Restore `.kiro/`, 308-clue word pool, remove HandCursor

1. `git checkout wip-casino-ui -- .kiro src/shared/wordPool.ts`
2. Delete stale compiled duplicates (git rm):
   - `src/client/lib/content.js`, `content.js.map`, `content.d.ts`
   - `src/client/lib/daily.js`, `daily.js.map`, `daily.d.ts`
   - `src/client/lib/words.js`, `words.js.map`, `words.d.ts`
   - `src/client/data/wordPool.js`, `wordPool.js.map`, `wordPool.d.ts`
   (keep the `.ts` sources: `src/client/lib/{words,content,daily,hints}.ts`,
   `src/client/data/wordPool.ts`)
3. Remove HandCursor:
   - Delete `src/client/components/HandCursor.tsx`.
   - In `src/client/components/GameScreen.tsx`, remove `import { HandCursor } from "./HandCursor";`
     (line 2) and `<HandCursor />` (line 87).
4. Sanity-check the pool: confirm `src/client/lib/words.ts` still compiles against the
   checked-out `src/shared/wordPool.ts` (`PoolWord` with `clues`/`radical`). If
   `dist/types` has stale build info, delete `dist/` before type-checking.

### Task 2 — Offline fallback + `vite.local.config.ts`

1. `git checkout wip-casino-ui -- vite.local.config.ts`
   (root `src/client`, react + tailwind plugins, aliases `@` and `@/shared`). If the
   checked-out file trips on `__dirname` at runtime, recreate it using
   `fileURLToPath(new URL('.', import.meta.url))` with the same settings.
2. `package.json` scripts — add:
   - `"dev:local": "vite --config vite.local.config.ts"`
3. `src/client/hooks/useDailyGame.ts` — minimal, surgical edits:
   - Extend the `@/lib/daily` import to
     `import { dealDailyCards, getTodaysPuzzleNumber, getTodaysSeed } from "@/lib/daily";`
   - Add a direction ref near `timerRef`:
     ```ts
     const directionRef = useRef(direction);
     useEffect(() => {
       directionRef.current = direction;
     }, [direction]);
     ```
   - Replace `fetchDaily` body with a 1000 ms `AbortController` timeout + offline
     fallback (keep `fetchDaily` in the hook's return and keep deps `[]`):
     ```ts
     const fetchDaily = useCallback(async () => {
       const controller = new AbortController();
       const timeoutId = window.setTimeout(() => controller.abort(), 1000);
       try {
         const res = await fetch("/api/daily", { signal: controller.signal });
         if (!res.ok) throw new Error(`HTTP ${res.status}`);
         const data: DailyResponse = await res.json();
         if (data.type !== "daily") throw new Error("Unexpected response");
         setState((s) => ({ ...s, daily: data, loading: false, error: null }));
       } catch (err) {
         console.warn("Daily API unavailable, using offline fallback", err);
         const puzzleNumber = getTodaysPuzzleNumber();
         const daily: DailyResponse = {
           type: "daily",
           puzzleNumber,
           seed: getTodaysSeed(),
           username: "local",
           streak: 0,
           alreadyPlayed: false,
           cards: dealDailyCards(puzzleNumber, directionRef.current, WORDS),
           stats: {},
         };
         setState((s) => ({ ...s, daily, loading: false, error: null }));
       } finally {
         window.clearTimeout(timeoutId);
       }
     }, []);
     ```
   - In `startTimer`, add the test-pause guard immediately after the existing
     `if (!state.timerEnabled) return;` line:
     ```ts
     if ((window as unknown as { __TEST_PAUSE_TIMER__?: boolean }).__TEST_PAUSE_TIMER__) return;
     ```
4. Re-run `npm run test:types` and `npm test` (unit tests mock `fetch` success, so the
   fallback path is not exercised there; the timer guard is inert because jsdom leaves
   `window.__TEST_PAUSE_TIMER__` undefined).

### Task 3 — `data-testid` attributes + Playwright E2E

Add attributes only (no layout/class changes):

- `src/client/components/StartScreen.tsx`
  - main `<button>` → `data-testid="start-button"`
  - three radio `<input>`s → `data-testid="direction-zh2ja"`, `"direction-ja2zh"`, `"direction-en"`
- `src/client/components/CardView.tsx`
  - main card `<div className="w-full game-card p-3 sm:p-4 relative">` → `data-testid="question-card"`
  - add a `testid` field to each entry in `lifelinePills`
    (`lifeline-5050`, `lifeline-xray`, `lifeline-20q`, `lifeline-poll`) and render
    `data-testid={pill.testid}` on the mapped `<button>`
- `src/client/components/ChoiceButtons.tsx`
  - choice `<button>` → `data-testid={`answer-option-${idx}`}`
- `src/client/components/RevealView.tsx`
  - root `<div>` → `data-testid="reveal-card"`
  - Next button → `data-testid="next-card-button"`
- `src/client/components/EndScreen.tsx`
  - Play Again `<button>` → `data-testid="play-again-button"`

Add Playwright infra:

1. `package.json`:
   - devDependency `"@playwright/test": "^1.40.0"`, then run `npm install`.
   - scripts `"test:e2e": "playwright test"` and
     `"verify": "npm run lint && npm run test:types && npm test && npm run test:e2e && npm run build"`
     (keep main's existing `lint` script).
2. `playwright.config.ts` (new):
   ```ts
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: false,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: 1,
     reporter: 'line',
     use: {
       baseURL: 'http://127.0.0.1:5173',
       trace: 'on-first-retry',
       actionTimeout: 10000,
       navigationTimeout: 15000,
     },
     projects: [
       { name: 'mobile', use: { ...devices['iPhone 12'], browserName: 'chromium', viewport: { width: 375, height: 667 } } },
       { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
     ],
     webServer: {
       command: 'npm run dev:local -- --host 127.0.0.1 --port 5173',
       url: 'http://127.0.0.1:5173/game.html',
       reuseExistingServer: true,
       timeout: 30000,
     },
     timeout: 20000,
   });
   ```
3. `tests/e2e/fullGame.spec.ts` (new — simple playthrough; **must** include
   `page.goto` and the X-Ray `isEnabled()` guard):
   ```ts
   import { test, expect } from '@playwright/test';

   test.describe('Tandem Daily - Full Game Flow', () => {
     test('plays full 5-card game end-to-end', async ({ page }) => {
       const errors: string[] = [];
       page.on('pageerror', (err) => errors.push(err.message));

       await page.addInitScript(() => {
         (window as unknown as Record<string, unknown>).__DEVIT_WEB_CLIENT__ = {
           requestExpandedMode: () => {},
           navigateTo: () => {},
           showToast: () => {},
           showForm: () => {},
         };
         (window as unknown as Record<string, unknown>).__TEST_PAUSE_TIMER__ = true;
       });

       await page.goto('/game.html', { waitUntil: 'domcontentloaded' });

       await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });
       await page.locator('[data-testid="start-button"]').click();

       for (let cardNum = 1; cardNum <= 5; cardNum++) {
         await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });

         for (let i = 0; i < 4; i++) {
           await expect(page.locator(`[data-testid="answer-option-${i}"]`)).toBeVisible({ timeout: 10000 });
         }

         if (cardNum === 1) {
           await page.locator('[data-testid="lifeline-5050"]').click();
         } else if (cardNum === 2) {
           const xrayBtn = page.locator('[data-testid="lifeline-xray"]');
           if (await xrayBtn.isEnabled()) {
             await xrayBtn.click();
           }
         }

         await page.locator('[data-testid^="answer-option-"]:not([disabled])').first().click();

         await expect(page.locator('[data-testid="reveal-card"]')).toBeVisible({ timeout: 10000 });
         await page.locator('[data-testid="next-card-button"]').click();
       }

       await expect(page.locator('[data-testid="play-again-button"]')).toBeVisible({ timeout: 10000 });
       await expect(page.getByRole('heading', { name: /Perfect|Well Done|Keep Learning/i })).toBeVisible();

       await page.locator('[data-testid="play-again-button"]').click();
       await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });

       expect(errors).toEqual([]);
     });
   });
   ```
   Notes:
   - `isEnabled()` returns `false` for a missing X-Ray button (Card 2 word has no
     radical), so the guard never stalls.
   - `pageerror` is collected and asserted at the end (fail-fast with a clear diff).
   - The `__TEST_PAUSE_TIMER__` flag + Task 2 guard keep the 15 s timer from firing.
4. `.gitignore` — add `test-results/` and `playwright-report/`.

### Task 4 — Gate `verify` + `.githooks/pre-push`

1. `package.json` already has `test:e2e` and `verify` from Task 3.
2. Create `.githooks/pre-push`:
   ```sh
   #!/bin/sh
   npm run verify
   ```
3. `git config core.hooksPath .githooks`
4. `git update-index --chmod=+x .githooks/pre-push` (after staging) so the hook is
   executable on Unix checkouts.

## Validation (run in order)

```powershell
npm install
npx playwright install chromium
npx playwright test --workers=1 --reporter=line   # mobile + desktop, 5 cards + Play Again
npm run verify                                    # lint + types + unit + e2e + build
```

Expected: both `mobile` and `desktop` pass one test each; `verify` exits 0 with no lint,
type, unit, E2E, or build errors.

If `tsc --build` reports stale outputs from removed `.d.ts` files, delete `dist/` and
re-run `npm run test:types`.

## Commit

Stage only intended paths (do **not** stage `.audit/`):

- `.kiro/`, `src/shared/wordPool.ts`
- deleted: `src/client/lib/*.{js,js.map,d.ts}`, `src/client/data/*.{js,js.map,d.ts}`
- `src/client/components/GameScreen.tsx`, `src/client/components/StartScreen.tsx`,
  `src/client/components/CardView.tsx`, `src/client/components/ChoiceButtons.tsx`,
  `src/client/components/RevealView.tsx`, `src/client/components/EndScreen.tsx`
- deleted: `src/client/components/HandCursor.tsx`
- `src/client/hooks/useDailyGame.ts`
- `vite.local.config.ts`, `playwright.config.ts`, `tests/e2e/fullGame.spec.ts`
- `package.json`, `package-lock.json`, `.gitignore`, `.githooks/pre-push`

Suggested commit message:

```
Add offline fallback, data-testids, Playwright E2E, and verify gate
```

## Risks / notes

- `src/client/data/wordPool.ts` is legacy/dead (nothing imports `@/data` after the
  compiled files are removed). Leave the `.ts` in place; only compiled siblings go.
- If `npm run lint` flags `@typescript-eslint/no-floating-promises` on the new code,
  prefix fire-and-forget calls with `void` (the new fallback lives inside an `async`
  function, so it should not trigger this).
- `vite.local.config.ts` is not covered by `tsc --build` (tsconfig.vite only includes
  `vite.config.ts`); this is intentional and keeps `verify` focused on `src/`.

## Out of scope

- No `PageCard`, `Cinematic`, `Deck`, `HandCursor`, `src/shared/game/*`,
  `src/client/hooks/useCountdown.ts`, or other `wip-casino-ui`-only files.
- No UI/layout/restyling changes.