import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";

export async function GET(request: Request) {
  const pool = getPool();
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // users, groups, predictions, matches

  try {
    let data: any[] = [];
    let filename = "";
    let headers = "";

    switch (type) {
      case "users": {
        const result = await pool.query(`
          SELECT 
            u.id,
            u.name,
            u.email,
            p.role,
            p.display_name,
            p.country,
            p.created_at as profile_created
          FROM "user" u
          LEFT JOIN profiles p ON p.id = u.id
          ORDER BY u.email
        `);
        data = result.rows;
        filename = "usuarios.csv";
        headers = "ID,Email,Nombre,Rol,Nombre Display,País,Creado";
        break;
      }

      case "groups": {
        const result = await pool.query(`
          SELECT 
            g.id,
            g.name,
            g.slug,
            g.description,
            t.name as tournament,
            g.invite_code,
            g.visibility,
            g.created_at,
            (SELECT count(*) FROM group_members WHERE group_id = g.id)::int as members
          FROM groups g
          LEFT JOIN tournaments t ON t.id = g.tournament_id
          ORDER BY g.created_at DESC
        `);
        data = result.rows;
        filename = "grupos.csv";
        headers = "ID,Nombre,Slug,Descripción,Torneo,Código,Visibilidad,Miembros,Creado";
        break;
      }

      case "predictions": {
        const result = await pool.query(`
          SELECT 
            p.id,
            p.group_id,
            g.name as group_name,
            p.user_id,
            p.match_id,
            m.home_score as match_home,
            m.away_score as match_away,
            p.predicted_home_score,
            p.predicted_away_score,
            p.is_locked,
            p.created_at,
            p.updated_at
          FROM predictions p
          LEFT JOIN groups g ON g.id = p.group_id
          LEFT JOIN matches m ON m.id = p.match_id
          ORDER BY p.created_at DESC
          LIMIT 10000
        `);
        data = result.rows;
        filename = "pronosticos.csv";
        headers = "ID,Grupo ID,Grupo,Usuario,Partido,Resultado Real,Predicción,Locked,Creado,Actualizado";
        break;
      }

      case "matches": {
        const result = await pool.query(`
          SELECT 
            m.id,
            m.stage,
            m.match_number,
            m.round_label,
            ht.name as home_team,
            at.name as away_team,
            m.home_score,
            m.away_score,
            m.starts_at,
            m.status,
            m.venue
          FROM matches m
          LEFT JOIN teams ht ON ht.id = m.home_team_id
          LEFT JOIN teams at ON at.id = m.away_team_id
          ORDER BY m.starts_at
        `);
        data = result.rows;
        filename = "partidos.csv";
        headers = "ID,Fase,Número,Ronda,Local,Visitante,Score Local,Score Visitante,Fecha,Estado,Estadio";
        break;
      }

      default:
        return NextResponse.json({ error: "Tipo no válido. Usa: users, groups, predictions, matches" }, { status: 400 });
    }

    // Convert to CSV
    const csvRows = [headers];
    for (const row of data) {
      const values = Object.values(row).map((v: any) => {
        if (v === null || v === undefined) return "";
        const str = String(v);
        // Escape quotes and wrap in quotes if contains comma
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(values.join(","));
    }

    const csv = csvRows.join("\n");
    
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 });
  }
}
