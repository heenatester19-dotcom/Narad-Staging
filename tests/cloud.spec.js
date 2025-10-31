import { test, expect } from '@playwright/test';
import { doLogin } from './login';

test('Member Module: Add → Resend Email → Delete Flow', async ({ page }) => {
  try {
    // -------------------------------------------------
    // 🔐 LOGIN FLOW
    // -------------------------------------------------
    await doLogin(page);
    await page.waitForSelector('text=Dashboard', { timeout: 60000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
    console.log('✅ Logged in successfully and Dashboard loaded.');

    // -------------------------------------------------
    // ⚙️ NAVIGATE TO SETTINGS → MEMBERS
    // -------------------------------------------------
    console.log('➡ Navigating to Members...');
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Members' }).click();

    await expect(page.getByRole('button', { name: 'Add Member' })).toBeVisible({ timeout: 30000 });
    console.log('✅ Members page loaded successfully.');

    // -------------------------------------------------
    // 🧩 ADD MEMBER FLOW
    // -------------------------------------------------
    console.log('➕ Adding new member...');
    const addMemberBtn = page.getByRole('button', { name: /Add Member/i });
    await addMemberBtn.waitFor({ state: 'visible', timeout: 30000 });
    await addMemberBtn.click();

    // CRITICAL: Click "New Member" from the menu that appears
    await page.getByText('New Member').click();
    console.log('✓ Clicked New Member menu item');

    // Wait for dialog to appear
    const dialog = page.locator('div[role="dialog"]');
    await dialog.waitFor({ state: 'visible', timeout: 10000 });

    // Fill form using direct placeholders
    await dialog.getByRole('textbox', { name: /First Name/i }).fill('Heena');
    console.log('✓ Filled First Name');

    await dialog.getByRole('textbox', { name: /Last Name/i }).fill('QA Test');
    console.log('✓ Filled Last Name');

    const testEmail = `heena.webosmotic+test_${Date.now()}@gmail.com`;
    await dialog.getByRole('textbox', { name: /Email/i }).fill(testEmail);
    console.log('✓ Filled Email:', testEmail);

    // Select Role
    await dialog.getByText('Member', { exact: true }).first().click();
    await page.waitForTimeout(500);
    await page.locator('#menu-').getByText('Member', { exact: true }).click();
    console.log('✓ Selected Role: Member');

    // Save
    await dialog.getByRole('button', { name: 'Save' }).click();
    console.log('✓ Clicked Save');

    await page.getByText(/Member added successfully/i).waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Member added successfully.');

    // Wait for dialog to close
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });

    // -------------------------------------------------
    // 🔁 RESEND ONBOARDING EMAIL
    // -------------------------------------------------
    console.log('📧 Resending onboarding email...');
    
    // Click on the member row
    await page.getByText('Heena QA Test').click();

    // Open More Actions menu
    const moreActions = page.getByRole('button', { name: /More Actions/i }).last();
    await moreActions.click();
    
    await page.getByText('Resend Onboarding Email').click();

    await expect(page.getByText(/verification link has been/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Verification link sent successfully.');
    await page.getByRole('button', { name: 'Close' }).click();

    // -------------------------------------------------
    // ❌ DELETE MEMBER
    // -------------------------------------------------
    console.log('🗑️ Deleting member...');
    await moreActions.click();
    await page.getByText('Delete Member').click();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page.getByText(/Member deleted successfully/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Member deleted successfully.');
    await page.getByRole('button', { name: 'Close' }).click();

    console.log('🎯 Member Flow completed successfully.');
  } catch (err) {
    const debugPath = `screenshots/member-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('❌ Test failed. Screenshot saved at:', debugPath);
    throw err;
  }
});