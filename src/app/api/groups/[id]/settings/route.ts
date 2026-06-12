import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { groups, groupScoringRules } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";

// GET /api/groups/:id/settings
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

  const group = await _db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, id),
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  if (group.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Solo el dueño puede ver settings" }, { status: 403 });
  }

  const rulesResult = await _db
    .select()
    .from(groupScoringRules)
    .where(eq(groupScoringRules.groupId, id))
    .limit(1);

  return NextResponse.json({
    name: group.name,
    description: group.description,
    isActive: group.isActive,
    rules: rulesResult[0] || null,
  });
}

// PUT /api/groups/:id/settings
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const _db = getDb();

  const group = await _db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, id),
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  if (group.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Solo el dueño puede cambiar settings" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, exactScorePoints, outcomePoints, oneTeamScorePoints, bonusPoints } = body;

  // Actualizar grupo
  const groupUpdate: Record<string, any> = {};
  if (name !== undefined) groupUpdate.name = name;
  if (description !== undefined) groupUpdate.description = description;

  if (Object.keys(groupUpdate).length > 0) {
    await _db.update(groups).set(groupUpdate).where(eq(groups.id, id));
  }

  // Actualizar/crear reglas
  const ruleUpdate: Record<string, any> = {};
  if (exactScorePoints !== undefined) ruleUpdate.exactScorePoints = exactScorePoints;
  if (outcomePoints !== undefined) ruleUpdate.outcomePoints = outcomePoints;
  if (oneTeamScorePoints !== undefined) ruleUpdate.oneTeamScorePoints = oneTeamScorePoints;
  if (bonusPoints !== undefined) ruleUpdate.bonusPoints = bonusPoints;

  if (Object.keys(ruleUpdate).length > 0) {
    ruleUpdate.updatedBy = session.user.id;
    ruleUpdate.updatedAt = new Date();

    const existing = await _db
      .select({ id: groupScoringRules.id })
      .from(groupScoringRules)
      .where(eq(groupScoringRules.groupId, id))
      .limit(1);

    if (existing.length > 0) {
      await _db.update(groupScoringRules).set(ruleUpdate).where(eq(groupScoringRules.groupId, id));
    } else {
      const newRules = {
        groupId: id,
        updatedBy: session.user.id,
        updatedAt: new Date(),
        exactScorePoints: exactScorePoints ?? 5,
        outcomePoints: outcomePoints ?? 3,
        oneTeamScorePoints: oneTeamScorePoints ?? 0,
        bonusPoints: bonusPoints ?? 0,
      };
      await _db.insert(groupScoringRules).values(newRules);
    }
  }

  return NextResponse.json({ success: true });
}
