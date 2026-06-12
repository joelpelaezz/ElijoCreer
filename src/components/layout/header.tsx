import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getPool } from "@/lib/db";
import { isUserAdmin } from "@/lib/admin";
import { UserDropdown } from "./user-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";

export async function Header() {
  const session = await auth();

  // Check if user is admin
  let isAdmin = false;
  if (session?.user?.id) {
    const pool = getPool();
    isAdmin = await isUserAdmin(session.user.id, pool, session.user.email);
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground">
          Elijo<span className="text-primary">Creer</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 transition-colors"
              title="Panel de Admin"
            >
              Admin
            </Link>
          )}
          <ThemeToggle />
          {session?.user ? (
            <UserDropdown user={session.user} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
