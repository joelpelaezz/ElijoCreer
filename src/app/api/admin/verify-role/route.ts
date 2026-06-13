import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { hasAdminAccess } from "@/lib/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ isAdmin: false });
  }

  const pool = getPool();
  const admin = await hasAdminAccess(session, pool);

  return NextResponse.json({ isAdmin: admin });
}
