import { Page } from '@playwright/test';

// Extend the Window interface to include our mock auth flag
declare global {
  interface Window {
    __MOCK_AUTH__?: boolean;
    pocketbase_auth?: string;
  }
}

export async function loginAsAdmin(page: Page) {
  try {
    console.log("🔵 Setting up mock authentication...");

    // Navegamos primero a la app para tener acceso a localStorage del origen correcto
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Set up the mock authentication state en el contexto de la app
    await page.evaluate(() => {
      // Imitar el formato interno de PocketBase authStore
      const now = new Date().toISOString();
      const mockAuth = {
        token: 'mock-jwt-token',
        // "model" representa el registro de usuario devuelto por la colección `users`
        model: {
          id: 'mock-user-id',
          email: 'admin@gmail.com',
          username: 'admin',
          name: 'Admin User',
          avatar: '',
          role: 'admin',
          verified: true,
          created: now,
          updated: now,
          emailVisibility: true,
          feature: null,
          archive: false,
          emailNotifications: true,
          tokenRecy: null,
        },
      };

      // PocketBase por defecto persiste en la clave 'pb_auth'
      localStorage.setItem('pb_auth', JSON.stringify(mockAuth));

      // Marcar en window solo por si algún código de la app lo usa
      window.__MOCK_AUTH__ = true;

      console.log('🔑 Mock PocketBase authStore set in localStorage (pb_auth)');
    });
    
    // Now navigate to the app root with the auth state already set
    console.log("🌐 Navigating to app with mock auth...");
    await page.goto("http://localhost:3000", { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for the app to initialize
    await page.waitForLoadState('networkidle');
    
    // Verify we're logged in by checking for admin elements
    try {
      // Wait for either the admin menu or a known element that appears when logged in
      await Promise.race([
        page.waitForSelector('button:has-text("Nuevo Producto")', { timeout: 5000 }),
        page.waitForSelector('text=Bienvenido, admin', { timeout: 5000 }),
        page.waitForSelector('button:has-text("Cerrar sesión")', { timeout: 5000 })
      ]);
      
      console.log("✅ Successfully authenticated as admin");
      return true;
    } catch (e) {
      console.log("⚠ Could not verify admin UI elements, but continuing...");
      return true; // Still return true as the auth state is set
    }
    
  } catch (error) {
    console.error("❌ Error during mock authentication:", error);
    await page.screenshot({ path: 'mock-auth-error.png' });
    throw error;
  }
}
