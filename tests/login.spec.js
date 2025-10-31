import { test, expect } from '@playwright/test';

// Give generous timeout for slow UI and transitions
test.setTimeout(3 * 60 * 1000);

const BASE_URL = 'https://lumora.saas-staging.narad.io/';
const EMAIL = 'https://lumora.saas-staging.narad.io/m';
const PASSWORD = 'Narad123!';

async function clickWithFallback(page, selectors, perSelectorTimeout = 8000) {
  for (const sel of selectors) {
    try {
      const locator = page.locator(sel);
      await locator.first().waitFor({ state: 'visible', timeout: perSelectorTimeout });
      await page.waitForTimeout(200);
      await locator.first().click({ force: true });
      await page.waitForTimeout(400);
      return;
    } catch (e) {
      // try next
    }
  }
  throw new Error('None of selectors clickable: ' + selectors.join(' | '));
}

test('Email -> Next -> Try another way -> Password -> Login', async ({ page }) => {
  console.log('🌐 Opening login page');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Enter email
  const emailLocator = page.locator('input[name="username"]').first();
  await emailLocator.waitFor({ state: 'visible', timeout: 60000 });
  await emailLocator.fill(EMAIL);
  console.log('✅ Email filled');

  // Click Next
  await clickWithFallback(page, [
    'xpath=//button[contains(., "Next")]',
    'xpath=//button[@type="submit"]',
    'button:has-text("Next")',
    'button[type="submit"]'
  ], 12000);
  console.log('✅ Next clicked');

  // Wait shortly for choose-sign-in UI to render
  await page.waitForTimeout(800);

  // Click "Try another way" (fallbacks)
  await clickWithFallback(page, [
    'xpath=(//button[contains(., "Try another way")])[1]',
    'xpath=//button[contains(., "Try another way")]',
    'button:has-text("Try another way")',
    'button:nth-child(1)'
  ], 12000);
  console.log('✅ Clicked "Try another way"');

  // Select Password radio (many fallback locators you provided)
  const passwordRadioSelectors = [
    'xpath=(//input[contains(@class, "native-input")])[2]',
    'input.native-input:nth-child(2)',
    'input[value="USER_PASSWORD_AUTH"]',
    'text=/Password/i',
    'xpath=//label[contains(.,"Password")]//input'
  ];
  let radioClicked = false;
  for (const s of passwordRadioSelectors) {
    try {
      const loc = page.locator(s);
      await loc.first().waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(150);
      await loc.first().click({ force: true });
      radioClicked = true;
      console.log('✅ Password radio/label clicked with:', s);
      break;
    } catch (err) {
      // try next
    }
  }
  if (!radioClicked) {
    throw new Error('Password option not selectable using any fallback selectors.');
  }

  // Click Continue (to load password input)
  await clickWithFallback(page, [
    'xpath=(//button)[1]',
    'xpath=(//button[contains(., "Continue")])[1]',
    'button[type="submit"]',
    'button:has-text("Continue")'
  ], 12000);
  console.log('✅ Continue clicked to show password field');

  // Wait for password input and fill
  const passwordInputSelectors = [
    'xpath=(//input[@name="password"])[1]',
    'input[name="password"]',
    'xpath=//input[contains(@placeholder,"Password")]'
  ];
  let pwVisible = false;
  for (const s of passwordInputSelectors) {
    try {
      await page.locator(s).first().waitFor({ state: 'visible', timeout: 15000 });
      await page.locator(s).first().fill(PASSWORD);
      pwVisible = true;
      console.log('🔒 Password entered using selector:', s);
      break;
    } catch (e) {
      // continue
    }
  }
  if (!pwVisible) throw new Error('Password input not found.');

  // Final submit
  await clickWithFallback(page, [
    'xpath=(//button[@type="submit"])[1]',
    'button[type="submit"]',
    'xpath=(//button[contains(., "Continue")])[1]',
    'button:has-text("Continue")'
  ], 12000);
  console.log('✅ Final submit clicked');

  // Verify post-login landing
  await expect(page).toHaveURL(/dashboard/i, { timeout: 120000 });
  console.log('🎯 Password flow login succeeded');
});
