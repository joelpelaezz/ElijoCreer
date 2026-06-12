import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";

export async function GET() {
  const _db = getDb();
  const all = await _db
    .select({
      id: tournaments.id,
      name: tournaments.name,
      slug: tournaments.slug,
      year: tournaments.year,
      status: tournaments.status,
    })
    .from(tournaments)
    .orderBy(tournaments.year);

  return NextResponse.json(all);
}
