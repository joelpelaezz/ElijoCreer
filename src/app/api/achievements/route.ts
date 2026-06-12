import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const groupId = searchParams.get("groupId");
  
  const pool = getPool();

  try {
    // Get all available achievements
    const achievementsResult = await pool.query('SELECT * FROM achievements');
    const achievements = achievementsResult.rows;

    // If userId provided, get user's earned achievements
    let earned: any[] = [];
    if (userId) {
      const earnedResult = await pool.query(`
        SELECT * FROM user_achievements WHERE user_id = $1
      `, [userId]);
      earned = earnedResult.rows;
    }

    // Get leaderboard for achievements in a group
    let leaderboard: any[] = [];
    if (groupId) {
      const lbResult = await pool.query(`
        SELECT u.id, p.display_name, sum(a.points) as total_points, count(a.id)::int as achievements
        FROM "user" u
        LEFT JOIN user_achievements a ON a.user_id = u.id
        LEFT JOIN profiles p ON p.id = u.id
        WHERE u.id IN (SELECT user_id FROM group_members WHERE group_id = $1)
        GROUP BY u.id, p.display_name
        ORDER BY total_points DESC
        LIMIT 10
      `, [groupId]);
      leaderboard = lbResult.rows;
    }

    return NextResponse.json({
      achievements,
      earned: earned.map((e: any) => e.achievement_key),
      earnedDetails: earned,
      leaderboard,
    });
  } catch (error: any) {
    console.error("Achievements error:", error);
    return NextResponse.json({ error: "Error al obtener logros" }, { status: 500 });
  }
}

// Check and award achievements for a user
export async function POST(request: Request) {
  const pool = getPool();
  const userId = request.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { groupId, matchId, action } = await request.json();
    const newAchievements: string[] = [];

    // Get user's existing achievements
    const existing = await pool.query(`
      SELECT achievement_key FROM user_achievements WHERE user_id = $1
    `, [userId]);
    const existingKeys = new Set(existing.rows.map((r: any) => r.achievement_key));

    // Check each achievement condition
    switch (action) {
      case "prediction_created": {
        // First prediction
        if (!existingKeys.has("first_prediction")) {
          await awardAchievement(userId, "first_prediction", pool);
          newAchievements.push("first_prediction");
        }
        // Active member (10+ predictions)
        const predCount = await pool.query(`
          SELECT count(*)::int as c FROM predictions WHERE user_id = $1
        `, [userId]);
        if (predCount.rows[0]?.c >= 10 && !existingKeys.has("active_member")) {
          await awardAchievement(userId, "active_member", pool);
          newAchievements.push("active_member");
        }
        break;
      }
      case "perfect_score": {
        if (!existingKeys.has("perfect_score")) {
          await awardAchievement(userId, "perfect_score", pool);
          newAchievements.push("perfect_score");
        }
        break;
      }
      case "top_3": {
        if (!existingKeys.has("top_3")) {
          await awardAchievement(userId, "top_3", pool);
          newAchievements.push("top_3");
        }
        break;
      }
      case "group_created": {
        if (!existingKeys.has("group_creator")) {
          await awardAchievement(userId, "group_creator", pool);
          newAchievements.push("group_creator");
        }
        break;
      }
    }

    return NextResponse.json({ 
      success: true, 
      newAchievements,
      message: newAchievements.length > 0 
        ? `¡Nuevo logro${newAchievements.length > 1 ? 's' : ''} desbloqueado${newAchievements.length > 1 ? 's' : ''}!` 
        : "Sin nuevos logros"
    });
  } catch (error: any) {
    console.error("Award achievement error:", error);
    return NextResponse.json({ error: "Error al otorgar logro" }, { status: 500 });
  }
}

async function awardAchievement(userId: string, key: string, pool: any) {
  // Get achievement details
  const achievement = await pool.query('SELECT * FROM achievements WHERE key = $1', [key]);
  if (achievement.rows.length === 0) return;

  const a = achievement.rows[0];
  
  await pool.query(`
    INSERT INTO user_achievements (user_id, achievement_key, achievement_name, description, icon, points)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, achievement_key) DO NOTHING
  `, [userId, key, a.name, a.description, a.icon, a.points]);
}