/**
 * Fix groupMembers table
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  console.log("🔧 Corrigiendo groupMembers...");
  
  // Rename table
  await pool.query(`ALTER TABLE "groupMembers" RENAME TO "group_members"`);
  console.log("✅ Tabla renombrada a group_members");

  // Add missing columns and fix types
  await pool.query(`
    ALTER TABLE "group_members"
    ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS joined_at timestamp with time zone DEFAULT NOW()
  `).catch(() => {});
  console.log("✅ Columnas actualizadas");

  // Rename groupId column if needed
  await pool.query(`ALTER TABLE "group_members" RENAME COLUMN "groupId" TO group_id`).catch(() => {});
  await pool.query(`ALTER TABLE "group_members" RENAME COLUMN "userId" TO user_id`).catch(() => {});
  console.log("✅ Columnas renombradas");

  await pool.end();
  console.log("🎉 Listo!");
}

main().catch(console.error);