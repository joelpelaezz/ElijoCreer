import { expect, test } from "@playwright/test";
import {
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

async function setupRankingSourceScenario() {
  const suffix = uniqueSuffix("api-ranking");
  const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}-owner@test.com`);
  const member = await createUserInDb(`Member ${suffix}`, `${suffix}-member@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId });
  await addMember(group.id, member.id);
  await createPrediction({ groupId: group.id, matchId: scenario.pastMatchId, userId: owner.id, home: 1, away: 0, isLocked: true });
  await createPrediction({ groupId: group.id, matchId: scenario.pastMatchId, userId: member.id, home: 0, away: 0, isLocked: true });
  await createOfficialResult({ matchId: scenario.pastMatchId, loadedBy: owner.id, home: 1, away: 0 });
  return { owner, member, group };
}

test.describe("API ranking export source", () => {
  test("should return ranking source data for export", async ({ page, context }) => {
    const { owner, group } = await setupRankingSourceScenario();
    await clearSession(context);
    await loginUser(page, owner);

    const result = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/ranking`);
      return { status: res.status, body: await res.json() };
    }, group.id);

    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });

  test("should include ranking fields required by csv", async ({ page, context }) => {
    const { owner, group } = await setupRankingSourceScenario();
    await clearSession(context);
    await loginUser(page, owner);

    const ranking = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/ranking`);
      return res.json();
    }, group.id);

    expect(ranking[0]).toHaveProperty("userName");
    expect(ranking[0]).toHaveProperty("predictionsCount");
    expect(ranking[0]).toHaveProperty("exactScore");
    expect(ranking[0]).toHaveProperty("outcome");
    expect(ranking[0]).toHaveProperty("oneTeamScore");
    expect(ranking[0]).toHaveProperty("totalPoints");
  });

  test("should include member rows in ranking output", async ({ page, context }) => {
    const { owner, member, group } = await setupRankingSourceScenario();
    await clearSession(context);
    await loginUser(page, owner);

    const ranking = await page.evaluate(async (groupId) => {
      const res = await fetch(`/api/groups/${groupId}/ranking`);
      return res.json();
    }, group.id);

    const names = ranking.map((row: { userName: string }) => row.userName);
    expect(names).toContain(owner.name);
    expect(names).toContain(member.name);
  });
});
