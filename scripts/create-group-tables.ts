/**
 * Create group tables in production DB
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  console.log("🔧 Creando tablas de grupos...");

  // groupMembers
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "groupMembers" (
      "groupId" text NOT NULL,
      "userId" text NOT NULL,
      role text DEFAULT 'member',
      status text DEFAULT 'active',
      "joinedAt" timestamp with time zone DEFAULT NOW(),
      PRIMARY KEY ("groupId", "userId")
    )
  `);
  console.log("✅ groupMembers");

  // groupScoringRules
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "groupScoringRules" (
      "groupId" text PRIMARY KEY,
      "exactScorePoints" integer DEFAULT 5,
      "outcomePoints" integer DEFAULT 3,
      "oneTeamScorePoints" integer DEFAULT 0,
      "bonusPoints" integer DEFAULT 0,
      "updatedBy" text,
      "updatedAt" timestamp with time zone DEFAULT NOW()
    )
  `);
  console.log("✅ groupScoringRules");

  console.log("🎉 Listo!");
  await pool.end();
}

main().catch(console.error);