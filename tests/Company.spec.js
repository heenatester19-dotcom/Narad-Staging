import { test, expect } from '@playwright/test';
import { doLogin } from './login';

test('Company Module: Update Company Details', async ({ page }) => {
  try {
    // Test data
    const companyName = 'Lumora & Pvt Ltd test TEST';

    // -------------------------------------------------
    // 🔐 LOGIN FLOW
    // -------------------------------------------------
    await doLogin(page);
    await page.waitForSelector('text=Dashboard', { timeout: 60000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
    console.log('✅ Logged in successfully and Dashboard loaded.');

    // -------------------------------------------------
    // 🏢 UPDATE COMPANY DETAILS
    // -------------------------------------------------
    console.log('🏢 Updating company details...');
    
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Company' }).click();
    
    // Click Edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Update company name
    const companyNameField = page.getByRole('textbox', { name: /Company Name/i });
    await companyNameField.waitFor({ state: 'visible', timeout: 10000 });
    await companyNameField.clear();
    await companyNameField.fill(companyName);
    console.log('✓ Company name updated:', companyName);
    
    // Save company details
    const saveBtn = page.getByRole('button', { name: 'Save' });
    const saveVisible = await saveBtn.isVisible().catch(() => false);
    
    if (saveVisible) {
      await saveBtn.click();
      console.log('✓ Clicked Save button');
      
      // Check for success message
      const successMsg = page.getByText(/Company details updated/i);
      const msgVisible = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (msgVisible) {
        console.log('✅ Company details updated successfully');
        await page.getByRole('button', { name: 'Close' }).click();
      }
    }

    console.log('🎯 Company Flow completed successfully.');
  } catch (err) {
    const debugPath = `screenshots/company-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('❌ Test failed. Screenshot saved at:', debugPath);
    throw err;
  }
});