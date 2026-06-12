import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";

// GET /api/admin/tournaments — listar todos los torneos (solo admin)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check admin role
    const pool = getPool();
    const profileResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [session.user.id]
    );

    if (profileResult.rows.length === 0 || profileResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
    }

    // Get all tournaments with stats
    const tournamentsResult = await pool.query(`
      SELECT 
        t.id, t.name, t.slug, t.year, t.status, t.starts_at, t.ends_at,
        (SELECT COUNT(*) FROM teams WHERE tournament_id = t.id) as team_count,
        (SELECT COUNT(*) FROM matches WHERE tournament_id = t.id) as match_count,
        (SELECT COUNT(*) FROM groups WHERE tournament_id = t.id) as group_count
      FROM tournaments t
      ORDER BY t.year DESC, t.starts_at DESC
    `);

    return NextResponse.json(tournamentsResult.rows);
  } catch (error) {
    console.error("Error in GET /api/admin/tournaments:", error);
    return NextResponse.json(
      { error: "Error al obtener torneos", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tournaments — eliminar torneo (solo admin)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check admin role
    const pool = getPool();
    const profileResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [session.user.id]
    );

    if (profileResult.rows.length === 0 || profileResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
    }

    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId requerido" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get all groups for this tournament
      const groups = await client.query(
        'SELECT id FROM groups WHERE tournament_id = $1',
        [tournamentId]
      );
      
      // Delete data for each group
      for (const g of groups.rows) {
        await client.query('DELETE FROM predictions WHERE group_id = $1', [g.id]);
        await client.query('DELETE FROM group_activity WHERE group_id = $1', [g.id]);
        await client.query('DELETE FROM group_scoring_rules WHERE group_id = $1', [g.id]);
        await client.query('DELETE FROM group_members WHERE group_id = $1', [g.id]);
        await client.query('DELETE FROM groups WHERE id = $1', [g.id]);
      }
      
      // Delete tournament data
      await client.query('DELETE FROM matches WHERE tournament_id = $1', [tournamentId]);
      await client.query('DELETE FROM teams WHERE tournament_id = $1', [tournamentId]);
      await client.query('DELETE FROM predictions WHERE tournament_id = $1', [tournamentId]);
      await client.query('DELETE FROM official_results WHERE tournament_id = $1', [tournamentId]);
      await client.query('DELETE FROM tournaments WHERE id = $1', [tournamentId]);
      
      await client.query('COMMIT');
      
      return NextResponse.json({ success: true, message: "Torneo eliminado" });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in DELETE /api/admin/tournaments:", error);
    return NextResponse.json(
      { error: "Error al eliminar torneo", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}