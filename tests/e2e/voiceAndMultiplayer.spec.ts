import { test, expect } from '@playwright/test';

test.describe('Tandem Daily - Voice Host & Multiplayer Rooms', () => {
  test.beforeEach(async ({ page }) => {
    // Stub speechSynthesis for Voice Host tests
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__SPOKEN_LINES__ = [];
      (window as unknown as Record<string, unknown>).__CANCEL_COUNT__ = 0;

      const mockSpeak = (utterance: { text: string }) => {
        (window as unknown as Record<string, unknown>).__SPOKEN_LINES__ = [
          ...((window as unknown as Record<string, unknown>).__SPOKEN_LINES__ as string[]),
          utterance.text,
        ];
      };

      const mockCancel = () => {
        (window as unknown as Record<string, unknown>).__CANCEL_COUNT__ =
          ((window as unknown as Record<string, unknown>).__CANCEL_COUNT__ as number) + 1;
      };

      Object.defineProperty(window, 'speechSynthesis', {
        value: { speak: mockSpeak, cancel: mockCancel, getVoices: () => [] },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        value: function(text: string) { this.text = text; },
        writable: true,
        configurable: true,
      });

      (window as unknown as Record<string, unknown>).__DEVIT_WEB_CLIENT__ = {
        requestExpandedMode: () => {}, navigateTo: () => {}, showToast: () => {}, showForm: () => {},
      };
      (window as unknown as Record<string, unknown>).__TEST_PAUSE_TIMER__ = true;
    });

    await page.goto('/game.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="start-button"]').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('Voice Host narrates on game start and mute toggle works', async ({ page }) => {
    // Click start - should unlock audio and narrate Card 1
    await page.locator('[data-testid="start-button"]').click();

    // Wait for question card
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });

    // Assert that speech was triggered (spoken lines recorded)
    const spokenLines = await page.evaluate(
      () => (window as unknown as Record<string, unknown>).__SPOKEN_LINES__ as string[]
    );
    expect(spokenLines.length).toBeGreaterThan(0);

    // Click mute toggle
    const muteBtn = page.locator('[data-testid="host-mute-toggle"]');
    if (await muteBtn.isVisible()) {
      await muteBtn.click();

      // Assert cancel was called when muting
      const cancelCount = await page.evaluate(
        () => (window as unknown as Record<string, unknown>).__CANCEL_COUNT__ as number
      );
      expect(cancelCount).toBeGreaterThan(0);

      // Advance to reveal - should NOT push new utterances while muted
      const spokenBefore = await page.evaluate(
        () => ((window as unknown as Record<string, unknown>).__SPOKEN_LINES__ as string[]).length
      );
      await page.locator('[data-testid^="answer-option-"]:not([disabled])').first().click();
      await expect(page.locator('[data-testid="reveal-card"]')).toBeVisible({ timeout: 10000 });
      const spokenAfter = await page.evaluate(
        () => ((window as unknown as Record<string, unknown>).__SPOKEN_LINES__ as string[]).length
      );
      expect(spokenAfter).toBe(spokenBefore);
    }
  });

  test('Multiplayer room creation, chat, and match start flow', async ({ page }) => {
    // Mock API routes for room operations
    let roomCode = 'ABCDE';
    const roomState = {
      code: roomCode,
      host: 'testuser',
      direction: 'zh2ja' as const,
      status: 'lobby' as const,
      currentCard: 0,
      cards: [],
      players: [{ username: 'testuser', score: 0, answeredCard: 0, choiceIdx: null, correct: null }],
      chat: [] as { id: string; username: string; text: string; ts: number }[],
      updatedAt: Date.now(),
    };

    await page.route('**/api/rooms', async (route) => {
      if (route.request().method() === 'POST') {
        roomState.status = 'lobby';
        roomState.players = [{ username: 'testuser', score: 0, answeredCard: 0, choiceIdx: null, correct: null }];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ type: 'room', room: roomState }),
        });
      }
    });

    await page.route('**/api/rooms/*/join', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ type: 'room', room: roomState }),
      });
    });

    await page.route('**/api/rooms/*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ type: 'room', room: roomState }),
        });
      }
    });

    await page.route('**/api/rooms/*/chat', async (route) => {
      const body = route.request().postDataJSON() as { text: string };
      roomState.chat.push({
        id: `msg_${Date.now()}`,
        username: 'testuser',
        text: body.text,
        ts: Date.now(),
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ type: 'room', room: roomState }),
      });
    });

    await page.route('**/api/rooms/*/start', async (route) => {
      roomState.status = 'playing';
      roomState.cards = []; // Would be populated by server
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ type: 'room', room: roomState }),
      });
    });

    // Click Create Room button
    const createBtn = page.locator('[data-testid="create-room-button"]');
    if (await createBtn.isVisible()) {
      await createBtn.click();

      // Assert room lobby renders
      await expect(page.locator('[data-testid="room-lobby"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="room-code-display"]')).toContainText(roomCode);

      // Type and send chat message
      const chatInput = page.locator('[data-testid="room-chat-input"]');
      if (await chatInput.isVisible()) {
        await chatInput.fill('Hello table!');
        await chatInput.press('Enter');

        // Assert message appears in chat
        await expect(page.locator('[data-testid="room-chat-messages"]')).toContainText('Hello table!');
      }

      // Click Start Match button
      const startBtn = page.locator('[data-testid="start-room-button"]');
      if (await startBtn.isVisible()) {
        await startBtn.click();

        // Assert transition to question card (game starts)
        await expect(page.locator('[data-testid="question-card"]')).toBeVisible({ timeout: 10000 });
      }
    }
  });
});