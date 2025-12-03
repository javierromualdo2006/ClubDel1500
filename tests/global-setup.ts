import { FullConfig, chromium } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';
import * as path from 'path';
import * as fs from 'fs';

async function globalSetup(config: FullConfig) {
  const { baseURL = 'http://localhost:3000', storageState } = config.projects[0].use;
  
  console.log('🔧 Starting global setup with mock authentication...');
  console.log(`🌐 Base URL: ${baseURL}`);
  console.log(`💾 Storage state will be saved to: ${storageState}`);
  
  // Ensure the storage directory exists
  const storageDir = path.dirname(storageState as string);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  const browser = await chromium.launch({ 
    headless: true,
    logger: {
      isEnabled: (name, severity) => true,
      log: (name, severity, message) => console.log(`[${name}] ${message}`)
    },
    // Enable browser logs for debugging
    devtools: false
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    // Enable network logging
    recordHar: { path: 'global-setup.har' },
    // Set a more permissive permissions policy
    permissions: ['clipboard-read', 'clipboard-write']
  });
  
  // Enable console logging from the page
  context.on('console', (msg: { text: () => string }) => console.log(`[Page Console] ${msg.text()}`));
  context.on('weberror', (webError: { error: Error }) => console.error(`[Page Error] ${webError.error.message}`));
  
  const page = await context.newPage();
  
  try {
    console.log('🔑 Starting mock authentication...');
    
    // Set a longer default timeout for all actions
    page.setDefaultTimeout(60000);
    
    // Set up request interception to handle any authentication-related requests
    await page.route('**/*', route => {
      const url = route.request().url();
      // Mock any authentication-related API calls
      if (url.includes('/api/collections/users/auth-with-password')) {
        console.log('🔍 Intercepted auth request, responding with mock data');
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-jwt-token',
            user: {
              id: 'mock-user-id',
              username: 'admin',
              email: 'admin@example.com',
              verified: true,
              role: 'admin'
            }
          })
        });
      }
      return route.continue();
    });
    
    // Perform the mock login
    const loginSuccess = await loginAsAdmin(page);
    
    if (!loginSuccess) {
      throw new Error('Mock login failed: No success flag returned');
    }
    
    // Wait for the page to settle
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'after-auth-setup.png' });
    
    console.log('✅ Mock authentication successful, saving storage state...');
    
    // Save the storage state for future tests
    await context.storageState({ 
      path: storageState as string 
    });
    
    console.log('💾 Storage state saved successfully');
    
    return storageState;
    
  } catch (error) {
    console.error('❌ Mock authentication failed:', error);
    
    // Save debug information
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `auth-failure-${timestamp}.png`;
    const htmlPath = `auth-failure-${timestamp}.html`;
    
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved as ${screenshotPath}`);
    
    // Save the page content for debugging
    const pageContent = await page.content();
    fs.writeFileSync(htmlPath, pageContent);
    console.log(`📄 Page content saved as ${htmlPath}`);
    
    // Also save the current URL
    console.log(`🌍 Current URL: ${page.url()}`);
    
    throw error;
    
  } finally {
    console.log('🧹 Cleaning up...');
    await context.close();
    await browser.close();
    console.log('✅ Global setup completed');
  }
}

export default globalSetup;
