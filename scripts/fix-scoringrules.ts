/**
 * Fix groupScoringRules table
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  console.log("🔧 Corrigiendo groupScoringRules...");
  
  // Rename table
  await pool.query(`ALTER TABLE "groupScoringRules" RENAME TO "group_scoring_rules"`);
  console.log("✅ Tabla renombrada");

  // Add missing columns
  await pool.query(`
    ALTER TABLE "group_scoring_rules"
    ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS exact_score_points integer DEFAULT 5,
    ADD COLUMN IF NOT EXISTS outcome_points integer DEFAULT 3,
    ADD COLUMN IF NOT EXISTS one_team_score_points integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bonus_points integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_by text,
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW()
  `).catch(() => {});
  console.log("✅ Columnas actualizadas");

  // Rename groupId column
  await pool.query(`ALTER TABLE "group_scoring_rules" RENAME COLUMN "groupId" TO group_id`).catch(() => {});
  console.log("✅ Columna group_id");

  await pool.end();
  console.log("🎉 Listo!");
}

main().catch(console.error);