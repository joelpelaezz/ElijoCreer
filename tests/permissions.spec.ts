import { expect, test } from "@playwright/test";
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

async function setupPermissionScenario() {
  const suffix = uniqueSuffix("perm");
  const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}-owner@test.com`);
  const member = await createUserInDb(`Member ${suffix}`, `${suffix}-member@test.com`);
  const outsider = await createUserInDb(`Out ${suffix}`, `${suffix}-out@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });
  await addMember(group.id, member.id);
  return { owner, member, outsider, group };
}

test.describe("Permissions", () => {
  test("should allow admin to access group settings", async ({ page, context }) => {
    const { owner, group } = await setupPermissionScenario();
    await clearSession(context);
    await loginUser(page, owner);
    await page.goto(`${BASE_URL}/groups/${group.id}/settings`);
    await expect(page.getByRole("heading", { name: /Configuración del grupo/i })).toBeVisible();
  });

  test("should prevent member from recalculating scores", async ({ page, context }) => {
    const { member, group } = await setupPermissionScenario();
    await clearSession(context);
    await loginUser(page, member);
    await page.goto(`${BASE_URL}/groups/${group.id}/settings`);
    await page.waitForTimeout(1200);
    expect(page.url()).toBe(`${BASE_URL}/groups/${group.id}`);

    const response = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/recalculate`, { method: "POST" });
      return { status: res.status, body: await res.json() };
    }, group.id);

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/Solo el dueño/i);
  });

  test("should block non-member from viewing private group routes", async ({ page, context }) => {
    const { outsider, group } = await setupPermissionScenario();
    await clearSession(context);
    await loginUser(page, outsider);
    await page.goto(`${BASE_URL}/groups/${group.id}`);
    await page.waitForTimeout(1000);

    const statuses = await page.evaluate(async (groupId) => {
      const urls = [
        `/api/groups/${groupId}`,
        `/api/groups/${groupId}/settings`,
        `/api/predictions?groupId=${groupId}`,
      ];
      const result: number[] = [];
      for (const url of urls) {
        const res = await fetch(url);
        result.push(res.status);
      }
      return result;
    }, group.id);

    expect(statuses).toEqual([403, 403, 403]);
  });
});
