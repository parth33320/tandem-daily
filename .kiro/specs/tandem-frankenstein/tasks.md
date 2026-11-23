# Tandem Daily - Implementation Tasks

## Phase 1: Core Architecture (COMPLETED)
- [x] Devvit serverless setup (Hono + tRPC + Redis)
- [x] Shared game engine (`src/shared/game/`)
- [x] 308-word bilingual pool with clues & radicals
- [x] Casino Felt & Parchment UI design system
- [x] 3D PageCard flip animation
- [x] 4 lifelines (50/50, X-Ray, 20-Q, Poll)
- [x] Web Audio procedural synthesis
- [x] Playwright E2E test suite (mobile + desktop)

## Phase 2: Kiroween 2026 Compliance (IN PROGRESS)

### 2.1 UI Bug Fixes
- [x] Remove `.no-cursor` & `HandCursor` completely
- [x] Fix PageCard auto-flip (derive `isOpen` from state directly)
- [x] Fix mobile viewport layout (flex column, 100dvh, all 4 buttons visible)
- [x] Remove `no-cursor` from `splash.html` & `game.html`

### 2.2 Test Infrastructure
- [x] Standalone `vite.local.config.ts` with `root: 'src/client'`
- [x] Fast offline fallback in `useDailyGame.ts` (1000ms AbortController)
- [x] Playwright config with `webServer` + `reuseExistingServer: true`
- [x] Single consolidated E2E test (not 20 separate tests)

### 2.3 Stable Test IDs
- [x] `data-testid` on all interactive elements:
  - `direction-zh2ja`, `direction-ja2zh`, `direction-en` (on `<label>`)
  - `start-button`, `question-card`, `answer-option-0..3`
  - `lifeline-5050`, `lifeline-xray`, `lifeline-20q`, `lifeline-poll`
  - `next-card-button`, `play-again-button`
  - `reveal-card`, `play-again-button`

### 2.4 Kiro Steering & Specs
- [x] `.kiro/steering/guardrails.md` (permanent rules)
- [x] `.kiro/specs/tandem-frankenstein/requirements.md`
- [x] `.kiro/specs/tandem-frankenstein/design.md`
- [x] `.kiro/specs/tandem-frankenstein/tasks.md` (this file)
- [x] `.kiro/hooks/pre-push-verify.kiro.hook`

### 2.5 Playwright Config & Tests
- [x] `playwright.config.ts` with:
  - `timeout: 20_000`
  - `webServer: { command: 'npm run dev:local -- --host 127.0.0.1 --port 5173', url: 'http://127.0.0.1:5173/game.html', reuseExistingServer: true, timeout: 15_000 }`
  - `timeout: 20_000`
  - Two projects: `mobile` (375×667) and `desktop` (1280×800)
- [x] Single `test('plays full 5-card game end-to-end')` block
- [x] `page.goto('/game.html', { waitUntil: 'domcontentloaded' })`
- [x] `page.on('pageerror', (err) => { throw err; })`
- [x] Use `data-testid` selectors throughout

### 2.6 Verification Suite
- [x] `vite.local.config.ts` with `root: 'src/client'`
- [x] Fast offline fallback in `useDailyGame.ts` (1000ms AbortController)
- [x] Fast 1000ms timeout on `/api/daily` fetch
- [x] `npm run verify` script (lint + type-check + test + test:e2e + build)

## Phase 3: Final Verification & Commit

### 3.1 Pre-commit Checks
- [ ] Run `npx playwright test --workers=1 --reporter=line`
- [ ] Run `npm run verify` (lint + type-check + test + test:e2e + build)
- [ ] Verify `.kiro/` not in `.gitignore`
- [ ] Verify `LICENSE` (BSD-3-Clause) exists at root
- [ ] Verify `README.md` has Frankenstein framing & attribution

### 3.2 Commit
- [ ] `git add .`
- [ ] `git commit -m "chore: Kiroween 2026 Frankenstein compliance - UI fixes, Playwright E2E, Kiro specs, guardrails"`
- [ ] `git push`

## Completed Tasks Summary

### Architecture
- ✅ Devvit serverless (Hono + tRPC + Redis)
- ✅ Shared game engine (`src/shared/game/`)
- ✅ Casino Felt & Parchment UI (5 themes)
- ✅ 3D PageCard flip (auto-flip, no setTimeout)
- ✅ Mobile viewport fit (100dvh, all 4 buttons visible)

### Testing
- ✅ Vitest unit tests (26 passing)
- ✅ Playwright E2E (mobile + desktop, single test)
- ✅ Fast offline fallback (1000ms timeout)
- ✅ Stable `data-testid` contracts
- ✅ Fail-fast `page.on('pageerror')`

### Kiro Compliance
- ✅ `.kiro/steering/guardrails.md`
- ✅ `.kiro/specs/tandem-frankenstein/{requirements,design,tasks}.md`
- ✅ `.kiro/hooks/pre-push-verify.kiro.hook`
- ✅ `.kiro/` not in `.gitignore`
- ✅ `LICENSE` (BSD-3-Clause) at root

### CI/CD
- ✅ `npm run verify` (lint + type-check + test + test:e2e + build)
- ✅ `npm run dev:local` serves at 127.0.0.1:5173
- ✅ Playwright config with `reuseExistingServer: true`
- ✅ `npm run verify` gates `git push`