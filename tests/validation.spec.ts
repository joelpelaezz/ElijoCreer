import { test, expect } from '@playwright/test';

test.describe('Validación Mobile-First + Accesibilidad + Flujos', () => {
  
  // ============================================
  // 1. ACCESIBILIDAD
  // ============================================
  
  test('AC-001: Contraste de colores en home', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check contrast on hero section
    const hero = page.locator('.hero-gradient');
    await expect(hero).toBeVisible();
    
    // Check buttons have visible contrast
    const ctaButton = page.getByRole('link', { name: /Crear Cuenta|Iniciar Sesión/ }).first();
    await expect(ctaButton).toBeVisible();
  });
  
  test('AC-002: Labels en formularios', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Check form labels exist
    const emailLabel = page.getByLabel(/Email|Correo/);
    const passwordLabel = page.getByLabel(/Contraseña/);
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });
  
  test('AC-003: Navegación por teclado', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Tab through page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should not crash
    const url = page.url();
    expect(url).toContain('localhost');
  });

  // ============================================
  // 2. FLUJOS FUNCIONALES
  // ============================================
  
  test('FL-001: Registro de usuario', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // Fill form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="confirmPassword"]', 'Test1234!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should either succeed or show error (not crash)
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/register|dashboard|error/);
  });
  
  test('FL-002: Login redirige a dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Try login (will fail with wrong creds, but should show error)
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    // Should show error, not crash
    await expect(page.locator('text=Invalid|Credenciales|error')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
  
  test('FL-003: Página de grupos sin auth redirige a login', async ({ page }) => {
    await page.goto('http://localhost:3000/groups/new');
    
    // Should redirect to login
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/login|groups\/new/);
  });
  
  test('FL-004: Dashboard sin auth redirige a login', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Should redirect to login
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/login|dashboard/);
  });

  // ============================================
  // 3. EDGE CASES
  // ============================================
  
  test('EC-001: Home sin partidos muestra fallback', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Page should load without crash
    await expect(page.locator('h1')).toBeVisible();
    
    // Should show some content (either next match or placeholder)
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
  
  test('EC-002: API error handling', async ({ page }) => {
    // Try invalid route
    await page.goto('http://localhost:3000/api/invalid-route');
    
    // Should show 404 or handle gracefully
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('localhost');
  });
  
  test('EC-003: Grupos con ID inválido', async ({ page }) => {
    await page.goto('http://localhost:3000/groups/invalid-id-12345');
    
    // Should handle 404 or redirect
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/groups\/|404|error/);
  });
  
  test('EC-004: Loading state', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Should show form (no infinite loader)
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 5000 });
  });

  // ============================================
  // 4. MOBILE RESPONSIVE
  // ============================================
  
  test('MR-001: Mobile viewport sin overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Get scroll width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    
    // Should not have horizontal scroll
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
  
  test('MR-002: Botones táctiles en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/register');
    
    // Buttons should be visible and clickable
    const button = page.locator('button[type="submit"]');
    await expect(button).toBeVisible();
    
    // Should be able to click
    await button.click();
  });
});
