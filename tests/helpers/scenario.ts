import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { Page, BrowserContext } from "@playwright/test";
import { getDb } from "../../src/lib/db";
import { resolvePostgresConnectionString } from "../../src/lib/db/connection-string";
import {
  accounts,
  groupMembers,
  groupScoringRules,
  groups,
  matches,
  officialResults,
  predictionScores,
  predictions,
  profiles,
  teams,
  tournaments,
  users,
} from "../../src/lib/db/schema";

if (
  !process.env.POSTGRES_URL &&
  !process.env.POSTGRES_URL_NON_POOLING &&
  !process.env.DATABASE_URL
) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");

    const keys = ["POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "DATABASE_URL"] as const;
    for (const key of keys) {
      const match = content.match(new RegExp(`^${key}="?([^"\n]+)"?`, "m"));
      if (match) {
        process.env[key] = match[1];
      }
    }

    try {
      process.env.POSTGRES_URL = resolvePostgresConnectionString(process.env);
    } catch {
      // se valida después cuando se intente usar la conexión
    }
  }
}

export const BASE_URL = "http://localhost:3000";

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface ScenarioData {
  tournamentId: string;
  futureMatchId: string;
  pastMatchId: string;
  homeTeamId: string;
  awayTeamId: string;
}

export function uniqueSuffix(prefix = "t"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createUserInDb(
  name: string,
  email: string,
  password = "Test1234!"
): Promise<TestUser> {
  const db = getDb();
  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({ id, email, name });
  await db.insert(accounts).values({
    userId: id,
    type: "credentials",
    provider: "credentials",
    providerAccountId: id,
    access_token: hashedPassword,
  });
  await db.insert(profiles).values({ id, displayName: name, role: "user" });

  return { id, name, email, password };
}

export async function createTournamentScenario(label: string): Promise<ScenarioData> {
  const db = getDb();
  const tournamentId = crypto.randomUUID();
  const homeTeamId = crypto.randomUUID();
  const awayTeamId = crypto.randomUUID();
  const thirdTeamId = crypto.randomUUID();
  const fourthTeamId = crypto.randomUUID();
  const futureMatchId = crypto.randomUUID();
  const pastMatchId = crypto.randomUUID();
  const now = Date.now();

  await db.insert(tournaments).values({
    id: tournamentId,
    name: `Test Tournament ${label}`,
    slug: `test-tournament-${label}`,
    year: 2099,
    status: "active",
    startsAt: new Date(now - 24 * 60 * 60 * 1000),
    endsAt: new Date(now + 30 * 24 * 60 * 60 * 1000),
  });

  await db.insert(teams).values([
    { id: homeTeamId, tournamentId, name: `Local ${label}`, shortName: `L${label.slice(-2)}`, code: `L${label.slice(-3)}` },
    { id: awayTeamId, tournamentId, name: `Visita ${label}`, shortName: `V${label.slice(-2)}`, code: `V${label.slice(-3)}` },
    { id: thirdTeamId, tournamentId, name: `Tercero ${label}`, shortName: `T${label.slice(-2)}`, code: `T${label.slice(-3)}` },
    { id: fourthTeamId, tournamentId, name: `Cuarto ${label}`, shortName: `C${label.slice(-2)}`, code: `C${label.slice(-3)}` },
  ]);

  await db.insert(matches).values([
    {
      id: futureMatchId,
      tournamentId,
      stage: "group",
      roundLabel: "Fecha 1",
      matchNumber: 1,
      homeTeamId,
      awayTeamId,
      startsAt: new Date(now + 5 * 24 * 60 * 60 * 1000),
      status: "scheduled",
      venue: "Cancha Test",
    },
    {
      id: pastMatchId,
      tournamentId,
      stage: "group",
      roundLabel: "Fecha 0",
      matchNumber: 2,
      homeTeamId: thirdTeamId,
      awayTeamId: fourthTeamId,
      startsAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      status: "finished",
      venue: "Cancha Test 2",
    },
  ]);

  return { tournamentId, futureMatchId, pastMatchId, homeTeamId, awayTeamId };
}

export async function createGroupInDb(params: {
  ownerUserId: string;
  tournamentId: string;
  name?: string;
  inviteCode?: string;
}) {
  const db = getDb();
  const id = crypto.randomUUID();
  const name = params.name ?? `Grupo ${id.slice(0, 6)}`;
  const inviteCode = params.inviteCode ?? crypto.randomUUID().slice(0, 8).toUpperCase();

  await db.insert(groups).values({
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    description: null,
    inviteCode,
    ownerUserId: params.ownerUserId,
    tournamentId: params.tournamentId,
    isActive: true,
  });

  await db.insert(groupMembers).values({
    id: crypto.randomUUID(),
    groupId: id,
    userId: params.ownerUserId,
    role: "admin",
    status: "active",
  });

  await db.insert(groupScoringRules).values({
    id: crypto.randomUUID(),
    groupId: id,
    exactScorePoints: 5,
    outcomePoints: 3,
    oneTeamScorePoints: 1,
    bonusPoints: 0,
    updatedBy: params.ownerUserId,
  });

  return { id, inviteCode, name };
}

export async function addMember(groupId: string, userId: string, role = "member") {
  const db = getDb();
  await db.insert(groupMembers).values({
    id: crypto.randomUUID(),
    groupId,
    userId,
    role,
    status: "active",
  });
}

export async function createPrediction(params: {
  groupId: string;
  matchId: string;
  userId: string;
  home: number;
  away: number;
  isLocked?: boolean;
}) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(predictions).values({
    id,
    groupId: params.groupId,
    matchId: params.matchId,
    userId: params.userId,
    predictedHomeScore: params.home,
    predictedAwayScore: params.away,
    isLocked: params.isLocked ?? false,
  });
  return id;
}

export async function createOfficialResult(params: {
  matchId: string;
  loadedBy: string;
  home: number;
  away: number;
}) {
  const db = getDb();
  await db.insert(officialResults).values({
    id: crypto.randomUUID(),
    matchId: params.matchId,
    loadedBy: params.loadedBy,
    homeScore: params.home,
    awayScore: params.away,
  });
}

export async function loginUser(page: Page, user: TestUser) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

export async function clearSession(context: BrowserContext) {
  await context.clearCookies();
}

export async function getPredictionForUser(groupId: string, matchId: string, userId: string) {
  const db = getDb();
  return db.query.predictions.findFirst({
    where: (p, { eq, and }) => and(eq(p.groupId, groupId), eq(p.matchId, matchId), eq(p.userId, userId)),
  });
}

export async function getScoreForPrediction(predictionId: string) {
  const db = getDb();
  return db.query.predictionScores.findFirst({
    where: (ps, { eq }) => eq(ps.predictionId, predictionId),
  });
}

export async function setMatchStart(matchId: string, startsAt: Date) {
  const db = getDb();
  await db.update(matches).set({ startsAt, updatedAt: new Date() }).where(eq(matches.id, matchId));
}

export async function removePredictionScores(groupId: string) {
  const db = getDb();
  const rows = await db.select({ id: predictionScores.id }).from(predictionScores).where(eq(predictionScores.groupId, groupId));
  for (const row of rows) {
    await db.delete(predictionScores).where(eq(predictionScores.id, row.id));
  }
}
