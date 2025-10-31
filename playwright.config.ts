import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Test timeout
  timeout: 120000, // 2 minutes per test
  
  // Expect timeout
  expect: {
    timeout: 10000
  },

  // Parallel execution
  fullyParallel: false, // Run tests sequentially for better stability
  
  // Retry on failure
  retries: process.env.CI ? 2 : 1,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        'Test Environment': 'Staging',
        'Browser': 'Chromium',
        'OS': process.platform
      }
    }],
    ['list'] // Console output
  ],

  use: {
    // Base URL
    baseURL: 'https://lumora.saas-staging.narad.io',
    
    // Browser options
    headless: false, // Set to true for CI/CD
    viewport: { width: 1920, height: 1080 },
    
    // Artifacts on failure
    screenshot: 'only-on-failure', // Take screenshot on failure
    video: 'retain-on-failure',    // Save video only on failure
    trace: 'retain-on-failure',    // Save trace on failure
    
    // Other options
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Project configuration
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Video settings
        video: {
          mode: 'retain-on-failure',
          size: { width: 1920, height: 1080 }
        },
        // Screenshot settings
        screenshot: {
          mode: 'only-on-failure',
          fullPage: true
        }
      },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results',
});