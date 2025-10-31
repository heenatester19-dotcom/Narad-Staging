import { test, expect } from '@playwright/test';

test('Narad Flow - Login, Cabinet Policy, Billing Edit', async ({ page }) => {

  // Step 1: Login
   await page.getByRole('button', { name: 'Next' }).click();

  // Wait until radio is visible before checking
  const passwordRadio = page.getByRole('radio', { name: /Password/i });
  await passwordRadio.waitFor({ state: 'visible' });
  await passwordRadio.check();

  await page.getByRole('button', { name: 'Continue' }).click();

  // Fill credentials
  await page.getByRole('textbox', { name: /Password/i }).fill('Narad123!');
  await page.getByRole('button', { name: /Sign In/i }).click();

  // Verify dashboard loaded
  // Wait for home dashboard to load
  await page.waitForLoadState('networkidle');
 await expect(page).toHaveURL(/dashboard/);
  // Step 2: Go to Cabinet → Add Policy → Rename → Delete
  await page.getByRole('button', { name: 'Cabinet' }).click();
  await page.getByRole('button', { name: 'Policies' }).click();

  await page.getByRole('button', { name: 'Add' }).click();
  const filePath = 'Information-Security-Policy-EN.pdf';
  await page.setInputFiles('input[type="file"]', filePath);
  await expect(page.getByText('File uploaded successfully')).toBeVisible();

  // Rename uploaded policy
  await page.getByLabel('Information-Security-Policy-EN').click();
  await page.getByText('Rename').click();
  await page.getByRole('textbox', { name: 'File Name*' }).fill('Information-Security-Policy-EN new');
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('File renamed successfully')).toBeVisible();

  // Delete uploaded policy
  await page.getByLabel('Information-Security-Policy-EN new').click();
  await page.getByText('Delete').click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByText('File deleted successfully')).toBeVisible();

  // Step 3: Go to Settings → Billing → Edit Billing Details
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Billing' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();

  await page.getByRole('textbox', { name: 'Address *' }).fill('Warehouse (North) | Sector 7 test address');
  await page.getByRole('combobox', { name: 'Country' }).click();
  await page.getByRole('option', { name: 'India' }).click();

  await page.getByRole('combobox', { name: 'State' }).click();
  await page.getByRole('option', { name: 'Gujarat' }).click();

  await page.getByRole('textbox', { name: 'City' }).fill('Surat');
  await page.getByRole('textbox', { name: 'Pin Code' }).fill('395009');

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Billing details updated successfully')).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();

  console.log('✅ Test flow completed successfully!');
});
