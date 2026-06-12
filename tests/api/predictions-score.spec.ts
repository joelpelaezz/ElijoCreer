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
  loginUser,
  uniqueSuffix,
} from "../helpers/scenario";

async function setupScoreScenario() {
  const suffix = uniqueSuffix("api-score");
  const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}-owner@test.com`);
  const outsider = await createUserInDb(`Out ${suffix}`, `${suffix}-out@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });
  await createPrediction({ groupId: group.id, matchId: scenario.pastMatchId, userId: owner.id, home: 1, away: 0, isLocked: true });
  await createOfficialResult({ matchId: scenario.pastMatchId, loadedBy: owner.id, home: 1, away: 0 });
  return { owner, outsider, group, scenario };
}

test.describe("API predictions score", () => {
  test("should return score breakdown for authenticated user", async ({ page, context }) => {
    const { owner, group, scenario } = await setupScoreScenario();
    await clearSession(context);
    await loginUser(page, owner);

    const result = await page.evaluate(async ({ groupId, matchId }) => {
      const res = await fetch(`/api/predictions/score?groupId=${groupId}&matchId=${matchId}`);
      return { status: res.status, body: await res.json() };
    }, { groupId: group.id, matchId: scenario.pastMatchId });

    expect(result.status).toBe(200);
    expect(result.body.score.points).toBe(5);
    expect(result.body.score.hitExactScore).toBe(true);
    expect(result.body.score.reason).toMatch(/Resultado exacto/i);
  });

  test("should return 401 for unauthenticated score request", async ({ request }) => {
    const suffix = uniqueSuffix("api-score-401");
    const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}@test.com`);
    const scenario = await createTournamentScenario(suffix);
    const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });

    const res = await request.get(`${BASE_URL}/api/predictions/score?groupId=${group.id}&matchId=${scenario.pastMatchId}`);
    expect(res.status()).toBe(401);
  });

  test("should return 403 for user outside group", async ({ page, context }) => {
    const { outsider, group, scenario } = await setupScoreScenario();
    await clearSession(context);
    await loginUser(page, outsider);

    const result = await page.evaluate(async ({ groupId, matchId }) => {
      const res = await fetch(`/api/predictions/score?groupId=${groupId}&matchId=${matchId}`);
      return { status: res.status, body: await res.json() };
    }, { groupId: group.id, matchId: scenario.pastMatchId });

    expect(result.status).toBe(403);
    expect(result.body.error).toMatch(/No sos miembro/i);
  });

  test("should return 400 when groupId is missing", async ({ page, context }) => {
    const suffix = uniqueSuffix("api-score-400a");
    const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}@test.com`);
    await clearSession(context);
    await loginUser(page, owner);

    const result = await page.evaluate(async () => {
      const res = await fetch(`/api/predictions/score?matchId=missing`);
      return { status: res.status, body: await res.json() };
    });

    expect(result.status).toBe(400);
  });

  test("should return 400 when matchId is missing", async ({ page, context }) => {
    const suffix = uniqueSuffix("api-score-400b");
    const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}@test.com`);
    const scenario = await createTournamentScenario(suffix);
    const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });
    await clearSession(context);
    await loginUser(page, owner);

    const result = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/predictions/score?groupId=${groupId}`);
      return { status: res.status, body: await res.json() };
    }, group.id);

    expect(result.status).toBe(400);
  });
});
