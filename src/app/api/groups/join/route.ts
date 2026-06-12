import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groups, groupMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const _db = getDb();
  const { inviteCode } = await request.json();

  if (!inviteCode) {
    return NextResponse.json(
      { error: "Código de invitación requerido" },
      { status: 400 }
    );
  }

  // Buscar grupo por código
  const group = await _db.query.groups.findFirst({
    where: (groups, { eq }) => eq(groups.inviteCode, inviteCode.toUpperCase()),
  });

  if (!group) {
    return NextResponse.json(
      { error: "Código de invitación inválido" },
      { status: 404 }
    );
  }

  if (!group.isActive) {
    return NextResponse.json(
      { error: "El grupo ya no está activo" },
      { status: 400 }
    );
  }

  // Verificar si ya es miembro
  const existing = await _db.query.groupMembers.findFirst({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, group.id), eq(gm.userId, session.user.id!)),
  });

  if (existing) {
    if (existing.status === "active") {
      return NextResponse.json(
        { error: "Ya sos miembro de este grupo" },
        { status: 409 }
      );
    }
    // Reactivar si estaba inactivo
    await _db
      .update(groupMembers)
      .set({ status: "active", joinedAt: new Date() })
      .where(eq(groupMembers.id, existing.id));
    return NextResponse.json({ success: true, groupId: group.id });
  }

  // Unirse al grupo
  await _db.insert(groupMembers).values({
    id: crypto.randomUUID(),
    groupId: group.id,
    userId: session.user.id,
    role: "member",
    status: "active",
  });

  logActivity({
    groupId: group.id,
    userId: session.user.id!,
    activityType: "member_joined",
    message: "Se unió al grupo",
  });

  return NextResponse.json(
    { success: true, groupId: group.id },
    { status: 201 }
  );
}
