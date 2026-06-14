import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pool = getPool();
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Archivo SQL requerido" }, { status: 400 });
    }

    const sql = await file.text();

    // Validar BEGIN/COMMIT (saltando comentarios)
    const sqlLines = sql
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("--"));
    const sqlTrimmed = sqlLines.join("\n").trim();
    if (!sqlTrimmed.toUpperCase().startsWith("BEGIN")) {
      return NextResponse.json(
        { error: "El archivo SQL debe comenzar con BEGIN" },
        { status: 400 }
      );
    }
    if (!sqlTrimmed.toUpperCase().includes("COMMIT")) {
      return NextResponse.json(
        { error: "El archivo SQL debe terminar con COMMIT" },
        { status: 400 }
      );
    }

    // Extraer column names de los INSERTs por tabla
    // Formato: INSERT INTO "tabla" ("col1", "col2", ...) VALUES ...
    const insertPattern = /INSERT\s+INTO\s+"?(\w+)"?\s*\(([^)]+)\)\s*VALUES/gi;
    const backupColumns: Record<string, string[]> = {};
    let match;
    while ((match = insertPattern.exec(sql)) !== null) {
      const table = match[1];
      const cols = match[2]
        .split(",")
        .map((c) => c.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
      if (!backupColumns[table]) backupColumns[table] = [];
      for (const col of cols) {
        if (!backupColumns[table].includes(col)) {
          backupColumns[table].push(col);
        }
      }
    }

    const client = await pool.connect();
    try {
      // 1. Detectar y agregar columnas faltantes
      const addedColumns: string[] = [];
      for (const [table, cols] of Object.entries(backupColumns)) {
        const localCols = await client.query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_schema = 'public' AND table_name = $1`,
          [table]
        );
        const localColNames = localCols.rows.map((r: any) => r.column_name);

        for (const col of cols) {
          if (!localColNames.includes(col)) {
            // Determinar tipo por naming heuristic
            let dataType = "text";
            if (col.endsWith("_at") || col.endsWith("At") || col.toLowerCase().includes("time")) {
              dataType = "timestamp without time zone";
            } else if (col.endsWith("_id") || col.endsWith("Id") || col.endsWith("_by") || col.endsWith("By")) {
              dataType = "text";
            } else if (col.toLowerCase().includes("score") || col.toLowerCase().includes("points") || col.toLowerCase().includes("number")) {
              dataType = "integer";
            } else if (col.toLowerCase().includes("active") || col.toLowerCase().includes("locked") || col.toLowerCase().includes("enabled") || col.toLowerCase().includes("late") || col.toLowerCase().includes("hit_")) {
              dataType = "boolean";
            }
            await client.query(
              `ALTER TABLE "${table}" ADD COLUMN "${col}" ${dataType}`
            );
            addedColumns.push(`${table}.${col} (${dataType})`);
            console.log(`➕ Columna agregada: ${table}.${col} (${dataType})`);
          }
        }
      }

      // 2. Extraer nombres de tabla para truncar
      const getTableName = (stmt: string): string => {
        const m = stmt.match(/INSERT\s+INTO\s+"?(\w+)"?/i);
        return m ? m[1] : "";
      };

      const tableMatches = sql.match(/INSERT\s+INTO\s+"?(\w+)"?\s*\(/gi);
      const tables = [
        ...new Set(
          (tableMatches || []).map(getTableName).filter(Boolean) as string[]
        ),
      ];

      // 3. Truncar tablas (orden hijos primero)
      const TRUNCATE_ORDER = [
        "prediction_scores",
        "prediction_history",
        "predictions",
        "official_results",
        "matches",
        "group_scoring_rules",
        "group_activity",
        "group_members",
        "groups",
        "profiles",
        "session",
        "account",
        "user",
        "verificationToken",
        "app_config",
        "teams",
        "tournaments",
      ];

      const truncPriority: Record<string, number> = {};
      TRUNCATE_ORDER.forEach((t, i) => (truncPriority[t] = i));
      const sortedTables = [...tables].sort(
        (a, b) => (truncPriority[a] ?? 999) - (truncPriority[b] ?? 999)
      );

      // TRUNCATE se hace fuera de transacción (autocommit), 
      // luego el backup SQL maneja su propia transacción
      for (const table of sortedTables) {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
      }

      // 4. Ejecutar el backup SQL completo (tiene BEGIN/COMMIT propio)
      await client.query(sql);
      console.log("✅ Restore completado exitosamente");

      return NextResponse.json({
        message: "✅ Restore completado exitosamente",
        columnsAdded: addedColumns.length > 0 ? addedColumns : undefined,
        tablesTruncated: sortedTables.length,
      });
    } catch (err: any) {
      console.error("❌ Error durante restore:", err);
      return NextResponse.json(
        { error: `Error en restore: ${err.message}` },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("❌ Error en restore:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar restore" },
      { status: 500 }
    );
  }
}
