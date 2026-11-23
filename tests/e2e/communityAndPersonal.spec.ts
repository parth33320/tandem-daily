import { test, expect } from '@playwright/test';

test.describe('Tandem Daily - Community & Personal Features', () => {
  test('Settings modal switches theme to neon', async ({ page }) => {
    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="open-settings-button"]').click();

    const neonOption = page.locator('[data-testid="theme-option-neon"]');
    await neonOption.click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('neon');
  });

  test('How to Play modal explains friend types', async ({ page }) => {
    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="open-howtoplay-button"]').click();

    const modal = page.locator('[data-testid="howtoplay-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText(/True Friend/i);
    await expect(modal).toContainText(/False Friend/i);
    await expect(modal).toContainText(/Half Friend/i);
  });

  test('Leaderboard opens and shows rankings', async ({ page }) => {
    await page.route('**/api/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'leaderboard',
          direction: 'zh2ja',
          scores: [
            { username: 'alice', score: 500 },
            { username: 'bob', score: 480 },
            { username: 'charlie', score: 450 },
          ],
        }),
      });
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="open-leaderboard-button"]').click();

    await expect(page.locator('[data-testid="leaderboard-tab-ja2zh"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=alice')).toBeVisible({ timeout: 5000 });
  });

  test('Word Pool CRUD and voting', async ({ page }) => {
    const words: { id: number; form: string; reading: string; meaning_ja: string; meaning_zh: string; relation: string; author: string; votes: number }[] = [
      { id: 1, form: '便宜', reading: 'bin', meaning_ja: 'convenience', meaning_zh: 'cheap', relation: 'false', author: 'alice', votes: 5 },
    ];

    await page.route('**/api/words', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ type: 'words', words }),
        });
      } else if (route.request().method() === 'POST') {
        words.push({ id: Date.now(), form: '新', reading: 'xin', meaning_ja: 'new', meaning_zh: 'new', relation: 'true', author: 'testuser', votes: 1 });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ type: 'word', word: words[words.length - 1] }),
        });
      }
    });

    await page.route('**/api/words/*/vote', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ type: 'vote', id: 1, votes: 6 }),
      });
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="open-wordpool-button"]').click();
    await expect(page.locator('text=便宜')).toBeVisible({ timeout: 5000 });
  });

  test('My Traps shows missed words and practice mode', async ({ page }) => {
    await page.route('**/api/me/missed*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'missed',
            missed: [
              { wordId: 1, form: '手紙', missCount: 3, lastMissedAt: Date.now() },
              { wordId: 2, form: '学校', missCount: 2, lastMissedAt: Date.now() },
            ],
          }),
        });
      }
    });

    await page.route('**/api/me/missed/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ type: 'missed', cleared: 1 }),
        });
      }
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('[data-testid="open-traps-button"]').click();

    await expect(page.locator('text=手紙')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=学校')).toBeVisible();

    const clearBtn = page.locator('[data-testid="clear-trap-button"]').first();
    await clearBtn.click();
    await page.waitForTimeout(300);

    const practiceBtn = page.locator('[data-testid="practice-traps-button"]');
    await practiceBtn.click();
    await page.waitForTimeout(1000);
  });
});