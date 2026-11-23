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
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'], browserName: 'chromium', viewport: { width: 375, height: 667 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'npm run dev:local -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173/game.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
  timeout: 20000,
});