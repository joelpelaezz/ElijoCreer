import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, groups, groupMembers, matches, predictions, officialResults } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { isAdmin } from "@/lib/admin";
import { count } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const _db = getDb();

  const [userCount] = await _db.select({ count: count() }).from(users);
  const [groupCount] = await _db.select({ count: count() }).from(groups);
  const [matchCount] = await _db.select({ count: count() }).from(matches);
  const [predictionCount] = await _db.select({ count: count() }).from(predictions);
  const [resultCount] = await _db.select({ count: count() }).from(officialResults);

  // Grupos por tamaño
  const groupSizeStats = await _db
    .select({
      groupId: groupMembers.groupId,
      size: count(),
    })
    .from(groupMembers)
    .groupBy(groupMembers.groupId);

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
    users: userCount.count,
    groups: groupCount.count,
    matches: matchCount.count,
    predictions: predictionCount.count,
    results: resultCount.count,
    avgGroupSize,
    recentUsers,
  });
}
