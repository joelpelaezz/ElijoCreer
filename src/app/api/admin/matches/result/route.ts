import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";
import crypto from "crypto";

// POST /api/admin/matches/result — cargar o actualizar resultado oficial de un partido
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const pool = getPool();
    if (!(await hasAdminAccess(session, pool))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { matchId, homeScore, awayScore } = await request.json();

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: "Faltan datos: matchId, homeScore, awayScore" },
        { status: 400 }
      );
    }

    // Validar que el partido existe
    const match = await pool.query("SELECT id, status FROM matches WHERE id = $1", [matchId]);
    if (match.rows.length === 0) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    // Upsert result
    const existing = await pool.query(
      "SELECT id FROM official_results WHERE match_id = $1",
      [matchId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE official_results SET home_score = $1, away_score = $2, loaded_by = $3, updated_at = NOW() WHERE match_id = $4`,
        [homeScore, awayScore, session.user.id, matchId]
      );
    } else {
      await pool.query(
        `INSERT INTO official_results (id, match_id, home_score, away_score, loaded_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [crypto.randomUUID(), matchId, homeScore, awayScore, session.user.id]
      );
    }

    // Update match status to finished if not already
    if (match.rows[0].status !== "finished") {
      await pool.query(
        "UPDATE matches SET status = 'finished', updated_at = NOW() WHERE id = $1",
        [matchId]
      );
    }

    return NextResponse.json({ success: true, message: "Resultado cargado correctamente" });
  } catch (error) {
    console.error("Error in POST /api/admin/matches/result:", error);
    return NextResponse.json(
      { error: "Error al cargar resultado", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
