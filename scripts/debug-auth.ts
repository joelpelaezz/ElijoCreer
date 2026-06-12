/**
 * Debug auth tables
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  // Check existing tables
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  
  console.log("📋 Tablas existentes:");
  tables.rows.forEach(t => console.log("  -", t.table_name));

  // Check if we can insert
  console.log("\n🧪 Test insert user...");
  try {
    const userId = crypto.randomUUID();
    await pool.query(`
      INSERT INTO "user" (id, name, email) 
      VALUES ($1, $2, $3)
    `, [userId, 'Test', 'test@test.com']);
    console.log("✅ User insertado");
    
    // Clean up
    await pool.query(`DELETE FROM "user" WHERE email = 'test@test.com'`);
    console.log("✅ Test limpiado");
  } catch (e) {
    console.error("❌ Error:", e.message);
  }

  await pool.end();
}

main().catch(console.error);