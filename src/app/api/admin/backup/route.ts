import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";

/**
 * Escapa un valor SQL para INSERT.
 */
function escapeSQL(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return val.toString();
  if (typeof val === "boolean") return val ? "true" : "false";
  if (val instanceof Date) return `'${val.toISOString()}'`;
  // String: escapar comillas simples duplicándolas
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

// Tablas en orden de dependencia (sin FK → con FK)
const TABLE_ORDER = [
  "teams",
  "tournaments",
  "app_config",
  "verificationToken",
  "user",
  "account",
  "session",
  "profiles",
  "groups",
  "group_members",
  "group_activity",
  "group_scoring_rules",
  "matches",
  "official_results",
  "predictions",
  "prediction_history",
  "prediction_scores",
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pool = getPool();
  const isAdmin = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM "user" WHERE id = $1 AND role = 'admin') AS ok`,
    [session.user.id]
  );
  if (!isAdmin.rows[0]?.ok) {
    return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
  }

  try {
    let sqlLines: string[] = [];
    sqlLines.push("-- ============================================");
    sqlLines.push("-- Backup ElijoCreer — " + new Date().toISOString());
    sqlLines.push("-- ============================================");
    sqlLines.push("");
    sqlLines.push("BEGIN;");
    sqlLines.push("");

    // Obtener columnas de cada tabla
    const colsResult = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    const columnsByTable: Record<string, { name: string; type: string }[]> = {};
    for (const row of colsResult.rows) {
      if (!columnsByTable[row.table_name]) columnsByTable[row.table_name] = [];
      columnsByTable[row.table_name].push({ name: row.column_name, type: row.data_type });
    }

    for (const table of TABLE_ORDER) {
      const cols = columnsByTable[table];
      if (!cols || cols.length === 0) {
        console.warn(`⚠️ Tabla '${table}' no encontrada o sin columnas, se saltea`);
        continue;
      }

      const colNames = cols.map((c) => `"${c.name}"`).join(", ");
      const rows = await pool.query(`SELECT * FROM "${table}"`);

      if (rows.rows.length === 0) {
        sqlLines.push(`-- ${table}: sin datos`);
        sqlLines.push("");
        continue;
      }

      for (const row of rows.rows) {
        const values = cols.map((c) => escapeSQL(row[c.name]));
        sqlLines.push(`INSERT INTO "${table}" (${colNames}) VALUES (${values.join(", ")});`);
      }
      sqlLines.push("");
    }

    sqlLines.push("COMMIT;");
    sqlLines.push("");

    const sql = sqlLines.join("\n");

    return new NextResponse(sql, {
      status: 200,
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="elijocreer-backup-${new Date().toISOString().slice(0, 10)}.sql"`,
      },
    });
  } catch (error: any) {
    console.error("❌ Error en backup:", error);
    return NextResponse.json({ error: error.message || "Error al generar backup" }, { status: 500 });
  }
}
