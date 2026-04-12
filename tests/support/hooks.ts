import { Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CustomWorld } from './world';

setDefaultTimeout(30 * 1000);

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld, scenario) {
  if (this.context) {
    const slug = scenario.pickle.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'scenario';
    const artifactsDir = path.join(process.cwd(), 'test-results', 'cucumber-artifacts');
    const tracePath = path.join(artifactsDir, `${slug}.zip`);
    const screenshotPath = path.join(artifactsDir, `${slug}.png`);

    await fs.mkdir(artifactsDir, { recursive: true });

    if (scenario.result?.status === Status.FAILED && this.page) {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      await this.context.tracing.stop({ path: tracePath });
    } else {
      await this.context.tracing.stop();
    }
  }

  if (this.browser) {
    await this.cleanup();
  }
});