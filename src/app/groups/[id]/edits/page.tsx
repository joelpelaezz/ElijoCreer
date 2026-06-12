"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/skeleton";

interface EditEntry {
  id: string;
  previousHomeScore: number | null;
  previousAwayScore: number | null;
  newHomeScore: number;
  newAwayScore: number;
  createdAt: string;
  match: {
    matchNumber: number;
    stage: string;
  };
}

export default function EditsPage() {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<EditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/predictions/history?groupId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setHistory(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href={`/groups/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver al grupo
        </Link>
        <h1 className="text-2xl font-bold text-foreground mt-2">
          Historial de ediciones
        </h1>
        <p className="text-muted-foreground text-sm">
          Últimos 50 cambios en tus pronósticos
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">
            history
          </span>
          <p className="text-muted-foreground">
            Todavía no editaste ningún pronóstico.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => {
            const prev =
              entry.previousHomeScore !== null
                ? `${entry.previousHomeScore}-${entry.previousAwayScore}`
                : "—";
            const next = `${entry.newHomeScore}-${entry.newAwayScore}`;
            const stageLabel =
              entry.match.stage === "group"
                ? `Fase grupos · Partido #${entry.match.matchNumber}`
                : entry.match.stage === "round_of_16"
                ? "Octavos"
                : entry.match.stage === "quarter"
                ? "Cuartos"
                : entry.match.stage === "semi"
                ? "Semifinal"
                : entry.match.stage === "final"
                ? "Final"
                : `#${entry.match.matchNumber}`;

            return (
              <div
                key={entry.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {stageLabel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString("es-AR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {prev}
                  </span>
                  <span className="material-symbols-outlined text-sm text-muted-foreground">
                    arrow_forward
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {next}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
