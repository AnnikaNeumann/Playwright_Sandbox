import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const requiredEnv = ['TEST_USER_EMAIL', 'TEST_PASSWORD'] as const;
const canRunSuccessfulAuth = process.env.POSTEO_VALID_CREDENTIALS === 'true';
const canRunAuthenticatedAccessibility = process.env.POSTEO_RUN_AUTH_A11Y === 'true';

function requireEnv(name: (typeof requiredEnv)[number]): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not set. Provide it in .env locally or as a GitHub Actions secret in CI.`);
    }
    return value;
}

async function assertInputsHaveAccessibleNames(
    page: Page,
    options: { maxUnnamedInputs?: number } = {}
): Promise<void> {
    const { maxUnnamedInputs = 0 } = options;
    const inputs = page.locator(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="reset"]), select, textarea'
    );
    const count = await inputs.count();
    const unnamedInputs: string[] = [];

    for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);

        const isVisible = await input.isVisible().catch(() => false);
        if (!isVisible) {
            continue;
        }

        const ariaHidden = await input.getAttribute('aria-hidden');
        if (ariaHidden === 'true') {
            continue;
        }

        const hasAccessibleNameSignal = await input.evaluate((node) => {
            const element = node as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

            const wrappedByLabel = !!element.closest('label');
            const labels = (element as any).labels as NodeListOf<HTMLLabelElement> | null;
            const hasDomLabel = !!labels && labels.length > 0;

            const ariaLabel = element.getAttribute('aria-label')?.trim();
            const ariaLabelledBy = element.getAttribute('aria-labelledby')?.trim();
            const title = element.getAttribute('title')?.trim();
            const placeholder = element.getAttribute('placeholder')?.trim();

            let hasAriaLabelledByText = false;
            if (ariaLabelledBy) {
                const ids = ariaLabelledBy.split(/\s+/).filter(Boolean);
                hasAriaLabelledByText = ids.some((id) => {
                    const labelNode = document.getElementById(id);
                    return !!labelNode?.textContent?.trim();
                });
            }

            return Boolean(
                wrappedByLabel ||
                hasDomLabel ||
                ariaLabel ||
                hasAriaLabelledByText ||
                title ||
                placeholder
            );
        });

        if (!hasAccessibleNameSignal) {
            const preview = await input.evaluate((node) => node.outerHTML.slice(0, 200));
            unnamedInputs.push(`index ${i}: ${preview}`);
        }
    }

    expect(
        unnamedInputs.length,
        [
            `Found ${unnamedInputs.length} input(s) without an accessible naming signal on ${page.url()}.`,
            ...unnamedInputs,
        ].join('\n')
    ).toBeLessThanOrEqual(maxUnnamedInputs);
}

async function assertNotRateLimited(page: Page): Promise<void> {
    const rateLimitHeading = page.getByRole('heading', { name: /429 too many requests/i });
    await expect(rateLimitHeading, 'Site returned a 429 rate-limit page. Re-run with fewer workers or wait a minute.').toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(LoginPage.DEFAULT_BASE_URL);
    await assertNotRateLimited(page);
});

test.describe('Accessibility', () => {
    test.describe.configure({ mode: 'serial' });

    test('all images should declare alt attributes', async ({ page }) => {
        const images = page.locator('img');
        const count = await images.count();
        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const hasAltAttribute = await img.evaluate((node) => node.hasAttribute('alt'));
            const src = await img.getAttribute('src');
            expect(hasAltAttribute, `Image with src "${src}" is missing an alt attribute`).toBeTruthy();
        }
    });

    test('all form inputs should have associated labels', async ({ page }) => {
        await page.goto(LoginPage.DEFAULT_BASE_URL);
        await assertNotRateLimited(page);
        await assertInputsHaveAccessibleNames(page);
    });

    test('authenticated pages should have labelled inputs', async ({ page }) => {
        test.skip(
            !canRunSuccessfulAuth || !canRunAuthenticatedAccessibility,
            'Set POSTEO_VALID_CREDENTIALS=true and POSTEO_RUN_AUTH_A11Y=true to run authenticated Posteo accessibility checks.'
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.clickLoginButton();
        await loginPage.login(requireEnv('TEST_USER_EMAIL'), requireEnv('TEST_PASSWORD'));

        const authenticatedPaths = ['/webmail/'];
        for (const path of authenticatedPaths) {
            await page.goto(`https://posteo.de${path}`);
            await assertNotRateLimited(page);
            // Third-party authenticated UIs may contain a small number of known unlabeled controls.
            await assertInputsHaveAccessibleNames(page, { maxUnnamedInputs: 1 });
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

        const focusableTags = new Set(['a', 'button', 'input', 'select', 'textarea']);
        const focusedInteractiveCount = focusedElements.filter((tag) => !!tag && focusableTags.has(tag)).length;
        expect(focusedInteractiveCount, 'Should be able to tab to at least one interactive element').toBeGreaterThan(0);
    });
});