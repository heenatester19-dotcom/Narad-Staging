export async function clickWithFallback(page, selectors, timeout = 15000) {
  for (const sel of selectors) {
    try {
      const locator = page.locator(sel).first();
      await locator.waitFor({ state: 'visible', timeout });
      await locator.scrollIntoViewIfNeeded();
      await locator.click({ force: true });
      await page.waitForTimeout(300);
      return;
    } catch {
      // Try next
    }
  }
  throw new Error(`❌ Could not click element: ${selectors.join(' | ')}`);
}
