# Kiro Steering Guardrails for Tandem Daily

This document defines permanent, non-negotiable development rules for the Tandem Daily project. All contributors and AI agents must follow these rules without exception.

---

## 1. Surgical Edits Only

- **Modify only the specific functions, hooks, or JSX blocks required for a task.**
- **Never rewrite working files from scratch or delete existing features.**
- Prefer minimal, targeted changes over broad refactoring.
- If a change requires touching multiple unrelated areas, split into separate tasks.

---

## 2. Devvit & Mobile Viewport Invariants

These rules are **absolute** and must never be violated:

### 2.1 Cursor Behavior
- **Never use `cursor: none` or custom cursor overlays.**
- Custom cursor hiding breaks Devvit's cross-origin iframe sandbox and native pointer visibility.
- Standard browser cursors (`cursor: default`, `cursor: pointer`) must always be used.

### 2.2 GameScreen Flip Behavior
- **`GameScreen` must always render the active card face-up** so the cream `.paper-card` content is immediately visible.
- Derive `isOpen` directly from state: `const isOpen = game.phase !== "start"`.
- **Never gate visibility behind `setTimeout` or async state updates** — timers can be throttled in Devvit iframes and Playwright test environments.
- Let Framer Motion's `initial` / `animate` props handle the entrance transition smoothly.

### 2.3 Mobile Viewport Fit
- **`GameScreen` must fit cleanly inside `100dvh` on a `375×667` mobile viewport.**
- All 4 answer buttons (`data-testid="answer-option-0..3"`) must be visible in the viewport without scrolling.
- Use flex column layout with `min-h-[100dvh] max-h-[100dvh]` and `flex-1` main area.
- Card container must not have rigid `aspect-[3/4]` — let content dictate height with `max-h-[60vh] sm:max-h-[70vh]`.
- Choice buttons must fit in a single row on 375px width (4 × 80px + 3 × 8px gap = 344px < 375px).

---

## 3. Stable `data-testid` Contracts

- **Never remove or rename existing `data-testid` attributes** during visual restyling or refactoring.
- **Never remove or alter `<input type="radio">` accessibility roles** (`role="radio"`, `name="direction"`).
- These attributes are the **stable contract** for E2E tests and must persist across all visual changes.

### Required `data-testid` Attributes

| Component | Selector | Description |
|-----------|----------|-------------|
| `StartScreen` | `direction-zh2ja` | Chinese → Japanese radio |
| `StartScreen` | `direction-ja2zh` | Japanese → Chinese radio |
| `StartScreen` | `direction-en` | Visual Detective radio |
| `StartScreen` | `start-button` | Primary start button |
| `CardView` | `question-card` | Active question container |
| `LifelineBar` | `lifeline-5050` | 50/50 lifeline button |
| `LifelineBar` | `lifeline-xray` | X-Ray lifeline button |
| `LifelineBar` | `lifeline-20q` | 20-Q lifeline button |
| `LifelineBar` | `lifeline-poll` | Poll lifeline button |
| `ChoiceButtons` | `answer-option-0` | Answer A button |
| `ChoiceButtons` | `answer-option-1` | Answer B button |
| `ChoiceButtons` | `answer-option-2` | Answer C button |
| `ChoiceButtons` | `answer-option-3` | Answer D button |
| `RevealView` | `reveal-card` | Reveal container |
| `RevealView` | `next-card-button` | Next Card / See Final Score button |
| `EndScreen` | `play-again-button` | Play Again button |

---

## 4. Single-Task Verification

- **After every task, run `npm run verify`** (`lint`, `test:types`, `test`, `test:e2e`, `build`) before committing.
- No task is complete until the full verification suite passes with 0 errors.
- If any check fails, fix it before moving to the next task.

---

## 5. Fail-Fast E2E Testing

- Every Playwright test in `tests/e2e/fullGame.spec.ts` **must** attach a page error handler at the top:
  ```ts
  page.on('pageerror', (err) => { throw err; });
  ```
- Any uncaught runtime crash must fail the test immediately with a stack trace.
- Tests must use the stable `data-testid` selectors above (not brittle text or CSS selectors).
- Tests must assert `toBeVisible()` and `toBeInViewport()` for all interactive elements across both `375×667` mobile and `1280×800` desktop viewports.

---

## 5. Forbidden Patterns

| Pattern | Forbidden | Alternative |
|---------|-----------|-------------|
| `cursor: none` | ✅ Yes | Use default browser cursors |
| `setTimeout` gating card visibility | ✅ Yes | Derive `isOpen` from state directly |
| `min-h-screen` + `items-center` on GameScreen | ✅ Yes | Use `flex-col min-h-[100dvh] max-h-[100dvh]` |
| Removing `data-testid` attributes | ✅ Yes | Never remove — they are test contracts |
| Removing `<input type="radio">` roles | ✅ Yes | Keep accessibility intact |
| Brittle CSS/text selectors in E2E tests | ✅ Yes | Use `data-testid` selectors only |

---

## 6. Recover via Git, Never Rewrite

- **If a file edit causes syntax/redeclaration errors, immediately run `git checkout HEAD -- <file>` to restore a clean baseline before applying a small diff.**
- Never attempt to "fix" a corrupted file by writing more code on top of it — restore first, then reapply a minimal, targeted change.
- This prevents cascading errors (e.g., duplicate function declarations, orphaned braces, undefined variables) that can corrupt an entire file.

---

## Enforcement

- These rules are enforced via:
  1. **Code review** — reviewers must check for violations
  2. **CI/CD** — `npm run verify` runs on every push
  3. **Kiro IDE hooks** — pre-push hooks run full verification
  4. **Playwright E2E** — runs on mobile (375×667) and desktop (1280×800) before merge

**No exceptions. No waivers. These guardrails protect the Frankenstein architecture that makes Tandem Daily work across Devvit, mobile, and desktop simultaneously.**
## 7. Modular Sub-Routers & 100-Line Diff Limit
- Never add more than 100 lines to an existing file in a single edit. For new backend endpoints, create a separate Hono sub-router file (e.g. src/server/routes/rooms.ts) and mount it with api.route() in 1 line.

