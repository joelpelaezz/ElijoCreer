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
    const { title, message, type, targetAudience } = await request.json();
    
    if (!title || !message) {
      return NextResponse.json({ error: "Título y mensaje requeridos" }, { status: 400 });
    }

    let userIds: string[] = [];

    // Get target users
    switch (targetAudience) {
      case "all":
        const allUsers = await pool.query('SELECT id FROM "user"');
        userIds = allUsers.rows.map((r: any) => r.id);
        break;
        
      case "active":
        const activeUsers = await pool.query(`
          SELECT DISTINCT p.user_id FROM predictions p
          WHERE p.created_at > NOW() - INTERVAL '7 days'
        `);
        userIds = activeUsers.rows.map((r: any) => r.user_id);
        break;
        
      case "groups":
        const groupUsers = await pool.query('SELECT DISTINCT user_id FROM group_members');
        userIds = groupUsers.rows.map((r: any) => r.user_id);
        break;
        
      case "none":
        // No recipients, just store the notification
        userIds = [];
        break;
        
      default:
        return NextResponse.json({ error: "Audiencia no válida" }, { status: 400 });
    }

    // Create notification record (can be extended to actual notification system)
    const notificationId = crypto.randomUUID();
    await pool.query(`
      INSERT INTO admin_notifications (id, title, message, type, target_audience, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [notificationId, title, message, type || 'info', targetAudience, userId]);

    // TODO: Integrate with actual notification system (email, push, etc.)
    // For now, just log what would be sent
    console.log(`[NOTIFICATION] "${title}": ${message}`);
    console.log(`[NOTIFICATION] Recipients: ${userIds.length} users (${targetAudience})`);

    return NextResponse.json({
      success: true,
      notificationId,
      recipients: userIds.length,
      message: `Notificación programada para ${userIds.length} usuarios`
    });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Error al enviar notificación" }, { status: 500 });
  }
}