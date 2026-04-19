import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

const expectedLanguageOptions = {
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

test.describe('Dashboard', () => {
  test('verify the logo is displayed on the dashboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.displayedDashboard(30_000);
  });

  test('then I verify that \'Deutsch\', \'Français\' and \'Español\' are available as language options', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.verifyLanguageOptions(expectedLanguageOptions, 30_000);
  });
});
