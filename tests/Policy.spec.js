import { test, expect } from '@playwright/test';
import { doLogin } from './login';
import path from 'path';
import fs from 'fs';

test('Policy Module: Complete Upload Flow with Validation', async ({ page }) => {
  try {
    const timestamp = Date.now();
    
    await doLogin(page);
    await page.waitForSelector('text=Dashboard', { timeout: 60000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
    console.log('✅ Logged in successfully and Dashboard loaded.');

    // Navigate to Policies
    console.log('📂 Navigating to Policies...');
    await page.getByRole('button', { name: 'Cabinet' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Policies' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Policies page opened');

    // Test 1: Upload valid PDF file
    console.log('\n🧪 TEST 1: Uploading Valid PDF File');
    const validFileName = 'Anti-Corruption-Policy.pdf';
    const validFilePath = path.join(__dirname, validFileName);
    
    if (!fs.existsSync(validFilePath)) {
      console.log('❌ Valid test file not found:', validFilePath);
      throw new Error('Test file missing');
    }

    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(500);
    
    await page.getByText('Upload Files').click();
    await page.waitForTimeout(500);

    const fileInput = page.locator('#file-input-main');
    await fileInput.setInputFiles(validFilePath);
    console.log('✓ Valid file selected for upload');

    // Wait and verify success message
    await page.waitForTimeout(3000);
    const successMsg = page.locator('text=/uploaded successfully|success/i').first();
    
    if (await successMsg.isVisible().catch(() => false)) {
      const msgText = await successMsg.textContent();
      console.log('✅ SUCCESS MESSAGE:', msgText);
    } else {
      console.log('⚠️ No success message found');
    }

    // Close notification
    const closeBtn = page.getByRole('button', { name: 'Close' });
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // Find the newly uploaded file
    console.log('\n🔍 Finding newly uploaded file...');
    await page.waitForTimeout(3000);
    
    // Find the newest Anti-Corruption file (will be first one with today's date)
    const allRows = page.locator('tbody tr');
    const rowCount = await allRows.count();
    console.log(`Found ${rowCount} rows in table`);
    
    let uploadedFileName = '';
    let foundRow = null;
    
    for (let i = 0; i < rowCount; i++) {
      const row = allRows.nth(i);
      const cellText = await row.locator('td').nth(1).textContent();
      const dateCell = await row.locator('td').nth(3).textContent();
      
      if (cellText.includes('Anti-Corruption-Policy') && dateCell.includes('29 Oct 2025')) {
        uploadedFileName = cellText.replace('pdf', '').trim();
        foundRow = i;
        console.log('✅ Found uploaded file:', uploadedFileName, 'at row', i + 1);
        break;
      }
    }

    if (!uploadedFileName) {
      throw new Error('Could not find newly uploaded file');
    }

    // Test 2: Rename the file
    console.log('\n🧪 TEST 2: Renaming File');
    const newFileName = `Policy-Test-${timestamp}`;
    
    // Find the paragraph with the file name and click the row's More Actions button directly
    const fileNameParagraph = page.getByLabel(uploadedFileName, { exact: true });
    await fileNameParagraph.waitFor({ state: 'visible', timeout: 5000 });
    
    // Find the More Actions button in the same row using the row structure
    // Simple and reliable selector
const moreActionsBtn = page.locator(`tbody tr:has-text("${uploadedFileName}")`).getByRole('button', { name: 'More Actions' });

await moreActionsBtn.click();
    await page.waitForTimeout(500);
    console.log('✓ Clicked More Actions button');

    await page.getByText('Rename').click();
    await page.waitForTimeout(1000);
    console.log('✓ Clicked Rename option');

    const renameInput = page.getByRole('textbox', { name: /File Name/i });
    await renameInput.waitFor({ state: 'visible', timeout: 5000 });
    await renameInput.clear();
    await renameInput.fill(newFileName);
    console.log('✓ New name entered:', newFileName);

    await page.getByRole('button', { name: 'Update' }).click();
    await page.waitForTimeout(2000);

    // Verify rename success message
    const renameMsg = page.locator('text=/renamed|updated/i').first();
    if (await renameMsg.isVisible().catch(() => false)) {
      const msgText = await renameMsg.textContent();
      console.log('✅ RENAME MESSAGE:', msgText);
    } else {
      console.log('⚠️ No rename message found');
    }

    // Close notification
    const closeBtnRename = page.getByRole('button', { name: 'Close' });
    if (await closeBtnRename.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtnRename.click();
      await page.waitForTimeout(1000);
    }

    // Verify renamed file in table
    console.log('\n🔍 Verifying renamed file...');
    await page.waitForTimeout(2000);
    const renamedFileLabel = page.getByLabel(newFileName, { exact: true });
    
    if (await renamedFileLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Renamed file visible in table:', newFileName);
    } else {
      console.log('❌ Renamed file NOT found in table');
    }

    // Test 3: Preview the file
    console.log('\n🧪 TEST 3: Previewing File');
    const renamedRowSelector = `tbody tr:has(p[aria-label="${newFileName}"])`;
    const moreActionsBtn2 = page.locator(`tbody tr:has-text("${newFileName}")`).getByRole('button', { name: 'More Actions' });
    
    await moreActionsBtn2.click();
    await page.waitForTimeout(500);

    const previewOption = page.getByText('Preview');
    if (await previewOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await previewOption.click();
      console.log('✓ Preview opened');
      await page.waitForTimeout(3000);
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      console.log('✓ Preview closed');
    } else {
      console.log('⚠️ Preview option not available');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Test 4: Delete the file
    console.log('\n🧪 TEST 4: Deleting File');
    
    await moreActionsBtn2.click();
    await page.waitForTimeout(500);

    await page.getByText('Delete').click();
    await page.waitForTimeout(1000);

    const confirmBtn = page.getByRole('button', { name: 'Yes' });
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();
    await page.waitForTimeout(2000);

    // Verify delete success message
    const deleteMsg = page.locator('text=/deleted|removed/i').first();
    if (await deleteMsg.isVisible().catch(() => false)) {
      const msgText = await deleteMsg.textContent();
      console.log('✅ DELETE MESSAGE:', msgText);
    } else {
      console.log('⚠️ No delete message found');
    }

    // Close notification
    const closeBtnDelete = page.getByRole('button', { name: 'Close' });
    if (await closeBtnDelete.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtnDelete.click();
      await page.waitForTimeout(1000);
    }

    // Verify file removed
    console.log('\n🔍 Verifying file deletion...');
    await page.waitForTimeout(2000);
    const fileStillExists = await page.getByLabel(newFileName, { exact: true })
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    
    if (!fileStillExists) {
      console.log('✅ File successfully removed from table');
    } else {
      console.log('⚠️ File still visible in table');
    }

    // Test 5: Test unsupported file types
    console.log('\n🧪 TEST 5: Testing Unsupported File Types');
    const corruptFilesDir = 'C:\\Users\\DESK0048\\Documents\\Narad\\Documents\\Currpt filles-20250929T054055Z-1-001\\Currpt filles';
    
    if (fs.existsSync(corruptFilesDir)) {
      const files = fs.readdirSync(corruptFilesDir);
      
      for (let i = 0; i < Math.min(files.length, 3); i++) {
        const testFile = files[i];
        const testFilePath = path.join(corruptFilesDir, testFile);
        
        console.log(`\n📄 Testing file ${i + 1}: ${testFile}`);
        
        try {
          await page.getByRole('button', { name: 'Add' }).click();
          await page.waitForTimeout(500);
          
          await page.getByText('Upload Files').click();
          await page.waitForTimeout(500);

          const fileInputTest = page.locator('#file-input-main');
          await fileInputTest.setInputFiles(testFilePath);
          console.log('✓ File selected:', testFile);

          await page.waitForTimeout(3000);

          // Check for error or success message
          const errorMsg = page.locator('text=/error|invalid|not supported|failed|corrupt/i').first();
          const successMsgTest = page.locator('text=/success|uploaded/i').first();

          if (await errorMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
            const errorText = await errorMsg.textContent();
            console.log('❌ ERROR MESSAGE:', errorText);
          } else if (await successMsgTest.isVisible({ timeout: 2000 }).catch(() => false)) {
            const successText = await successMsgTest.textContent();
            console.log('✅ SUCCESS MESSAGE:', successText);
          } else {
            console.log('⚠️ No message displayed');
          }

          // Close any notification
          const closeTestBtn = page.getByRole('button', { name: 'Close' });
          if (await closeTestBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await closeTestBtn.click();
            await page.waitForTimeout(500);
          }

        } catch (err) {
          console.log('⚠️ Error testing file:', err.message);
        }
      }
    } else {
      console.log('⚠️ Corrupt files directory not found:', corruptFilesDir);
    }

    console.log('\n🎯 ========================================');
    console.log('✅ ALL TESTS COMPLETED');
    console.log('========================================');

  } catch (err) {
    const debugPath = `screenshots/policy-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('\n❌ TEST FAILED:', err.message);
    throw err;
  }
});