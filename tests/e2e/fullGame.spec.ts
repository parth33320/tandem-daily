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
          await tqBtn.click(); // 20-Q can be used twice
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
});