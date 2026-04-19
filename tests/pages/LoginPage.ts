import { Locator, Page } from 'playwright';

export class LoginPage {
  static readonly DEFAULT_BASE_URL = 'https://posteo.de/en';

  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page
      .getByLabel(/^(email|e-mail)$/i)
      .or(page.getByPlaceholder(/^(email|e-mail-address|e-mail-adresse)$/i))
      .or(page.locator('input[type="email"], input[name="login"], input[name="username"]'))
      .first();
    this.passwordInput = page
      .getByLabel(/^(password|passwort)$/i)
      .or(page.getByPlaceholder(/^(password|passwort)$/i))
      .or(page.locator('input[type="password"]'))
      .first();
    this.signInButton = page
      .getByRole('button', { name: /^(log in|jetzt anmelden|anmelden|sign in)$/i })
      .or(page.locator('button[type="submit"]'))
      .first();
    this.errorMessage = page
      .locator('[role="alert"], [class*="error"], [class*="alert"], .flash-error')
      .or(page.getByText(/login failed|anmeldung fehlgeschlagen/i))
      .first();
    this.loginButton = page
      .getByRole('link', { name: /^login$/i })
      .or(page.locator('a[href="/login"], a[href$="/login"], a[href*="/login?"]'))
      .first();
    this.logoutButton = page.locator('form[action*="logout"] button, form[action*="logout"] [type="submit"]').first();
  }

  async goto() {
    const configuredBaseUrl = process.env.BASE_URL?.trim();
    const baseUrl = !configuredBaseUrl || !configuredBaseUrl.includes('posteo.de')
      ? LoginPage.DEFAULT_BASE_URL
      : configuredBaseUrl;

    await this.page.goto(baseUrl);
  }

  async clickLoginButton() {
    const loginInputsVisible = (await this.emailInput.isVisible().catch(() => false))
      && (await this.passwordInput.isVisible().catch(() => false));

    if (loginInputsVisible) {
      return;
    }

    await this.loginButton.waitFor({ state: 'visible', timeout: 10_000 });
    await Promise.all([
      this.page.waitForURL(/\/login(\?.*)?$/, { timeout: 10_000 }).catch(() => undefined),
      this.loginButton.click({ force: true }),
    ]);
    await this.emailInput.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async clickLogoutButton() {
    const logoutCandidates = [
      this.logoutButton,
      this.page.getByRole('button', { name: /^(log out|logout|abmelden)$/i }).first(),
      this.page.getByRole('link', { name: /^(log out|logout|abmelden)$/i }).first(),
      this.page.locator('a[href*="logout"], button[name*="logout"], [aria-label*="logout"]').first(),
    ];

    for (const candidate of logoutCandidates) {
      const visible = await candidate.isVisible().catch(() => false);
      if (!visible) {
        continue;
      }

      await candidate.click({ timeout: 10_000 }).catch(() => undefined);
      return;
    }

    // Last resort: if UI controls are dynamic or hidden in this session, hit logout URL directly.
    await this.page.goto('https://posteo.de/logout').catch(() => this.page.goto(LoginPage.DEFAULT_BASE_URL));
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async displayedWebmail(timeoutMs = 30000) {
    const effectiveTimeout = timeoutMs;

    await this.page.waitForLoadState('domcontentloaded', { timeout: effectiveTimeout }).catch(() => undefined);
    await this.page
      .waitForURL((url) => !url.toString().startsWith(LoginPage.DEFAULT_BASE_URL), { timeout: effectiveTimeout })
      .catch(() => undefined);

    try {
      await this.page.waitForURL(/\/webmail(\/.*)?$/, { timeout: effectiveTimeout });
    } catch {
      const currentUrl = this.page.url();
      const loginErrorText = (await this.errorMessage.textContent().catch(() => null))?.trim();
      throw new Error(
        `Login did not reach Posteo webmail. URL: ${currentUrl}${loginErrorText ? ` | UI error: ${loginErrorText}` : ''}`
      );
    }

    await this.page.waitForLoadState('domcontentloaded', { timeout: effectiveTimeout }).catch(() => undefined);

    const currentUrl = this.page.url();
    if (currentUrl.startsWith(LoginPage.DEFAULT_BASE_URL)) {
      throw new Error(`Still on Posteo landing page instead of webmail: ${currentUrl}`);
    }

    if (!currentUrl.includes('https://posteo.de/webmail')) {
      throw new Error(`Expected Posteo webmail URL but got: ${currentUrl}`);
    }
  }

  async displayedDashboard(timeoutMs = 30000) {
    await this.displayedWebmail(timeoutMs);
  }

  async getErrorMessage(): Promise<string> {
    const candidates = [
      this.errorMessage,
      this.page.getByText(/login failed|anmeldung fehlgeschlagen/i).first(),
    ];

    for (const candidate of candidates) {
      const visible = await candidate.isVisible().catch(() => false);
      if (!visible) {
        continue;
      }

      const text = (await candidate.innerText().catch(() => '')).trim();
      if (text.length > 0) {
        return text;
      }
    }

    return '';
  }
}