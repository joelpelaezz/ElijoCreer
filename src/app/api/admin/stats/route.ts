import { NextResponse } from "next/server";
import { getDb, getPool } from "@/lib/db";
import { users, groups, groupMembers, matches, predictions, officialResults } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";
import { count } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pool = getPool();
  if (!(await hasAdminAccess(session, pool))) {
    return NextResponse.json({ error: "No autorizado - se requiere rol admin" }, { status: 403 });
  }

  const _db = getDb();

  try {

  const [userCount] = await _db.select({ value: count() }).from(users);
  const [groupCount] = await _db.select({ value: count() }).from(groups);
  const [matchCount] = await _db.select({ value: count() }).from(matches);
  const [predictionCount] = await _db.select({ value: count() }).from(predictions);
  const [resultCount] = await _db.select({ value: count() }).from(officialResults);

  // Grupos por tamaño
  const groupSizeStats = await _db
    .select({
      groupId: groupMembers.groupId,
      size: count(),
    })
    .from(groupMembers)
    .groupBy(groupMembers.groupId) as { groupId: string; size: number }[];

  const avgGroupSize =
    groupSizeStats.length > 0
      ? (groupSizeStats.reduce((a, b) => a + b.size, 0) / groupSizeStats.length).toFixed(1)
      : "0";

  // Últimos usuarios registrados (sin createdAt en tabla Auth.js, retornamos lo que hay)
  const recentUsers = await _db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .limit(10);

  return NextResponse.json({
    users: Number(userCount?.value || 0),
    groups: Number(groupCount?.value || 0),
    matches: Number(matchCount?.value || 0),
    predictions: Number(predictionCount?.value || 0),
    results: Number(resultCount?.value || 0),
    avgGroupSize,
    recentUsers,
  });
  } catch (error) {
    console.error("❌ Error in GET /api/admin/stats:", error);
    return NextResponse.json(
      {
        error: "Error al obtener estadísticas",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
