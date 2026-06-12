import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
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
    // Get global config
    const configResult = await pool.query(`
      SELECT key, value, description, updated_at
      FROM app_config
      WHERE category = 'scoring'
    `);

    const config: Record<string, any> = {};
    for (const row of configResult.rows) {
      config[row.key] = {
        value: row.value,
        description: row.description,
        updatedAt: row.updated_at,
      };
    }

    // Default values if not set
    const defaults = {
      exactScorePoints: { value: "5", description: "Puntos por resultado exacto" },
      outcomePoints: { value: "3", description: "Puntos por ganador acertado" },
      oneTeamScorePoints: { value: "1", description: "Puntos por un equipo acertado" },
      bonusPoints: { value: "2", description: "Puntos bonus por partido" },
    };

    // Merge with defaults
    for (const [key, data] of Object.entries(defaults)) {
      if (!config[key]) {
        config[key] = data;
      }
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Config error:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const updates = await request.json();
    
    // Ensure config table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        description TEXT,
        category VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Update or insert each config
    for (const [key, data] of Object.entries(updates)) {
      const value = (data as any).value;
      const description = (data as any).description;
      
      await pool.query(`
        INSERT INTO app_config (key, value, description, category, updated_at)
        VALUES ($1, $2, $3, 'scoring', NOW())
        ON CONFLICT (key) DO UPDATE SET value = $2, description = COALESCE($3, app_config.description), updated_at = NOW()
      `, [key, value, description]);
    }

    return NextResponse.json({ success: true, message: "Configuración actualizada" });
  } catch (error: any) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}