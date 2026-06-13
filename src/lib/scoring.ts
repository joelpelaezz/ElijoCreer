/**
 * Scoring utility compartido entre ranking y detalle por partido.
 * El cálculo se hace en runtime y también se persiste en prediction_scores
 * para recálculos controlados y trazabilidad histórica.
 */

export interface ScoreResult {
  points: number;
  hitExactScore: boolean;
  hitOutcome: boolean;
  hitOneTeamScore: boolean;
  reason: string;
}

export function calculateScore(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  rules: {
    exactScorePoints: number;
    outcomePoints: number;
    oneTeamScorePoints: number;
    bonusPoints: number;
  },
  latePenaltyPercent?: number
): ScoreResult {
  const ph = predictedHome;
  const pa = predictedAway;
  const ah = actualHome ?? 0;
  const aa = actualAway ?? 0;

  // Sin pronóstico
  if (ph === undefined || pa === undefined) {
    return {
      points: 0,
      hitExactScore: false,
      hitOutcome: false,
      hitOneTeamScore: false,
      reason: "Sin pronóstico",
    };
  }

  let points: number;
  let hitExactScore = false;
  let hitOutcome = false;
  let hitOneTeamScore = false;
  let reason: string;

  // Resultado exacto
  if (ph === ah && pa === aa) {
    points = rules.exactScorePoints + rules.bonusPoints;
    hitExactScore = true;
    hitOutcome = true;
    hitOneTeamScore = true;
    reason = `Resultado exacto: ${ph}-${pa}`;
  } else if (ph === ah || pa === aa) {
    // Acertó score de un equipo (prioridad media)
    points = rules.oneTeamScorePoints;
    hitExactScore = false;
    hitOutcome = false;
    hitOneTeamScore = true;
    reason = `Acertó el score de ${ph === ah ? "local" : "visitante"}`;
  } else {
    // Acertó ganador o empate (prioridad baja)
    const predSign = Math.sign(ph - pa);
    const actualSign = Math.sign(ah - aa);
    if (predSign === actualSign) {
      points = rules.outcomePoints;
      hitExactScore = false;
      hitOutcome = true;
      hitOneTeamScore = false;
      reason = `Acertó el resultado: ${predSign === 0 ? "Empate" : predSign > 0 ? "Ganador Local" : "Ganador Visitante"}`;
    } else {
      // Sin puntos
      points = 0;
      hitExactScore = false;
      hitOutcome = false;
      hitOneTeamScore = false;
      reason = "No acertó";
    }
  }

  // Aplicar penalización por pronóstico tardío
  if (latePenaltyPercent && latePenaltyPercent > 0 && points > 0) {
    const penalty = Math.floor(points * latePenaltyPercent / 100);
    points = points - penalty;
    reason += ` (tardío -${latePenaltyPercent}%)`;
  }

  return { points, hitExactScore, hitOutcome, hitOneTeamScore, reason };
}
