import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import crypto from "crypto";

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
      `SELECT p.* FROM predictions p WHERE p.group_id = $1`,
      [groupId]
    );

    return NextResponse.json(predResult.rows);
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

    // Check match is not past
    const matchResult = await pool.query(
      `SELECT starts_at FROM matches WHERE id = $1`,
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    const match = matchResult.rows[0];
    if (new Date(match.starts_at) < new Date()) {
      return NextResponse.json({ error: "El partido ya empezó" }, { status: 400 });
    }

    // Upsert prediction
    const predId = crypto.randomUUID();
    await pool.query(`
      INSERT INTO predictions (id, group_id, match_id, user_id, predicted_home_score, predicted_away_score, is_locked)
      VALUES ($1, $2, $3, $4, $5, $6, false)
      ON CONFLICT (group_id, match_id, user_id) DO UPDATE SET
        predicted_home_score = excluded.predicted_home_score,
        predicted_away_score = excluded.predicted_away_score
    `, [predId, groupId, matchId, session.user.id, predictedHomeScore, predictedAwayScore]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in predictions POST:", error);
    return NextResponse.json(
      { error: "Error saving prediction", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}