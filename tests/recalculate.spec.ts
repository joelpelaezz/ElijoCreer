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
  removePredictionScores,
  uniqueSuffix,
} from "./helpers/scenario";

async function setupRecalculateScenario() {
  const suffix = uniqueSuffix("recalc");
  const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}-owner@test.com`);
  const member = await createUserInDb(`Member ${suffix}`, `${suffix}-member@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });
  await addMember(group.id, member.id);

  const ownerPredictionId = await createPrediction({
    groupId: group.id,
    matchId: scenario.pastMatchId,
    userId: owner.id,
    home: 1,
    away: 0,
    isLocked: true,
  });
  const memberPredictionId = await createPrediction({
    groupId: group.id,
    matchId: scenario.pastMatchId,
    userId: member.id,
    home: 2,
    away: 2,
    isLocked: true,
  });
  await createOfficialResult({ matchId: scenario.pastMatchId, loadedBy: owner.id, home: 1, away: 0 });
  await removePredictionScores(group.id);

  return { owner, member, group, ownerPredictionId, memberPredictionId };
}

test.describe("Recalculate", () => {
  test("should recalculate scores and update ranking", async ({ page, context }) => {
    const { owner, group, ownerPredictionId, memberPredictionId } = await setupRecalculateScenario();
    await clearSession(context);
    await loginUser(page, owner);

    const result = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/recalculate`, { method: "POST" });
      return { status: res.status, body: await res.json() };
    }, group.id);

    expect(result.status).toBe(200);
    expect(result.body.recalculated).toBe(2);

    const ranking = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/ranking`);
      return res.json();
    }, group.id);

    expect(ranking[0].totalPoints).toBe(5);
    expect(ranking[1].totalPoints).toBe(0);
    expect((await getScoreForPrediction(ownerPredictionId))?.pointsAwarded).toBe(5);
    expect((await getScoreForPrediction(memberPredictionId))?.pointsAwarded).toBe(0);
  });

  test("should keep ranking consistent after recalculation", async ({ page, context }) => {
    const { owner, group } = await setupRecalculateScenario();
    await clearSession(context);
    await loginUser(page, owner);

    const run = async () =>
      page.evaluate(async (groupId) => {
        const res = await fetch(`/api/groups/${groupId}/recalculate`, { method: "POST" });
        return { status: res.status, body: await res.json() };
      }, group.id);

    const first = await run();
    const second = await run();
    const ranking = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/ranking`);
      return res.json();
    }, group.id);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(ranking[0].totalPoints).toBe(5);
    expect(ranking[1].totalPoints).toBe(0);
  });

  test("should reject recalculation for non-admin user", async ({ page, context }) => {
    const { member, group } = await setupRecalculateScenario();
    await clearSession(context);
    await loginUser(page, member);

    const result = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/recalculate`, { method: "POST" });
      return { status: res.status, body: await res.json() };
    }, group.id);

    expect(result.status).toBe(403);
    expect(result.body.error).toMatch(/Solo el dueño/i);
  });
});
