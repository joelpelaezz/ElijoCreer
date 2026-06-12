/**
 * Update groups table to match schema
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  console.log("🔧 Actualizando tabla groups...");

  // Add missing columns
  await pool.query(`
    ALTER TABLE groups 
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private',
    ADD COLUMN IF NOT EXISTS owner_user_id text,
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW()
  `);
  console.log("✅ Columnas agregadas");

  // Add foreign key if not exists
  await pool.query(`
    ALTER TABLE groups 
    ADD CONSTRAINT fk_owner FOREIGN KEY (owner_user_id) REFERENCES "user"(id) ON DELETE SET NULL
  `).catch(() => console.log("⚠️ FK owner puede existir"));
  console.log("✅ FK owner");

  await pool.end();
  console.log("🎉 Listo!");
}

main().catch(console.error);