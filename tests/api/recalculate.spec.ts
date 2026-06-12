import { expect, test } from "@playwright/test";
import {
  BASE_URL,
  addMember,
  clearSession,
  createGroupInDb,
  createOfficialResult,
  createPrediction,
  createTournamentScenario,
  createUserInDb,
  getScoreForPrediction,
  loginUser,
  uniqueSuffix,
} from "../helpers/scenario";

async function setupApiRecalculateScenario() {
  const suffix = uniqueSuffix("api-recalc");
  const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}-owner@test.com`);
  const member = await createUserInDb(`Member ${suffix}`, `${suffix}-member@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });
  await addMember(group.id, member.id);
  const ownerPredictionId = await createPrediction({ groupId: group.id, matchId: scenario.pastMatchId, userId: owner.id, home: 1, away: 0, isLocked: true });
  await createOfficialResult({ matchId: scenario.pastMatchId, loadedBy: owner.id, home: 1, away: 0 });
  return { owner, member, group, scenario, ownerPredictionId };
}

test.describe("API recalculate", () => {
  test("should recalculate scores for admin user", async ({ page, context }) => {
    const { owner, group, ownerPredictionId } = await setupApiRecalculateScenario();
    await clearSession(context);
    await loginUser(page, owner);

    const result = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/recalculate`, { method: "POST" });
      return { status: res.status, body: await res.json() };
    }, group.id);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect((await getScoreForPrediction(ownerPredictionId))?.pointsAwarded).toBe(5);
  });

  test("should return 401 for unauthenticated recalculation", async ({ request }) => {
    const suffix = uniqueSuffix("api-recalc-401");
    const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}@test.com`);
    const scenario = await createTournamentScenario(suffix);
    const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });

    const res = await request.post(`${BASE_URL}/api/groups/${group.id}/recalculate`);
    expect(res.status()).toBe(401);
  });

  test("should return 403 for non-admin recalculation", async ({ page, context }) => {
    const { member, group } = await setupApiRecalculateScenario();
    await clearSession(context);
    await loginUser(page, member);

    const result = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/recalculate`, { method: "POST" });
      return { status: res.status, body: await res.json() };
    }, group.id);

    expect(result.status).toBe(403);
  });

  test("should return 404 for unknown group", async ({ page, context }) => {
    const suffix = uniqueSuffix("api-recalc-404");
    const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}@test.com`);
    await clearSession(context);
    await loginUser(page, owner);

    const result = await page.evaluate(async () => {
      const res = await fetch(`/api/groups/00000000-0000-0000-0000-000000000000/recalculate`, { method: "POST" });
      return { status: res.status, body: await res.json() };
    });

    expect(result.status).toBe(404);
  });

  test("should update prediction scores after recalculation", async ({ page, context }) => {
    const { owner, group, ownerPredictionId } = await setupApiRecalculateScenario();
    await clearSession(context);
    await loginUser(page, owner);

    await page.evaluate(async (groupId) => {
      await fetch(`/api/groups/${groupId}/recalculate`, { method: "POST" });
    }, group.id);

    const score = await getScoreForPrediction(ownerPredictionId);
    expect(score?.hitExactScore).toBe(true);
    expect(score?.scoringReason).toMatch(/Resultado exacto/i);
  });
});
