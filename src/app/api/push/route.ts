import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Web Push subscription
export async function POST(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { subscription, endpoint } = await request.json();
    
    // Store push subscription
    await pool.query(`
      INSERT INTO push_subscriptions (user_id, subscription, endpoint, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id) DO UPDATE SET subscription = $2, endpoint = $3
    `, [userId, JSON.stringify(subscription), endpoint]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Push subscription error:", error);
    return NextResponse.json({ error: "Error al suscribir" }, { status: 500 });
  }
}

// Send push notification (called from server)
export async function PUT(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { userIds, title, body, icon } = await request.json();
    
    if (!userIds || !title) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    // Get push subscriptions
    const subscriptions = await pool.query(`
      SELECT subscription FROM push_subscriptions WHERE user_id = ANY($1)
    `, [userIds]);

    // TODO: Implement actual push with web-push library
    // For now, just log what would be sent
    for (const row of subscriptions.rows) {
      console.log(`[PUSH] to ${row.user_id}: ${title} - ${body}`);
    }

    return NextResponse.json({ success: true, sent: subscriptions.rows.length });
  } catch (error: any) {
    console.error("Push error:", error);
    return NextResponse.json({ error: "Error al enviar push" }, { status: 500 });
  }
}

// Delete subscription
export async function DELETE(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await pool.query('DELETE FROM push_subscriptions WHERE user_id = $1', [userId]);
  
  return NextResponse.json({ success: true });
}