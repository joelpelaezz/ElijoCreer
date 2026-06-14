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

    // Saltamos líneas de comentarios y vacías para validar
    const sqlLines = sql.split("\n").filter(
      (line) => line.trim() !== "" && !line.trim().startsWith("--")
    );
    const normalized = sqlLines.join("\n").trim();
    if (!normalized.toUpperCase().startsWith("BEGIN")) {
      return NextResponse.json(
        { error: "El archivo SQL debe comenzar con BEGIN (líneas de comentario son válidas antes)" },
        { status: 400 }
      );
    }
    if (!normalized.toUpperCase().includes("COMMIT")) {
      return NextResponse.json(
        { error: "El archivo SQL debe terminar con COMMIT" },
        { status: 400 }
      );
    }

    // Extraemos las tablas de los INSERT para truncarlas antes
    const tableMatches = sql.match(/INSERT\s+INTO\s+"?(\w+)"?\s*\(/gi);
    if (!tableMatches || tableMatches.length === 0) {
      return NextResponse.json({ error: "No se encontraron INSERTs en el archivo" }, { status: 400 });
    }

    const tables = [...new Set(
      tableMatches.map((m) => {
        const match = m.match(/INSERT\s+INTO\s+"?(\w+)"?/i);
        return match ? match[1] : null;
      }).filter(Boolean) as string[]
    )];

    // Separar sentencias por ";"
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Truncar todas las tablas involucradas en orden inverso (CASCADE respeta FKs)
      for (const table of tables.toReversed()) {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
      }

      // Ejecutar INSERTs
      for (const stmt of statements) {
        if (!stmt.toUpperCase().startsWith("INSERT")) continue;
        await client.query(stmt);
      }

      await client.query("COMMIT");
      console.log("✅ Restore completado exitosamente");
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("❌ Error durante restore, rollback ejecutado:", err);
      return NextResponse.json(
        { error: `Error en restore: ${err.message}` },
        { status: 500 }
      );
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: "✅ Restore completado exitosamente",
      tables: tables.length,
      statements: statements.length,
    });
  } catch (error: any) {
    console.error("❌ Error en restore:", error);
    return NextResponse.json({ error: error.message || "Error al procesar restore" }, { status: 500 });
  }
}
