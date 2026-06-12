import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  predictions,
  officialResults,
  groupScoringRules,
  groupMembers,
  matches,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and } from "drizzle-orm";
import { calculateScore } from "@/lib/scoring";

// GET /api/predictions/score?groupId=X&matchId=Y
// Devuelve el detalle de puntaje del usuario autenticado para un partido en un grupo
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

  // Obtener reglas del grupo
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

  // Obtener resultado oficial
  const result = await _db.query.officialResults.findFirst({
    where: (r, { eq }) => eq(r.matchId, matchId),
  });

  if (!result) {
    return NextResponse.json({
      hasResult: false,
      message: "El partido aún no tiene resultado oficial",
    });
  }

  // Obtener predicción del usuario
  const pred = await _db.query.predictions.findFirst({
    where: (p, { eq, and: _and }) =>
      _and(
        eq(p.groupId, groupId),
        eq(p.matchId, matchId),
        eq(p.userId, session.user.id!)
      ),
  });

  if (!pred) {
    return NextResponse.json({
      hasResult: true,
      hasPrediction: false,
      actualHomeScore: result.homeScore,
      actualAwayScore: result.awayScore,
      message: "No cargaste pronóstico para este partido",
    });
  }

  // Calcular score
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
    }
  );

  return NextResponse.json({
    hasResult: true,
    hasPrediction: true,
    predictedHomeScore: pred.predictedHomeScore,
    predictedAwayScore: pred.predictedAwayScore,
    actualHomeScore: result.homeScore,
    actualAwayScore: result.awayScore,
    score,
    rules: {
      exactScorePoints: rules.exactScorePoints,
      outcomePoints: rules.outcomePoints,
      oneTeamScorePoints: rules.oneTeamScorePoints,
      bonusPoints: rules.bonusPoints,
    },
  });
}
