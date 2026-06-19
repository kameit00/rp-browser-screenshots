import { defineConfig, devices } from '@playwright/test';

/**
 * Cross-browser screenshot configuration.
 *
 * Projects below cover the three Playwright browser engines:
 *   - chromium  -> Chrome / Edge
 *   - firefox   -> Firefox
 *   - webkit    -> Safari (engine-level approximation)
 *
 * In GitHub Actions each project is run independently via --project,
 * on a matrix of Ubuntu / Windows / macOS runners.
 *
 * Two modes are supported (set MODE env var):
 *   - capture (default): just writes screenshots to ./screenshots/<os>/<browser>/
 *   - compare:           additionally asserts against committed baselines
 *                        (seed them first with: npm run update-snapshots)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  // Per-browser baseline folders (so chromium / firefox / webkit don't collide)
  snapshotPathTemplate:
    '{snapshotDir}/{testFilePath}/{arg}-{projectName}{ext}',

  use: {
    // BASE_URL is set in CI (workflow_dispatch input / schedule default)
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    actionTimeout: 15000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], browserName: 'webkit' },
    },
  ],
});
