"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/skeleton";

interface UserStats {
  totalPredictions: number;
  groupsCount: number;
  matchesWithResult: number;
  exactScore: number;
  outcome: number;
  oneTeamScore: number;
  noHit: number;
  totalPoints: number;
  hitRate: number;
  stageBreakdown: Record<string, number>;
}

export function UserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={stats.totalPredictions} label="Pronósticos" color="text-primary" />
        <StatCard value={stats.matchesWithResult} label="Con resultado" color="text-blue-600" />
        <StatCard value={stats.totalPoints} label="Puntos totales" color="text-green-600" />
        <StatCard
          value={`${stats.hitRate}%`}
          label="Aciertos"
          color={stats.hitRate > 50 ? "text-green-600" : "text-yellow-600"}
        />
      </div>

      {/* Hit breakdown */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
          Desglose de aciertos
        </h3>
        <div className="space-y-2">
          <HitBar label="Resultado exacto" count={stats.exactScore} total={stats.matchesWithResult} color="bg-green-500" />
          <HitBar label="Ganador" count={stats.outcome} total={stats.matchesWithResult} color="bg-blue-500" />
          <HitBar label="Un score" count={stats.oneTeamScore} total={stats.matchesWithResult} color="bg-yellow-500" />
          <HitBar label="Sin acierto" count={stats.noHit} total={stats.matchesWithResult} color="bg-red-400" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function HitBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span>
          {count}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
