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

async function setupJoinScenario() {
  const suffix = uniqueSuffix("join");
  const owner = await createUserInDb(`Owner ${suffix}`, `${suffix}-owner@test.com`);
  const member = await createUserInDb(`Member ${suffix}`, `${suffix}-member@test.com`);
  const scenario = await createTournamentScenario(suffix);
  const group = await createGroupInDb({
    ownerUserId: owner.id,
    tournamentId: scenario.tournamentId,
    name: `Join ${suffix}`,
  });

  return { owner, member, group };
}

test.describe("Group Join", () => {
  test("should join group with valid invite code", async ({ page, context }) => {
    const { member, group } = await setupJoinScenario();
    await clearSession(context);
    await loginUser(page, member);

    await page.goto(`${BASE_URL}/dashboard/join`);
    await page.fill('input[type="text"]', group.inviteCode);
    await page.getByRole("button", { name: /Unirse/ }).click();

    await page.waitForURL(new RegExp(`/groups/${group.id}$`));
    await expect(page.getByText(group.inviteCode)).toBeVisible();
  });

  test("should reject invalid invite code", async ({ page, context }) => {
    const suffix = uniqueSuffix("join-invalid");
    const user = await createUserInDb(`User ${suffix}`, `${suffix}@test.com`);
    await clearSession(context);
    await loginUser(page, user);

    await page.goto(`${BASE_URL}/dashboard/join`);
    await page.fill('input[type="text"]', "ZZZZ9999");
    await page.getByRole("button", { name: /Unirse/ }).click();

    await expect(page.getByText(/Código de invitación inválido/i)).toBeVisible();
  });

  test("should prevent duplicate join for existing member", async ({ page, context }) => {
    const { member, group } = await setupJoinScenario();
    await addMember(group.id, member.id);
    await clearSession(context);
    await loginUser(page, member);

    await page.goto(`${BASE_URL}/dashboard/join`);
    await page.fill('input[type="text"]', group.inviteCode);
    await page.getByRole("button", { name: /Unirse/ }).click();

    await expect(page.getByText(/Ya sos miembro de este grupo/i)).toBeVisible();
  });
});
