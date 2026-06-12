import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";

// GET /api/admin/groups — listar todos los grupos (solo admin)
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

    // Get all groups with stats
    const groupsResult = await pool.query(`
      SELECT 
        g.id, g.name, g.slug, g.description, g.invite_code, g.is_active, g.created_at,
        g.tournament_id, t.name as tournament_name,
        (SELECT COUNT(*)::int FROM group_members WHERE group_id = g.id AND status = 'active') as member_count
      FROM groups g
      LEFT JOIN tournaments t ON t.id = g.tournament_id
      ORDER BY g.created_at DESC
    `);

    return NextResponse.json(groupsResult.rows);
  } catch (error) {
    console.error("Error in GET /api/admin/groups:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/groups — eliminar grupo (solo admin)
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

    const { groupId } = await request.json();

    if (!groupId) {
      return NextResponse.json({ error: "groupId requerido" }, { status: 400 });
    }

    // Delete related data first
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete predictions for this group
      await client.query('DELETE FROM predictions WHERE group_id = $1', [groupId]);
      
      // Delete group activity
      await client.query('DELETE FROM group_activity WHERE group_id = $1', [groupId]);
      
      // Delete scoring rules
      await client.query('DELETE FROM group_scoring_rules WHERE group_id = $1', [groupId]);
      
      // Delete members
      await client.query('DELETE FROM group_members WHERE group_id = $1', [groupId]);
      
      // Delete group
      await client.query('DELETE FROM groups WHERE id = $1', [groupId]);
      
      await client.query('COMMIT');
      
      return NextResponse.json({ success: true, message: "Grupo eliminado" });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in DELETE /api/admin/groups:", error);
    return NextResponse.json(
      { error: "Error al eliminar grupo", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}