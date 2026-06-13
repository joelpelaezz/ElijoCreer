import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";
import fs from "fs";
import path from "path";

const SQL_FILES = ["clear-data.sql", "init.sql", "matches-seed.sql"];

/**
 * Filtra líneas de meta-comandos de psql (ej: \echo, \i, etc.)
 * que NO son SQL válido y rompen en pool.query().
 */
function stripPsqlMetaCommands(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("\\"))
    .join("\n");
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pool = getPool();
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
  }

  const sqlDir = path.join(process.cwd(), "scripts/sql");

  try {
    // Ejecutar cada SQL file secuencialmente
    for (const file of SQL_FILES) {
      const filePath = path.join(sqlDir, file);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ SQL file not found: ${filePath}`);
        return NextResponse.json(
          { error: `Archivo no encontrado: ${file}` },
          { status: 500 }
        );
      }

      const raw = fs.readFileSync(filePath, "utf-8");
      const sql = stripPsqlMetaCommands(raw);
      console.log(`⚙️  Ejecutando ${file} (${sql.length} bytes, stripped psql meta)...`);
      await pool.query(sql);
      console.log(`✅ ${file} ejecutado correctamente`);
    }

    return NextResponse.json({
      success: true,
      message: "Sistema inicializado correctamente",
    });
  } catch (error) {
    console.error("❌ Error al inicializar el sistema:", error);
    return NextResponse.json(
      {
        error: "Error al inicializar el sistema",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
