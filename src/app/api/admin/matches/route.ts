import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";

// GET /api/admin/matches?tournamentId=X&stage=group
// Lista todos los partidos con equipos
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const pool = getPool();
    if (!(await hasAdminAccess(session, pool))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const stage = searchParams.get("stage");

    let query = `
      SELECT 
        m.id, m.tournament_id, m.stage, m.round_label, m.match_number,
        m.starts_at, m.status, m.venue, m.created_at, m.updated_at,
        ht.id as home_id, ht.name as home_name, ht.short_name as home_short,
        ht.code as home_code, ht.flag_icon as home_flag,
        at.id as away_id, at.name as away_name, at.short_name as away_short,
        at.code as away_code, at.flag_icon as away_flag,
        r.home_score as official_home_score,
        r.away_score as official_away_score,
        r.id as result_id
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      LEFT JOIN official_results r ON r.match_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    const includeTeams = searchParams.get("includeTeams") === "true";

    if (tournamentId) {
      params.push(tournamentId);
      query += ` AND m.tournament_id = $${params.length}`;
    }
    if (stage) {
      params.push(stage);
      query += ` AND m.stage = $${params.length}`;
    }

    query += ` ORDER BY m.starts_at ASC, m.match_number ASC`;

    const result = await pool.query(query, params);

    // If includeTeams=true, also return teams list for dropdowns
    let teams: any[] = [];
    if (includeTeams) {
      const teamsResult = await pool.query(`
        SELECT id, tournament_id, name, short_name, code, flag_icon
        FROM teams ORDER BY name ASC
      `);
      teams = teamsResult.rows.map((t: any) => ({
        id: t.id,
        tournamentId: t.tournament_id,
        name: t.name,
        shortName: t.short_name,
        code: t.code,
        flagIcon: t.flag_icon,
      }));
    }

    const matches = result.rows.map((row: any) => ({
      id: row.id,
      tournamentId: row.tournament_id,
      stage: row.stage,
      roundLabel: row.round_label,
      matchNumber: row.match_number,
      startsAt: row.starts_at,
      status: row.status,
      venue: row.venue,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      homeTeam: {
        id: row.home_id,
        name: row.home_name,
        shortName: row.home_short,
        code: row.home_code,
        flagIcon: row.home_flag,
      },
      awayTeam: {
        id: row.away_id,
        name: row.away_name,
        shortName: row.away_short,
        code: row.away_code,
        flagIcon: row.away_flag,
      },
      result: row.result_id
        ? { homeScore: row.official_home_score, awayScore: row.official_away_score }
        : null,
    }));

    return NextResponse.json(includeTeams ? { matches, teams } : matches);
  } catch (error) {
    console.error("Error in GET /api/admin/matches:", error);
    return NextResponse.json(
      { error: "Error al obtener partidos", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/matches — crear partido
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

    const body = await request.json();
    const { tournamentId, stage, roundLabel, matchNumber, homeTeamId, awayTeamId, startsAt, venue, status } = body;

    if (!tournamentId || !stage || !homeTeamId || !awayTeamId || !startsAt) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: tournamentId, stage, homeTeamId, awayTeamId, startsAt" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO matches (tournament_id, stage, round_label, match_number, home_team_id, away_team_id, starts_at, venue, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        tournamentId,
        stage,
        roundLabel || null,
        matchNumber || null,
        homeTeamId,
        awayTeamId,
        startsAt,
        venue || null,
        status || "scheduled",
      ]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/matches:", error);
    return NextResponse.json(
      { error: "Error al crear partido", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/matches — actualizar partido
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const pool = getPool();
    if (!(await hasAdminAccess(session, pool))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { id, stage, roundLabel, matchNumber, homeTeamId, awayTeamId, startsAt, venue, status } = body;

    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    const current = await pool.query("SELECT * FROM matches WHERE id = $1", [id]);
    if (current.rows.length === 0) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    await pool.query(
      `UPDATE matches SET
        stage = COALESCE($1, stage),
        round_label = COALESCE($2, round_label),
        match_number = COALESCE($3, match_number),
        home_team_id = COALESCE($4, home_team_id),
        away_team_id = COALESCE($5, away_team_id),
        starts_at = COALESCE($6, starts_at),
        venue = COALESCE($7, venue),
        status = COALESCE($8, status),
        updated_at = NOW()
       WHERE id = $9`,
      [
        stage || null,
        roundLabel !== undefined ? roundLabel : null,
        matchNumber !== undefined ? matchNumber : null,
        homeTeamId || null,
        awayTeamId || null,
        startsAt || null,
        venue !== undefined ? venue : null,
        status || null,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/admin/matches:", error);
    return NextResponse.json(
      { error: "Error al actualizar partido", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/matches — eliminar partido
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const pool = getPool();
    if (!(await hasAdminAccess(session, pool))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: "matchId requerido" }, { status: 400 });
    }

    // Check exists
    const existing = await pool.query("SELECT id FROM matches WHERE id = $1", [matchId]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    // Delete related data first
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM predictions WHERE match_id = $1", [matchId]);
      await client.query("DELETE FROM prediction_history WHERE match_id = $1", [matchId]);
      await client.query("DELETE FROM prediction_scores WHERE match_id = $1", [matchId]);
      await client.query("DELETE FROM official_results WHERE match_id = $1", [matchId]);
      await client.query("DELETE FROM matches WHERE id = $1", [matchId]);
      await client.query("COMMIT");

      return NextResponse.json({ success: true, message: "Partido eliminado" });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in DELETE /api/admin/matches:", error);
    return NextResponse.json(
      { error: "Error al eliminar partido", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
