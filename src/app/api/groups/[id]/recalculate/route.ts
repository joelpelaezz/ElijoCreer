import { NextResponse } from "next/server";
import { getDb, getPool } from "@/lib/db";
import {
  predictions,
  officialResults,
  groupScoringRules,
  groups,
  predictionScores,
  matches,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and, inArray } from "drizzle-orm";
import { calculateScore } from "@/lib/scoring";
import crypto from "crypto";
import { logActivity } from "@/lib/activity";

// POST /api/groups/:id/recalculate
// Recalcula y persiste todos los puntajes del grupo
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: groupId } = await params;
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
      { error: "Solo el dueño del grupo puede recalcular" },
      { status: 403 }
    );
  }

  // Obtener reglas
  const rulesResult = await _db
    .select()
    .from(groupScoringRules)
    .where(eq(groupScoringRules.groupId, groupId))
    .limit(1);

  const rules = rulesResult[0] || {
    exactScorePoints: 5,
    outcomePoints: 3,
    oneTeamScorePoints: 0,
    bonusPoints: 0,
  };

  // Obtener partidos con resultado oficial
  const matchesWithResults = await _db
    .select({
      matchId: matches.id,
      matchNumber: matches.matchNumber,
    })
    .from(matches)
    .innerJoin(officialResults, eq(matches.id, officialResults.matchId))
    .where(eq(matches.tournamentId, group.tournamentId));

  if (matchesWithResults.length === 0) {
    return NextResponse.json({
      success: true,
      recalculated: 0,
      message: "No hay partidos con resultado para recalcular",
    });
  }

  const matchIds = matchesWithResults.map((m) => m.matchId);

  // Obtener todas las predicciones para esos partidos en este grupo
  const groupPredictions = await _db
    .select({
      id: predictions.id,
      matchId: predictions.matchId,
      userId: predictions.userId,
      predictedHomeScore: predictions.predictedHomeScore,
      predictedAwayScore: predictions.predictedAwayScore,
      isLate: predictions.isLate,
      latePenaltyApplied: predictions.latePenaltyApplied,
    })
    .from(predictions)
    .where(
      and(
        eq(predictions.groupId, groupId),
        inArray(predictions.matchId, matchIds)
      )
    );

  // Obtener resultados oficiales
  const allResults = await _db
    .select()
    .from(officialResults)
    .where(inArray(officialResults.matchId, matchIds));

  const resultMap = new Map(allResults.map((r) => [r.matchId, r]));

  // Obtener late penalty percent de config
  let latePenaltyPercent: number | undefined;
  try {
    const pool = getPool();
    const configResult = await pool.query(
      `SELECT value FROM app_config WHERE key = 'latePredictionPenaltyPercent' AND category = 'scoring'`
    );
    if (configResult.rows?.length > 0) {
      latePenaltyPercent = parseInt(configResult.rows[0].value, 10);
    }
  } catch {}

  // Recalcular y persistir
  let count = 0;

  for (const pred of groupPredictions) {
    const result = resultMap.get(pred.matchId);
    if (!result) continue;

    const penalty = (pred.isLate && pred.latePenaltyApplied) ? latePenaltyPercent : undefined;

    const score = calculateScore(
      pred.predictedHomeScore,
      pred.predictedAwayScore,
      result.homeScore,
      result.awayScore,
      {
        exactScorePoints: rules.exactScorePoints,
        outcomePoints: rules.outcomePoints,
        oneTeamScorePoints: rules.oneTeamScorePoints,
        bonusPoints: rules.bonusPoints,
      },
      penalty
    );

    // Upsert en predictionScores
    const existing = await _db
      .select({ id: predictionScores.id })
      .from(predictionScores)
      .where(eq(predictionScores.predictionId, pred.id))
      .limit(1);

    if (existing.length > 0) {
      await _db
        .update(predictionScores)
        .set({
          pointsAwarded: score.points,
          hitExactScore: score.hitExactScore,
          hitOutcome: score.hitOutcome,
          hitOneTeamScore: score.hitOneTeamScore,
          scoringReason: score.reason,
        })
        .where(eq(predictionScores.id, existing[0].id));
    } else {
      await _db.insert(predictionScores).values({
        id: crypto.randomUUID(),
        predictionId: pred.id,
        groupId,
        matchId: pred.matchId,
        userId: pred.userId,
        pointsAwarded: score.points,
        hitExactScore: score.hitExactScore,
        hitOutcome: score.hitOutcome,
        hitOneTeamScore: score.hitOneTeamScore,
        scoringReason: score.reason,
      });
    }

    count++;
  }

  logActivity({
    groupId,
    userId: session.user.id!,
    activityType: "scores_recalculated",
    message: `Recalculó ${count} puntajes (reglas: exacto=${rules.exactScorePoints}, ganador=${rules.outcomePoints})`,
  });

  return NextResponse.json({
    success: true,
    recalculated: count,
    message: `Se recalcularon ${count} pronósticos`,
  });
}
