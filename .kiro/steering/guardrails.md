# Tandem Daily — Architectural Guardrails

1. **Surgical Edits Only:** Modify only the specific functions or JSX blocks required for a task. Never rewrite working files from scratch or delete existing features.
2. **Devvit & Mobile Viewport Invariants:**
   - Never use cursor: none or custom cursor overlays (breaks Devvit cross-origin iframes).
   - Keep GameScreen and CardView compact enough to fit inside a 375×667 mobile viewport so all 4 answer buttons (data-testid="answer-option-0..3") stay visible and clickable without scrolling.
3. **Stable data-testid Contracts:** Never remove or rename existing data-testid attributes (direction-zh2ja, direction-ja2zh, direction-en, start-button, question-card, nswer-option-0..3, lifeline-5050, lifeline-xray, lifeline-20q, lifeline-poll, eveal-card, 
ext-card-button, play-again-button) or <input type="radio"> roles.
4. **Single-Task Verification:** Run 
pm run verify (lint, 	est:types, 	est, 	est:e2e, uild) before committing or pushing.
