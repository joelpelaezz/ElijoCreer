/**
 * Seed de partidos — Copa Mundial de la FIFA 2026
 * 72 fase grupos + 32 eliminatorias = 104 partidos
 *
 * Uso: POSTGRES_URL="..." npx tsx scripts/seed-matches.ts
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });
const db = drizzle(pool, { schema });
const FIXTURE_PATH = path.resolve(process.cwd(), "fixture/worldcup-2026.json");

type FixtureMatch = {
  round: string;
  num?: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group?: string;
  ground: string;
};

type FixtureData = {
  matches: FixtureMatch[];
};

function readFixture(): FixtureData {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

function parseStartsAt(date: string, timeWithOffset: string) {
  const [hhmm, utcRaw] = timeWithOffset.split(" ");
  const [hh, mm] = hhmm.split(":");
  const offset = utcRaw.replace("UTC", "");
  const sign = offset.startsWith("-") ? "-" : "+";
  const rawHours = offset.replace("+", "").replace("-", "");
  const paddedHours = rawHours.padStart(2, "0");
  return new Date(`${date}T${hh}:${mm}:00${sign}${paddedHours}:00`);
}

function stageFromRound(round: string) {
  if (round.startsWith("Matchday")) return "group";
  if (round === "Round of 32") return "round_of_32";
  if (round === "Round of 16") return "round_of_16";
  if (round === "Quarter-final") return "quarter_final";
  if (round === "Semi-final") return "semi_final";
  if (round === "Match for third place") return "third_place";
  if (round === "Final") return "final";
  return "group";
}

async function main() {
  console.log("⚽ Sembrando partidos del Mundial 2026...\n");

  const fixture = readFixture();

  const tournament = await db.query.tournaments.findFirst({
    where: (t, { eq }) => eq(t.slug, "mundial-2026"),
  });

  if (!tournament) {
    console.error("❌ Torneo no encontrado. Corré scripts/seed.ts primero.");
    process.exit(1);
  }

  const teams = await db
    .select({ id: schema.teams.id, name: schema.teams.name })
    .from(schema.teams)
    .where(eq(schema.teams.tournamentId, tournament.id));

  const teamIds = new Map(teams.map((team) => [team.name, team.id]));

  await db.delete(schema.matches).where(eq(schema.matches.tournamentId, tournament.id));

  let sequence = 1;
  for (const match of fixture.matches) {
    const homeTeamId = teamIds.get(match.team1);
    const awayTeamId = teamIds.get(match.team2);

    if (!homeTeamId || !awayTeamId) {
      throw new Error(`Falta teamId para ${match.team1} vs ${match.team2}`);
    }

    await db.insert(schema.matches).values({
      id: crypto.randomUUID(),
      tournamentId: tournament.id,
      stage: stageFromRound(match.round),
      roundLabel: match.round,
      matchNumber: match.num ?? sequence,
      homeTeamId,
      awayTeamId,
      startsAt: parseStartsAt(match.date, match.time),
      venue: match.ground,
      status: "scheduled",
    });

    sequence++;
  }

  console.log(`✅ Total partidos cargados: ${fixture.matches.length}`);

  await pool.end();
}

main().catch(async (e) => {
  console.error("❌ Error:", e);
  await pool.end();
  process.exit(1);
});
