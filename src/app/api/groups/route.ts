import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groups, groupMembers, groupScoringRules } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// GET /api/groups — listar grupos del usuario
export async function GET() {
  try {
    const session = await auth();
    console.log("📊 Session:", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado", session: !!session }, { status: 401 });
    }

    const _db = getDb();
    console.log("📊 User ID:", session.user.id);

    const memberships = await _db
      .select({
        groupId: groupMembers.groupId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        groupName: groups.name,
        groupSlug: groups.slug,
        inviteCode: groups.inviteCode,
        ownerUserId: groups.ownerUserId,
        createdAt: groups.createdAt,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(
        and(
          eq(groupMembers.userId, session.user.id),
          eq(groupMembers.status, "active")
        )
      );

    console.log("📊 Memberships found:", memberships.length);
    return NextResponse.json(memberships);
  } catch (error) {
    console.error("❌ Error in GET /api/groups:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/groups — crear grupo
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const _db = getDb();
    const { name, tournamentId, description } = await request.json();

    if (!name || !tournamentId) {
      return NextResponse.json(
        { error: "Nombre y torneo son requeridos" },
        { status: 400 }
      );
    }

    const groupId = crypto.randomUUID();
    const inviteCode = crypto.randomUUID().slice(0, 8).toUpperCase();

    await _db.insert(groups).values({
      id: groupId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    description: description || null,
      inviteCode,
      ownerUserId: session.user.id,
      tournamentId,
      isActive: true,
    });

    // Agregar owner como miembro admin
    await _db.insert(groupMembers).values({
      groupId,
      userId: session.user.id,
      role: "admin",
      status: "active",
    });

    // Crear reglas de puntaje default para el grupo
    await _db.insert(groupScoringRules).values({
      groupId,
      exactScorePoints: 5,
      outcomePoints: 3,
      oneTeamScorePoints: 0,
      bonusPoints: 0,
      updatedBy: session.user.id,
    });

    return NextResponse.json(
      { success: true, groupId, inviteCode },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Error al crear grupo", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
