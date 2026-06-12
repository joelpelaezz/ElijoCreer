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

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId requerido" }, { status: 400 });
  }

  try {
    // Get group info
    const groupResult = await pool.query(`
      SELECT g.id, g.name, g.description, t.name as tournament
      FROM groups g
      LEFT JOIN tournaments t ON t.id = g.tournament_id
      WHERE g.id = $1
    `, [groupId]);
    
    if (groupResult.rows.length === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }
    
    const group = groupResult.rows[0];

    // Get all predictions for this group
    const predictionsResult = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.match_id,
        p.predicted_home_score,
        p.predicted_away_score,
        p.is_locked,
        p.created_at,
        p.updated_at,
        m.home_score as actual_home,
        m.away_score as actual_away,
        ht.name as home_team,
        at.name as away_team,
        m.starts_at
      FROM predictions p
      LEFT JOIN matches m ON m.id = p.match_id
      LEFT JOIN teams ht ON ht.id = m.home_team_id
      LEFT JOIN teams at ON at.id = m.away_team_id
      WHERE p.group_id = $1
      ORDER BY m.starts_at, p.user_id
    `, [groupId]);

    // Get members
    const membersResult = await pool.query(`
      SELECT gm.user_id, gm.role, gm.joined_at, p.display_name
      FROM group_members gm
      LEFT JOIN profiles p ON p.id = gm.user_id
      WHERE gm.group_id = $1
    `, [groupId]);

    // Group predictions by match
    const predictionsByMatch: Record<string, any[]> = {};
    for (const pred of predictionsResult.rows) {
      if (!predictionsByMatch[pred.match_id]) {
        predictionsByMatch[pred.match_id] = [];
      }
      predictionsByMatch[pred.match_id].push({
        userId: pred.user_id,
        predictedHomeScore: pred.predicted_home_score,
        predictedAwayScore: pred.predicted_away_score,
        isLocked: pred.is_locked,
        homeTeam: pred.home_team,
        awayTeam: pred.away_team,
        actualHomeScore: pred.actual_home,
        actualAwayScore: pred.actual_away,
      });
    }

    // Format predictions with user info
    const predictions = predictionsResult.rows.map((p: any) => ({
      matchId: p.match_id,
      userId: p.user_id,
      predictedHomeScore: p.predicted_home_score,
      predictedAwayScore: p.predicted_away_score,
      isLocked: p.is_locked,
      homeTeam: p.home_team,
      awayTeam: p.away_team,
      actualHomeScore: p.actual_home,
      actualAwayScore: p.actual_away,
      matchStartsAt: p.starts_at,
    }));

    return NextResponse.json({
      group,
      members: membersResult.rows,
      predictions,
      totalPredictions: predictionsResult.rows.length,
    });
  } catch (error) {
    console.error("Group predictions error:", error);
    return NextResponse.json({ error: "Error al obtener predicciones" }, { status: 500 });
  }
}
