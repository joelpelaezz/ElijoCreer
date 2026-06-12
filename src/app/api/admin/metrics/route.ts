import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";

export async function GET(request: Request) {
  const pool = getPool();
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    // Get various metrics
    const [
      usersCount,
      activeUsers,
      groupsCount,
      predictionsCount,
      matchesWithResults,
      tournaments,
    ] = await Promise.all([
      // Total users
      pool.query('SELECT count(*)::int as c FROM "user"'),
      // Active users (last 7 days)
      pool.query(`
        SELECT count(DISTINCT user_id)::int as c FROM predictions 
        WHERE created_at > NOW() - INTERVAL '7 days'
      `),
      // Total groups
      pool.query('SELECT count(*)::int as c FROM groups'),
      // Total predictions
      pool.query('SELECT count(*)::int as c FROM predictions'),
      // Matches with results
      pool.query(`
        SELECT count(*)::int as c FROM matches 
        WHERE home_score IS NOT NULL AND away_score IS NOT NULL
      `),
      // Active tournaments
      pool.query('SELECT count(*)::int as c FROM tournaments WHERE status = $1', ['active']),
    ]);

    // Daily signups (last 30 days)
    const dailySignups = await pool.query(`
      SELECT DATE(created_at) as date, count(*)::int as count
      FROM "user"
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Daily predictions (last 30 days)
    const dailyPredictions = await pool.query(`
      SELECT DATE(created_at) as date, count(*)::int as count
      FROM predictions
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Top groups by members
    const topGroups = await pool.query(`
      SELECT g.name, count(gm.user_id)::int as members, count(p.id)::int as predictions
      FROM groups g
      LEFT JOIN group_members gm ON gm.group_id = g.id
      LEFT JOIN predictions p ON p.group_id = g.id
      GROUP BY g.id
      ORDER BY members DESC
      LIMIT 10
    `);

    // Top predictors (most predictions)
    const topPredictors = await pool.query(`
      SELECT p.display_name || ' (' || substr(p.id::text, 1, 6) || ')' as name, 
             count(pr.id)::int as predictions
      FROM predictions pr
      LEFT JOIN profiles p ON p.id = pr.user_id
      GROUP BY pr.user_id, p.display_name
      ORDER BY predictions DESC
      LIMIT 10
    `);

    return NextResponse.json({
      users: {
        total: usersCount.rows[0]?.c || 0,
        active7d: activeUsers.rows[0]?.c || 0,
      },
      groups: {
        total: groupsCount.rows[0]?.c || 0,
      },
      predictions: {
        total: predictionsCount.rows[0]?.c || 0,
      },
      matches: {
        withResults: matchesWithResults.rows[0]?.c || 0,
      },
      tournaments: {
        active: tournaments.rows[0]?.c || 0,
      },
      charts: {
        dailySignups: dailySignups.rows,
        dailyPredictions: dailyPredictions.rows,
        topGroups: topGroups.rows,
        topPredictors: topPredictors.rows,
      },
    });
  } catch (error: any) {
    console.error("Metrics error:", error);
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}
