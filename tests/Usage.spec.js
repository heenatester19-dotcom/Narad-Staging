import { test, expect } from '@playwright/test';
import { doLogin } from './login';

test('Usage Module: View Usage Statistics', async ({ page }) => {
  try {
    // -------------------------------------------------
    // 🔐 LOGIN FLOW
    // -------------------------------------------------
    await doLogin(page);
    await page.waitForSelector('text=Dashboard', { timeout: 60000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
    console.log('✅ Logged in successfully and Dashboard loaded.');

    // -------------------------------------------------
    // 📊 VIEW USAGE
    // -------------------------------------------------
    console.log('📊 Viewing usage statistics...');
    
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Usage' }).click();
    
    // Wait for usage page to load
    await page.waitForTimeout(2000);
    
    // Verify usage page is displayed
    await expect(page.getByRole('button', { name: 'Usage' })).toBeVisible();
    console.log('✅ Usage page loaded successfully');

    console.log('🎯 Usage Flow completed successfully.');
  } catch (err) {
    const debugPath = `screenshots/usage-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('❌ Test failed. Screenshot saved at:', debugPath);
    throw err;
  }
});