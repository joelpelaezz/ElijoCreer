import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { predictions, officialResults, matches, groupMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and, inArray, sql, count } from "drizzle-orm";

// GET /api/stats — estadísticas del usuario logueado
// GET /api/stats?userId=X — estadísticas de otro usuario
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || session.user.id;

  const _db = getDb();

  // 1. Total de predicciones
  const [predCountResult] = await _db
    .select({ value: count() })
    .from(predictions)
    .where(eq(predictions.userId, userId));
  const totalPredictions = Number(predCountResult?.value || 0);

  // 2. Predicciones con resultado (para calcular aciertos)
  const scoredPredictions = await _db
    .select({
      predictedHomeScore: predictions.predictedHomeScore,
      predictedAwayScore: predictions.predictedAwayScore,
      actualHomeScore: officialResults.homeScore,
      actualAwayScore: officialResults.awayScore,
      stage: matches.stage,
    })
    .from(predictions)
    .innerJoin(officialResults, eq(predictions.matchId, officialResults.matchId))
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .where(eq(predictions.userId, userId));

  // 3. Grupos donde participa
  const [groupsResult] = await _db
    .select({ value: count() })
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.status, "active")));
  const groupsCount = Number(groupsResult?.value || 0);

  // Calcular stats
  const stats = {
    totalPredictions,
    groupsCount,
    matchesWithResult: scoredPredictions.length,
    exactScore: 0,
    outcome: 0,
    oneTeamScore: 0,
    noHit: 0,
    totalPoints: 0,
  };

  scoredPredictions.forEach((sp) => {
    const ph = sp.predictedHomeScore ?? 0;
    const pa = sp.predictedAwayScore ?? 0;
    const ah = sp.actualHomeScore ?? 0;
    const aa = sp.actualAwayScore ?? 0;

    if (ph === ah && pa === aa) {
      stats.exactScore++;
      stats.totalPoints += 5;
    } else if (Math.sign(ph - pa) === Math.sign(ah - aa)) {
      stats.outcome++;
      stats.totalPoints += 3;
    } else if (ph === ah || pa === aa) {
      stats.oneTeamScore++;
      stats.totalPoints += 1;
    } else {
      stats.noHit++;
    }
  });

  const hitRate =
    stats.matchesWithResult > 0
      ? Math.round(
          ((stats.exactScore + stats.outcome + stats.oneTeamScore) /
            stats.matchesWithResult) *
            100
        )
      : 0;

  // Predicciones por fase
  const stageBreakdown: Record<string, number> = {};
  scoredPredictions.forEach((sp) => {
    const stage = sp.stage || "unknown";
    stageBreakdown[stage] = (stageBreakdown[stage] || 0) + 1;
  });

  return NextResponse.json({
    ...stats,
    hitRate,
    stageBreakdown,
  });
}
