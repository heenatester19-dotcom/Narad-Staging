import { test, expect } from '@playwright/test';
import { doLogin } from './login';
import path from 'path';
import fs from 'fs';

test('Evidence Module: Complete Upload, Search, and Validation Flow', async ({ page }) => {
  try {
    const timestamp = Date.now();
    
    await doLogin(page);
    await page.waitForSelector('text=Dashboard', { timeout: 60000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
    console.log('✅ Logged in successfully and Dashboard loaded.');

    // Navigate to Evidence
    console.log('\n📂 Navigating to Evidence...');
    await page.getByRole('button', { name: 'Cabinet' }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('//span[normalize-space()="Evidence"]').click();
    await page.waitForTimeout(2000);
    console.log('✓ Evidence page opened');

    // Test 1: Upload Multiple Valid Files
    console.log('\n🧪 TEST 1: Uploading Valid Files with Description');
    
    const testFiles = ['Anti-Corruption-Policy.pdf'];
    const validFiles = [];
    
    for (const fileName of testFiles) {
      const filePath = path.join(__dirname, fileName);
      if (fs.existsSync(filePath)) {
        validFiles.push(filePath);
      }
    }
    
    if (validFiles.length === 0) {
      throw new Error('Test files missing');
    }
    
    console.log(`Found ${validFiles.length} valid test file(s)`);

    await page.locator('//button[normalize-space()="Add"]').click();
    await page.waitForTimeout(500);
    
    await page.getByText('Upload Files').click();
    await page.waitForTimeout(500);

    const fileInput = page.locator('#file-input-main');
    await fileInput.setInputFiles(validFiles);
    console.log('✓ Files selected for upload');

    // Wait for upload and description dialog
    await page.waitForTimeout(3000);
    
    // Check for upload progress
    const progressMsg = page.locator('text=/\\d+-\\d+ of \\d+|Total\\s*\\d+/i').first();
    if (await progressMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
      const progressText = await progressMsg.textContent();
      console.log('📊 Upload Progress:', progressText);
    }

    // Handle description dialog
    const descriptionDialog = page.locator('[role="dialog"]');
    const descriptionField = page.locator('textarea[placeholder*="description"]').or(page.getByPlaceholder('Enter description'));
    
    if (await descriptionDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Description dialog appeared');
      
      // Add description
      if (await descriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const testDescription = `Test Evidence - ${timestamp}\nAutomated test description`;
        await descriptionField.fill(testDescription);
        console.log('✓ Description added');
        await page.waitForTimeout(500);
      }
      
      // Click Skip button to close dialog
      const skipBtn = page.getByRole('button', { name: 'Skip' });
      if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipBtn.click();
        console.log('✓ Clicked Skip button');
        await page.waitForTimeout(2000);
      }
    }

    // Wait for success message
    const successMsg = page.locator('text=/uploaded successfully|success/i').first();
    if (await successMsg.isVisible({ timeout: 5000 }).catch(() => false)) {
      const msgText = await successMsg.textContent();
      console.log('✅ SUCCESS MESSAGE:', msgText);
    } else {
      console.log('⚠️ No success message found (file might be uploaded)');
    }

    // Close any notification
    const closeBtn = page.locator('//svg[@title="Close"]').or(page.getByRole('button', { name: 'Close' }));
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // Test 2: Verify Files in Table
    console.log('\n🔍 TEST 2: Verifying Uploaded Files in Table');
    await page.waitForTimeout(2000);
    
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    console.log(`✓ Found ${rowCount} rows in evidence table`);
    
    let uploadedFileName = '';
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      const cellText = await row.locator('td').nth(1).textContent().catch(() => '');
      const dateCell = await row.locator('td').nth(3).textContent().catch(() => '');
      
      if (cellText.includes('Anti-Corruption') && dateCell.includes('29 Oct 2025')) {
        uploadedFileName = cellText.trim();
        console.log('✅ Found uploaded file:', uploadedFileName);
        break;
      }
    }

    // Test 3: Upload Unsupported Files
    console.log('\n🧪 TEST 3: Testing Unsupported File Types');
    const corruptFilesDir = 'C:\\Users\\DESK0048\\Documents\\Narad\\Documents\\Currpt filles-20250929T054055Z-1-001\\Currpt filles';
    
    if (fs.existsSync(corruptFilesDir)) {
      const files = fs.readdirSync(corruptFilesDir);
      
      for (let i = 0; i < Math.min(files.length, 2); i++) {
        const testFile = files[i];
        const testFilePath = path.join(corruptFilesDir, testFile);
        
        console.log(`\n📄 Testing file ${i + 1}: ${testFile}`);
        
        try {
          // Make sure no dialogs are open
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          
          await page.locator('//button[normalize-space()="Add"]').click({ timeout: 10000 });
          await page.waitForTimeout(500);
          
          await page.getByText('Upload Files').click();
          await page.waitForTimeout(500);

          const fileInputTest = page.locator('#file-input-main');
          await fileInputTest.setInputFiles(testFilePath);
          console.log('✓ File selected');

          await page.waitForTimeout(3000);

          // Check for error message
          const errorMsg = page.locator('text=/error|invalid|not supported|unsupported|failed|format|type/i').first();
          const successMsgTest = page.locator('text=/success|uploaded/i').first();

          if (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
            const errorText = await errorMsg.textContent();
            console.log('❌ ERROR MESSAGE:', errorText);
          } else if (await successMsgTest.isVisible({ timeout: 3000 }).catch(() => false)) {
            const successText = await successMsgTest.textContent();
            console.log('⚠️ SUCCESS (unexpected):', successText);
          } else {
            console.log('⚠️ No validation message');
          }

          // Close any dialog/notification
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          
          const closeTestBtn = page.getByRole('button', { name: /close|skip/i });
          if (await closeTestBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await closeTestBtn.click();
            await page.waitForTimeout(500);
          }

        } catch (err) {
          console.log('⚠️ Error:', err.message);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    } else {
      console.log('⚠️ Corrupt files directory not found');
    }

    // Test 4: Pagination
    console.log('\n🧪 TEST 4: Testing Pagination');
    
    const page2Btn = page.getByRole('button', { name: '2' });
    if (await page2Btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✓ Pagination found');
      
      await page2Btn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Navigated to page 2');
      
      const page1Btn = page.getByRole('button', { name: '1' });
      await page1Btn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Returned to page 1');
    } else {
      console.log('⚠️ No pagination (single page)');
    }

    // Test 5: Search Functionality
    console.log('\n🧪 TEST 5: Testing Search');
    
    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Search input found');

    // Test 5a: Search for file
    if (uploadedFileName) {
      const searchTerm = uploadedFileName.split(' ')[0];
      console.log(`\n🔍 Searching: "${searchTerm}"`);
      
      await searchInput.fill(searchTerm);
      await page.waitForTimeout(2000);
      
      const searchResults = page.locator('tbody tr');
      const resultCount = await searchResults.count();
      console.log(`✓ Found ${resultCount} result(s)`);
      
      if (resultCount > 0) {
        const firstResult = await searchResults.first().locator('td').nth(1).textContent();
        console.log('✓ First result:', firstResult.trim());
        
        // Double-click to open
        await searchResults.first().dblclick();
        await page.waitForTimeout(2000);
        
        const modal = page.locator('[role="dialog"]');
        if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ File opened');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
      }
      
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }

    // Test 5b: Special characters
    console.log('\n🔍 Testing Special Character Search');
    
    const specialSearches = ['@#$%', '><script>', '   '];
    
    for (const term of specialSearches) {
      console.log(`Searching: "${term}"`);
      await searchInput.fill(term);
      await page.waitForTimeout(1500);
      
      const results = page.locator('tbody tr');
      const count = await results.count();
      console.log(`✓ Results: ${count}`);
      
      await searchInput.clear();
      await page.waitForTimeout(500);
    }

    console.log('\n🎯 ========================================');
    console.log('✅ ALL EVIDENCE TESTS COMPLETED');
    console.log('========================================');

  } catch (err) {
    const debugPath = `screenshots/evidence-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('\n❌ TEST FAILED:', err.message);
    throw err;
  }
});