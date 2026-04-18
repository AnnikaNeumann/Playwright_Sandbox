import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

function requireEnv(name: 'TEST_USER_EMAIL' | 'TEST_PASSWORD'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Provide it in .env locally or as a GitHub Actions secret in CI.`);
  }
  return value;
}

test.describe('Smoke', () => {
  test('@smoke login path works for valid user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickLoginButton();
    await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));
    await loginPage.redirectionToDashboard(30_000);
  });

  test('@smoke dashboard energy balance is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.clickLoginButton();
    await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));
    await loginPage.redirectionToDashboard(30_000);

    await dashboardPage.verifyEnergyBalance('£125.59', 30_000);
  });
});
