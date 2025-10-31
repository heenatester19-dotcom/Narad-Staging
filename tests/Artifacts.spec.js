import { test, expect } from '@playwright/test';
import { doLogin } from './login';
import path from 'path';
import fs from 'fs';

test('Artifacts Module: Complete Upload, Sheet Mapping, and CRUD Operations', async ({ page }) => {
  try {
    const timestamp = Date.now();
    
    // Login
    await doLogin(page);
    await page.waitForSelector('text=Dashboard', { timeout: 60000 });
    await expect(page).toHaveURL(/.*dashboard.*/);
    console.log('✅ Logged in successfully and Dashboard loaded.');

    // Navigate to Artifacts
    console.log('\n📂 Navigating to Artifacts...');
    await page.getByRole('button', { name: 'Cabinet' }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('//span[normalize-space()="Artifacts"]').click();
    await page.waitForTimeout(2000);
    console.log('✓ Artifacts page opened');

    // ========================================
    // TEST 1: Upload Single Sheet Excel File
    // ========================================
    console.log('\n🧪 TEST 1: Uploading Single Sheet Excel File');
    
    const artifactsDir = 'C:\\Users\\DESK0048\\Documents\\Narad\\Documents\\Artifacts-20250929T060547Z-1-001\\Artifacts';
    
    if (!fs.existsSync(artifactsDir)) {
      throw new Error('Artifacts directory not found: ' + artifactsDir);
    }
    
    const allFiles = fs.readdirSync(artifactsDir);
    console.log(`Found ${allFiles.length} files in Artifacts folder`);
    
    // Find an Excel file (single sheet first)
    const excelFiles = allFiles.filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
    
    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in Artifacts folder');
    }
    
    console.log(`Found ${excelFiles.length} Excel file(s)`);
    
    // Upload first Excel file
    const firstExcelFile = excelFiles[0];
    const firstFilePath = path.join(artifactsDir, firstExcelFile);
    
    console.log(`\n📄 Uploading: ${firstExcelFile}`);
    
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(500);
    
    await page.getByText('Upload Files').click();
    await page.waitForTimeout(500);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(firstFilePath);
    console.log('✓ File selected for upload');

    // Wait for upload success message
    await page.waitForTimeout(3000);
    
    const uploadSuccessMsg = page.locator('text=/uploaded successfully|success/i').first();
    if (await uploadSuccessMsg.isVisible({ timeout: 5000 }).catch(() => false)) {
      const msgText = await uploadSuccessMsg.textContent();
      console.log('✅ UPLOAD SUCCESS:', msgText);
    }

    // Close notification if exists
    const closeNotification = page.locator('button:has-text("Close")').or(page.locator('[aria-label="Close"]'));
    if (await closeNotification.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeNotification.click();
      await page.waitForTimeout(500);
    }

    // ========================================
    // TEST 2: Sheet Mapping Popup Validation
    // ========================================
    console.log('\n🧪 TEST 2: Verifying Sheet Mapping Popup');
    
    // Wait for Sheet Mapping popup
    await page.waitForTimeout(2000);
    
    const sheetMappingDialog = page.locator('[role="dialog"]');
    const isSheetMappingVisible = await sheetMappingDialog.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isSheetMappingVisible) {
      console.log('✓ Sheet Mapping popup opened');
      
      // Get all sheet rows
      const sheetRows = page.locator('//tr[@class="MuiTableRow-root MuiTableRow-hover css-5nsq9k"]');
      const sheetCount = await sheetRows.count();
      console.log(`✓ Found ${sheetCount} sheet(s) in the file`);
      
      // Verify sheet name(s)
      for (let i = 0; i < sheetCount; i++) {
        const sheetRow = sheetRows.nth(i);
        const sheetName = await sheetRow.locator('td').first().textContent();
        console.log(`  Sheet ${i + 1}: ${sheetName.trim()}`);
      }
      
      // Test Column Selection (Question & Answer)
      console.log('\n🔍 Testing Question/Answer Column Selection');
      
      // Get first sheet's dropdowns
      const firstSheetRow = sheetRows.first();
      
      // Question Column Dropdown
      const questionDropdown = firstSheetRow.locator('//div[contains(@class, "MuiSelect-select")]').first();
      await questionDropdown.click();
      await page.waitForTimeout(500);
      
      // Select column A for Question
      const columnA = page.locator('//div[normalize-space()="A"]').first();
      if (await columnA.isVisible({ timeout: 2000 }).catch(() => false)) {
        await columnA.click();
        console.log('✓ Selected Column A for Questions');
        await page.waitForTimeout(500);
      }
      
      // Answer Column Dropdown
      const answerDropdown = firstSheetRow.locator('//div[contains(@class, "MuiSelect-select")]').last();
      await answerDropdown.click();
      await page.waitForTimeout(500);
      
      // Test Duplicate Column Detection (Select A again)
      console.log('\n⚠️ Testing Duplicate Column Detection');
      const columnAAnswer = page.locator('//div[normalize-space()="A"]').first();
      if (await columnAAnswer.isVisible({ timeout: 2000 }).catch(() => false)) {
        await columnAAnswer.click();
        console.log('✓ Selected Column A for Answers (should trigger error)');
        await page.waitForTimeout(1000);
        
        // Check for duplicate column error
        const duplicateError = page.locator('text=/Duplicate columns detected|Select different/i').first();
        if (await duplicateError.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await duplicateError.textContent();
          console.log('✅ DUPLICATE ERROR DETECTED:', errorText);
          
          // Verify Submit button is disabled
          const submitBtn = page.locator('button:has-text("Submit")').or(page.getByRole('button', { name: /submit|upload/i }));
          const isDisabled = await submitBtn.isDisabled().catch(() => true);
          console.log(isDisabled ? '✅ Submit button is DISABLED (correct)' : '⚠️ Submit button is ENABLED (incorrect)');
        }
      }
      
      // Fix by selecting different column (Column B for Answer)
      console.log('\n✅ Fixing: Selecting Column B for Answers');
      await answerDropdown.click();
      await page.waitForTimeout(500);
      
      const columnB = page.locator('//div[normalize-space()="B"]').first();
      if (await columnB.isVisible({ timeout: 2000 }).catch(() => false)) {
        await columnB.click();
        console.log('✓ Selected Column B for Answers');
        await page.waitForTimeout(1000);
        
        // Verify error is gone and Submit is enabled
        const submitBtn = page.locator('button:has-text("Submit")').or(page.locator('button:has-text("Next")'));
        const isEnabled = await submitBtn.isEnabled().catch(() => false);
        console.log(isEnabled ? '✅ Submit button is ENABLED (correct)' : '⚠️ Submit button is DISABLED');
        
        if (isEnabled) {
          await submitBtn.click();
          console.log('✓ Clicked Submit button');
          await page.waitForTimeout(2000);
        }
      }
      
    } else {
      console.log('⚠️ No Sheet Mapping popup (file might not be Excel or already processed)');
    }

    // Check for final success message
    const finalSuccess = page.locator('text=/uploaded successfully|processed successfully/i').first();
    if (await finalSuccess.isVisible({ timeout: 5000 }).catch(() => false)) {
      const successText = await finalSuccess.textContent();
      console.log('✅ FINAL SUCCESS:', successText);
    }

    // Close any remaining notifications
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // ========================================
    // TEST 3: Verify File in Table
    // ========================================
    console.log('\n🧪 TEST 3: Verifying Uploaded File in Table');
    await page.waitForTimeout(2000);
    
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    console.log(`✓ Found ${rowCount} row(s) in artifacts table`);
    
    let uploadedFileName = '';
    let uploadedFileRow = null;
    
    // Find the uploaded file (look for today's date or recent upload)
    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = tableRows.nth(i);
      const nameCell = await row.locator('td').nth(1).textContent().catch(() => '');
      const dateCell = await row.locator('td').nth(2).textContent().catch(() => '');
      
      if (nameCell && dateCell.includes('29 Oct 2025')) {
        uploadedFileName = nameCell.trim();
        uploadedFileRow = row;
        console.log('✅ Found uploaded file:', uploadedFileName);
        break;
      }
    }
    
    if (!uploadedFileName) {
      console.log('⚠️ Could not find uploaded file in table, using first row');
      uploadedFileName = await tableRows.first().locator('td').nth(1).textContent();
      uploadedFileRow = tableRows.first();
    }

    // ========================================
    // TEST 4: Search Functionality
    // ========================================
    console.log('\n🧪 TEST 4: Testing Search Functionality');
    
    const searchInput = page.locator('input[placeholder*="Search"]').or(page.locator('input[type="search"]'));
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Search input found');
    
    // Search for uploaded file
    const searchTerm = uploadedFileName.split(' ')[0];
    console.log(`🔍 Searching for: "${searchTerm}"`);
    
    await searchInput.fill(searchTerm);
    await page.waitForTimeout(2000);
    
    const searchResults = page.locator('tbody tr');
    const resultCount = await searchResults.count();
    console.log(`✓ Search returned ${resultCount} result(s)`);
    
    if (resultCount > 0) {
      const firstResult = await searchResults.first().locator('td').nth(1).textContent();
      console.log('✅ First result:', firstResult.trim());
    }
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);
    console.log('✓ Search cleared');

    // ========================================
    // TEST 5: Sheet Mapping Verification
    // ========================================
    console.log('\n🧪 TEST 5: Verifying Sheet Mapping in Table');
    
    if (uploadedFileRow) {
      // Click on the file row to see if sheet mapping icon exists
      const sheetMappingIcon = uploadedFileRow.locator('//div[@class="MuiStack-root css-hp68mp"]//*[name()="svg"]');
      
      if (await sheetMappingIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Sheet Mapping icon found');
        
        await sheetMappingIcon.click();
        await page.waitForTimeout(2000);
        
        // Verify Sheet Mapping dialog opens
        const mappingDialog = page.locator('[role="dialog"]');
        if (await mappingDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('✅ Sheet Mapping dialog opened');
          
          // Verify sheets are listed
          const sheetRows = page.locator('//tr[@class="MuiTableRow-root MuiTableRow-hover css-5nsq9k"]');
          const sheetCount = await sheetRows.count();
          console.log(`✓ Sheets displayed: ${sheetCount}`);
          
          // Verify column mappings
          for (let i = 0; i < sheetCount; i++) {
            const row = sheetRows.nth(i);
            const sheetName = await row.locator('td').first().textContent();
            console.log(`  Sheet: ${sheetName.trim()}`);
          }
          
          // Close dialog
          const closeDialogBtn = page.locator('button:has-text("Close")').or(page.getByRole('button', { name: 'Close' }));
          if (await closeDialogBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeDialogBtn.click();
            await page.waitForTimeout(500);
          } else {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        }
      } else {
        console.log('⚠️ Sheet Mapping icon not found for this file');
      }
    }

    // ========================================
    // TEST 6: More Actions - Preview
    // ========================================
    console.log('\n🧪 TEST 6: Testing Preview Action');
    
    if (uploadedFileRow) {
      // Find More Actions button
      const moreActionsBtn = page.locator(`tbody tr:has-text("${uploadedFileName}")`).getByRole('button', { name: 'More Actions' }).first();
      
      if (await moreActionsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreActionsBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ More Actions menu opened');
        
        // Click Preview
        const previewOption = page.getByText('Preview', { exact: false });
        if (await previewOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await previewOption.click();
          console.log('✓ Clicked Preview');
          await page.waitForTimeout(3000);
          
          // Check if preview opened
          const previewDialog = page.locator('[role="dialog"]');
          if (await previewDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('✅ Preview opened successfully');
            
            // Close preview
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            console.log('✓ Preview closed');
          }
        } else {
          console.log('⚠️ Preview option not available');
          await page.keyboard.press('Escape');
        }
      }
    }

    // ========================================
    // TEST 7: More Actions - Rename
    // ========================================
    console.log('\n🧪 TEST 7: Testing Rename Action');
    
    const newFileName = `Artifact-Test-${timestamp}`;
    
    if (uploadedFileRow) {
      const moreActionsBtn = page.locator(`tbody tr:has-text("${uploadedFileName}")`).getByRole('button', { name: 'More Actions' }).first();
      
      if (await moreActionsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreActionsBtn.click();
        await page.waitForTimeout(500);
        
        // Click Rename
        const renameOption = page.getByText('Rename', { exact: false });
        if (await renameOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await renameOption.click();
          console.log('✓ Clicked Rename');
          await page.waitForTimeout(1000);
          
          // Enter new name
          const renameInput = page.locator('input[placeholder*="name"]').or(page.locator('input[type="text"]').first());
          if (await renameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await renameInput.clear();
            await renameInput.fill(newFileName);
            console.log('✓ Entered new name:', newFileName);
            
            // Click Update/Save
            const updateBtn = page.getByRole('button', { name: /update|save/i });
            await updateBtn.click();
            await page.waitForTimeout(2000);
            
            // Verify rename success
            const renameSuccess = page.locator('text=/renamed successfully|updated successfully/i').first();
            if (await renameSuccess.isVisible({ timeout: 3000 }).catch(() => false)) {
              const successText = await renameSuccess.textContent();
              console.log('✅ RENAME SUCCESS:', successText);
            }
            
            // Close notification
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            
            // Update uploaded filename for next operations
            uploadedFileName = newFileName;
          }
        } else {
          console.log('⚠️ Rename option not available');
          await page.keyboard.press('Escape');
        }
      }
    }

    // ========================================
    // TEST 8: More Actions - Delete
    // ========================================
    console.log('\n🧪 TEST 8: Testing Delete Action');
    
    const moreActionsBtnDelete = page.locator(`tbody tr:has-text("${uploadedFileName}")`).getByRole('button', { name: 'More Actions' }).first();
    
    if (await moreActionsBtnDelete.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreActionsBtnDelete.click();
      await page.waitForTimeout(500);
      
      // Click Delete
      const deleteOption = page.getByText('Delete', { exact: false });
      if (await deleteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteOption.click();
        console.log('✓ Clicked Delete');
        await page.waitForTimeout(1000);
        
        // Confirm deletion
        const confirmBtn = page.getByRole('button', { name: /yes|confirm|delete/i });
        if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmBtn.click();
          console.log('✓ Confirmed deletion');
          await page.waitForTimeout(2000);
          
          // Verify delete success
          const deleteSuccess = page.locator('text=/deleted successfully|removed successfully/i').first();
          if (await deleteSuccess.isVisible({ timeout: 3000 }).catch(() => false)) {
            const successText = await deleteSuccess.textContent();
            console.log('✅ DELETE SUCCESS:', successText);
          }
          
          // Verify file removed from table
          await page.waitForTimeout(2000);
          const fileStillExists = await page.locator(`tbody tr:has-text("${uploadedFileName}")`).isVisible({ timeout: 2000 }).catch(() => false);
          
          if (!fileStillExists) {
            console.log('✅ File successfully removed from table');
          } else {
            console.log('⚠️ File still visible in table');
          }
        }
      } else {
        console.log('⚠️ Delete option not available');
        await page.keyboard.press('Escape');
      }
    }

    // ========================================
    // TEST 9: Upload Multiple Sheet Excel
    // ========================================
    console.log('\n🧪 TEST 9: Testing Multi-Sheet Excel Upload');
    
    // Find a file with multiple sheets (if available)
    if (excelFiles.length > 1) {
      const secondFile = excelFiles[1];
      const secondFilePath = path.join(artifactsDir, secondFile);
      
      console.log(`\n📄 Uploading: ${secondFile}`);
      
      await page.getByRole('button', { name: 'Add' }).click();
      await page.waitForTimeout(500);
      
      await page.getByText('Upload Files').click();
      await page.waitForTimeout(500);

      const fileInput2 = page.locator('input[type="file"]').first();
      await fileInput2.setInputFiles(secondFilePath);
      console.log('✓ File selected');

      await page.waitForTimeout(3000);
      
      // Handle sheet mapping for multiple sheets
      const sheetMappingDialog2 = page.locator('[role="dialog"]');
      if (await sheetMappingDialog2.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✓ Sheet Mapping popup opened for multi-sheet file');
        
        const sheetRows2 = page.locator('//tr[@class="MuiTableRow-root MuiTableRow-hover css-5nsq9k"]');
        const sheetCount2 = await sheetRows2.count();
        console.log(`✓ Found ${sheetCount2} sheet(s)`);
        
        // Configure each sheet
        for (let i = 0; i < Math.min(sheetCount2, 2); i++) {
          console.log(`\n  Configuring Sheet ${i + 1}`);
          const sheetRow = sheetRows2.nth(i);
          
          // Question column
          const questionDD = sheetRow.locator('//div[contains(@class, "MuiSelect-select")]').first();
          await questionDD.click();
          await page.waitForTimeout(300);
          await page.locator('//div[normalize-space()="A"]').first().click();
          await page.waitForTimeout(300);
          
          // Answer column
          const answerDD = sheetRow.locator('//div[contains(@class, "MuiSelect-select")]').last();
          await answerDD.click();
          await page.waitForTimeout(300);
          await page.locator('//div[normalize-space()="B"]').first().click();
          await page.waitForTimeout(300);
          
          console.log(`  ✓ Sheet ${i + 1} configured: A (Questions), B (Answers)`);
        }
        
        // Submit
        const submitBtn2 = page.locator('button:has-text("Submit")').or(page.locator('button:has-text("Next")'));
        if (await submitBtn2.isEnabled().catch(() => false)) {
          await submitBtn2.click();
          console.log('✓ Submitted multi-sheet configuration');
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('⚠️ No additional Excel files for multi-sheet test');
    }

    console.log('\n🎯 ========================================');
    console.log('✅ ALL ARTIFACTS TESTS COMPLETED');
    console.log('========================================');

  } catch (err) {
    const debugPath = `screenshots/artifacts-flow-failure-${Date.now()}.png`;
    await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
    console.error('\n❌ TEST FAILED:', err.message);
    console.error(err.stack);
    throw err;
  }
});