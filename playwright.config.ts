import { defineConfig, devices } from '@playwright/test';

// Always test an isolated production server. Reusing the preview server on :3000
// can mix old in-memory Next manifests with newly generated .next assets.
const testPort = 3111;
const testUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: testUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${testPort}`,
    url: testUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
