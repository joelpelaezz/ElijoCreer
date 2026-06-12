import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { getDb } from "../src/lib/db";
import { groups } from "../src/lib/db/schema";
import {
  BASE_URL,
  addMember,
  clearSession,
  createGroupInDb,
  createTournamentScenario,
  createUserInDb,
  loginUser,
  uniqueSuffix,
} from "./helpers/scenario";

test.describe("Family Group", () => {
  test("should create family group and generate invite code", async ({ page, context }) => {
    const suffix = uniqueSuffix("family-create");
    const owner = await createUserInDb(`Padre ${suffix}`, `${suffix}@test.com`);
    const scenario = await createTournamentScenario(suffix);
    const groupName = `Familia ${suffix}`;

    await clearSession(context);
    await loginUser(page, owner);
    await page.goto(`${BASE_URL}/groups/new`);
    await page.fill('input[placeholder="Ej: Los Pibes del Prode"]', groupName);
    await page.locator("select").selectOption({ label: `Test Tournament ${suffix}` });
    await page.getByRole("button", { name: /Crear Grupo/i }).click();
    await page.waitForURL(/\/groups\/[a-f0-9-]{36}/);

    const db = getDb();
    const group = await db.query.groups.findFirst({
      where: (g, { eq: eqFn }) => eqFn(g.name, groupName),
    });

    expect(group?.tournamentId).toBe(scenario.tournamentId);
    expect(group?.inviteCode).toHaveLength(8);
  });

  test("should load fixture ranking and settings for family group", async ({ page, context }) => {
    const suffix = uniqueSuffix("family-pages");
    const owner = await createUserInDb(`Padre ${suffix}`, `${suffix}-owner@test.com`);
    const scenario = await createTournamentScenario(suffix);
    const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId, name: `Familia ${suffix}` });

    await clearSession(context);
    await loginUser(page, owner);

    await page.goto(`${BASE_URL}/groups/${group.id}/fixture`);
    await expect(page.getByRole("heading", { name: /Fixture/i })).toBeVisible();

    await page.goto(`${BASE_URL}/groups/${group.id}/ranking`);
    await expect(page.getByRole("heading", { name: /Ranking/i })).toBeVisible();

    await page.goto(`${BASE_URL}/groups/${group.id}/settings`);
    await expect(page.getByRole("heading", { name: /Configuración del grupo/i })).toBeVisible();
  });

  test("should display group members correctly", async ({ page, context }) => {
    const suffix = uniqueSuffix("family-members");
    const owner = await createUserInDb(`Padre ${suffix}`, `${suffix}-owner@test.com`);
    const mother = await createUserInDb(`Madre ${suffix}`, `${suffix}-mother@test.com`);
    const son = await createUserInDb(`Hijo ${suffix}`, `${suffix}-son@test.com`);
    const daughter = await createUserInDb(`Hija ${suffix}`, `${suffix}-daughter@test.com`);
    const scenario = await createTournamentScenario(suffix);
    const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId, name: `Familia ${suffix}` });
    await addMember(group.id, mother.id);
    await addMember(group.id, son.id);
    await addMember(group.id, daughter.id);

    await clearSession(context);
    await loginUser(page, owner);
    await page.goto(`${BASE_URL}/groups/${group.id}`);

    await expect(page.getByText(owner.name)).toBeVisible();
    await expect(page.getByText(mother.name)).toBeVisible();
    await expect(page.getByText(son.name)).toBeVisible();
    await expect(page.getByText(daughter.name)).toBeVisible();
  });
});
