import { DashboardPage } from '../pages/DashboardPage';
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

let dashboardPage: DashboardPage;

Given('I am on the Octopus Energy dashboard page', async function (this: CustomWorld) {
  await this.loginPage.redirectionToDashboard(30000);
});