import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Subscribe to ranking alerts
export async function POST(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { groupId, notifyWhen } = await request.json();
    
    if (!groupId) {
      return NextResponse.json({ error: "Grupo requerido" }, { status: 400 });
    }

    await pool.query(`
      INSERT INTO ranking_alerts (user_id, group_id, notify_when, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, group_id) DO UPDATE SET notify_when = $3
    `, [userId, groupId, notifyWhen || "position_change"]);

    return NextResponse.json({ success: true, message: "Alerta configurada" });
  } catch (error: any) {
    console.error("Ranking alert error:", error);
    return NextResponse.json({ error: "Error al configurar alerta" }, { status: 500 });
  }
}

// Unsubscribe from ranking alerts
export async function DELETE(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "Grupo requerido" }, { status: 400 });
  }

  await pool.query('DELETE FROM ranking_alerts WHERE user_id = $1 AND group_id = $2', [userId, groupId]);

  return NextResponse.json({ success: true, message: "Alerta eliminada" });
}

// Check and send ranking alerts (called by cron or manually)
export async function PUT(request: Request) {
  const pool = getPool();
  // This would be called by a cron job or manually
  
  const alerts = await pool.query(`
    SELECT ra.*, g.name as group_name, u.email, p.display_name
    FROM ranking_alerts ra
    JOIN groups g ON g.id = ra.group_id
    JOIN "user" u ON u.id = ra.user_id
    LEFT JOIN profiles p ON p.id = ra.user_id
    WHERE ra.notify_when = 'position_change'
  `);

  let sent = 0;
  for (const alert of alerts.rows) {
    // Get current and previous ranking
    const currentRank = await pool.query(`
      WITH ranked AS (
        SELECT p.user_id, 
               COALESCE(SUM(
                 CASE 
                   WHEN p.predicted_home_score = m.home_score AND p.predicted_away_score = m.away_score THEN 5
                   WHEN (p.predicted_home_score > p.predicted_away_score AND m.home_score > m.away_score)
                        OR (p.predicted_home_score < p.predicted_away_score AND m.home_score < m.away_score)
                        OR (p.predicted_home_score = p.predicted_away_score AND m.home_score = m.away_score) THEN 3
                   WHEN p.predicted_home_score = m.home_score OR p.predicted_away_score = m.away_score THEN 1
                   ELSE 0
                 END
               ), 0) as points,
               ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(
                 CASE 
                   WHEN p.predicted_home_score = m.home_score AND p.predicted_away_score = m.away_score THEN 5
                   WHEN (p.predicted_home_score > p.predicted_away_score AND m.home_score > m.away_score)
                        OR (p.predicted_home_score < p.predicted_away_score AND m.home_score < m.away_score)
                        OR (p.predicted_home_score = p.predicted_away_score AND m.home_score = m.away_score) THEN 3
                   WHEN p.predicted_home_score = m.home_score OR p.predicted_away_score = m.away_score THEN 1
                   ELSE 0
                 END
               ), 0) DESC) as rank
        FROM predictions p
        JOIN matches m ON m.id = p.match_id
        WHERE p.group_id = $1 AND m.home_score IS NOT NULL
        GROUP BY p.user_id
      )
      SELECT rank FROM ranked WHERE user_id = $2
    `, [alert.group_id, alert.user_id]);

    if (currentRank.rows.length === 0) continue;
    
    const newPosition = currentRank.rows[0].rank;
    const previousPosition = alert.previous_position;

    // If position changed, send notification
    if (previousPosition && newPosition !== previousPosition) {
      const direction = newPosition < previousPosition ? "subió" : "bajó";
      const diff = Math.abs(newPosition - previousPosition);
      
      // TODO: Send actual notification (push/email)
      console.log(`[RANKING ALERT] ${alert.display_name} ${direction} ${diff} posiciones en ${alert.group_name}: ${previousPosition} → ${newPosition}`);
      sent++;
    }

    // Update previous position
    await pool.query(`
      UPDATE ranking_alerts 
      SET previous_position = $1, last_notified_at = NOW()
      WHERE id = $2
    `, [newPosition, alert.id]);
  }

  return NextResponse.json({ success: true, sent });
}