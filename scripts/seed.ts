/**
 * Seed data — Copa Mundial de la FIFA 2026
 *
 * Uso: POSTGRES_URL="..." npx tsx scripts/seed.ts
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
const db = drizzle(pool, { schema });

const FLAG_BASE_URL = "https://flagicons.lipis.dev/flags/4x3";
const FIXTURE_PATH = path.resolve(process.cwd(), "fixture/worldcup-2026.json");
const TEAMS_PATH = path.resolve(process.cwd(), "fixture/worldcup.teams.json");

const TEAM_META: Record<string, { code: string; iso?: string }> = {
  Algeria: { code: "ALG", iso: "dz" },
  Argentina: { code: "ARG", iso: "ar" },
  Australia: { code: "AUS", iso: "au" },
  Austria: { code: "AUT", iso: "at" },
  Belgium: { code: "BEL", iso: "be" },
  "Bosnia & Herzegovina": { code: "BIH", iso: "ba" },
  Brazil: { code: "BRA", iso: "br" },
  Canada: { code: "CAN", iso: "ca" },
  "Cape Verde": { code: "CPV", iso: "cv" },
  Colombia: { code: "COL", iso: "co" },
  Croatia: { code: "CRO", iso: "hr" },
  "Curaçao": { code: "CUW", iso: "cw" },
  "Czech Republic": { code: "CZE", iso: "cz" },
  "DR Congo": { code: "COD", iso: "cd" },
  Ecuador: { code: "ECU", iso: "ec" },
  Egypt: { code: "EGY", iso: "eg" },
  England: { code: "ENG", iso: "gb-eng" },
  France: { code: "FRA", iso: "fr" },
  Germany: { code: "GER", iso: "de" },
  Ghana: { code: "GHA", iso: "gh" },
  Haiti: { code: "HAI", iso: "ht" },
  Iran: { code: "IRN", iso: "ir" },
  Iraq: { code: "IRQ", iso: "iq" },
  "Ivory Coast": { code: "CIV", iso: "ci" },
  Japan: { code: "JPN", iso: "jp" },
  Jordan: { code: "JOR", iso: "jo" },
  Mexico: { code: "MEX", iso: "mx" },
  Morocco: { code: "MAR", iso: "ma" },
  Netherlands: { code: "NED", iso: "nl" },
  "New Zealand": { code: "NZL", iso: "nz" },
  Norway: { code: "NOR", iso: "no" },
  Panama: { code: "PAN", iso: "pa" },
  Paraguay: { code: "PAR", iso: "py" },
  Portugal: { code: "POR", iso: "pt" },
  Qatar: { code: "QAT", iso: "qa" },
  "Saudi Arabia": { code: "KSA", iso: "sa" },
  Scotland: { code: "SCO", iso: "gb-sct" },
  Senegal: { code: "SEN", iso: "sn" },
  "South Africa": { code: "RSA", iso: "za" },
  "South Korea": { code: "KOR", iso: "kr" },
  Spain: { code: "ESP", iso: "es" },
  Sweden: { code: "SWE", iso: "se" },
  Switzerland: { code: "SUI", iso: "ch" },
  Tunisia: { code: "TUN", iso: "tn" },
  Turkey: { code: "TUR", iso: "tr" },
  USA: { code: "USA", iso: "us" },
  Uruguay: { code: "URU", iso: "uy" },
  Uzbekistan: { code: "UZB", iso: "uz" },
};

type FixtureMatch = {
  team1: string;
  team2: string;
};

type FixtureData = {
  matches: FixtureMatch[];
};

type TeamCatalogEntry = {
  name: string;
  name_normalised?: string;
  flag_icon?: string;
  fifa_code?: string;
};

function readFixture(): FixtureData {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

function readTeamCatalog(): TeamCatalogEntry[] {
  return JSON.parse(fs.readFileSync(TEAMS_PATH, "utf8"));
}

async function main() {
  console.log("🌱 Sembrando datos del Mundial 2026...\n");

  const fixture = readFixture();
  const teamCatalog = readTeamCatalog();
  const teamCatalogMap = new Map<string, TeamCatalogEntry>();

  for (const team of teamCatalog) {
    teamCatalogMap.set(team.name, team);
    if (team.name_normalised) {
      teamCatalogMap.set(team.name_normalised, team);
    }
  }

  let tournament = await db.query.tournaments.findFirst({
    where: (t, { eq }) => eq(t.slug, "mundial-2026"),
  });

  const tournamentId = tournament?.id ?? crypto.randomUUID();

  await db
    .insert(schema.tournaments)
    .values({
      id: tournamentId,
      name: "Copa Mundial de la FIFA 2026",
      slug: "mundial-2026",
      year: 2026,
      status: "active",
      startsAt: new Date("2026-06-11T00:00:00Z"),
      endsAt: new Date("2026-07-19T23:59:59Z"),
    })
    .onConflictDoNothing();

  const existingTournament = tournament ?? { id: tournamentId };
  console.log("✅ Torneo listo: Mundial 2026");

  const teamNames = new Set<string>();
  for (const match of fixture.matches) {
    teamNames.add(match.team1);
    teamNames.add(match.team2);
  }

  const existingTeams = await db
    .select({ id: schema.teams.id, name: schema.teams.name })
    .from(schema.teams)
    .where(eq(schema.teams.tournamentId, tournamentId));

  const existingByName = new Map(existingTeams.map((team) => [team.name, team]));

  let inserted = 0;
  let updated = 0;
  for (const name of [...teamNames].sort()) {
    const meta = TEAM_META[name];
    const catalog = teamCatalogMap.get(name);
    const code = meta?.code ?? name;
    const crestUrl = meta?.iso ? `${FLAG_BASE_URL}/${meta.iso}.svg` : null;
    const flagIcon = catalog?.flag_icon ?? null;

    const existing = existingByName.get(name);

    if (existing) {
      await db
        .update(schema.teams)
        .set({
          shortName: code,
          code,
          flagIcon,
          crestUrl,
        })
        .where(eq(schema.teams.id, existing.id));
      updated++;
      continue;
    }

    await db.insert(schema.teams).values({
      id: crypto.randomUUID(),
      tournamentId,
      name,
      shortName: code,
      code,
      flagIcon,
      crestUrl,
    });
    inserted++;
  }

  console.log(`✅ Equipos insertados: ${inserted}`);
  console.log(`✅ Equipos actualizados: ${updated}`);
  console.log(`✅ Equipos totales esperados del torneo: ${teamNames.size}`);

  await pool.end();
}

main().catch(async (e) => {
  console.error("❌ Error en seed:", e);
  await pool.end();
  process.exit(1);
});
