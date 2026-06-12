# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: validation.spec.ts >> Validación Mobile-First + Accesibilidad + Flujos >> FL-002: Login redirige a dashboard
- Location: tests/validation.spec.ts:66:7

# Error details

```
Error: page.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('input[name="email"]')

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Validación Mobile-First + Accesibilidad + Flujos', () => {
  4   |   
  5   |   // ============================================
  6   |   // 1. ACCESIBILIDAD
  7   |   // ============================================
  8   |   
  9   |   test('AC-001: Contraste de colores en home', async ({ page }) => {
  10  |     await page.goto('http://localhost:3000');
  11  |     
  12  |     // Check contrast on hero section
  13  |     const hero = page.locator('.hero-gradient');
  14  |     await expect(hero).toBeVisible();
  15  |     
  16  |     // Check buttons have visible contrast
  17  |     const ctaButton = page.getByRole('link', { name: /Crear Cuenta|Iniciar Sesión/ }).first();
  18  |     await expect(ctaButton).toBeVisible();
  19  |   });
  20  |   
  21  |   test('AC-002: Labels en formularios', async ({ page }) => {
  22  |     await page.goto('http://localhost:3000/login');
  23  |     
  24  |     // Check form labels exist
  25  |     const emailLabel = page.getByLabel(/Email|Correo/);
  26  |     const passwordLabel = page.getByLabel(/Contraseña/);
  27  |     
  28  |     await expect(emailLabel.or(passwordLabel)).toBeVisible();
  29  |   });
  30  |   
  31  |   test('AC-003: Navegación por teclado', async ({ page }) => {
  32  |     await page.goto('http://localhost:3000');
  33  |     
  34  |     // Tab through page
  35  |     await page.keyboard.press('Tab');
  36  |     await page.keyboard.press('Tab');
  37  |     await page.keyboard.press('Tab');
  38  |     
  39  |     // Should not crash
  40  |     const url = page.url();
  41  |     expect(url).toContain('localhost');
  42  |   });
  43  | 
  44  |   // ============================================
  45  |   // 2. FLUJOS FUNCIONALES
  46  |   // ============================================
  47  |   
  48  |   test('FL-001: Registro de usuario', async ({ page }) => {
  49  |     await page.goto('http://localhost:3000/register');
  50  |     
  51  |     // Fill form
  52  |     await page.fill('input[name="name"]', 'Test User');
  53  |     await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
  54  |     await page.fill('input[name="password"]', 'Test1234!');
  55  |     await page.fill('input[name="confirmPassword"]', 'Test1234!');
  56  |     
  57  |     // Submit
  58  |     await page.click('button[type="submit"]');
  59  |     
  60  |     // Should either succeed or show error (not crash)
  61  |     await page.waitForTimeout(2000);
  62  |     const url = page.url();
  63  |     expect(url).toMatch(/register|dashboard|error/);
  64  |   });
  65  |   
  66  |   test('FL-002: Login redirige a dashboard', async ({ page }) => {
  67  |     await page.goto('http://localhost:3000/login');
  68  |     
  69  |     // Try login (will fail with wrong creds, but should show error)
> 70  |     await page.fill('input[name="email"]', 'wrong@test.com');
      |                ^ Error: page.fill: Target page, context or browser has been closed
  71  |     await page.fill('input[name="password"]', 'wrong');
  72  |     await page.click('button[type="submit"]');
  73  |     
  74  |     // Should show error, not crash
  75  |     await expect(page.locator('text=Invalid|Credenciales|error')).toBeVisible({ timeout: 5000 }).catch(() => {});
  76  |   });
  77  |   
  78  |   test('FL-003: Página de grupos sin auth redirige a login', async ({ page }) => {
  79  |     await page.goto('http://localhost:3000/groups/new');
  80  |     
  81  |     // Should redirect to login
  82  |     await page.waitForTimeout(1000);
  83  |     const url = page.url();
  84  |     expect(url).toMatch(/login|groups\/new/);
  85  |   });
  86  |   
  87  |   test('FL-004: Dashboard sin auth redirige a login', async ({ page }) => {
  88  |     await page.goto('http://localhost:3000/dashboard');
  89  |     
  90  |     // Should redirect to login
  91  |     await page.waitForTimeout(1000);
  92  |     const url = page.url();
  93  |     expect(url).toMatch(/login|dashboard/);
  94  |   });
  95  | 
  96  |   // ============================================
  97  |   // 3. EDGE CASES
  98  |   // ============================================
  99  |   
  100 |   test('EC-001: Home sin partidos muestra fallback', async ({ page }) => {
  101 |     await page.goto('http://localhost:3000');
  102 |     
  103 |     // Page should load without crash
  104 |     await expect(page.locator('h1')).toBeVisible();
  105 |     
  106 |     // Should show some content (either next match or placeholder)
  107 |     const content = await page.content();
  108 |     expect(content.length).toBeGreaterThan(100);
  109 |   });
  110 |   
  111 |   test('EC-002: API error handling', async ({ page }) => {
  112 |     // Try invalid route
  113 |     await page.goto('http://localhost:3000/api/invalid-route');
  114 |     
  115 |     // Should show 404 or handle gracefully
  116 |     await page.waitForTimeout(1000);
  117 |     const url = page.url();
  118 |     expect(url).toContain('localhost');
  119 |   });
  120 |   
  121 |   test('EC-003: Grupos con ID inválido', async ({ page }) => {
  122 |     await page.goto('http://localhost:3000/groups/invalid-id-12345');
  123 |     
  124 |     // Should handle 404 or redirect
  125 |     await page.waitForTimeout(2000);
  126 |     const url = page.url();
  127 |     expect(url).toMatch(/groups\/|404|error/);
  128 |   });
  129 |   
  130 |   test('EC-004: Loading state', async ({ page }) => {
  131 |     await page.goto('http://localhost:3000/login');
  132 |     
  133 |     // Should show form (no infinite loader)
  134 |     await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 5000 });
  135 |   });
  136 | 
  137 |   // ============================================
  138 |   // 4. MOBILE RESPONSIVE
  139 |   // ============================================
  140 |   
  141 |   test('MR-001: Mobile viewport sin overflow', async ({ page }) => {
  142 |     await page.setViewportSize({ width: 375, height: 667 });
  143 |     await page.goto('http://localhost:3000');
  144 |     
  145 |     // Get scroll width
  146 |     const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  147 |     const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  148 |     
  149 |     // Should not have horizontal scroll
  150 |     expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  151 |   });
  152 |   
  153 |   test('MR-002: Botones táctiles en mobile', async ({ page }) => {
  154 |     await page.setViewportSize({ width: 375, height: 667 });
  155 |     await page.goto('http://localhost:3000/register');
  156 |     
  157 |     // Buttons should be visible and clickable
  158 |     const button = page.locator('button[type="submit"]');
  159 |     await expect(button).toBeVisible();
  160 |     
  161 |     // Should be able to click
  162 |     await button.click();
  163 |   });
  164 | });
```