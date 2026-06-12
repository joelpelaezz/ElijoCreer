/**
 * Add auth tables to Vercel DB
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function main() {
  console.log("🔐 Agregando tablas de autenticación...\n");

  await pool.query(`
    -- users table
    CREATE TABLE IF NOT EXISTS "user" (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      name text,
      email text UNIQUE,
      "emailVerified" timestamp with time zone,
      image text
    );

    -- accounts table
    CREATE TABLE IF NOT EXISTS "account" (
      "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      type text NOT NULL,
      provider text NOT NULL,
      "providerAccountId" text NOT NULL,
      refresh_token text,
      access_token text,
      expires_at integer,
      token_type text,
      scope text,
      id_token text,
      "session_state" text,
      PRIMARY KEY (provider, "providerAccountId")
    );

    -- sessions table
    CREATE TABLE IF NOT EXISTS "session" (
      "sessionToken" text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      expires timestamp with time zone NOT NULL
    );

    -- verification tokens table
    CREATE TABLE IF NOT EXISTS "VerificationToken" (
      identifier text NOT NULL,
      token text NOT NULL,
      expires timestamp with time zone NOT NULL,
      PRIMARY KEY (identifier, token)
    );

    -- profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
      "displayName" text,
      role text DEFAULT 'user',
      avatar_url text,
      created_at timestamp with time zone DEFAULT NOW()
    );
  `);

  console.log("✅ Tablas de auth creadas\n");

  await pool.end();
  console.log("🎉 Listo!");
}

main().catch(console.error);