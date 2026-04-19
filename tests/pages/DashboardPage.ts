import { Locator, Page } from 'playwright';

export class DashboardPage {
  static readonly DEFAULT_BASE_URL = 'https://posteo.de/en';

  readonly page: Page;
  readonly posteoLogo: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly languageSwitch: Locator;
  readonly germanLanguageOption: Locator;
  readonly frenchLanguageOption: Locator;
  readonly spanishLanguageOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.posteoLogo = page.getByAltText('Posteo');
    this.emailInput = page.getByLabel(/^email$/i).or(page.getByPlaceholder(/^(email|e-mail-address|e-mail-adresse)$/i)).first();
    this.passwordInput = page.getByLabel(/^(password|passwort)$/i).or(page.getByPlaceholder(/^(password|passwort)$/i)).first();
    this.languageSwitch = page.locator('nav[aria-label="Language Switch"]');
    this.germanLanguageOption = this.languageSwitch.locator('li.p_lang-switch', {
      has: page.locator('a[lang="de"][href*="/de"]'),
    }).first();
    this.frenchLanguageOption = this.languageSwitch.locator('li.p_lang-switch', {
      has: page.locator('a[lang="fr"][href*="/fr"]'),
    }).first();
    this.spanishLanguageOption = this.languageSwitch.locator('li.p_lang-switch', {
      has: page.locator('a[lang="es"][href*="/es"]'),
    }).first();
  }

  async goto() {
    const configuredBaseUrl = process.env.BASE_URL?.trim();
    const baseUrl = !configuredBaseUrl || !configuredBaseUrl.includes('posteo.de')
      ? DashboardPage.DEFAULT_BASE_URL
      : configuredBaseUrl;

    await this.page.goto(baseUrl);
  }

  async displayedDashboard(timeoutMs = 30000) {
    await this.posteoLogo.waitFor({ state: 'visible', timeout: timeoutMs });
    await this.emailInput.waitFor({ state: 'visible', timeout: timeoutMs });
    await this.passwordInput.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async verifyLanguageOptions(
    expected: { de: string; fr: string; es: string },
    timeoutMs = 30000,
  ) {
    await this.languageSwitch.waitFor({ state: 'visible', timeout: timeoutMs });
    await this.germanLanguageOption.waitFor({ state: 'visible', timeout: timeoutMs });
    await this.frenchLanguageOption.waitFor({ state: 'visible', timeout: timeoutMs });
    await this.spanishLanguageOption.waitFor({ state: 'visible', timeout: timeoutMs });

    const germanText = (await this.germanLanguageOption.locator('a').first().innerText()).trim();
    const frenchText = (await this.frenchLanguageOption.locator('a').first().innerText()).trim();
    const spanishText = (await this.spanishLanguageOption.locator('a').first().innerText()).trim();

    // Always print the resolved values so they are visible during debug runs.
    console.log(`[DashboardPage] Language values -> de='${germanText}', fr='${frenchText}', es='${spanishText}'`);

    if (germanText !== expected.de || frenchText !== expected.fr || spanishText !== expected.es) {
      console.error(
        `[DashboardPage] Language mismatch. Expected de='${expected.de}', fr='${expected.fr}', es='${expected.es}' but got de='${germanText}', fr='${frenchText}', es='${spanishText}'`
      );
      throw new Error('Language option labels do not match expected values.');
    }
  }
}