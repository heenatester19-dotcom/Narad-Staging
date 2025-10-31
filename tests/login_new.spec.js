import { test, expect } from '@playwright/test';

test.describe('Narad Login Flows', () => {

  const BASE_URL = 'https://skyenter.saas-prod.narad.io/';
  const EMAIL = 'heena.webosmotic+Admin2@gmail.com';
  const PASSWORD = 'Narad123!';

  // ============ 1️⃣ MANUAL OTP FLOW ============
  test('Login via Manual OTP entry', async ({ page }) => {
    console.log('🌐 Opening Narad login page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Step 1 - Enter email
    const emailField = page.locator('input[name="username"]').first();
    await emailField.waitFor({ state: 'visible', timeout: 60000 });
    await emailField.fill(EMAIL);
    console.log('✅ Email entered successfully');

    // Click Continue (using role-based locator)
 // Wait until Continue button is visible & clickable
const continueBtn = page.getByRole('button', { name: /Continue/i }).first();
await continueBtn.waitFor({ state: 'visible', timeout: 15000 });

// Add small wait to ensure it’s ready
await page.waitForTimeout(500);

// Click using force to bypass any overlay or timing issue
await continueBtn.click({ force: true });

console.log('✅ Continue clicked successfully');
test.setTimeout(60000); // at top of the test

    // Step 2 - Wait for OTP field
    const otpField = page.locator('input[name="code"]').first();
    try {
      await otpField.waitFor({ state: 'visible', timeout: 60000 });
      console.log('⚠️ OTP input visible — please manually enter OTP within 5 mins');
    } catch {
      throw new Error('❌ OTP field not visible. Check if login switched to password method.');
    }

    // Wait until OTP entered manually
    await page.waitForFunction(() => {
      const el = document.querySelector('input[name="code"]');
      return el && el.value.trim().length > 0;
    }, { timeout: 5 * 60 * 1000 }); // wait 5 mins max

    console.log('🔐 OTP detected — clicking Continue...');
    await page.getByRole('button', { name: /Continue/i }).first().click();

    // Step 3 - Verify dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 120000 });
    console.log('🎯 OTP login successful');
  });

  // ============ 2️⃣ TRY ANOTHER WAY (PASSWORD) ============
  test('Login via "Try another way" → Password', async ({ page }) => {
    console.log('🌐 Opening Narad login page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Step 1 - Enter email
    const emailField = page.locator('input[name="username"]').first();
    await emailField.waitFor({ state: 'visible', timeout: 60000 });
    await emailField.fill(EMAIL);
    console.log('✅ Email entered successfully');

    // Step 2 - Click Continue
    await page.getByRole('button', { name: /Continue/i }).first().click();

    // Step 3 - Wait for “Try another way”
    const tryAnother = page.locator('button:has-text("Try another way")');
    if (await tryAnother.count() > 0) {
      await tryAnother.click();
      console.log('✅ Clicked "Try another way"');
    } else {
      console.log('⚠️ "Try another way" not visible — maybe password option loads directly.');
    }

    // Step 4 - Wait and select Password method
    const passwordLabel = page.locator('text=/Password/i');
    await passwordLabel.waitFor({ state: 'visible', timeout: 60000 });
    await passwordLabel.click();
    console.log('✅ Password method selected');

    // Step 5 - Click Continue to load password input
    await page.getByRole('button', { name: /Continue/i }).first().click();

    // Step 6 - Enter password and continue
    const passwordField = page.locator('input[name="password"]').first();
    await passwordField.waitFor({ state: 'visible', timeout: 60000 });
    await passwordField.fill(PASSWORD);
    console.log('🔒 Password entered');

    await page.getByRole('button', { name: /Continue/i }).first().click();

    // Step 7 - Verify dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 120000 });
    console.log('🎯 Password login successful');
  });
});
