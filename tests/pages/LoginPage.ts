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
    // Try link role first, fallback to original class selector for headless/CI environments
    this.loginButton = page.locator(
      'a[class*="Login"], a[class*="login"], div[class*="coralHeader-actions-dynamic"] a'
    ).first();
    this.logoutButton = page.locator('form[id="logout-form"] [type="submit"]');
  }

  async goto() {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      throw new Error('BASE_URL is not set. Provide it in .env locally or as a GitHub Actions secret in CI.');
    }

    await this.page.goto(baseUrl);
  }

  async clickLoginButton() {
    try {
      await this.loginButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.loginButton.click();
    } catch (e) {
      // Fallback: try original selector if role-based selector fails
      const fallback = this.page.locator('div[class*="coralHeader-actions-dynamic"]');
      await fallback.waitFor({ state: 'visible', timeout: 5000 });
      await fallback.click();
    }
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
    // Wait for navigation to complete first
    await this.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => {
      // If networkidle times out, fall back to domcontentloaded
      return this.page.waitForLoadState('domcontentloaded');
    });

    // Check URL contains dashboard path (less strict for CI variants)
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Expected dashboard URL but got: ${currentUrl}`);
    }

    // Wait for greeting to appear
    await this.page.getByText('Hi Annika').waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.innerText();
  }
}