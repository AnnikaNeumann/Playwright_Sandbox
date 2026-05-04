import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import fs from 'node:fs';
import path from 'node:path';

const AUTH_FILE = path.join(process.cwd(), '.playwright', 'auth.json');

function requireEnv(name: 'TEST_USER_EMAIL' | 'TEST_PASSWORD'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Provide it in .env locally or as a GitHub Actions secret.`);
  }
  return value;
}

async function globalSetup(config: FullConfig) {
  // Skip if credentials not provided
  if (process.env.POSTEO_VALID_CREDENTIALS !== 'true') {
    console.log('⏭️  Skipping auth setup (POSTEO_VALID_CREDENTIALS not set to true)');
    return;
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: !!process.env.CI,
  });
  const page = await browser.newPage();

  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.clickLoginButton();
  await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));
  await loginPage.displayedWebmail(60_000);


  // Ensure folder exists and save state
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });

  console.log('✅ Auth setup complete: storage state saved');

  await browser.close();
}

export default globalSetup;
