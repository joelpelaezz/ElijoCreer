import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Cliente de base de datos.
 *
 * Usa `pg` (node-postgres) + `drizzle-orm/node-postgres`.
 * La conexión se crea de forma lazy para evitar errores durante el build.
 *
 * USAGE:
 *   import { getDb } from "@/lib/db";
 *   const db = getDb();
 *   await db.query.users.findFirst(...)
 */
let _db: ReturnType<typeof createClient> | null = null;
let _pool: Pool | null = null;

function createClient() {
  _pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  return drizzle(_pool, { schema });
}

export function getDb() {
  if (!_db) {
    _db = createClient();
  }
  return _db;
}

export function getPool() {
  if (!_pool) {
    createClient();
  }
  return _pool!;
}
