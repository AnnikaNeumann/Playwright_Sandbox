import { Page, Locator } from 'playwright';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.signInButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[class*="error"], [class*="alert"]');
    this.loginButton = page.locator('div[class*="coralHeader-actions-dynamic"]');
    this.logoutButton = page.locator('form[id="logout-form"] [type="submit"]');
  }

  async goto() {
    await this.page.goto(process.env.BASE_URL!);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async clickLogoutButton(){
    await this.logoutButton.click();
  }

    async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async redirectionToDashboard(timeoutMs = 10000) {
    await this.page.waitForURL(/\/dashboard\/new\/accounts\/[^/]+\/dashboard$/, { timeout: timeoutMs });
    await this.page.getByText('Hi Annika').waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.innerText();
  }
}