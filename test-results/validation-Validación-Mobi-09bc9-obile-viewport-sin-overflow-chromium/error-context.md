# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: validation.spec.ts >> Validación Mobile-First + Accesibilidad + Flujos >> MR-001: Mobile viewport sin overflow
- Location: tests/validation.spec.ts:141:7

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 376
Received:    439
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "ElijoCreer" [ref=e4] [cursor=pointer]:
        - /url: /
      - navigation [ref=e5]:
        - button "settings_brightness" [ref=e6]:
          - generic [ref=e7]: settings_brightness
        - generic [ref=e8]:
          - link "Iniciar Sesión" [ref=e9] [cursor=pointer]:
            - /url: /login
          - link "Registrarse" [ref=e10] [cursor=pointer]:
            - /url: /register
  - main [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e16]: Road to 2026
        - heading "La gloria se predice, el orgullo se comparte." [level=1] [ref=e17]:
          - text: La gloria se predice,
          - text: el orgullo se comparte.
        - paragraph [ref=e18]: La plataforma social de predicciones del Mundial 2026. Creá grupos con amigos, cargá tus pronósticos y subí en el ranking.
        - generic [ref=e19]:
          - link "Crear Cuenta arrow_forward" [ref=e20] [cursor=pointer]:
            - /url: /register
            - text: Crear Cuenta
            - generic [ref=e21]: arrow_forward
          - link "Iniciar Sesión" [ref=e22] [cursor=pointer]:
            - /url: /login
      - generic [ref=e26]: sports_soccer
    - generic [ref=e29]:
      - generic [ref=e30]:
        - paragraph [ref=e31]: "244"
        - paragraph [ref=e32]: Usuarios
      - generic [ref=e33]:
        - paragraph [ref=e34]: "3"
        - paragraph [ref=e35]: Grupos
      - generic [ref=e36]:
        - paragraph [ref=e37]: "104"
        - paragraph [ref=e38]: Partidos
    - generic [ref=e39]:
      - generic [ref=e40]:
        - heading "¿Cómo funciona?" [level=2] [ref=e41]
        - paragraph [ref=e42]: Tres pasos para convertirte en el campeón de tu grupo.
      - generic [ref=e43]:
        - generic [ref=e44]:
          - generic [ref=e46]: groups
          - heading "Creá tu grupo" [level=3] [ref=e47]
          - paragraph [ref=e48]: Armá un grupo privado con amigos o unite a una liga pública. La competencia es mejor cuando es social.
        - generic [ref=e49]:
          - generic [ref=e51]: edit_note
          - heading "Predicí los resultados" [level=3] [ref=e52]
          - paragraph [ref=e53]: Cargá tus pronósticos antes de cada partido. Ganá puntos por resultado exacto o por acertar el ganador.
        - generic [ref=e54]:
          - generic [ref=e56]: leaderboard
          - heading "Ganá el ranking" [level=3] [ref=e57]
          - paragraph [ref=e58]: Escalá posiciones en el ranking de tu grupo. Demostrá quién conoce más del fútbol.
    - generic [ref=e59]:
      - generic [ref=e60]:
        - heading "Próximo Partido" [level=2] [ref=e61]
        - paragraph [ref=e62]: "Fecha: viernes, 12 de junio"
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]: Próximo Partido
            - generic [ref=e67]: Fase de Grupos
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]: 🇨🇦
              - generic [ref=e71]: Canada
              - generic [ref=e72]: CAN
            - generic [ref=e73]:
              - generic [ref=e74]: "?"
              - generic [ref=e75]: ":"
              - generic [ref=e76]: "?"
            - generic [ref=e77]:
              - generic [ref=e78]: 🇧🇦
              - generic [ref=e79]: Bosnia & Herzegovina
              - generic [ref=e80]: BIH
          - generic [ref=e81]:
            - paragraph [ref=e82]: 07:00 p. m. hs
            - generic [ref=e83]: +5 pts si acertás el exacto
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]:
              - heading "Ranking Amigos" [level=3] [ref=e87]
              - generic [ref=e88]: workspace_premium
            - paragraph [ref=e89]: Iniciá sesión para ver tu posición en el ranking
            - link "Iniciar Sesión" [ref=e90] [cursor=pointer]:
              - /url: /login
          - generic [ref=e91]:
            - paragraph [ref=e92]: Unite a la competencia
            - paragraph [ref=e93]: Registrate y empezá a competir con tus amigos
    - generic [ref=e95]:
      - heading "¿Listo para demostrar tu fe?" [level=2] [ref=e96]
      - paragraph [ref=e97]: Unite a miles de aficionados que ya están armando sus grupos. No te quedes fuera del mayor evento social del 2026.
      - generic [ref=e98]:
        - link "Crear Cuenta Gratis" [ref=e99] [cursor=pointer]:
          - /url: /register
        - link "Iniciar Sesión" [ref=e100] [cursor=pointer]:
          - /url: /login
    - generic [ref=e101]:
      - generic [ref=e102]:
        - generic [ref=e103]:
          - heading "ElijoCreer" [level=4] [ref=e104]
          - paragraph [ref=e105]: La red social definitiva para fanáticos del fútbol y maestros de las predicciones.
        - generic [ref=e106]:
          - heading "Plataforma" [level=5] [ref=e107]
          - list [ref=e108]:
            - listitem [ref=e109]:
              - link "Dashboard" [ref=e110] [cursor=pointer]:
                - /url: /dashboard
            - listitem [ref=e111]:
              - link "Ingresar" [ref=e112] [cursor=pointer]:
                - /url: /login
        - generic [ref=e113]:
          - heading "Legal" [level=5] [ref=e114]
          - list [ref=e115]:
            - listitem [ref=e116]: Términos y Condiciones
            - listitem [ref=e117]: Privacidad
        - generic [ref=e118]:
          - heading "Contacto" [level=5] [ref=e119]
          - paragraph [ref=e120]: Seguinos en redes para estar al tanto de las novedades.
      - generic [ref=e121]: © 2026 ElijoCreer. Todos los derechos reservados.
  - button "Open Next.js Dev Tools" [ref=e127] [cursor=pointer]:
    - img [ref=e128]
  - alert [ref=e131]
```

# Test source

```ts
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
  70  |     await page.fill('input[name="email"]', 'wrong@test.com');
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
> 150 |     expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      |                         ^ Error: expect(received).toBeLessThanOrEqual(expected)
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