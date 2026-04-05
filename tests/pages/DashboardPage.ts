import { Page, Locator } from 'playwright';

export class DashboardPage {
  readonly page: Page;
  readonly accountHeading: Locator;
  readonly personalDetailsLink: Locator;

  constructor(page: Page) 
  {
    this.page = page;
    this.accountHeading = page.getByText('Hi Annika');
    this.personalDetailsLink = page.getByText('Personal details');
  }

    async redirectionToDashboard(timeoutMs = 10000) 
    {
    await this.accountHeading.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async verifyEnergyBalance(expectedBalance: string, timeoutMs = 10000): Promise<string>
  {
    console.log(`[DashboardPage] Checking energy balance. expected='${expectedBalance}'`);
    const energyBalance = this.page.getByText(expectedBalance, { exact: true });
    try {
      await energyBalance.waitFor({ state: 'visible', timeout: timeoutMs });
    } catch (error) {
      const bodyText = await this.page.locator('body').innerText();
      const firstDetectedCurrency = bodyText.match(/£\s*\d+[.,]\d{2}/)?.[0] ?? 'none';
      console.log(
        `[DashboardPage] Balance element not found. expected='${expectedBalance}', firstDetectedCurrency='${firstDetectedCurrency}'`
      );
      throw error;
    }

    const actualBalance = (await energyBalance.textContent())?.trim() ?? '';
    if (actualBalance !== expectedBalance) {
      console.log(`[DashboardPage] Energy balance mismatch. expected='${expectedBalance}', actual='${actualBalance}'`);
      throw new Error(`Expected energy balance to be '${expectedBalance}', but got '${actualBalance}'`);
    }

    console.log(`[DashboardPage] Energy balance verified. expected='${expectedBalance}', actual='${actualBalance}'`);

    return actualBalance;
  }
  
  async clickPersonalDetails(timeoutMs = 10000)
  {
    await this.personalDetailsLink.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
  }

  }