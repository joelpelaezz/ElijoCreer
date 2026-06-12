/**
 * Debug register flow
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  const userId = crypto.randomUUID();
  const email = "debug@test.com";
  const name = "Debug";

  console.log("🧪 Test register completo...\n");

  try {
    // Insert user
    console.log("1. Insert user...");
    await pool.query(`
      INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)
    `, [userId, name, email]);
    console.log("   ✅ User created");

    // Insert account
    console.log("2. Insert account...");
    await pool.query(`
      INSERT INTO account ("userId", type, provider, "providerAccountId", access_token)
      VALUES ($1, 'credentials', 'credentials', $2, 'hash')
    `, [userId, userId]);
    console.log("   ✅ Account created");

    // Insert profile
    console.log("3. Insert profile...");
    await pool.query(`
      INSERT INTO profiles (id, "displayName", role) VALUES ($1, $2, 'user')
    `, [userId, name]);
    console.log("   ✅ Profile created");

    console.log("\n✅ Registro exitoso!");

    // Clean up
    await pool.query(`DELETE FROM profiles WHERE id = $1`, [userId]);
    await pool.query(`DELETE FROM account WHERE "userId" = $1`, [userId]);
    await pool.query(`DELETE FROM "user" WHERE id = $1`, [userId]);
    console.log("🧹 Limpiado");

  } catch (e) {
    console.error("❌ Error:", e.message);
  }

  await pool.end();
}

main().catch(console.error);