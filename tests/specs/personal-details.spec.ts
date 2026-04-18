import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';

function requireEnv(name: 'TEST_USER_EMAIL' | 'TEST_PASSWORD' | 'TEST_USER_FULL_NAME' | 'TEST_USER_PHONE'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Provide it in .env locally or as a GitHub Actions secret in CI.`);
  }
  return value;
}

test.describe('Personal details', () => {
  test('verify personal details are displayed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);

    await loginPage.goto();
    await loginPage.clickLoginButton();
    await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));
    await loginPage.redirectionToDashboard(30_000);

    const settingsLink = page.getByRole('link', { name: /^Personal details$/i })
      .or(page.getByRole('button', { name: /^Personal details$/i }))
      .first();

    await settingsLink.waitFor({ state: 'visible', timeout: 30_000 });

    // If the link opens a new tab, capture it; otherwise use the same page
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 5_000 }).catch(() => null),
      settingsLink.click(),
    ]);
    const activePage = newPage ?? page;
    if (newPage) {
      await newPage.waitForLoadState('domcontentloaded');
    }

    await activePage.getByRole('heading', { name: /Your settings/i }).waitFor({ timeout: 30_000 });

    const personalDetailsPageOnActive = new PersonalDetailsPage(activePage);

    await personalDetailsPageOnActive.verifyContactDetails(
      requireEnv('TEST_USER_EMAIL'),
      requireEnv('TEST_USER_FULL_NAME'),
      requireEnv('TEST_USER_PHONE'),
      30_000
    );

    await personalDetailsPageOnActive.verifyCommunicationPreferences(30_000);

    await expect(activePage.getByText('Your communication preferences')).toBeVisible();
  });
});
