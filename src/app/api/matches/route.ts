import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { matches } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";

// GET /api/matches?tournamentId=X&stage=group
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get("tournamentId");
  const stage = searchParams.get("stage");

  const _db = getDb();

  // Traer todos los partidos con raw SQL queries
  const allMatches = await _db.query.matches.findMany({
    orderBy: (m, { asc }) => [asc(m.startsAt)],
  });

  // Filter in memory (these are lookup queries, not datasets)
  const filtered = allMatches.filter((m) => {
    if (tournamentId && m.tournamentId !== tournamentId) return false;
    if (stage && m.stage !== stage) return false;
    return true;
  });

  // Enrich with team names in one query
  const teamIds = new Set<string>();
  filtered.forEach((m) => {
    teamIds.add(m.homeTeamId);
    teamIds.add(m.awayTeamId);
  });

  const allTeams = await _db.query.teams.findMany();

  const teamMap = new Map(allTeams.map((t) => [t.id, t]));

  const enriched = filtered.map((m) => {
    const homeTeam = teamMap.get(m.homeTeamId);
    const awayTeam = teamMap.get(m.awayTeamId);
    return {
      id: m.id,
      stage: m.stage,
      matchNumber: m.matchNumber,
      startsAt: m.startsAt,
      status: m.status,
      venue: m.venue,
      homeTeam: homeTeam
        ? { id: homeTeam.id, name: homeTeam.name, shortName: homeTeam.shortName, code: homeTeam.code, flagIcon: homeTeam.flagIcon }
        : null,
      awayTeam: awayTeam
        ? { id: awayTeam.id, name: awayTeam.name, shortName: awayTeam.shortName, code: awayTeam.code, flagIcon: awayTeam.flagIcon }
        : null,
    };
  });

  return NextResponse.json(enriched);
}
