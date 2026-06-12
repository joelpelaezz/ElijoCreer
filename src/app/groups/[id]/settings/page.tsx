"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface SettingsData {
  name: string;
  description: string | null;
  isActive: boolean;
  rules: {
    exactScorePoints: number;
    outcomePoints: number;
    oneTeamScorePoints: number;
    bonusPoints: number;
  } | null;
}

export default function GroupSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exactScorePoints, setExactScorePoints] = useState(5);
  const [outcomePoints, setOutcomePoints] = useState(3);
  const [oneTeamScorePoints, setOneTeamScorePoints] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);

  useEffect(() => {
    fetch(`/api/groups/${id}/settings`)
      .then((r) => {
        if (r.status === 403) {
          router.push(`/groups/${id}`);
          return null;
        }
        return r.json();
      })
      .then((data: SettingsData | null) => {
        if (!data) return;
        setName(data.name);
        setDescription(data.description || "");
        if (data.rules) {
          setExactScorePoints(data.rules.exactScorePoints);
          setOutcomePoints(data.rules.outcomePoints);
          setOneTeamScorePoints(data.rules.oneTeamScorePoints);
          setBonusPoints(data.rules.bonusPoints);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/groups/${id}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        exactScorePoints,
        outcomePoints,
        oneTeamScorePoints,
        bonusPoints,
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "✅ Configuración guardada" });
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: `❌ ${err.error || "Error al guardar"}` });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link
          href={`/groups/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver al grupo
        </Link>
        <h1 className="text-2xl font-bold text-foreground mt-2">
          Configuración del grupo
        </h1>
      </div>

      {message && (
        <div
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Información básica */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Información
          </h2>
          <div className="space-y-4 bg-card border border-border rounded-xl p-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nombre del grupo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:ring-0 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:ring-0 outline-none resize-none"
              />
            </div>
          </div>
        </section>

        {/* Reglas de puntaje */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Reglas de puntaje
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-xs text-muted-foreground mb-1">
                Resultado exacto
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={exactScorePoints}
                onChange={(e) => setExactScorePoints(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-foreground text-center text-lg font-bold focus:border-primary focus:ring-0 outline-none"
              />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-xs text-muted-foreground mb-1">
                Ganador
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={outcomePoints}
                onChange={(e) => setOutcomePoints(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-foreground text-center text-lg font-bold focus:border-primary focus:ring-0 outline-none"
              />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-xs text-muted-foreground mb-1">
                Un score
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={oneTeamScorePoints}
                onChange={(e) => setOneTeamScorePoints(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-foreground text-center text-lg font-bold focus:border-primary focus:ring-0 outline-none"
              />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-xs text-muted-foreground mb-1">
                Bonus
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={bonusPoints}
                onChange={(e) => setBonusPoints(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-foreground text-center text-lg font-bold focus:border-primary focus:ring-0 outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Puntos por: acertar el resultado exacto, acertar el ganador/empate, acertar el score de un equipo, y bonus adicional.
          </p>
        </section>

        {/* Resultados */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Resultados
          </h2>
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Cargá los scores oficiales de los partidos para que se calculen los puntos de los participantes.
            </p>
            <Link
              href={`/groups/${id}/results`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">sports_soccer</span>
              Cargar resultados
            </Link>
            <div className="border-t border-border pt-3">
              <p className="text-sm text-muted-foreground mb-3">
                Si cambiás las reglas de puntaje, los partidos con resultado se vuelven a calcular con los nuevos valores.
              </p>
              <button
                onClick={async () => {
                  setRecalculating(true);
                  try {
                    const res = await fetch(`/api/groups/${id}/recalculate`, {
                      method: "POST",
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setMessage({
                        type: "success",
                        text: data.message || "Puntajes recalculados",
                      });
                    } else {
                      setMessage({
                        type: "error",
                        text: data.error || "Error al recalcular",
                      });
                    }
                  } catch {
                    setMessage({ type: "error", text: "Error de conexión" });
                  } finally {
                    setRecalculating(false);
                    setTimeout(() => setMessage(null), 5000);
                  }
                }}
                disabled={recalculating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                {recalculating ? "Recalculando..." : "Recalcular puntajes"}
              </button>
            </div>
          </div>
        </section>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link
            href={`/groups/${id}`}
            className="px-6 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
