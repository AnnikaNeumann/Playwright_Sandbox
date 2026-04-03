import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';

let loginPage: LoginPage;

Given('I am on the Octopus Energy login page', async function (this: CustomWorld) {
  loginPage = new LoginPage(this.page);
  await loginPage.goto();
});


When('I click Login button', async function (this: CustomWorld) {
  await loginPage.clickLoginButton();
});

When('I enter valid credentials', async function (this: CustomWorld) {
  await loginPage.login(
    process.env.TEST_USERNAME!,
    process.env.TEST_PASSWORD!,
  );
});

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  await loginPage.redirectionToDashboard(10000);
});

When('I enter invalid credentials', async function (this: CustomWorld) {
  await loginPage.login('wrong@email.com', 'wrongpassword');
});

Then('I should see an error message', async function (this: CustomWorld) {
  const error = await loginPage.getErrorMessage();
  expect(error.length).toBeGreaterThan(0);
});