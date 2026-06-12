import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { matches, officialResults, groups } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";
import { logActivity } from "@/lib/activity";

interface CSVRow {
  matchNumber: number;
  stage: string;
  homeScore: number;
  awayScore: number;
}

// POST /api/results/bulk — carga masiva desde cuerpo JSON (array de resultados)
// Body: { groupId, results: [{ matchNumber, stage, homeScore, awayScore }] }
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { groupId, results } = body;

  if (!groupId || !Array.isArray(results) || results.length === 0) {
    return NextResponse.json(
      { error: "groupId y results[] requeridos" },
      { status: 400 }
    );
  }

  const _db = getDb();

  // Verificar ownership
  const group = await _db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, groupId),
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  if (group.ownerUserId !== session.user.id) {
    return NextResponse.json(
      { error: "Solo el dueño del grupo puede cargar resultados" },
      { status: 403 }
    );
  }

  // Buscar matches por matchNumber + stage + tournamentId
  let loaded = 0;
  let errors: string[] = [];

  for (const row of results) {
    const { matchNumber, stage, homeScore, awayScore } = row;

    if (
      matchNumber === undefined ||
      !stage ||
      homeScore === undefined ||
      awayScore === undefined
    ) {
      errors.push(`Fila inválida: ${JSON.stringify(row)}`);
      continue;
    }

    // Buscar el partido
    const match = await _db.query.matches.findFirst({
      where: (m, { eq, and: _and }) =>
        _and(
          eq(m.tournamentId, group.tournamentId),
          eq(m.stage, stage),
          eq(m.matchNumber, matchNumber)
        ),
    });

    if (!match) {
      errors.push(
        `Partido no encontrado: stage=${stage}, matchNumber=${matchNumber}`
      );
      continue;
    }

    // Upsert resultado
    const existing = await _db
      .select({ id: officialResults.id })
      .from(officialResults)
      .where(eq(officialResults.matchId, match.id))
      .limit(1);

    if (existing.length > 0) {
      await _db
        .update(officialResults)
        .set({ homeScore, awayScore, updatedAt: new Date() })
        .where(eq(officialResults.id, existing[0].id));
    } else {
      await _db.insert(officialResults).values({
        id: crypto.randomUUID(),
        matchId: match.id,
        homeScore,
        awayScore,
        loadedBy: session.user.id,
      });
    }

    loaded++;
  }

  if (loaded > 0) {
    logActivity({
      groupId,
      userId: session.user.id!,
      activityType: "result_loaded",
      message: `Cargó ${loaded} resultados vía CSV`,
    });
  }

  return NextResponse.json({
    success: true,
    loaded,
    errors: errors.length > 0 ? errors : undefined,
  });
}
