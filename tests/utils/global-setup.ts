import { chromium, FullConfig } from '@playwright/test';
import { loginAsAdmin } from './auth';

async function globalSetup(config: FullConfig) {
  console.log("Starting authentication...");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await loginAsAdmin(page);

  console.log("💾 Guardando storage...");
  await page.context().storageState({
    path: 'tests/.auth/admin.json',
  });

  await browser.close();
}

export default globalSetup;
