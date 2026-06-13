import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const pool = getPool();

    // Ensure table exists (safe no-op if already there)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        description TEXT,
        category VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    const result = await pool.query(
      `SELECT key, value FROM app_config WHERE key = ANY($1)`,
      [["predictionDeadlineMinutes", "latePredictionEnabled", "latePredictionWindowMinutes"]]
    );

    const config: Record<string, string> = {};
    for (const row of result.rows) {
      config[row.key] = row.value;
    }

    return NextResponse.json({
      predictionDeadlineMinutes: config.predictionDeadlineMinutes
        ? parseInt(config.predictionDeadlineMinutes, 10)
        : 30,
      latePredictionEnabled: config.latePredictionEnabled === "true",
      latePredictionWindowMinutes: config.latePredictionWindowMinutes
        ? parseInt(config.latePredictionWindowMinutes, 10)
        : 120,
    });
  } catch (error) {
    console.error("Error fetching public scoring config:", error);
    return NextResponse.json(
      {
        predictionDeadlineMinutes: 30,
        latePredictionEnabled: false,
        latePredictionWindowMinutes: 120,
      },
      { status: 200 }
    );
  }
}
