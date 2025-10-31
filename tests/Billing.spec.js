import { test, expect } from '@playwright/test';
import { doLogin } from './login';

test('Billing Module: Update Billing Details', async ({ page }) => {
  try {
    // Test data
    const testData = {
      address: 'test 12 -45 adress, char rastaa 523 test adress test adres235 test adresss test adress',
      country: 'India',
      state: 'Gujarat',
      city: 'surat',
      pinCode: '395006',
      gstNumber: '09AAACH7409R1ZZ'
    };

    // -------------------------------------------------
    // 🔐 LOGIN FLOW
    // -------------------------------------------------
    await doLogin(page);
    await page.waitForSelector('text=Dashboard', { timeout: 60000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
    console.log('✅ Logged in successfully and Dashboard loaded.');

    // -------------------------------------------------
    // 💳 UPDATE BILLING DETAILS
    // -------------------------------------------------
    console.log('💳 Updating billing details...');
    
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Billing' }).click();
    
    // Click Edit button
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // Fill address
    const addressField = page.getByRole('textbox', { name: /Address/i });
    await addressField.waitFor({ state: 'visible', timeout: 10000 });
    await addressField.clear();
    await addressField.fill(testData.address);
    console.log('✓ Address filled');
    
    // Select country
    const countryDropdown = page.getByRole('combobox').first();
    await countryDropdown.click();
    await page.getByRole('option', { name: testData.country, exact: true }).click();
    console.log('✓ Country selected');
    
    // Wait for state dropdown to populate
    await page.waitForTimeout(500);
    
    // Select state
    const stateDropdown = page.getByRole('combobox').nth(1);
    await stateDropdown.click();
    await page.getByRole('option', { name: testData.state }).click();
    console.log('✓ State selected');
    
    // Fill city
    await page.getByRole('textbox', { name: /City/i }).fill(testData.city);
    console.log('✓ City filled');
    
    // Fill pin code
    await page.getByRole('textbox', { name: /Pin Code/i }).fill(testData.pinCode);
    console.log('✓ Pin Code filled');
    
    // Fill GST number
    await page.getByRole('textbox', { name: /GST Number/i }).fill(testData.gstNumber);
    console.log('✓ GST Number filled');
    
    // Save billing details
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify success message
    await expect(page.getByText(/Billing details updated/i))
      .toBeVisible({ timeout: 10000 });
    console.log('✅ Billing details updated successfully');
    
    // Close notification
    await page.getByRole('button', { name: 'Close' }).click();

    console.log('🎯 Billing Flow completed successfully.');
  } catch (err) {
    const debugPath = `screenshots/billing-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('❌ Test failed. Screenshot saved at:', debugPath);
    throw err;
  }
});