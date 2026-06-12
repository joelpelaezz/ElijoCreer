import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groupMembers, predictions, groups, groupScoringRules, officialResults, profiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, inArray } from "drizzle-orm";

// GET /api/groups/:id/ranking
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: groupId } = await params;

  const _db = getDb();

  // Verificar membresía
  const member = await _db.query.groupMembers.findFirst({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, groupId), eq(gm.userId, session.user.id!)),
  });

  if (!member || member.status !== "active") {
    return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
  }

  // Obtener reglas del grupo
  const group = await _db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, groupId),
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  const rulesResult = await _db
    .select()
    .from(groupScoringRules)
    .where(eq(groupScoringRules.groupId, groupId))
    .limit(1);
  const rules = rulesResult[0];

  const exactScorePoints = rules?.exactScorePoints ?? 5;
  const outcomePoints = rules?.outcomePoints ?? 3;
  const oneTeamScorePoints = rules?.oneTeamScorePoints ?? 0;

  // Obtener miembros activos
  const members = await _db.query.groupMembers.findMany({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, groupId), eq(gm.status, "active")),
  });

  // Obtener predicciones con resultados oficiales
  // JOIN: predictions.matchId -> officialResults.matchId
  const predictionResults = await _db
    .select({
      userId: predictions.userId,
      predictedHomeScore: predictions.predictedHomeScore,
      predictedAwayScore: predictions.predictedAwayScore,
      actualHomeScore: officialResults.homeScore,
      actualAwayScore: officialResults.awayScore,
    })
    .from(predictions)
    .innerJoin(officialResults, eq(predictions.matchId, officialResults.matchId))
    .where(eq(predictions.groupId, groupId));

  // Armar ranking
  const userPoints: Record<
    string,
    {
      predictionsCount: number;
      exactScore: number;
      outcome: number;
      oneTeamScore: number;
      totalPoints: number;
    }
  > = {};

  members.forEach((m) => {
    userPoints[m.userId] = {
      predictionsCount: 0,
      exactScore: 0,
      outcome: 0,
      oneTeamScore: 0,
      totalPoints: 0,
    };
  });

  predictionResults.forEach((pr) => {
    const up = userPoints[pr.userId];
    if (!up) return;

    up.predictionsCount++;

    const ph = pr.predictedHomeScore ?? 0;
    const pa = pr.predictedAwayScore ?? 0;
    const ah = pr.actualHomeScore ?? 0;
    const aa = pr.actualAwayScore ?? 0;

    // Exact score: both scores match
    if (ph === ah && pa === aa) {
      up.exactScore++;
      up.totalPoints += exactScorePoints;
    }
    // Outcome: correct winner/draw
    else if (Math.sign(ph - pa) === Math.sign(ah - aa)) {
      up.outcome++;
      up.totalPoints += outcomePoints;
    }
    // One team score matches
    else if (ph === ah || pa === aa) {
      up.oneTeamScore++;
      up.totalPoints += oneTeamScorePoints;
    }
  });

  // Enriquecer con displayName
  const userIds = Object.keys(userPoints);
  let userProfiles: { id: string; displayName: string | null }[] = [];
  if (userIds.length > 0) {
    userProfiles = await _db
      .select({ id: profiles.id, displayName: profiles.displayName })
      .from(profiles)
      .where(inArray(profiles.id, userIds));
  }

  const profileMap = new Map(userProfiles.map((p) => [p.id, p.displayName || ""]));

  const ranking = Object.entries(userPoints).map(([userId, stats]) => ({
    userId,
    userName: profileMap.get(userId) || "",
    ...stats,
  }));

  ranking.sort(
    (a, b) => b.totalPoints - a.totalPoints || b.predictionsCount - a.predictionsCount
  );

  return NextResponse.json(ranking);
}
