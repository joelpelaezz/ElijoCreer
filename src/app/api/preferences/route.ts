import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Get email preferences
export async function GET(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM user_preferences WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      // Create default preferences
      await pool.query(`
        INSERT INTO user_preferences (user_id) VALUES ($1)
      `, [userId]);
      return NextResponse.json({
        emailNotifications: true,
        pushNotifications: true,
        reminderBeforeMatch: 60,
        rankingAlerts: true,
      });
    }

    const p = result.rows[0];
    return NextResponse.json({
      emailNotifications: p.email_notifications,
      pushNotifications: p.push_notifications,
      reminderBeforeMatch: p.reminder_before_match,
      rankingAlerts: p.ranking_alerts,
    });
  } catch (error: any) {
    console.error("Preferences error:", error);
    return NextResponse.json({ error: "Error al obtener preferencias" }, { status: 500 });
  }
}

// Update email preferences
export async function PUT(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const {
      emailNotifications,
      pushNotifications,
      reminderBeforeMatch,
      rankingAlerts,
    } = await request.json();

    await pool.query(`
      INSERT INTO user_preferences (user_id, email_notifications, push_notifications, reminder_before_match, ranking_alerts, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id) DO UPDATE SET 
        email_notifications = COALESCE($2, user_preferences.email_notifications),
        push_notifications = COALESCE($3, user_preferences.push_notifications),
        reminder_before_match = COALESCE($4, user_preferences.reminder_before_match),
        ranking_alerts = COALESCE($5, user_preferences.ranking_alerts),
        updated_at = NOW()
    `, [userId, emailNotifications, pushNotifications, reminderBeforeMatch, rankingAlerts]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Preferences update error:", error);
    return NextResponse.json({ error: "Error al actualizar preferencias" }, { status: 500 });
  }
}

// Send reminder emails (called by cron job)
export async function POST(request: Request) {
  const pool = getPool();
  // This endpoint would be called by a cron job
  
  try {
    // Get upcoming matches (next 24-48 hours)
    const upcomingMatches = await pool.query(`
      SELECT m.id, m.starts_at, m.home_team_id, m.away_team_id,
             ht.name as home_team, at.name as away_team
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE m.starts_at > NOW() 
        AND m.starts_at < NOW() + INTERVAL '48 hours'
        AND m.status = 'upcoming'
      ORDER BY m.starts_at
      LIMIT 10
    `);

    let emailsSent = 0;

    for (const match of upcomingMatches.rows) {
      // Get users who haven't predicted for this match but have email notifications on
      const usersToRemind = await pool.query(`
        SELECT DISTINCT u.email, p.display_name, up.reminder_before_match
        FROM "user" u
        JOIN profiles p ON p.id = u.id
        JOIN user_preferences up ON up.user_id = u.id
        LEFT JOIN predictions pr ON pr.user_id = u.id AND pr.match_id = $1
        WHERE up.email_notifications = true
          AND pr.id IS NULL
          AND u.id IN (SELECT user_id FROM group_members)
      `, [match.id]);

      for (const user of usersToRemind.rows) {
        // TODO: Send actual email
        console.log(`[EMAIL REMINDER] to ${user.email}: ${match.home_team} vs ${match.away_team} starts soon!`);
        emailsSent++;
      }
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (error: any) {
    console.error("Reminder error:", error);
    return NextResponse.json({ error: "Error al enviar recordatorios" }, { status: 500 });
  }
}