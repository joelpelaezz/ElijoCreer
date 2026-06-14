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

    // Validar que tenga BEGIN/COMMIT (saltando comentarios)
    const sqlTrimmed = sql
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("--"))
      .join("\n")
      .trim();
    if (!sqlTrimmed.toUpperCase().startsWith("BEGIN")) {
      return NextResponse.json(
        { error: "El archivo SQL debe comenzar con BEGIN (líneas de comentario al inicio son válidas)" },
        { status: 400 }
      );
    }
    if (!sqlTrimmed.toUpperCase().includes("COMMIT")) {
      return NextResponse.json(
        { error: "El archivo SQL debe terminar con COMMIT" },
        { status: 400 }
      );
    }

    // Extraer nombres de tabla de los INSERTs para truncar
    const tableMatches = sql.match(/INSERT\s+INTO\s+"?(\w+)"?\s*\(/gi);
    if (!tableMatches || tableMatches.length === 0) {
      return NextResponse.json({ error: "No se encontraron INSERTs" }, { status: 400 });
    }

    const getTableName = (stmt: string): string => {
      const match = stmt.match(/INSERT\s+INTO\s+"?(\w+)"?/i);
      return match ? match[1] : "";
    };

    const tables = [
      ...new Set(
        tableMatches.map(getTableName).filter(Boolean) as string[]
      ),
    ];

    // Orden de truncado: hijos primero (orden inverso al de dependencia)
    const TABLE_ORDER_TRUNCATE = [
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

    const tableTruncatePriority: Record<string, number> = {};
    TABLE_ORDER_TRUNCATE.forEach((t, i) => {
      tableTruncatePriority[t] = i;
    });

    const sortedTables = [...tables].sort(
      (a, b) =>
        (tableTruncatePriority[a] ?? 999) - (tableTruncatePriority[b] ?? 999)
    );

    const client = await pool.connect();
    try {
      // Truncar todo en orden (hijos primero) sin transacción anidada
      for (const table of sortedTables) {
        console.log(`🗑️  Truncando "${table}" CASCADE`);
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
      }

      // Ejecutar el SQL completo (ya tiene BEGIN/COMMIT y orden correcto)
      console.log("📥 Ejecutando backup SQL...");
      await client.query(sql);
      console.log("✅ Restore completado exitosamente");

      return NextResponse.json({
        message: "✅ Restore completado exitosamente",
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
    return NextResponse.json({ error: error.message || "Error al procesar restore" }, { status: 500 });
  }
}
