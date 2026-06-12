import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groupActivity, profiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and, desc } from "drizzle-orm";

// GET /api/activity?groupId=X&limit=20
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!groupId) {
    return NextResponse.json({ error: "groupId requerido" }, { status: 400 });
  }

  const _db = getDb();

  // Verificar membresía
  const member = await _db.query.groupMembers.findFirst({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, groupId), eq(gm.userId, session.user.id!)),
  });

  if (!member || member.status !== "active") {
    return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
  }

  // Traer actividad enriquecida con displayName
  const activities = await _db
    .select({
      id: groupActivity.id,
      activityType: groupActivity.activityType,
      referenceId: groupActivity.referenceId,
      message: groupActivity.message,
      createdAt: groupActivity.createdAt,
      userId: groupActivity.userId,
      displayName: profiles.displayName,
    })
    .from(groupActivity)
    .leftJoin(profiles, eq(groupActivity.userId, profiles.id))
    .where(eq(groupActivity.groupId, groupId))
    .orderBy(desc(groupActivity.createdAt))
    .limit(limit);

  return NextResponse.json(activities);
}
