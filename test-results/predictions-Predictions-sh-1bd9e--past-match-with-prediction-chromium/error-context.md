# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: predictions.spec.ts >> Predictions >> should show score detail for past match with prediction
- Location: tests/predictions.spec.ts:84:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Ver puntaje/ })

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
        - button "U User pred-1781284978826-tc730l" [ref=e9]:
          - generic [ref=e10]: U
          - generic [ref=e11]: User pred-1781284978826-tc730l
  - main [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e15]:
        - link "arrow_back Volver al grupo" [ref=e16] [cursor=pointer]:
          - /url: /groups/cf6366fd-9d36-4fd6-a6eb-6c0787017d89
          - generic [ref=e17]: arrow_back
          - text: Volver al grupo
        - heading "Fixture" [level=1] [ref=e18]
      - generic [ref=e19]:
        - button "Fase de Grupos" [ref=e20]
        - button "32avos de Final" [ref=e21]
        - button "16avos de Final" [ref=e22]
        - button "Cuartos de Final" [ref=e23]
        - button "Semifinal" [ref=e24]
        - button "Tercer Puesto" [ref=e25]
        - button "Final" [ref=e26]
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e30]: dom, 7 jun 05:22 p. m.
          - generic [ref=e31]:
            - generic [ref=e32]:
              - generic [ref=e33]: T30l
              - generic [ref=e34]: T0l
            - generic [ref=e35]:
              - spinbutton [disabled] [ref=e36]
              - generic [ref=e37]: ":"
              - spinbutton [disabled] [ref=e38]
            - generic [ref=e39]:
              - generic [ref=e40]: C30l
              - generic [ref=e41]: C0l
          - generic [ref=e42]:
            - generic [ref=e43]: ❌ Cerrado
            - button "Ver pronósticos" [ref=e45]
        - generic [ref=e46]:
          - generic [ref=e47]:
            - generic [ref=e48]: mié, 17 jun 05:22 p. m.
            - generic "Último momento para pronosticar" [ref=e49]: 🕐 Cierra 04:52 p. m.
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: L30l
              - generic [ref=e53]: L0l
            - generic [ref=e54]:
              - spinbutton [ref=e55]
              - generic [ref=e56]: ":"
              - spinbutton [ref=e57]
            - generic [ref=e58]:
              - generic [ref=e59]: V30l
              - generic [ref=e60]: V0l
          - generic [ref=e61]:
            - generic [ref=e62]: 🟢 Abierto
            - generic [ref=e63]:
              - button "Ver pronósticos" [ref=e64]
              - button "Guardar" [ref=e65]
  - button "Open Next.js Dev Tools" [ref=e71] [cursor=pointer]:
    - img [ref=e72]
  - alert [ref=e75]
```

# Test source

```ts
  5   |   createGroupInDb,
  6   |   createOfficialResult,
  7   |   createPrediction,
  8   |   createTournamentScenario,
  9   |   createUserInDb,
  10  |   loginUser,
  11  |   uniqueSuffix,
  12  | } from "./helpers/scenario";
  13  | 
  14  | async function setupPredictionScenario() {
  15  |   const suffix = uniqueSuffix("pred");
  16  |   const user = await createUserInDb(`User ${suffix}`, `${suffix}@test.com`);
  17  |   const scenario = await createTournamentScenario(suffix);
  18  |   const group = await createGroupInDb({
  19  |     ownerUserId: user.id,
  20  |     tournamentId: scenario.tournamentId,
  21  |     name: `Predictions ${suffix}`,
  22  |   });
  23  | 
  24  |   return { user, group, scenario };
  25  | }
  26  | 
  27  | test.describe("Predictions", () => {
  28  |   test("should persist prediction after page reload", async ({ page, context }) => {
  29  |     const { user, group } = await setupPredictionScenario();
  30  | 
  31  |     await clearSession(context);
  32  |     await loginUser(page, user);
  33  |     await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);
  34  | 
  35  |     const editableInputs = page.locator('input[type="number"]:not([disabled])');
  36  |     await editableInputs.nth(0).fill("2");
  37  |     await editableInputs.nth(1).fill("1");
  38  |     await page.getByRole("button", { name: /Guardar/ }).click();
  39  |     await page.reload();
  40  | 
  41  |     await expect(editableInputs.nth(0)).toHaveValue("2");
  42  |     await expect(editableInputs.nth(1)).toHaveValue("1");
  43  |   });
  44  | 
  45  |   test("should update existing prediction before match lock", async ({ page, context }) => {
  46  |     const { user, group, scenario } = await setupPredictionScenario();
  47  |     await createPrediction({
  48  |       groupId: group.id,
  49  |       matchId: scenario.futureMatchId,
  50  |       userId: user.id,
  51  |       home: 1,
  52  |       away: 0,
  53  |     });
  54  | 
  55  |     await clearSession(context);
  56  |     await loginUser(page, user);
  57  |     await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);
  58  | 
  59  |     const editableInputs = page.locator('input[type="number"]:not([disabled])');
  60  |     await expect(editableInputs.nth(0)).toHaveValue("1");
  61  |     await expect(editableInputs.nth(1)).toHaveValue("0");
  62  | 
  63  |     await editableInputs.nth(0).fill("3");
  64  |     await editableInputs.nth(1).fill("2");
  65  |     await page.getByRole("button", { name: /Actualizar/ }).click();
  66  |     await page.reload();
  67  | 
  68  |     await expect(editableInputs.nth(0)).toHaveValue("3");
  69  |     await expect(editableInputs.nth(1)).toHaveValue("2");
  70  |   });
  71  | 
  72  |   test("should disable prediction inputs for past matches", async ({ page, context }) => {
  73  |     const { user, group } = await setupPredictionScenario();
  74  | 
  75  |     await clearSession(context);
  76  |     await loginUser(page, user);
  77  |     await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);
  78  | 
  79  |     const disabledInputs = page.locator('input[type="number"][disabled]');
  80  |     await expect(disabledInputs.first()).toBeVisible();
  81  |     expect(await disabledInputs.count()).toBeGreaterThanOrEqual(2);
  82  |   });
  83  | 
  84  |   test("should show score detail for past match with prediction", async ({ page, context }) => {
  85  |     const { user, group, scenario } = await setupPredictionScenario();
  86  |     await createPrediction({
  87  |       groupId: group.id,
  88  |       matchId: scenario.pastMatchId,
  89  |       userId: user.id,
  90  |       home: 1,
  91  |       away: 0,
  92  |       isLocked: true,
  93  |     });
  94  |     await createOfficialResult({
  95  |       matchId: scenario.pastMatchId,
  96  |       loadedBy: user.id,
  97  |       home: 1,
  98  |       away: 0,
  99  |     });
  100 | 
  101 |     await clearSession(context);
  102 |     await loginUser(page, user);
  103 |     await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);
  104 | 
> 105 |     await page.getByRole("button", { name: /Ver puntaje/ }).click();
      |                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  106 | 
  107 |     await expect(page.getByText(/Tu puntaje/i)).toBeVisible();
  108 |     await expect(page.getByText(/Resultado:/i)).toBeVisible();
  109 |     await expect(page.getByText(/Exacto/i)).toBeVisible();
  110 |     await expect(page.getByText(/\+5 pts/i)).toBeVisible();
  111 |   });
  112 | });
  113 | 
```