import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { predictions, groupMembers, profiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and } from "drizzle-orm";

// GET /api/predictions/compare?groupId=X&matchId=Y
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const matchId = searchParams.get("matchId");

  if (!groupId || !matchId) {
    return NextResponse.json(
      { error: "groupId y matchId requeridos" },
      { status: 400 }
    );
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

  // Traer todas las predicciones de este match en el grupo, con nombres
  const allPredictions = await _db
    .select({
      userId: predictions.userId,
      predictedHomeScore: predictions.predictedHomeScore,
      predictedAwayScore: predictions.predictedAwayScore,
      isLocked: predictions.isLocked,
      displayName: profiles.displayName,
    })
    .from(predictions)
    .leftJoin(profiles, eq(predictions.userId, profiles.id))
    .where(
      and(eq(predictions.groupId, groupId), eq(predictions.matchId, matchId))
    );

  return NextResponse.json(allPredictions);
}
