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
  await this.page.click(`text=${linkText}`);
});

Then('I verify users contact details are displayed on the personal details page', async function (this: CustomWorld) {
  const userEmail = process.env.TEST_USER_EMAIL;
  const userFullName = process.env.TEST_USER_FULL_NAME;
  const userPhone = process.env.TEST_USER_PHONE;

  if (!userEmail) throw new Error('TEST_USER_EMAIL is not set. Provide it in .env locally or as a GitHub Actions secret in CI.');
  if (!userFullName) throw new Error('TEST_USER_FULL_NAME is not set. Provide it in .env locally or as a GitHub Actions secret in CI.');
  if (!userPhone) throw new Error('TEST_USER_PHONE is not set. Provide it in .env locally or as a GitHub Actions secret in CI.');

  const personalDetailsPage = new PersonalDetailsPage(this.page);
  await personalDetailsPage.verifyContactDetails(userEmail, userFullName, userPhone, 30000);
});