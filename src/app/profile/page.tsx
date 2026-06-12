"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserStats } from "@/components/user-stats";

interface ProfileData {
  user: { id: string; email: string; name: string | null };
  groupsCount: number;
  groups: { groupId: string; groupName: string; role: string }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await signOut({ redirect: true, callbackUrl: "/" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">No pudimos cargar tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
          {(profile.user.name || profile.user.email || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {profile.user.name || "Usuario"}
          </h1>
          <p className="text-sm text-muted-foreground">{profile.user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Mis estadísticas
        </h2>
        <UserStats />
      </div>

      {/* Groups */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Mis grupos
        </h2>
        <div className="divide-y divide-border border border-border rounded-xl">
          {profile.groups.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Todavía no estás en ningún grupo.
            </p>
          ) : (
            profile.groups.map((g) => (
              <Link
                key={g.groupId}
                href={`/groups/${g.groupId}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  {g.groupName}
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {g.role}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="block w-full text-center px-4 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
