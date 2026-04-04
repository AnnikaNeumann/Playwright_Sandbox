import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, Page, BrowserContext, chromium } from 'playwright';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage: any;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    const headless = process.env.PW_HEADLESS === 'true'
      ? true
      : process.env.PW_HEADED === 'true'
        ? false
        : !!process.env.CI;

    this.browser = await chromium.launch({
      headless,
      slowMo: headless ? 0 : 800,
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      // Browser already closed or not initialized
    }
  }
}

setWorldConstructor(CustomWorld);