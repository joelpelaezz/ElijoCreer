"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton, RankingSkeleton } from "@/components/skeleton";

interface MemberRank {
  userId: string;
  userName: string;
  predictionsCount: number;
  exactScore: number;
  outcome: number;
  oneTeamScore: number;
  totalPoints: number;
}

interface GroupInfo {
  id: string;
  name: string;
  tournament: { name: string } | null;
}

function downloadCSV(sorted: MemberRank[], groupName: string) {
  const headers = [
    "Posición",
    "Participante",
    "Pronósticos",
    "Exactos",
    "Ganador",
    "Un equipo",
    "Puntos",
  ];
  const rows = sorted.map((m, i) => [
    i + 1,
    m.userName || `Usuario ${m.userId.slice(0, 6)}`,
    m.predictionsCount,
    m.exactScore,
    m.outcome,
    m.oneTeamScore,
    m.totalPoints,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ranking-${groupName.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RankingPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [ranking, setRanking] = useState<MemberRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // Info del grupo
      fetch(`/api/groups/${id}`).then((r) => r.json()),
      // Predicciones del grupo
      fetch(`/api/groups/${id}/ranking`).then((r) => {
        if (!r.ok) return [];
        return r.json();
      }),
    ])
      .then(([groupData, rankingData]) => {
        setGroup(groupData);
        setRanking(rankingData || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-40" />
        <RankingSkeleton />
      </div>
    );
  }



  const sorted = [...ranking].sort(
    (a, b) => b.totalPoints - a.totalPoints || b.predictionsCount - a.predictionsCount
  );

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
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-foreground">
            Ranking{group ? ` · ${group.name}` : ""}
          </h1>
          {sorted.length > 0 && (
            <button
              onClick={() => downloadCSV(sorted, group?.name || "ranking")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Exportar CSV
            </button>
          )}
        </div>
        {group?.tournament && (
          <p className="text-muted-foreground text-sm">{group.tournament.name}</p>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">
            leaderboard
          </span>
          <p className="text-muted-foreground">
            El ranking se actualizará cuando los participantes carguen pronósticos y los
            partidos tengan resultados.
          </p>
          <Link
            href={`/groups/${id}/fixture`}
            className="inline-block mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Ir al fixture
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((member, index) => (
            <div
              key={member.userId}
              className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${
                index === 0 ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              {/* Position */}
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {member.userName || `Usuario ${member.userId.slice(0, 6)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.predictionsCount} pronósticos
                </p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                <span title="Resultado exacto">Exacto: {member.exactScore}</span>
                <span title="Ganador acertado">Ganador: {member.outcome}</span>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="text-xl font-bold text-primary">{member.totalPoints}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
