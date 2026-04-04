import { Page, Locator } from 'playwright';

export class DashboardPage {
  readonly page: Page;
  readonly accountHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountHeading = page.getByText('Hi Annika');
  }

  async goto() {
    await this.page.goto(process.env.BASE_URL!);
  }
}
