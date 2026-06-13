import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Get user stats
    const [
      totalPredictions,
      groups,
      achievements,
      firstPrediction,
      lastPrediction,
    ] = await Promise.all([
      pool.query('SELECT count(*)::int as c FROM predictions WHERE user_id = $1', [userId]),
      pool.query('SELECT count(*)::int as c FROM group_members WHERE user_id = $1', [userId]),
      pool.query('SELECT count(*)::int as c FROM user_achievements WHERE user_id = $1', [userId]),
      pool.query('SELECT created_at FROM predictions WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1', [userId]),
      pool.query('SELECT created_at FROM predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]),
    ]);

    // Get predictions over time
    const predictionsOverTime = await pool.query(`
      SELECT DATE(created_at) as date, count(*)::int as count
      FROM predictions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [userId]);

    // Get performance by tournament
    const byTournament = await pool.query(`
      SELECT t.name as tournament, 
             count(p.id)::int as predictions,
             sum(CASE WHEN p.predicted_home_score = r.home_score AND p.predicted_away_score = r.away_score THEN 1 ELSE 0 END)::int as exact,
             sum(CASE WHEN (p.predicted_home_score > p.predicted_away_score AND r.home_score > r.away_score)
                       OR (p.predicted_home_score < p.predicted_away_score AND r.home_score < r.away_score)
                       OR (p.predicted_home_score = p.predicted_away_score AND r.home_score = r.away_score) THEN 1 ELSE 0 END)::int as outcome
      FROM predictions p
      JOIN groups g ON g.id = p.group_id
      JOIN tournaments t ON t.id = g.tournament_id
      JOIN matches m ON m.id = p.match_id
      LEFT JOIN official_results r ON r.match_id = m.id
      WHERE p.user_id = $1
      GROUP BY t.id, t.name
    `, [userId]);

    // Get recent achievements
    const recentAchievements = await pool.query(`
      SELECT * FROM user_achievements 
      WHERE user_id = $1
      ORDER BY earned_at DESC
      LIMIT 5
    `, [userId]);

    return NextResponse.json({
      stats: {
        totalPredictions: totalPredictions.rows[0]?.c || 0,
        groups: groups.rows[0]?.c || 0,
        achievements: achievements.rows[0]?.c || 0,
        memberSince: firstPrediction.rows[0]?.created_at,
        lastPrediction: lastPrediction.rows[0]?.created_at,
      },
      charts: {
        predictionsOverTime: predictionsOverTime.rows,
        byTournament: byTournament.rows,
      },
      achievements: recentAchievements.rows,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Error al obtener analytics" }, { status: 500 });
  }
}