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

// Wait for the context menu to disappear and dialog to appear
await page.waitForTimeout(2000);

// Wait for the dialog to be visible
await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 10000 });
console.log('✓ Add Member dialog appeared');

// Wait for First Name field to be ready
const firstNameField = page.getByRole('textbox', { name: /First Name/i });
await firstNameField.waitFor({ state: 'visible', timeout: 10000 });
await firstNameField.click();
await firstNameField.fill('Heena');
console.log('✓ Filled First Name');

    // Fill Last Name
    const lastNameField = page.getByRole('textbox', { name: /Last Name/i });
    await lastNameField.click();
    await lastNameField.fill('QA Test');
    console.log('✓ Filled Last Name');



// Fill Email
const testEmails = `heena.webosmotic+test_${Date.now()}@gmail.com`;
const emailField = page.getByRole('textbox', { name: /Email/i });
await emailField.click();
await emailField.fill(testEmails);
console.log('✓ Filled Email:', testEmails);

// Role is already set to "Member" by default - skip selection
console.log('✓ Role: Member (default)');

// Click Save button
await page.getByRole('button', { name: 'Save' }).click();
console.log('✓ Clicked Save');

// Wait for success message
await page.getByText(/Member added successfully/i).waitFor({ state: 'visible', timeout: 20000 });
console.log('✅ Member added successfully.');

    // Wait for dialog to close and table to update
    await page.waitForTimeout(3000);

    // -------------------------------------------------
    // 🔁 RESEND ONBOARDING EMAIL
    // -------------------------------------------------
    console.log('📧 Resending onboarding email...');
    
    // Find and click on the newly added member
    await page.getByText('Heena QA Test').waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText('Heena QA Test').click();
    console.log('✓ Clicked on member row');

    // Wait a moment for row to be selected
    await page.waitForTimeout(1000);

    // Open More Actions menu (use last() to get the newest member's button)
    const moreActions = page.getByRole('button', { name: /More Actions/i }).last();
    await moreActions.waitFor({ state: 'visible', timeout: 5000 });
    await moreActions.click();
    console.log('✓ Opened More Actions menu');
    
    await page.getByText('Resend Onboarding Email').waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText('Resend Onboarding Email').click();
    console.log('✓ Clicked Resend Onboarding Email');

    await expect(page.getByText(/verification link has been/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Verification link sent successfully.');
    
    await page.getByRole('button', { name: 'Close' }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: 'Close' }).click();

    // -------------------------------------------------
    // ❌ DELETE MEMBER
    // -------------------------------------------------
    console.log('🗑️ Deleting member...');
    
    await page.waitForTimeout(1000);
    
    await moreActions.waitFor({ state: 'visible', timeout: 5000 });
    await moreActions.click();
    console.log('✓ Opened More Actions menu again');
    
    await page.getByText('Delete Member').waitFor({ state: 'visible', timeout: 5000 });
    await page.getByText('Delete Member').click();
    console.log('✓ Clicked Delete Member');
    
    await page.getByRole('button', { name: 'Yes' }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: 'Yes' }).click();
    console.log('✓ Confirmed deletion');

    await expect(page.getByText(/Member deleted successfully/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Member deleted successfully.');
    
    await page.getByRole('button', { name: 'Close' }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: 'Close' }).click();

    console.log('🎯 Member Flow completed successfully.');
  } catch (err) {
    const debugPath = `screenshots/member-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('❌ Test failed. Screenshot saved at:', debugPath);
    throw err;
  }
});