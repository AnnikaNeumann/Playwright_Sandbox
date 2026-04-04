import { DashboardPage } from '../pages/DashboardPage';
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

let dashboardPage: DashboardPage;

Given('I am on the Octopus Energy dashboard page', async function (this: CustomWorld) {
  dashboardPage = new DashboardPage(this.page);
  await dashboardPage.redirectionToDashboard(30000);
});

When('I verify the users name is displayed on the dashboard', async function (this: CustomWorld) {  
  await this.page.waitForSelector('text=Hi Annika,');
});

Then('I verify the users energy balance {string} is displayed on the dashboard', async function (this: CustomWorld, balance: string) {
  if (!dashboardPage) {
    dashboardPage = new DashboardPage(this.page);
  }
  await dashboardPage.verifyEnergyBalance(balance, 30000);
});