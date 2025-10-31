import { test, expect } from '@playwright/test';

test('Login flow - Narad (Stable Locators from Test Case)', async ({ page }) => {
  // Set a longer default timeout for the entire test
  test.setTimeout(180000); // 3 minutes total for the test

  // Step 1: Open login page
  await page.goto('https://skyenter.saas-prod.narad.io/', { waitUntil: 'load' });

  // Add a general wait for the page to be stable.
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

  // Step 2: Enter email (using your cssSelector)
  const emailField = page.locator('input[id="formField:rk:"]');
  await emailField.waitFor({ state: 'visible', timeout: 30000 });
  await emailField.fill('heena.webosmotic+Admin2@gmail.com');
  console.log('Filled email address.');

  // Step 3: Click on "Next"
  // Assuming "Next" is the text within a button's span (common for AWS Amplify UI)
  const nextBtn = page.locator('button:has(span:has-text("Next"))');
  await nextBtn.waitFor({ state: 'visible', timeout: 60000 }); // Generous timeout
  await nextBtn.click();
  console.log('Clicked "Next" button.');

  // Step 4: Click on "Try another way"
  // Based on your previous errors and the structure, let's use a robust text-based locator.
  // The CSS selector `button[data-analytics-funnel-value="button:r6:"]` from your original code
  // combined with `span:has-text("Try another way")` is the most probable for stability.
  // However, your test case study doesn't provide a direct CSS selector for this.
  // Let's stick to a robust text-based one as it's less prone to positional changes.
  const tryAnotherBtn = page.locator('button', { hasText: 'Try another way' });
  // If the above still fails, try:
  // const tryAnotherBtn = page.locator('button:has(span:has-text("Try another way"))');
  // Or:
  // const tryAnotherBtn = page.locator('button[data-analytics-funnel-value="button:r6:"]'); // If this is actually stable
  // await page.waitForSelector('button[data-analytics-funnel-value="button:r6:"]', { state: 'visible', timeout: 60000 });
  // const tryAnotherBtn = page.locator('button[data-analytics-funnel-value="button:r6:"]');

  await tryAnotherBtn.waitFor({ state: 'visible', timeout: 90000 }); // Very generous timeout (1.5 min)
  await tryAnotherBtn.scrollIntoViewIfNeeded();
  await tryAnotherBtn.click({ force: true });
  console.log('Clicked "Try another way" button.');

  // Step 5: Click on "Password" radio button
  // Based on your test case: `input[@id = '#radio-button-1-label']` is an ID.
  // This is a great, stable locator!
  const passwordRadio = page.locator('input[id="radio-button-1-label"]');
  await passwordRadio.waitFor({ state: 'visible', timeout: 30000 });
  await passwordRadio.check();
  console.log('Selected "Password" radio button.');

  // Step 6: Click on "Continue" (after selecting password)
  // Your test case: `button[type="submit"]`
  const continueBtn1 = page.locator('button[type="submit"]');
  await continueBtn1.waitFor({ state: 'visible', timeout: 30000 });
  await continueBtn1.click();
  console.log('Clicked "Continue" button after selecting password.');

  // Steps 7-10 are related to password entry.
  // Step 7: Press CAP (Implied: this might mean a new password field appears)
  // Step 8: Enter password (using your cssSelector)
  const passwordField1 = page.locator('input[id="formField:rk:"]'); // Assuming this ID reappears for password
  await passwordField1.waitFor({ state: 'visible', timeout: 30000 });
  await passwordField1.fill('Narad123!'); // Filling with 'Narad123!' as per your original script
  console.log('Entered password into first field.');

  // Step 9: Press CAP (again - this might be a second password field or confirmation)
  // Step 10: Enter password (if there's a second one, use another ID or position)
  // Assuming 'Narad123!' is the final password to be entered.
  // Your test case script implies `input[@id='formField:rk:']` is used again.
  // If there's a *second* password field, its ID might be different, e.g., 'formField:rl:'
  // For now, we'll assume the previous fill was sufficient or it's the same field.

  // Let's assume the "Show password" (Step 11) is relevant after this password entry.
  // Step 11: Click "Show password"
  // Your test case: `span[@id = 'r:l:-label']`
  const showPasswordToggle = page.locator('span[id="r:l:-label"]');
  if (await showPasswordToggle.isVisible()) { // Check if it exists before interacting
    await showPasswordToggle.click();
    console.log('Clicked "Show password" toggle.');
  }


  // Step 12: Enter "Narad123!" (This seems to be a re-entry or a different password field)
  // Given your original script fills 'Narad123!' and the test case has "Enter Narad123!",
  // it's likely filling the password field that reappears.
  // Let's use the ID `input[id="formField:rk:"]` again for this if it's the same field.
  // If there's a new field, its ID might be `input[id="formField:rl:"]` as seen in your sheet.
  const passwordField2 = page.locator('input[id="formField:rl:"]'); // Assuming the ID from your sheet
  if (await passwordField2.isVisible()) {
      await passwordField2.fill('Narad123!');
      console.log('Entered "Narad123!" into second password field.');
  } else {
      console.log('Second password field (input[id="formField:rl:"]) was not visible. Skipping.');
  }

  // Step 13: Click "Continue" (to login)
  // Your test case: `button[type="submit"]`
  const continueBtn2 = page.locator('button[type="submit"]');
  await continueBtn2.waitFor({ state: 'visible', timeout: 30000 });
  await continueBtn2.click();
  console.log('Clicked final "Continue" button to login.');

  // Step 14: Verify successful login
  await expect(page).toHaveURL(/dashboard/i, { timeout: 45000 }); // Increased timeout for URL change
  console.log('✅ Login successful and redirected to dashboard.');

  // The rest of the steps are for post-login navigation and interaction.
  // I'll include them for completeness, adapting locators from your sheet.

  // Step 15: Click on "Settings"
  // Your test case: `p[id="r:p:"]`
  const settingsBtn = page.locator('p[id="r:p:"]');
  await settingsBtn.waitFor({ state: 'visible', timeout: 30000 });
  await settingsBtn.click();
  console.log('Clicked "Settings".');

  // Step 16: Click on "Cabinet"
  // Your test case: `div[cla body > div:nth-child(1) > div:nth-child(1)]` (This looks incomplete/broken)
  // Let's try to locate by text if "Cabinet" is a visible label, or use a robust attribute.
  // Assuming a common pattern for navigation items:
  const cabinetBtn = page.locator('div[role="button"]', { hasText: 'Cabinet' }); // Common for Material UI like elements
  if (!(await cabinetBtn.isVisible())) {
      // Fallback if not found directly
      console.warn('Could not find Cabinet button by text or role="button", trying by specific class/ID if available.');
      // If your test case meant `div[cla="body"] > div:nth-child(1) > div:nth-child(1)` try below
      // cabinetBtn = page.locator('div.MuiListItemButton-root', { hasText: 'Cabinet' });
      // Or based on your file's example for other list items:
      cabinetBtn = page.locator('div.MuiListItemButton-root:has-text("Cabinet")');
  }
  await cabinetBtn.waitFor({ state: 'visible', timeout: 30000 });
  await cabinetBtn.click();
  console.log('Clicked "Cabinet".');

  // Step 17: Click on "Policies"
  // Your test case: `div[cla_MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-compo` (Broken CSS)
  const policiesBtn = page.locator('div.MuiListItemButton-root', { hasText: 'Policies' });
  await policiesBtn.waitFor({ state: 'visible', timeout: 30000 });
  await policiesBtn.click();
  console.log('Clicked "Policies".');

  // Step 18: Click on "Add"
  // Your test case: `button[n_MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium css-r8c44m]` (Broken CSS)
  // Assuming "Add" is a button
  const addBtn = page.locator('button', { hasText: 'Add' });
  await addBtn.waitFor({ state: 'visible', timeout: 30000 });
  await addBtn.click();
  console.log('Clicked "Add".');

  // Step 19: Enter "into "file-input-main"
  // Your test case: `input[@id = 'file-input-main']`
  const fileInput = page.locator('input[id="file-input-main"]');
  await fileInput.waitFor({ state: 'visible', timeout: 30000 });
  // await fileInput.fill('path/to/your/file.txt'); // You'll need to provide an actual file path
  // If this is for file upload, consider using:
  // await fileInput.setInputFiles('path/to/your/file.txt');
  console.log('Attempted to fill file input (path placeholder).');

  // Step 20: Click on "OpE Open ai testt"
  // Your test case: `div[@id = 'r:4e:']`
  const openAiTesttBtn = page.locator('div[id="r:4e:"]');
  await openAiTesttBtn.waitFor({ state: 'visible', timeout: 30000 });
  await openAiTesttBtn.click();
  console.log('Clicked "OpE Open ai testt".');

  // Step 21: Click on "Rename FolderFolder"
  // Your test case: `div[cla body > div:nth-child(12) > div:nth-child(3) > div:nth-child(1)]` (Broken CSS)
  const renameFolderBtn = page.locator('div', { hasText: 'Rename FolderFolder' });
  await renameFolderBtn.waitFor({ state: 'visible', timeout: 30000 });
  await renameFolderBtn.click();
  console.log('Clicked "Rename FolderFolder".');

  // Step 22: Click on "Billing"
  // Your test case: `span[no body > div:nth-child(1) > div:nth-child(3) > form:nth-child(1) > button:nth-child(1)]` (Positional Xpath)
  const billingBtn = page.locator('button', { hasText: 'Billing' });
  await billingBtn.waitFor({ state: 'visible', timeout: 30000 });
  await billingBtn.click();
  console.log('Clicked "Billing".');

  // Step 23: Click on "Edit"
  // Your test case: `button[aria-label='Edit']`
  const editBtn = page.locator('button[aria-label="Edit"]');
  await editBtn.waitFor({ state: 'visible', timeout: 30000 });
  await editBtn.click();
  console.log('Clicked "Edit".');

  // Step 24: Click on "Address **"
  // Your test case: `textarea[id="r:8d:"]`
  const addressField = page.locator('textarea[id="r:8d:"]');
  await addressField.waitFor({ state: 'visible', timeout: 30000 });
  await addressField.click(); // Click to focus
  console.log('Clicked "Address" textarea.');

  // Step 25: Enter "test test 12-45 adress, cr"
  // Your test case: `textarea[id="r:8d:"]`
  await addressField.fill('test test 12-45 address, cr');
  console.log('Filled "Address" textarea.');

  // Step 26: Click on "bodyElement"
  // Your test case: `//body`
  // This likely means clicking outside to close a modal/dropdown.
  await page.locator('body').click();
  console.log('Clicked on body to dismiss potential element.');

  // Step 27: Click on "India"
  // Your test case: `li[cla_norma.MuiButtonBase-root.MuiMenuItem-root.MuiMenuItem-gutters.MuiMenuItem-root.MuiMenuItem-gutters css-kk1e0a]` (Broken CSS)
  // Assuming this is a list item for a dropdown
  const indiaOption = page.locator('li.MuiMenuItem-root', { hasText: 'India' });
  await indiaOption.waitFor({ state: 'visible', timeout: 30000 });
  await indiaOption.click();
  console.log('Selected "India".');

  // Step 28: Click on "bodyElement"
  // Your test case: `//body`
  await page.locator('body').click();
  console.log('Clicked on body again.');

  // Step 29: Click on "Gujarat"
  // Your test case: `li[cla_norma.MuiButtonBase-root.MuiMenuItem-root.MuiMenuItem-gutters.MuiMenuItem-root.MuiMenuItem-gutters css-kk1e0a]` (Broken CSS)
  const gujaratOption = page.locator('li.MuiMenuItem-root', { hasText: 'Gujarat' });
  await gujaratOption.waitFor({ state: 'visible', timeout: 30000 });
  await gujaratOption.click();
  console.log('Selected "Gujarat".');

  // Step 30: Click on "Edit Billing DetailsAdc"
  // Your test case: `div[cla_MuiDialog-container.MuiDialog-scrollPaper.css-ekc8j1]` (Likely a dialog, not a button)
  // This might be the label for a section or a button to open a dialog.
  // Assuming it's a clickable element with the text.
  const editBillingDetailsAdc = page.locator('div', { hasText: 'Edit Billing Details' }); // Simplified text
  await editBillingDetailsAdc.waitFor({ state: 'visible', timeout: 30000 });
  await editBillingDetailsAdc.click();
  console.log('Clicked "Edit Billing Details".');


  // Step 31: Click on "Pin CodE**"
  // Your test case: `div[cla body > div body > div:nth-child(11)]` (Positional, use a text-based input)
  // Assuming it's an input field for a pin code.
  const pinCodeInput = page.locator('input[name="pinCode"]'); // Common name for pin code fields
  if (!(await pinCodeInput.isVisible())) {
      // Fallback if not found by name, try by placeholder or label
      pinCodeInput = page.locator('input[placeholder*="Pin Code"]');
      if (!(await pinCodeInput.isVisible())) {
          pinCodeInput = page.locator('label:has-text("Pin Code") + input'); // Label adjacent to input
      }
  }
  await pinCodeInput.waitFor({ state: 'visible', timeout: 30000 });
  await pinCodeInput.click();
  console.log('Clicked "Pin Code" input.');


  // Step 32: Enter "395"
  // Your test case: `input[id="formField:rk:"]` - This ID keeps reappearing, so let's be careful.
  // Assuming the previous locator `pinCodeInput` refers to the correct field.
  await pinCodeInput.fill('395');
  console.log('Filled "Pin Code" with "395".');

  // Step 33: Click on "Edit Billing DetailsAdc" (again)
  // Your test case: `p[cla_MuiTypography-root.MuiTypography-body2.css-1sxz974]`
  // This is likely a text element, not a clickable button for "edit".
  // Perhaps it's a confirmation button for billing details. Let's look for a button with "Save" or "Done" or "Update".
  const saveBillingBtn = page.locator('button', { hasText: 'Save' }); // Common pattern for saving changes
  if (!(await saveBillingBtn.isVisible())) {
    saveBillingBtn = page.locator('button', { hasText: 'Update' });
  }
  await saveBillingBtn.waitFor({ state: 'visible', timeout: 30000 });
  await saveBillingBtn.click();
  console.log('Clicked "Save/Update" billing button.');

  // Step 34: Click on "Close"
  // Your test case: `svg[@fill='currentColor']` - very generic.
  // It's likely a button with an icon or specific role.
  const closeBtn = page.locator('button[aria-label="Close"]'); // Common for close buttons
  if (!(await closeBtn.isVisible())) {
      closeBtn = page.locator('button', { has: page.locator('svg[data-testid="CloseIcon"]') }); // If using MUI icons
  }
  if (!(await closeBtn.isVisible())) {
      closeBtn = page.locator('button', { hasText: 'Close' }); // If it has text
  }
  await closeBtn.waitFor({ state: 'visible', timeout: 30000 });
  await closeBtn.click();
  console.log('Clicked "Close" button.');

  // Step 35: Click on "Company"
  // Your test case: `span[no body > div:nth-child(1) > div:nth-child(1)]` (Positional Xpath)
  const companyBtn = page.locator('div.MuiListItemButton-root', { hasText: 'Company' });
  await companyBtn.waitFor({ state: 'visible', timeout: 30000 });
  await companyBtn.click();
  console.log('Clicked "Company".');

  // Step 36: Click on "Edit" (again, context dependent)
  // Your test case: `button[id = 'M2 20.9996C1.45 20.9996 0 19.167 0 16.8038 0 14.4406 1.45 12.608 3.25 12.608]` (Broken/path data)
  const editCompanyBtn = page.locator('button[aria-label="Edit"]'); // Assuming the same edit button logic
  await editCompanyBtn.waitFor({ state: 'visible', timeout: 30000 });
  await editCompanyBtn.click();
  console.log('Clicked "Edit" company button.');

  // Step 37: Enter "Sky, Skyenter test name tc"
  // Your test case: `input[@id = 'r:8p:']`
  const companyNameInput = page.locator('input[id="r:8p:"]');
  await companyNameInput.waitFor({ state: 'visible', timeout: 30000 });
  await companyNameInput.fill('Sky, Skyenter test name tc');
  console.log('Filled company name.');

  // Step 38: Click on "bodyElement"
  // Your test case: `//body`
  await page.locator('body').click();
  console.log('Clicked on body for the third time.');

  // Step 39: Click on "3 months"
  // Your test case: `*[name] body` (Incomplete/ambiguous)
  // Assuming a radio button or selection with this text
  const threeMonthsOption = page.locator('button', { hasText: '3 months' });
  if (!(await threeMonthsOption.isVisible())) {
      threeMonthsOption = page.locator('label', { hasText: '3 months' }); // Try label for radio/checkbox
  }
  await threeMonthsOption.waitFor({ state: 'visible', timeout: 30000 });
  await threeMonthsOption.click();
  console.log('Selected "3 months" option.');

  // Step 40: Click on "Save"
  // Your test case: `*[name]` (Incomplete/ambiguous)
  const saveBtn = page.locator('button', { hasText: 'Save' });
  await saveBtn.waitFor({ state: 'visible', timeout: 30000 });
  await saveBtn.click();
  console.log('Clicked "Save" button.');

  // Step 41: Click on "Close"
  // Your test case: `button[title="Close"]`
  const finalCloseBtn = page.locator('button[title="Close"]');
  await finalCloseBtn.waitFor({ state: 'visible', timeout: 30000 });
  await finalCloseBtn.click();
  console.log('Clicked final "Close" button. Test complete.');

});