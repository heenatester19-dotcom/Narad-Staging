import { test, expect } from '@playwright/test';

test('Narad - Company, Billing, and Member Flow', async ({ page, context }) => {

  // ---------------- LOGIN ----------------
  await page.goto('https://lumora.saas-staging.narad.io/');
  await page.getByRole('textbox', { name: 'Email address' }).fill('heena.webosmotic+admin_001@gmail.com');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Try another way' }).click();
  await page.getByRole('radio', { name: 'Password', exact: true }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Narad123!');
  await page.getByRole('button', { name: 'Continue' }).click();

  // ---------------- NAVIGATION ----------------
  await page.getByRole('button', { name: 'Dashboard' }).click();
  await page.getByRole('button', { name: 'Cabinet' }).click();
  await page.getByRole('button', { name: 'Policies' }).click();
  await page.getByRole('button', { name: 'Evidence' }).click();
  await page.getByRole('button', { name: 'Artifacts' }).click();
  await page.getByRole('button', { name: 'Ask narad' }).click();
  await page.getByRole('button', { name: 'Chat' }).click();
  await page.getByRole('button', { name: 'Questionnaire' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();

  // ---------------- BILLING SECTION ----------------
  await page.getByRole('button', { name: 'Billing' }).click();
  await page.waitForLoadState('domcontentloaded');

  // Edit Billing
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox', { name: 'Address *' }).fill('test 12 -45 adress, char rastaa 523 test adress test adres235 test adresss');
  await page.getByLabel('Edit Billing Details').getByText('India').click();
  await page.locator('.MuiBackdrop-root.MuiBackdrop-invisible').first().click();
  await page.getByRole('textbox', { name: 'City' }).fill('Surat');
  await page.getByRole('textbox', { name: 'Pin Code' }).fill('395005');
  await page.getByRole('button', { name: 'Save' }).click();

  // Preview Invoice
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Preview Invoice' }).click();
  const invoicePage = await page1Promise;
  await invoicePage.waitForLoadState('load');
  await invoicePage.close();

  // ---------------- COMPANY SECTION ----------------
  const companyBtn = page.locator('button:has-text("Company"), div[role="button"]:has-text("Company")');

  // Handle multiple or hidden elements safely
  const count = await companyBtn.count();
  let visibleCompany;
  for (let i = 0; i < count; i++) {
    if (await companyBtn.nth(i).isVisible()) {
      visibleCompany = companyBtn.nth(i);
      break;
    }
  }

  if (!visibleCompany) throw new Error('❌ Company button not visible on screen.');
  await visibleCompany.scrollIntoViewIfNeeded();
  await visibleCompany.click({ force: true });

  // Edit Company
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('combobox', { name: /Reminder/i }).click();
  await page.getByRole('option', { name: '3 months' }).click();
  await page.getByRole('textbox', { name: 'Company Name' }).fill('skyenter');
  await page.getByRole('button', { name: 'Save' }).click();

  // ---------------- MEMBER SECTION ----------------
  await page.getByRole('button', { name: 'Members' }).click();
  await expect(page.getByRole('button', { name: 'Add Member' })).toBeVisible({ timeout: 30000 });

  await page.getByRole('button', { name: 'Add Member' }).click();
  await page.getByText('New Member').click();
  await page.getByRole('textbox', { name: 'First Name*' }).fill('test');
  await page.getByRole('textbox', { name: 'Last Name*' }).fill('member');
  await page.getByRole('textbox', { name: 'Email*' }).fill('heena.webosmotic+member@gmail.com');
  await page.getByRole('button', { name: 'Save' }).click();

  // Final assertion
  await expect(page.getByText('Member added successfully')).toBeVisible({ timeout: 20000 });

});
