import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { predictionHistory, matches, groupMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and, desc } from "drizzle-orm";

// GET /api/predictions/history?groupId=X
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

  // Verificar membresía
  const member = await _db.query.groupMembers.findFirst({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, groupId), eq(gm.userId, session.user.id!)),
  });

  if (!member || member.status !== "active") {
    return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
  }

  // Traer historial del usuario en este grupo, ordenado descendente
  const history = await _db
    .select({
      id: predictionHistory.id,
      previousHomeScore: predictionHistory.previousHomeScore,
      previousAwayScore: predictionHistory.previousAwayScore,
      newHomeScore: predictionHistory.newHomeScore,
      newAwayScore: predictionHistory.newAwayScore,
      createdAt: predictionHistory.createdAt,
      match: {
        matchNumber: matches.matchNumber,
        stage: matches.stage,
      },
    })
    .from(predictionHistory)
    .innerJoin(matches, eq(predictionHistory.matchId, matches.id))
    .where(
      and(
        eq(predictionHistory.groupId, groupId),
        eq(predictionHistory.userId, session.user.id!)
      )
    )
    .orderBy(desc(predictionHistory.createdAt))
    .limit(50);

  return NextResponse.json(history);
}
