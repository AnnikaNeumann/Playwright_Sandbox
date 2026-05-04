import { Locator, Page } from "@playwright/test";
import { LoginPage } from "./LoginPage";

export class EmailPage {
  static readonly DEFAULT_BASE_URL = 'https://posteo.de/webmail/e/en';

  readonly page: Page;
  readonly mailboxContainer: Locator;
  readonly inboxLink: Locator;
  readonly draftsLink: Locator;
  readonly sentLink: Locator;
  readonly deletedLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mailboxContainer = page.locator('[id*="mailboxcontainer"]');
    this.inboxLink = page.getByRole('link', { name: /^inbox$/i });
    this.draftsLink = page.getByRole('link', { name: /^drafts$/i });
    this.sentLink = page.getByRole('link', { name: /^sent$/i });
    this.deletedLink = page.getByRole('link', { name: /^(deleted|trash)$/i });
  }

  async goto() {
    const configuredBaseUrl = process.env.BASE_URL?.trim();
    const baseUrl = !configuredBaseUrl || !configuredBaseUrl.includes('posteo.de')
      ? EmailPage.DEFAULT_BASE_URL
      : configuredBaseUrl;

    await this.page.goto(baseUrl);

    // Posteo uses server-side sessions that may not survive storageState.
    // If we were redirected to the login page, log in with credentials.
    const landedUrl = this.page.url();
    if (!landedUrl.includes('/webmail')) {
      const email = process.env.TEST_USER_EMAIL;
      const password = process.env.TEST_PASSWORD;
      if (!email || !password) {
        throw new Error(
          `Navigating to webmail redirected to login (${landedUrl}) but TEST_USER_EMAIL / TEST_PASSWORD are not set in .env`
        );
      }
      const loginPage = new LoginPage(this.page);
      await loginPage.clickLoginButton();
      await loginPage.login(email, password);
      await loginPage.displayedWebmail(60_000);
    }
  }

  async verifySideNavigation(items: string[], timeoutMs = 15_000) {
    for (const item of items) {
      const locator = this.mailboxContainer
        .locator('.foldername', { hasText: new RegExp(`^${item}$`, 'i') });
      await locator.waitFor({ state: 'visible', timeout: timeoutMs });
      const actualText = (await locator.innerText()).trim();
      console.log(`[EmailPage] Nav item found: expected="${item}" actual="${actualText}"`);
    }
  }

 


  }
