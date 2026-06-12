import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";

// GET /api/matches?tournamentId=X&stage=group
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const stage = searchParams.get("stage");

    const pool = getPool();
    
    let query = `
      SELECT 
        m.id, m.stage, m.round_label, m.match_number, m.starts_at, m.status, m.venue,
        ht.id as home_id, ht.name as home_name, ht.short_name as home_short, ht.code as home_code, ht.flag_icon as home_flag,
        at.id as away_id, at.name as away_name, at.short_name as away_short, at.code as away_code, at.flag_icon as away_flag
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (tournamentId) {
      params.push(tournamentId);
      query += ` AND m.tournament_id = $${params.length}`;
    }
    if (stage) {
      params.push(stage);
      query += ` AND m.stage = $${params.length}`;
    }
    
    query += ` ORDER BY m.starts_at ASC`;
    
    const result = await pool.query(query, params);
    
    const matches = result.rows.map((row: any) => ({
      id: row.id,
      stage: row.stage,
      matchNumber: row.match_number,
      startsAt: row.starts_at,
      status: row.status,
      venue: row.venue,
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
    }));

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error in matches API:", error);
    return NextResponse.json(
      { error: "Error fetching matches", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}