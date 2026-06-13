import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";

// GET /api/admin/late-predictions
export async function GET() {
  const pool = getPool();
  const session = await auth();

  if (!session?.user?.id || !(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.group_id,
        p.match_id,
        p.user_id,
        p.predicted_home_score,
        p.predicted_away_score,
        p.is_late,
        p.late_minutes,
        p.late_penalty_applied,
        p.late_excused_by,
        p.late_excused_reason,
        p.created_at,
        p.updated_at,
        m.starts_at AS match_starts_at,
        ht.short_name AS home_team,
        at.short_name AS away_team,
        pr.display_name AS user_name,
        pr2.display_name AS excused_by_name
      FROM predictions p
      JOIN matches m ON m.id = p.match_id
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      JOIN profiles pr ON pr.id = p.user_id
      LEFT JOIN profiles pr2 ON pr2.id = p.late_excused_by
      WHERE p.is_late = true
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json(result.rows.map((row: any) => ({
      id: row.id,
      groupId: row.group_id,
      matchId: row.match_id,
      userId: row.user_id,
      predictedHomeScore: row.predicted_home_score,
      predictedAwayScore: row.predicted_away_score,
      isLate: row.is_late,
      lateMinutes: row.late_minutes,
      latePenaltyApplied: row.late_penalty_applied,
      lateExcusedBy: row.late_excused_by,
      lateExcusedReason: row.late_excused_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      matchStartsAt: row.match_starts_at,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      userName: row.user_name,
      excusedByName: row.excused_by_name,
    })));
  } catch (error: any) {
    console.error("Error fetching late predictions:", error);
    return NextResponse.json({ error: "Error al obtener pronósticos tardíos" }, { status: 500 });
  }
}

// POST /api/admin/late-predictions/excuse
export async function POST(request: NextRequest) {
  const pool = getPool();
  const session = await auth();

  if (!session?.user?.id || !(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { predictionId, reason } = await request.json();

    if (!predictionId) {
      return NextResponse.json({ error: "predictionId requerido" }, { status: 400 });
    }

    // Actualizar la predicción
    await pool.query(`
      UPDATE predictions
      SET late_penalty_applied = false,
          late_excused_by = $1,
          late_excused_reason = $2,
          updated_at = NOW()
      WHERE id = $3 AND is_late = true
    `, [session.user.id, reason || null, predictionId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error excusing late prediction:", error);
    return NextResponse.json({ error: "Error al eximir pronóstico" }, { status: 500 });
  }
}
