import { Page } from 'playwright';

export class PersonalDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyContactDetails(userEmail: string, userFullName: string, userPhone: string, timeoutMs = 30000) {
    await this.page.waitForLoadState('domcontentloaded');

    const heading = this.page.getByText('Your contact details', { exact: false }).first();
    await heading.waitFor({ state: 'visible', timeout: timeoutMs });

    const card = heading.locator('xpath=ancestor::*[self::section or self::div][1]');
    await card.waitFor({ state: 'visible', timeout: timeoutMs });

    await card.getByText(userFullName, { exact: false }).waitFor({ state: 'visible', timeout: timeoutMs });
    console.log(`[PersonalDetailsPage] Full name found: '${userFullName}'`);

    await card.getByText(userEmail, { exact: false }).waitFor({ state: 'visible', timeout: timeoutMs });
    console.log(`[PersonalDetailsPage] Email found: '${userEmail}'`);

    const phonePattern = new RegExp(userPhone.replace(/\*/g, '\\*+').replace(/\s+/g, '\\s*'));
    await card.getByText(phonePattern).waitFor({ state: 'visible', timeout: timeoutMs });
    console.log(`[PersonalDetailsPage] Phone found (pattern): '${phonePattern.source}'`);

    console.log(`[PersonalDetailsPage] Contact details verified. email='${userEmail}', fullName='${userFullName}', phone='${userPhone}'`);
  }
}
