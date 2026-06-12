import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { GroupList } from "./group-list";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bienvenido, {session.user.name || "Usuario"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tus grupos y predicciones
          </p>
        </div>
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary hover:bg-primary/30 transition-colors"
          title="Mi perfil"
        >
          {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/groups/new"
          className="flex items-center gap-4 p-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-3xl">add_circle</span>
          <div>
            <p className="font-bold">Crear Grupo</p>
            <p className="text-sm opacity-90">Armá tu propio grupo</p>
          </div>
        </Link>
        <Link
          href="/dashboard/join"
          className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border text-foreground hover:bg-accent transition-colors"
        >
          <span className="material-symbols-outlined text-3xl text-primary">
            group_add
          </span>
          <div>
            <p className="font-bold">Unirse a Grupo</p>
            <p className="text-sm text-muted-foreground">
              Con código de invitación
            </p>
          </div>
        </Link>
      </div>

      {/* Groups */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Mis Grupos</h2>
        <Suspense
          fallback={
            <p className="text-muted-foreground text-sm">
              Cargando grupos...
            </p>
          }
        >
          <GroupList userId={session.user.id} />
        </Suspense>
      </section>
    </div>
  );
}
