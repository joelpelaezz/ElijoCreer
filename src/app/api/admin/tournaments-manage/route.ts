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
  const tournamentId = searchParams.get("id");

  // GET single tournament
  if (tournamentId) {
    const result = await pool.query(`
      SELECT t.*, 
        (SELECT count(*)::int FROM teams WHERE tournament_id = t.id) as team_count,
        (SELECT count(*)::int FROM matches WHERE tournament_id = t.id) as match_count
      FROM tournaments t WHERE t.id = $1
    `, [tournamentId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  }

  // GET all tournaments
  const result = await pool.query(`
    SELECT t.*, 
      (SELECT count(*)::int FROM teams WHERE tournament_id = t.id) as team_count,
      (SELECT count(*)::int FROM matches WHERE tournament_id = t.id) as match_count
    FROM tournaments t
    ORDER BY t.year DESC, t.name
  `);
  
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const pool = getPool();
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { name, year, status, description } = await request.json();
    
    if (!name || !year) {
      return NextResponse.json({ error: "Nombre y año requeridos" }, { status: 400 });
    }

    const result = await pool.query(`
      INSERT INTO tournaments (name, year, status, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, year, status, description
    `, [name, year, status || "upcoming", description || null]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Create tournament error:", error);
    return NextResponse.json({ error: "Error al crear torneo" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const pool = getPool();
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { tournamentId, name, year, status, description } = await request.json();
    
    if (!tournamentId) {
      return NextResponse.json({ error: "ID de torneo requerido" }, { status: 400 });
    }

    await pool.query(`
      UPDATE tournaments 
      SET name = COALESCE($1, name),
          year = COALESCE($2, year),
          status = COALESCE($3, status),
          description = COALESCE($4, description)
      WHERE id = $5
    `, [name, year, status, description, tournamentId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update tournament error:", error);
    return NextResponse.json({ error: "Error al actualizar torneo" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const pool = getPool();
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { tournamentId } = await request.json();
    
    if (!tournamentId) {
      return NextResponse.json({ error: "ID de torneo requerido" }, { status: 400 });
    }

    // Delete in correct order (respecting foreign keys)
    await pool.query('DELETE FROM matches WHERE tournament_id = $1', [tournamentId]);
    await pool.query('DELETE FROM teams WHERE tournament_id = $1', [tournamentId]);
    await pool.query('DELETE FROM tournaments WHERE id = $1', [tournamentId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete tournament error:", error);
    return NextResponse.json({ error: "Error al eliminar torneo" }, { status: 500 });
  }
}
