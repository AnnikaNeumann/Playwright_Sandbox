import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

if (!process.env.CI) {
  dotenv.config({ path: '.env' });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/specs',
  timeout: process.env.CI ? 120_000 : 60_000,
  expect: {
    timeout: 20_000,
  },
  /* Disable full parallelism by default to avoid rate limiting on live environments. */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Force sequential execution across all environments. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['github']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  globalSetup: require.resolve('./tests/auth.setup'),

  use: {
    headless: !!process.env.CI,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    /* Login and smoke tests: test UI login flow WITHOUT pre-loaded auth */
    {
      name: 'login-flow',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      testMatch: ['**/login.spec.ts', '**/smoke.spec.ts'],
    },

    /* Future: webmail E2E tests that will use authenticated state */
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',  
        storageState: '.playwright/auth.json',
      },
      testMatch: ['**/webmail.spec.ts', '**/inbox.spec.ts', '**/compose.spec.ts'],
    },

    /* Unauthenticated tests: homepage, accessibility, etc. */
    {
      name: 'unauthenticated',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      testMatch: ['**/accessibility.spec.ts', '**/dashboard.spec.ts'],
    },


    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
