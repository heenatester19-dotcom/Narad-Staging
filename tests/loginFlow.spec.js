import { test, chromium } from '@playwright/test';

const BASE_URL = 'https://lumora.saas-staging.narad.io/';
const VALID_EMAIL = 'heena.webosmotic+lumora@gmail.com';
const INVALID_EMAIL = 'heena.webosmotic+wrong@gmail.com';

// ✅ Helper function to safely check and log any validation message
async function logValidation(page, label) {
  const messageLocator = page.locator('.error-message, [role="alert"], text=/error|invalid|required|not found|enter/i');
  const isVisible = await messageLocator.isVisible({ timeout: 2000 }).catch(() => false);

  if (isVisible) {
    const msg = await messageLocator.innerText().catch(() => '');
    console.log(`⚠️ ${label} → Validation shown: "${msg}"`);
  } else {
    console.log(`ℹ️ ${label} → No validation message appeared.`);
  }
}

test('Lumora Login Flow - All Validations + OTP', async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--ignore-certificate-errors']
  });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  console.log('🌐 Opening Lumora staging login page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('input[name="username"]', { timeout: 60000 });
  console.log('✅ Login page loaded.');

  // 🧩 1. Click "Next" without email
  await page.click('button:has-text("Next")');
  await logValidation(page, 'Empty Email');

  // 🧩 2. Enter invalid format email
  await page.fill('input[name="username"]', 'abc@');
  await page.click('button:has-text("Next")');
  await logValidation(page, 'Invalid Email Format');

  // 🧩 3. Enter unregistered email
  await page.fill('input[name="username"]', INVALID_EMAIL);
  await page.click('button:has-text("Next")');
  await logValidation(page, 'Wrong/Unregistered Email');

  // 🧩 4. Enter valid email
  await page.fill('input[name="username"]', VALID_EMAIL);
  await page.click('button:has-text("Next")');
  console.log('✅ Valid email submitted.');

  // Wait for OTP or password step
  await page.waitForTimeout(3000);
  const otpField = page.locator('input[name="otp"], input[type="tel"]');
  const hasOtp = await otpField.isVisible().catch(() => false);

  if (hasOtp) {
    console.log('🔐 OTP step detected.');

    // 🧩 5. Click "Verify" without entering OTP
    await page.click('button:has-text("Verify"), button:has-text("Continue")');
    await logValidation(page, 'Empty OTP');

    // 🧩 6. Enter wrong OTP
    await otpField.fill('123456');
    await page.click('button:has-text("Verify"), button:has-text("Continue")');
    await logValidation(page, 'Wrong OTP');
  } else {
    console.log('ℹ️ No OTP step found — may redirect to password step.');
  }

  console.log('🎯 All negative login validation scenarios executed successfully.');

  await browser.close();
});
