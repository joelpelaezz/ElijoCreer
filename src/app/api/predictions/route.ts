import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { predictions, predictionHistory, groupMembers, matches } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { logActivity } from "@/lib/activity";

// GET /api/predictions?groupId=X&userId=Y
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const userId = searchParams.get("userId") || session.user.id;

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

  const userPredictions = await _db.query.predictions.findMany({
    where: (p, { eq, and: _and }) =>
      _and(eq(p.groupId, groupId), eq(p.userId, userId)),
  });

  return NextResponse.json(userPredictions);
}

// POST /api/predictions — crear/actualizar predicción
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const _db = getDb();
  const { groupId, matchId, predictedHomeScore, predictedAwayScore } =
    await request.json();

  if (!groupId || !matchId || predictedHomeScore === undefined || predictedAwayScore === undefined) {
    return NextResponse.json(
      { error: "Faltan datos requeridos" },
      { status: 400 }
    );
  }

  // Verificar membresía
  const member = await _db.query.groupMembers.findFirst({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, groupId), eq(gm.userId, session.user.id!)),
  });

  if (!member || member.status !== "active") {
    return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
  }

  // Verificar que el partido no haya empezado
  const match = await _db.query.matches.findFirst({
    where: (m, { eq }) => eq(m.id, matchId),
  });

  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  if (new Date(match.startsAt) < new Date()) {
    return NextResponse.json(
      { error: "El partido ya comenzó" },
      { status: 400 }
    );
  }

  // Upsert: buscar predicción existente
  const existing = await _db.query.predictions.findFirst({
    where: (p, { eq, and: _and }) =>
      _and(
        eq(p.groupId, groupId),
        eq(p.matchId, matchId),
        eq(p.userId, session.user.id!)
      ),
  });

  if (existing) {
    if (existing.isLocked) {
      return NextResponse.json(
        { error: "La predicción está bloqueada" },
        { status: 400 }
      );
    }

    // Guardar historial antes de actualizar.
    // Si la tabla todavía no fue migrada, no bloqueamos el update principal.
    try {
      await _db.insert(predictionHistory).values({
        id: crypto.randomUUID(),
        predictionId: existing.id,
        groupId,
        matchId,
        userId: session.user.id!,
        previousHomeScore: existing.predictedHomeScore,
        previousAwayScore: existing.predictedAwayScore,
        newHomeScore: predictedHomeScore,
        newAwayScore: predictedAwayScore,
        editedBy: session.user.id!,
      });
    } catch (error) {
      console.warn("No se pudo guardar prediction_history", error);
    }

    await _db
      .update(predictions)
      .set({
        predictedHomeScore,
        predictedAwayScore,
        updatedAt: new Date(),
      })
      .where(eq(predictions.id, existing.id));

    logActivity({
      groupId,
      userId: session.user.id!,
      activityType: "prediction_updated",
      referenceId: matchId,
      message: `Actualizó su pronóstico: ${predictedHomeScore}-${predictedAwayScore}`,
    });

    return NextResponse.json({ success: true, updated: true });
  }

  // Crear nueva
  await _db.insert(predictions).values({
    id: crypto.randomUUID(),
    groupId,
    matchId,
    userId: session.user.id,
    predictedHomeScore,
    predictedAwayScore,
  });

  logActivity({
    groupId,
    userId: session.user.id!,
    activityType: "prediction_saved",
    referenceId: matchId,
    message: `Cargó pronóstico: ${predictedHomeScore}-${predictedAwayScore}`,
  });

  return NextResponse.json({ success: true, updated: false }, { status: 201 });
}

// DELETE /api/predictions — borrar predicción (body: { groupId, matchId })
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const _db = getDb();
  const { groupId, matchId } = await request.json();

  if (!groupId || !matchId) {
    return NextResponse.json(
      { error: "groupId y matchId requeridos" },
      { status: 400 }
    );
  }

  // Verificar membresía
  const member = await _db.query.groupMembers.findFirst({
    where: (gm, { eq, and: _and }) =>
      _and(eq(gm.groupId, groupId), eq(gm.userId, session.user.id!)),
  });

  if (!member || member.status !== "active") {
    return NextResponse.json({ error: "No sos miembro" }, { status: 403 });
  }

  // Verificar que el partido no haya empezado
  const match = await _db.query.matches.findFirst({
    where: (m, { eq }) => eq(m.id, matchId),
  });

  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  if (new Date(match.startsAt) < new Date()) {
    return NextResponse.json(
      { error: "El partido ya comenzó, no se puede borrar" },
      { status: 400 }
    );
  }

  // Buscar y borrar
  const existing = await _db.query.predictions.findFirst({
    where: (p, { eq, and: _and }) =>
      _and(
        eq(p.groupId, groupId),
        eq(p.matchId, matchId),
        eq(p.userId, session.user.id!)
      ),
  });

  if (!existing) {
    return NextResponse.json({ error: "Predicción no encontrada" }, { status: 404 });
  }

  await _db.delete(predictions).where(eq(predictions.id, existing.id));

  logActivity({
    groupId,
    userId: session.user.id!,
    activityType: "prediction_deleted",
    referenceId: matchId,
    message: `Eliminó su pronóstico`,
  });

  return NextResponse.json({ success: true });
}
