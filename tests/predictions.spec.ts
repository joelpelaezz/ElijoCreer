import { expect, test } from "@playwright/test";
import {
  BASE_URL,
  clearSession,
  createGroupInDb,
  createOfficialResult,
  createPrediction,
  createTournamentScenario,
  createUserInDb,
  loginUser,
  uniqueSuffix,
} from "./helpers/scenario";

async function setupPredictionScenario() {
  const suffix = uniqueSuffix("pred");
  const user = await createUserInDb(`User ${suffix}`, `${suffix}@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({
    ownerUserId: user.id,
    tournamentId: scenario.tournamentId,
    name: `Predictions ${suffix}`,
  });

  return { user, group, scenario };
}

test.describe("Predictions", () => {
  test("should persist prediction after page reload", async ({ page, context }) => {
    const { user, group } = await setupPredictionScenario();

    await clearSession(context);
    await loginUser(page, user);
    await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);

    const editableInputs = page.locator('input[type="number"]:not([disabled])');
    await editableInputs.nth(0).fill("2");
    await editableInputs.nth(1).fill("1");
    await page.getByRole("button", { name: /Guardar/ }).click();
    await page.reload();

    await expect(editableInputs.nth(0)).toHaveValue("2");
    await expect(editableInputs.nth(1)).toHaveValue("1");
  });

  test("should update existing prediction before match lock", async ({ page, context }) => {
    const { user, group, scenario } = await setupPredictionScenario();
    await createPrediction({
      groupId: group.id,
      matchId: scenario.futureMatchId,
      userId: user.id,
      home: 1,
      away: 0,
    });

    await clearSession(context);
    await loginUser(page, user);
    await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);

    const editableInputs = page.locator('input[type="number"]:not([disabled])');
    await expect(editableInputs.nth(0)).toHaveValue("1");
    await expect(editableInputs.nth(1)).toHaveValue("0");

    await editableInputs.nth(0).fill("3");
    await editableInputs.nth(1).fill("2");
    await page.getByRole("button", { name: /Actualizar/ }).click();
    await page.reload();

    await expect(editableInputs.nth(0)).toHaveValue("3");
    await expect(editableInputs.nth(1)).toHaveValue("2");
  });

  test("should disable prediction inputs for past matches", async ({ page, context }) => {
    const { user, group } = await setupPredictionScenario();

    await clearSession(context);
    await loginUser(page, user);
    await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);

    const disabledInputs = page.locator('input[type="number"][disabled]');
    await expect(disabledInputs.first()).toBeVisible();
    expect(await disabledInputs.count()).toBeGreaterThanOrEqual(2);
  });

  test("should show score detail for past match with prediction", async ({ page, context }) => {
    const { user, group, scenario } = await setupPredictionScenario();
    await createPrediction({
      groupId: group.id,
      matchId: scenario.pastMatchId,
      userId: user.id,
      home: 1,
      away: 0,
      isLocked: true,
    });
    await createOfficialResult({
      matchId: scenario.pastMatchId,
      loadedBy: user.id,
      home: 1,
      away: 0,
    });

    await clearSession(context);
    await loginUser(page, user);
    await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);

    await page.getByRole("button", { name: /Ver puntaje/ }).click();

    await expect(page.getByText(/Tu puntaje/i)).toBeVisible();
    await expect(page.getByText(/Resultado:/i)).toBeVisible();
    await expect(page.getByText(/Exacto/i)).toBeVisible();
    await expect(page.getByText(/\+5 pts/i)).toBeVisible();
  });
});
