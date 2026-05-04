import { test } from "@playwright/test";
import { EmailPage } from "../pages/EmailPage";

const expectedEmailNavigation = ['Inbox', 'Drafts', 'Sent', 'Deleted Items'];

test.describe('Email', () => {
  test('verify the email navigation is displayed on the email page', async ({ page }) => {
    const emailPage = new EmailPage(page);
    await emailPage.goto();
    await emailPage.verifySideNavigation(expectedEmailNavigation);
  });
});

