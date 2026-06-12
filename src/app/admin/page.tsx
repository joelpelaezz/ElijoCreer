"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/skeleton";

interface AdminStats {
  users: number;
  groups: number;
  matches: number;
  predictions: number;
  results: number;
  avgGroupSize: string;
  recentUsers: { id: string; name: string; email: string }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("No autorizado");
        return r.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <span className="material-symbols-outlined text-4xl text-destructive mb-3">
          lock
        </span>
        <p className="text-foreground font-medium">Acceso restringido</p>
        <p className="text-muted-foreground text-sm mt-1">
          Necesitás permisos de administrador para acceder.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const cards = [
    {
      label: "Usuarios",
      value: stats?.users ?? 0,
      icon: "person",
      color: "text-blue-500",
    },
    {
      label: "Grupos",
      value: stats?.groups ?? 0,
      icon: "group",
      color: "text-green-500",
    },
    {
      label: "Partidos",
      value: stats?.matches ?? 0,
      icon: "sports_soccer",
      color: "text-orange-500",
    },
    {
      label: "Pronósticos",
      value: stats?.predictions ?? 0,
      icon: "rate_review",
      color: "text-purple-500",
    },
    {
      label: "Resultados",
      value: stats?.results ?? 0,
      icon: "checklist",
      color: "text-teal-500",
    },
    {
      label: "Prom. miembros/grupo",
      value: stats?.avgGroupSize ?? "-",
      icon: "people",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Dashboard global del sistema
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
          >
            <span
              className={`material-symbols-outlined text-3xl ${card.color}`}
            >
              {card.icon}
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Últimos usuarios registrados
        </h2>
        {stats?.recentUsers && stats.recentUsers.length > 0 ? (
          <div className="space-y-2">
            {stats.recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {u.name || "Sin nombre"}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin usuarios aún</p>
        )}
      </div>
    </div>
  );
}
