import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";

// GET /api/admin/users — listar todos los usuarios (solo admin)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check admin role
    const pool = getPool();
    if (!(await hasAdminAccess(session, pool))) {
      return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
    }

    // Get all profiles
    const usersResult = await pool.query(`
      SELECT 
        p.id, p.display_name, p.role, p.avatar_url, p.created_at,
        (SELECT COUNT(*) FROM group_members WHERE user_id = p.id AND status = 'active') as group_count,
        (SELECT COUNT(*) FROM predictions WHERE user_id = p.id) as prediction_count
      FROM profiles p
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json(usersResult.rows);
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users — actualizar rol de usuario (solo admin)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check admin role
    const pool = getPool();
    if (!(await hasAdminAccess(session, pool))) {
      return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId y role requeridos" }, { status: 400 });
    }

    // Valid roles
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    await pool.query(
      'UPDATE profiles SET role = $1, updated_at = NOW() WHERE id = $2',
      [role, userId]
    );

    return NextResponse.json({ success: true, message: "Rol actualizado" });
  } catch (error) {
    console.error("Error in PUT /api/admin/users:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users — eliminar usuario (solo admin)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check admin role
    const pool = getPool();
    if (!(await hasAdminAccess(session, pool))) {
      return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // No te puedes eliminar a ti mismo
    if (userId === session.user.id) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete user data
      await client.query('DELETE FROM predictions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM group_members WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM group_activity WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM profiles WHERE id = $1', [userId]);
      
      await client.query('COMMIT');
      
      return NextResponse.json({ success: true, message: "Usuario eliminado" });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in DELETE /api/admin/users:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
