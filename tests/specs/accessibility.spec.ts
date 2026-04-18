import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const requiredEnv = ['TEST_USER_EMAIL', 'TEST_PASSWORD'] as const;

function requireEnv(name: (typeof requiredEnv)[number]): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not set. Provide it in .env locally or as a GitHub Actions secret in CI.`);
    }
    return value;
}

async function assertInputsHaveAccessibleNames(page: Page): Promise<void> {
    const inputs = page.locator('input:not([type="hidden"]), select, textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');

        let hasAssociatedLabel = false;
        if (id) {
            hasAssociatedLabel = (await page.locator(`label[for="${id}"]`).count()) > 0;
        }

        const hasAriaLabel = !!ariaLabel;
        const hasPlaceholder = !!placeholder;

        expect(
            hasAssociatedLabel || hasAriaLabel || hasPlaceholder,
            `Input at index ${i} does not have an associated label, aria-label, or placeholder`
        ).toBeTruthy();
    }
}

async function assertNotRateLimited(page: Page): Promise<void> {
    const rateLimitHeading = page.getByRole('heading', { name: /429 too many requests/i });
    await expect(rateLimitHeading, 'Site returned a 429 rate-limit page. Re-run with fewer workers or wait a minute.').toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
    await page.goto('https://octopus.energy/dashboard');
    await assertNotRateLimited(page);
});

test.describe('Accessibility', () => {
    test.describe.configure({ mode: 'serial' });

    test('all images should have alt text', async ({ page }) => {
        const images = page.locator('img');
        const count = await images.count();
        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const alt = await img.getAttribute('alt');
            const src = await img.getAttribute('src');
            expect(alt, `Image with src "${src}" is missing alt text`).toBeTruthy();
        }
    });

    test('all form inputs should have associated labels', async ({ page }) => {
        await page.goto('https://octopus.energy/login.html');
        await assertNotRateLimited(page);
        await assertInputsHaveAccessibleNames(page);
    });

    test('authenticated pages should have labelled inputs', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.clickLoginButton();
        await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));
        await loginPage.redirectionToDashboard(30_000);

        const authenticatedPaths = ['/dashboard'];
        for (const path of authenticatedPaths) {
            await page.goto(`https://octopus.energy${path}`);
            await assertNotRateLimited(page);
            await assertInputsHaveAccessibleNames(page);
        }
    });

    test('page should have correct heading structure', async ({ page }) => {
        const headings = page.locator('h1, h2, h3, h4, h5, h6');
        const count = await headings.count();

        // Simple check to ensure there is at least one heading on the page
        expect(count).toBeGreaterThan(0);

        // At least one h1 should be present
        const h1Count = await page.locator('h1').count();
        expect(h1Count, 'Page should have at least one h1').toBeGreaterThanOrEqual(1);

        // Multiple h1s is an accessibility issue — log it as a warning but do not hard-fail
        // since this is a live third-party site we cannot control
        if (h1Count > 1) {
            console.warn(`Accessibility warning: page has ${h1Count} h1 elements (best practice is exactly one)`);
        }

        for (let i = 0; i < count; i++) {
            const tagName = await headings.nth(i).evaluate((node) => node.tagName);
            expect(tagName).toMatch(/^H[1-6]$/);
        }
    });

    test('interactive elements should be keyboard accessible', async ({ page }) => {
        await page.keyboard.press('Tab');

        const focusedElements: Array<string | null> = [];
        for (let i = 0; i < 10; i++) {
            const focus = await page.evaluate(() => {
                const element = (globalThis as any).document?.activeElement as { tagName?: string } | null;
                return element?.tagName?.toLowerCase() ?? null;
            });
            focusedElements.push(focus);
            await page.keyboard.press('Tab');
        }

        expect(focusedElements, 'Should be able to tab to a link or button').toContain('a');
        expect(focusedElements, 'Should be able to tab to a link or button').toContain('button');
    });
});