import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groups, matches, teams, officialResults } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";
import { logActivity } from "@/lib/activity";

// GET /api/results?groupId=X
// Devuelve partidos del torneo del grupo, con resultado si existe
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId requerido" }, { status: 400 });
  }

  const _db = getDb();

  // Verificar que sea owner del grupo
  const group = await _db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, groupId),
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  if (group.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Solo el dueño del grupo puede ver resultados" }, { status: 403 });
  }

  // Traer partidos del torneo con resultados
  const allMatches = await _db
    .select({
      id: matches.id,
      stage: matches.stage,
      matchNumber: matches.matchNumber,
      startsAt: matches.startsAt,
      status: matches.status,
      venue: matches.venue,
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
      officialHomeScore: officialResults.homeScore,
      officialAwayScore: officialResults.awayScore,
      resultId: officialResults.id,
    })
    .from(matches)
    .leftJoin(officialResults, eq(matches.id, officialResults.matchId))
    .where(eq(matches.tournamentId, group.tournamentId))
    .orderBy(asc(matches.startsAt));

  // Enriquecer con team names
  const allTeams = await _db.query.teams.findMany();
  const teamMap = new Map(allTeams.map((t) => [t.id, t]));

  const enriched = allMatches.map((m) => ({
    id: m.id,
    stage: m.stage,
    matchNumber: m.matchNumber,
    startsAt: m.startsAt,
    status: m.status,
    venue: m.venue,
    homeTeam: teamMap.get(m.homeTeamId) || null,
    awayTeam: teamMap.get(m.awayTeamId) || null,
    officialHomeScore: m.officialHomeScore,
    officialAwayScore: m.officialAwayScore,
    hasResult: !!m.resultId,
  }));

  return NextResponse.json(enriched);
}

// POST /api/results — crear o actualizar resultado
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const _db = getDb();
  const { groupId, matchId, homeScore, awayScore } = await request.json();

  if (!groupId || !matchId || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Verificar ownership
  const group = await _db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, groupId),
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  if (group.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Solo el dueño del grupo puede cargar resultados" }, { status: 403 });
  }

  // Upsert resultado
  const existing = await _db
    .select({ id: officialResults.id })
    .from(officialResults)
    .where(eq(officialResults.matchId, matchId))
    .limit(1);

  if (existing.length > 0) {
    await _db
      .update(officialResults)
      .set({
        homeScore,
        awayScore,
        updatedAt: new Date(),
      })
      .where(eq(officialResults.id, existing[0].id));
  } else {
    await _db.insert(officialResults).values({
      id: crypto.randomUUID(),
      matchId,
      homeScore,
      awayScore,
      loadedBy: session.user.id,
    });
  }

  logActivity({
    groupId,
    userId: session.user.id!,
    activityType: "result_loaded",
    referenceId: matchId,
    message: `Cargó resultado: ${homeScore}-${awayScore}`,
  });

  return NextResponse.json({ success: true });
}
