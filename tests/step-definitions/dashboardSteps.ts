import { DashboardPage } from '../pages/DashboardPage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

const getDashboardPage = (world: CustomWorld): DashboardPage => new DashboardPage(world.page);

Given('I am on the Octopus Energy dashboard page', async function (this: CustomWorld) {
  const dashboardPage = getDashboardPage(this);
  await dashboardPage.redirectionToDashboard(30000);
});

When('I verify the users name is displayed on the dashboard', async function (this: CustomWorld) {
  await this.page.waitForSelector('text=Hi Annika,');
});

Then('I verify the users energy balance {string} is displayed on the dashboard', async function (this: CustomWorld, balance: string) {
  const dashboardPage = getDashboardPage(this);
  await dashboardPage.verifyEnergyBalance(balance, 30000);
});

When('I click {string}', async function (this: CustomWorld, linkText: string) {
  const target = this.page
    .getByRole('link', { name: new RegExp(`^${linkText}$`, 'i') })
    .or(this.page.getByRole('button', { name: new RegExp(`^${linkText}$`, 'i') }))
    .first();
  await target.waitFor({ state: 'visible', timeout: 30_000 });
  await target.click();

  await this.page.getByRole('heading', { name: /Your settings/i }).waitFor({ timeout: 30_000 });
});

