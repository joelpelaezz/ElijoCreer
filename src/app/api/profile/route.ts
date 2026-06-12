import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groupMembers, groups } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and } from "drizzle-orm";

// GET /api/profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const _db = getDb();

  // Obtener grupos del usuario
  const memberships = await _db
    .select({
      groupId: groupMembers.groupId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      groupName: groups.name,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, session.user.id!),
        eq(groupMembers.status, "active")
      )
    );

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    groupsCount: memberships.length,
    groups: memberships,
  });
}
