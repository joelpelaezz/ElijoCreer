import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  groups,
  groupMembers,
  groupScoringRules,
  profiles,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const _db = getDb();

  // Verificar que el usuario sea miembro
  const membership = await _db.query.groupMembers.findFirst({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, id), eq(gm.userId, session.user.id)),
  });

  if (!membership || membership.status !== "active") {
    return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
  }

  // Obtener grupo
  const group = await _db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, id),
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  // Obtener miembros con displayName
  const members = await _db
    .select({
      id: groupMembers.id,
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      displayName: profiles.displayName,
    })
    .from(groupMembers)
    .leftJoin(profiles, eq(groupMembers.userId, profiles.id))
    .where(
      and(eq(groupMembers.groupId, id), eq(groupMembers.status, "active"))
    );

  // Obtener reglas de puntaje
  const rules = await _db.query.groupScoringRules.findFirst({
    where: (r, { eq }) => eq(r.groupId, id),
  });

  // Obtener torneo
  const tournament = await _db.query.tournaments.findFirst({
    where: (t, { eq }) => eq(t.id, group.tournamentId),
  });

  return NextResponse.json({
    ...group,
    tournament,
    members,
    rules,
    currentUserId: session.user.id,
    isOwner: group.ownerUserId === session.user.id,
    membershipRole: membership.role,
  });
}
