import { Locator, Page } from 'playwright';
import { expect } from '@playwright/test';

export class PersonalDetailsPage {
  readonly page: Page;
    readonly personalDetailsLink: Locator;
    readonly communicationPreferencesLink: Locator;

  constructor(page: Page) {
    this.page = page;
        this.personalDetailsLink = page.getByText('Personal details');
        this.communicationPreferencesLink = page.getByText('Your communication preferences');

  }

  async verifyContactDetails(userEmail: string, userFullName: string, userPhone: string, timeoutMs = 30000) {
    // Wait for page to settle after navigation
    await this.page.waitForLoadState('networkidle').catch(() => {
      // networkidle can timeout on CI; fallback to domcontentloaded
      return this.page.waitForLoadState('domcontentloaded');
    });

    const heading = this.page.getByText('Your contact details', { exact: false }).first();
    await heading.waitFor({ state: 'visible', timeout: timeoutMs });
    console.log('[PersonalDetailsPage] Contact details heading found, verifying values...');

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

  async verifyCommunicationPreferences(timeoutMs = 30000) {
  const heading = this.page.getByText('Your communication preferences', { exact: false }).first();
  await heading.waitFor({ state: 'visible', timeout: timeoutMs });

  // Go up to the nearest section/card ancestor, then find ul inside it
  const card = heading.locator('xpath=ancestor::div[2]');
  const bulletList = card.locator('ul');
  await bulletList.waitFor({ state: 'visible', timeout: timeoutMs });

  const expectedPreferences = [
    'You are currently opted in to receive our recommended emails',
    'You are currently opted in to receive some marketing emails from us',
    'You are currently opted out of meter reading confirmation emails',
    'You get emails from us in HTML format',
    'We send you emails in our usual style',
    'Your emails use our usual font size'
  ];

  const listItems = bulletList.locator('li');
  await expect(listItems).toHaveCount(expectedPreferences.length);

  for (let i = 0; i < expectedPreferences.length; i++) {
    await expect(listItems.nth(i)).toContainText(expectedPreferences[i]);
  }
  console.log('[PersonalDetailsPage] Communication preferences verified.');
}}
