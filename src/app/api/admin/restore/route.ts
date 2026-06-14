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

    // Validación básica: debe contener BEGIN y COMMIT
    // Saltamos líneas de comentarios y vacías
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

    // Separar sentencias por ";"
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const stmt of statements) {
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
      statements: statements.length,
    });
  } catch (error: any) {
    console.error("❌ Error en restore:", error);
    return NextResponse.json({ error: error.message || "Error al procesar restore" }, { status: 500 });
  }
}
