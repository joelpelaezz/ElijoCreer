import { expect, test } from "@playwright/test";
import fs from "fs/promises";
import path from "path";
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
} from "./helpers/scenario";

async function setupExportScenario() {
  const suffix = uniqueSuffix("export");
  const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}-owner@test.com`);
  const member = await createUserInDb(`Member ${suffix}`, `${suffix}-member@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({ ownerUserId: owner.id, tournamentId: scenario.tournamentId, name: `Export ${suffix}` });
  await addMember(group.id, member.id);
  await createPrediction({ groupId: group.id, matchId: scenario.pastMatchId, userId: owner.id, home: 1, away: 0, isLocked: true });
  await createPrediction({ groupId: group.id, matchId: scenario.pastMatchId, userId: member.id, home: 0, away: 0, isLocked: true });
  await createOfficialResult({ matchId: scenario.pastMatchId, loadedBy: owner.id, home: 1, away: 0 });
  return { owner, member, group };
}

async function downloadCsv(page: import("@playwright/test").Page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Exportar CSV/i }).click(),
  ]);

  const filePath = path.join("/tmp/opencode", `${Date.now()}-${download.suggestedFilename()}`);
  await download.saveAs(filePath);
  const content = await fs.readFile(filePath, "utf8");
  return { filePath, content, fileName: download.suggestedFilename() };
}

test.describe("Export CSV", () => {
  test("should download ranking csv", async ({ page, context }) => {
    const { owner, group } = await setupExportScenario();
    await clearSession(context);
    await loginUser(page, owner);
    await page.goto(`${BASE_URL}/groups/${group.id}/ranking`);

    const { fileName } = await downloadCsv(page);
    expect(fileName).toMatch(/^ranking-.*\.csv$/);
  });

  test("should export csv with expected headers", async ({ page, context }) => {
    const { owner, group } = await setupExportScenario();
    await clearSession(context);
    await loginUser(page, owner);
    await page.goto(`${BASE_URL}/groups/${group.id}/ranking`);

    const { content } = await downloadCsv(page);
    expect(content.split("\n")[0]).toBe(
      "Posición,Participante,Pronósticos,Exactos,Ganador,Un equipo,Puntos"
    );
  });

  test("should export csv with current ranking data", async ({ page, context }) => {
    const { owner, member, group } = await setupExportScenario();
    await clearSession(context);
    await loginUser(page, owner);
    await page.goto(`${BASE_URL}/groups/${group.id}/ranking`);

    const { content } = await downloadCsv(page);
    expect(content).toContain(owner.name);
    expect(content).toContain(member.name);
  });
});
