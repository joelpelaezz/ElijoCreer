import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pool = getPool();
  
  // Check auth - get user from header or basic check
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  // Verify admin role
  const adminCheck = await pool.query(
    'SELECT role FROM profiles WHERE id = $1',
    [userId]
  );
  if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const limit = parseInt(searchParams.get("limit") || "50");
  const type = searchParams.get("type"); // all, prediction, group, user

  let query = `
    SELECT 
      ga.id,
      ga.action,
      ga.entity_type,
      ga.entity_id,
      ga.user_id,
      ga.created_at,
      u.name as user_name,
      p.display_name as user_display_name
    FROM group_activity ga
    LEFT JOIN "user" u ON u.id = ga.user_id
    LEFT JOIN profiles p ON p.id = ga.user_id
  `;
  
  const conditions: string[] = [];
  const params: any[] = [];
  
  if (type && type !== "all") {
    conditions.push(`ga.entity_type = $${params.length + 1}`);
    params.push(type);
  }
  
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += ` ORDER BY ga.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  
  const result = await pool.query(query, params);
  
  // Format for display
  const activity = result.rows.map((row: any) => ({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    userId: row.user_id,
    userName: row.user_display_name || row.user_name || `Usuario ${row.user_id?.slice(0, 6)}`,
    createdAt: row.created_at,
    description: formatAction(row.action, row.entity_type),
  }));
  
  return NextResponse.json(activity);
}

function formatAction(action: string, entityType: string): string {
  const actions: Record<string, Record<string, string>> = {
    prediction: {
      create: "creó un pronóstico",
      update: "actualizó su pronóstico",
      delete: "eliminó su pronóstico",
    },
    group: {
      create: "creó un grupo",
      update: "actualizó un grupo",
      join: "se unió al grupo",
      leave: "abandonó el grupo",
    },
    user: {
      register: "se registró",
      login: "inició sesión",
    },
  };
  
  return actions[entityType]?.[action] || `${action} en ${entityType}`;
}