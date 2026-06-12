import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  const adminCheck = await pool.query('SELECT role FROM profiles WHERE id = $1', [userId]);
  if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { targetUserId, action, reason } = await request.json();
    
    if (!targetUserId || !action) {
      return NextResponse.json({ error: "Usuario y acción requeridos" }, { status: 400 });
    }

    // Don't allow banning yourself or other admins
    const targetCheck = await pool.query('SELECT role FROM profiles WHERE id = $1', [targetUserId]);
    if (targetCheck.rows.length > 0 && targetCheck.rows[0].role === "admin") {
      return NextResponse.json({ error: "No puedes banear a un administrador" }, { status: 400 });
    }

    let result;
    switch (action) {
      case "ban":
        // Add to banned users
        await pool.query(`
          UPDATE profiles SET status = 'banned', updated_at = NOW() WHERE id = $1
        `, [targetUserId]);
        result = { success: true, message: "Usuario baneado" };
        break;
        
      case "unban":
        await pool.query(`
          UPDATE profiles SET status = 'active', updated_at = NOW() WHERE id = $1
        `, [targetUserId]);
        result = { success: true, message: "Usuario desbaneado" };
        break;
        
      case "suspend":
        await pool.query(`
          UPDATE profiles SET status = 'suspended', updated_at = NOW() WHERE id = $1
        `, [targetUserId]);
        result = { success: true, message: "Usuario suspendido" };
        break;
        
      case "delete":
        // Delete user and all their data (cascade)
        await pool.query('DELETE FROM predictions WHERE user_id = $1', [targetUserId]);
        await pool.query('DELETE FROM group_members WHERE user_id = $1', [targetUserId]);
        await pool.query('DELETE FROM profiles WHERE id = $1', [targetUserId]);
        await pool.query('DELETE FROM "user" WHERE id = $1', [targetUserId]);
        result = { success: true, message: "Usuario eliminado" };
        break;
        
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    // Log the moderation action
    await pool.query(`
      INSERT INTO group_activity (action, entity_type, entity_id, user_id, created_at)
      VALUES ($1, 'moderation', $2, $3, NOW())
    `, [action, targetUserId, userId]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Moderation error:", error);
    return NextResponse.json({ error: "Error de moderación" }, { status: 500 });
  }
}