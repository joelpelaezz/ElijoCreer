import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";

// GET /api/groups/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const pool = getPool();

    // Check membership
    const memberResult = await pool.query(
      `SELECT * FROM "group_members" WHERE "group_id" = $1 AND "user_id" = $2 AND status = 'active'`,
      [id, session.user.id]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
    }

    // Get group
    const groupResult = await pool.query(
      `SELECT g.*, t.name as tournament_name, t.id as tournament_id
       FROM groups g
       JOIN tournaments t ON t.id = g.tournament_id
       WHERE g.id = $1`,
      [id]
    );

    if (groupResult.rows.length === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    const group = groupResult.rows[0];

    // Get members
    const membersResult = await pool.query(
      `SELECT gm.*, p.display_name 
       FROM "group_members" gm
       JOIN profiles p ON p.id = gm.user_id
       WHERE gm.group_id = $1 AND gm.status = 'active'`,
      [id]
    );

    // Get scoring rules
    const rulesResult = await pool.query(
      `SELECT * FROM "group_scoring_rules" WHERE group_id = $1`,
      [id]
    );

    return NextResponse.json({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      inviteCode: group.invite_code,
      ownerUserId: group.owner_user_id,
      isActive: group.is_active,
      createdAt: group.created_at,
      tournament: {
        id: group.tournament_id,
        name: group.tournament_name,
      },
      members: membersResult.rows.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at,
        displayName: m.display_name,
      })),
      scoringRules: rulesResult.rows[0] || null,
    });
  } catch (error) {
    console.error("Error in group API:", error);
    return NextResponse.json(
      { error: "Error fetching group", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}