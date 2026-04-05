import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';

const getLoginPage = (world: CustomWorld): LoginPage => new LoginPage(world.page);

const onLoginPage = async function (this: CustomWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.goto();
};

Given('I am on the Octopus Energy login page', onLoginPage);
Then('I should be on the Octopus Energy login page', onLoginPage);


When('I click Login button', async function (this: CustomWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.clickLoginButton();
});

When('I click Logout button', async function (this: CustomWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.clickLogoutButton();
});

When('I enter valid credentials', async function (this: CustomWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.login(
    process.env.TEST_USER_EMAIL!,
    process.env.TEST_PASSWORD!,
  );
});

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.redirectionToDashboard(30000);
});

When('I enter invalid credentials', async function (this: CustomWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.login('wrong@email.com', 'wrongpassword');
});

Then('I should see an error message', async function (this: CustomWorld) {
  const loginPage = getLoginPage(this);
  const error = await loginPage.getErrorMessage();
  expect(error.length).toBeGreaterThan(0);
});