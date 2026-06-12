# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: predictions.spec.ts >> Predictions >> should persist prediction after page reload
- Location: tests/predictions.spec.ts:28:7

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('input[type="number"]:not([disabled])').first()
Expected: "2"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" with timeout 5000ms
  - waiting for locator('input[type="number"]:not([disabled])').first()
    11 × locator resolved to <input min="0" max="99" value="" type="number" placeholder="?" class="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all border-border bg-surface text-foreground focus:border-primary focus:ring-0 outline-none "/>
       - unexpected value ""

```

```yaml
- spinbutton
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import {
  3   |   BASE_URL,
  4   |   clearSession,
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
> 41  |     await expect(editableInputs.nth(0)).toHaveValue("2");
      |                                         ^ Error: expect(locator).toHaveValue(expected) failed
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
  105 |     await page.getByRole("button", { name: /Ver puntaje/ }).click();
  106 | 
  107 |     await expect(page.getByText(/Tu puntaje/i)).toBeVisible();
  108 |     await expect(page.getByText(/Resultado:/i)).toBeVisible();
  109 |     await expect(page.getByText(/Exacto/i)).toBeVisible();
  110 |     await expect(page.getByText(/\+5 pts/i)).toBeVisible();
  111 |   });
  112 | });
  113 | 
```