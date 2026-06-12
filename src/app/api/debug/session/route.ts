import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
        }
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Error", 
        detail: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null 
      },
      { status: 500 }
    );
  }
}