import { Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';

Then('I verify users contact details are displayed', {timeout: 60_000}, async function (this: CustomWorld) {
  const userEmail = process.env.TEST_USER_EMAIL;
  const userFullName = process.env.TEST_USER_FULL_NAME;
  const userPhone = process.env.TEST_USER_PHONE;

  if (!userEmail) throw new Error('TEST_USER_EMAIL is not set. Provide it in .env locally or as a GitHub Actions secret in CI.');
  if (!userFullName) throw new Error('TEST_USER_FULL_NAME is not set. Provide it in .env locally or as a GitHub Actions secret in CI.');
  if (!userPhone) throw new Error('TEST_USER_PHONE is not set. Provide it in .env locally or as a GitHub Actions secret in CI.');

  const personalDetailsPage = new PersonalDetailsPage(this.page);
  await personalDetailsPage.verifyContactDetails(userEmail, userFullName, userPhone, 30000);
});

Then('I verify the users communication preferences are displayed on the personal details page', async function (this: CustomWorld) {
  const personalDetailsPage = new PersonalDetailsPage(this.page);
  await personalDetailsPage.verifyCommunicationPreferences(30000);
});
