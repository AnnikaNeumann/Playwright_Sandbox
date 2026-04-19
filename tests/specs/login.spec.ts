import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const requiredEnv = ['TEST_USER_EMAIL', 'TEST_PASSWORD'] as const;
const canRunSuccessfulAuth = process.env.POSTEO_VALID_CREDENTIALS === 'true';

function requireEnv(name: (typeof requiredEnv)[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Provide it in .env locally or as a GitHub Actions secret in CI.`);
  }
  return value;
}

test.describe('Login', () => {
  test('successful login with valid credentials', async ({ page }) => {
    test.skip(!canRunSuccessfulAuth, 'Set POSTEO_VALID_CREDENTIALS=true to run successful auth tests with a real Posteo mailbox.');

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickLoginButton();
    await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));
    await loginPage.displayedWebmail(30_000);

    await expect(page).toHaveURL(/webmail/);
  });

  test('successful logout', async ({ page }) => {
    test.skip(!canRunSuccessfulAuth, 'Set POSTEO_VALID_CREDENTIALS=true to run successful auth tests with a real Posteo mailbox.');

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickLoginButton();
    await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));
    await loginPage.displayedWebmail(30_000);

    await loginPage.clickLogoutButton();
    // After logout the site may redirect to the home page or the login page;
    // assert we are no longer on the webmail  rather than assuming a specific URL
    await page.waitForURL((url) => !url.toString().includes('posteo.de/webmail'), { timeout: 30_000 });
  });

  test('failed login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickLoginButton();
    await loginPage.login('wrong@email.com', 'wrongpassword');

    await expect(page).toHaveURL(/\/login(\?.*)?$/);
    await expect(page.getByText(/login failed|anmeldung fehlgeschlagen/i).first()).toBeVisible();
  });
});
