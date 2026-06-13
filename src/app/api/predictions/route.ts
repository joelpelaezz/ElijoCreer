import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import crypto from "crypto";

// Helper: leer config de app_config con fallback
async function getConfigValue(pool: any, key: string, defaultValue: string): Promise<string> {
  try {
    const result = await pool.query(
      `SELECT value FROM app_config WHERE key = $1 AND category = 'scoring'`,
      [key]
    );
    return result.rows.length > 0 ? result.rows[0].value : defaultValue;
  } catch {
    return defaultValue;
  }
}

// GET /api/predictions?groupId=X
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "groupId requerido" }, { status: 400 });
    }

    const pool = getPool();

    // Check membership
    const memberResult = await pool.query(
      `SELECT * FROM "group_members" WHERE "group_id" = $1 AND "user_id" = $2 AND status = 'active'`,
      [groupId, session.user.id]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
    }

    // Get predictions
    const predResult = await pool.query(
      `
      SELECT 
        p.id,
        p.group_id,
        p.match_id,
        p.user_id,
        p.predicted_home_score,
        p.predicted_away_score,
        p.is_locked,
        p.is_late,
        p.late_minutes,
        p.late_penalty_applied,
        p.created_at,
        p.updated_at
      FROM predictions p 
      WHERE p.group_id = $1
      `,
      [groupId]
    );

    return NextResponse.json(
      predResult.rows.map((row) => ({
        id: row.id,
        groupId: row.group_id,
        matchId: row.match_id,
        userId: row.user_id,
        predictedHomeScore: row.predicted_home_score,
        predictedAwayScore: row.predicted_away_score,
        isLocked: row.is_locked,
        isLate: row.is_late,
        lateMinutes: row.late_minutes,
        latePenaltyApplied: row.late_penalty_applied,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  } catch (error) {
    console.error("Error in predictions API:", error);
    return NextResponse.json(
      { error: "Error fetching predictions", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/predictions
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { groupId, matchId, predictedHomeScore, predictedAwayScore } = await request.json();

    if (!groupId || !matchId) {
      return NextResponse.json({ error: "groupId y matchId son requeridos" }, { status: 400 });
    }

    const pool = getPool();

    // Check membership
    const memberResult = await pool.query(
      `SELECT * FROM "group_members" WHERE "group_id" = $1 AND "user_id" = $2 AND status = 'active'`,
      [groupId, session.user.id]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
    }

    // Get match
    const matchResult = await pool.query(
      `SELECT starts_at, status FROM matches WHERE id = $1`,
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    const match = matchResult.rows[0];

    // Leer config desde app_config
    const deadlineMin = parseInt(await getConfigValue(pool, "predictionDeadlineMinutes", "30"));
    const lateEnabled = await getConfigValue(pool, "latePredictionEnabled", "false");
    const lateWindowMin = parseInt(await getConfigValue(pool, "latePredictionWindowMinutes", "120"));

    const now = new Date();
    const matchTime = new Date(match.starts_at);
    const deadline = new Date(matchTime.getTime() - deadlineMin * 60 * 1000);
    const lateDeadline = new Date(matchTime.getTime() - deadlineMin * 60 * 1000 + lateWindowMin * 60 * 1000);

    let isLate = false;
    let lateMinutes: number | null = null;

    if (deadline >= now) {
      // Todo ok — dentro del deadline normal
      isLate = false;
    } else if (lateEnabled === "true" && now <= lateDeadline) {
      // Dentro de la ventana extemporánea
      isLate = true;
      lateMinutes = Math.round((now.getTime() - deadline.getTime()) / 60000);
    } else {
      // Fuera de toda ventana
      return NextResponse.json(
        { error: lateEnabled === "true" ? "La ventana de pronóstico extemporáneo ha cerrado" : "El partido ya empezó" },
        { status: 400 }
      );
    }

    // Upsert prediction
    const predId = crypto.randomUUID();
    await pool.query(`
      INSERT INTO predictions (id, group_id, match_id, user_id, predicted_home_score, predicted_away_score, is_locked, is_late, late_minutes, late_penalty_applied)
      VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8, true)
      ON CONFLICT (group_id, match_id, user_id) DO UPDATE SET
        predicted_home_score = excluded.predicted_home_score,
        predicted_away_score = excluded.predicted_away_score,
        is_late = excluded.is_late,
        late_minutes = excluded.late_minutes,
        late_penalty_applied = excluded.late_penalty_applied
    `, [predId, groupId, matchId, session.user.id, predictedHomeScore, predictedAwayScore, isLate, lateMinutes]);

    return NextResponse.json({ success: true, isLate, lateMinutes });
  } catch (error) {
    console.error("Error in predictions POST:", error);
    return NextResponse.json(
      { error: "Error saving prediction", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
