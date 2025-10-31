import { expect } from '@playwright/test';

const BASE_URL = 'https://lumora.saas-staging.narad.io/';
const EMAIL = 'heena.webosmotic+lumora@gmail.com';
const PASSWORD = 'Narad123!';

export async function doLogin(page) {
  console.log('🌐 Opening login page');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Enter email
  const emailLocator = page.locator('input[name="username"]').first();
  await emailLocator.waitFor({ state: 'visible', timeout: 60000 });
  await emailLocator.fill(EMAIL);
  console.log('✅ Email filled');

  // Click Next
  await page.click('button:has-text("Next")');

  // Click "Try another way"
  await page.click('button:has-text("Try another way")');

  // Password radio
  await page.locator('(//input[contains(@class, "native-input")])[2]').click();
  console.log('✅ Password radio clicked');

  // Continue to password input
  await page.click('button:has-text("Continue")');

  // Fill password
  await page.locator('(//input[@name="password"])[1]').fill(PASSWORD);
  console.log('🔒 Password entered');

  // Final submit
  await page.click('button:has-text("Continue")');

  // Verify landing
  await expect(page).toHaveURL(/dashboard/i, { timeout: 120000 });
  console.log('🎯 Password flow login succeeded');
}
