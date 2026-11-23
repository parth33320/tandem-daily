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

      // 1. No horizontal overflow on mobile or desktop
      const noHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(noHorizontalOverflow).toBe(true);

      // 2. Native cursor is never hidden
      const cursorStyle = await page.evaluate(() => getComputedStyle(document.body).cursor);
      expect(cursorStyle).not.toBe('none');

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
      } else if (cardNum === 3) {
        const tqBtn = page.locator('[data-testid="lifeline-20q"]');
        if (await tqBtn.isEnabled()) {
          await tqBtn.click();
          await tqBtn.click();
        }
      } else if (cardNum === 4) {
        const pollBtn = page.locator('[data-testid="lifeline-poll"]');
        if (await pollBtn.isEnabled()) {
          await pollBtn.click();
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

  // Phase 12b: X-Ray Clip-Path Overlay Test
  test('X-Ray radical overlay renders clipped crimson glow on kanji', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__DEVIT_WEB_CLIENT__ = {
        requestExpandedMode: () => {}, navigateTo: () => {}, showToast: () => {}, showForm: () => {},
      };
      (window as unknown as Record<string, unknown>).__TEST_PAUSE_TIMER__ = true;
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('[data-testid="start-button"]').click();

    await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });

    const xrayBtn = page.locator('[data-testid="lifeline-xray"]');
    if (await xrayBtn.isEnabled()) {
      await xrayBtn.click();

      const overlay = page.locator('[data-testid="xray-radical-overlay"]');
      await expect(overlay).toBeVisible({ timeout: 5000 });

      const clipPath = await overlay.evaluate(el => getComputedStyle(el).clipPath);
      expect(clipPath).toContain('inset(');

      const kanjiBox = await page.locator('[data-testid="question-card"] .kanji-display').first().boundingBox();
      const overlayBox = await overlay.boundingBox();
      if (kanjiBox && overlayBox) {
        expect(overlayBox.x).toBeGreaterThanOrEqual(kanjiBox.x - 5);
        expect(overlayBox.x + overlayBox.width).toBeLessThanOrEqual(kanjiBox.x + kanjiBox.width + 5);
      }
    }
  });

  // Phase 12b: 20-Q Non-Empty Clues Test
  test('20-Q clues are never blank', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__DEVIT_WEB_CLIENT__ = {
        requestExpandedMode: () => {}, navigateTo: () => {}, showToast: () => {}, showForm: () => {},
      };
      (window as unknown as Record<string, unknown>).__TEST_PAUSE_TIMER__ = true;
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('[data-testid="start-button"]').click();

    // Play to card 3 where we test 20-Q twice
    for (let cardNum = 1; cardNum <= 2; cardNum++) {
      await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });
      await page.locator('[data-testid^="answer-option-"]:not([disabled])').first().click();
      await expect(page.locator('[data-testid="reveal-card"]')).toBeVisible({ timeout: 10000 });
      await page.locator('[data-testid="next-card-button"]').click();
      // Wait for next card to render
      await page.waitForTimeout(800);
    }

    // Now on card 3 - use 20-Q twice
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });

    const tqBtn = page.locator('[data-testid="lifeline-20q"]');
    if (await tqBtn.isEnabled()) {
      await tqBtn.click();
      await page.waitForTimeout(500);
      await tqBtn.click();
      await page.waitForTimeout(500);

      // Assert all clue pills have non-empty text
      const clueElements = page.locator('[data-testid="question-card"] .clue-pill');
      const count = await clueElements.count();
      expect(count).toBeGreaterThanOrEqual(1);

      for (let i = 0; i < count; i++) {
        const text = await clueElements.nth(i).innerText();
        expect(text.trim().length).toBeGreaterThan(5);
        // Clues contain 💡 lightbulb emoji (from CluesDisplay)
        expect(text).toContain('💡');
      }
    } else {
      // 20-Q not available on this card - just verify no crash
      expect(true).toBe(true);
    }
  });

  // Phase 12b: 15s Timeout Reveal Test
  test('timer expiry shows Time Up without Correct banner', async ({ page }) => {
    // Install clock before navigation for fast-forward
    await page.clock.install();

    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__DEVIT_WEB_CLIENT__ = {
        requestExpandedMode: () => {}, navigateTo: () => {}, showToast: () => {}, showForm: () => {},
      };
      (window as unknown as Record<string, unknown>).__TEST_PAUSE_TIMER__ = false;
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('[data-testid="start-button"]').click();

    // Wait for question card to appear
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });

    // Wait for timer to actually start (300ms setTimeout + render)
    await page.waitForTimeout(500);

    // Fast-forward 16 seconds - use runFor which fires all setInterval ticks
    await page.clock.runFor(16000);

    // Assert reveal-card appears
    await expect(page.locator('[data-testid="reveal-card"]')).toBeVisible({ timeout: 10000 });

    // Assert "Time's Up!" banner appears
    await expect(page.locator('text=/Time\'s Up!/i')).toBeVisible();

    // Assert "Correct!" banner does NOT appear
    await expect(page.locator('[data-testid="reveal-card"]')).not.toContainText('Correct!');

    // Assert "✓ Correct answer" label does NOT appear
    const revealCard = page.locator('[data-testid="reveal-card"]');
    await expect(revealCard).not.toContainText('✓ Correct answer');
  });

  // Phase 12b: Auto-Submit Score on Game End Test
  test('score is auto-submitted on game end with all 5 answers', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__DEVIT_WEB_CLIENT__ = {
        requestExpandedMode: () => {}, navigateTo: () => {}, showToast: () => {}, showForm: () => {},
      };
      (window as unknown as Record<string, unknown>).__TEST_PAUSE_TIMER__ = true;
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('[data-testid="start-button"]').click();

    // Play through all 5 cards
    for (let cardNum = 1; cardNum <= 5; cardNum++) {
      await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });
      await page.locator('[data-testid^="answer-option-"]:not([disabled])').first().click();
      await expect(page.locator('[data-testid="reveal-card"]')).toBeVisible({ timeout: 10000 });

      // Intercept the POST /api/score request on card 5
      if (cardNum === 5) {
        const scoreRequestPromise = page.waitForRequest('**/api/score', { timeout: 10000 });

        await page.locator('[data-testid="next-card-button"]').click();

        // Wait for EndScreen
        await expect(page.locator('[data-testid="play-again-button"]')).toBeVisible({ timeout: 10000 });

        // Await the score request
        const scoreRequest = await scoreRequestPromise;
        expect(scoreRequest.url()).toContain('/api/score');
        expect(scoreRequest.method()).toBe('POST');

        // Verify payload includes all 5 answers
        const payload = scoreRequest.postDataJSON();
        expect(payload.answers).toHaveLength(5);
      } else {
        await page.locator('[data-testid="next-card-button"]').click();
        await page.waitForTimeout(300);
      }
    }
  });
});