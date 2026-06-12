import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { UserDropdown } from "./user-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground">
          Elijo<span className="text-primary">Creer</span>
        </Link>

        <nav className="flex items-center gap-2">
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
