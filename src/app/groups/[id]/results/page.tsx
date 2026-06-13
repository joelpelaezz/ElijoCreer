"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ResultMatch {
  id: string;
  stage: string;
  matchNumber: number;
  startsAt: string;
  status: string;
  venue: string;
  homeTeam: { id: string; name: string; shortName: string; code: string } | null;
  awayTeam: { id: string; name: string; shortName: string; code: string } | null;
  officialHomeScore: number | null;
  officialAwayScore: number | null;
  hasResult: boolean;
}

export default function GroupResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [matches, setMatches] = useState<ResultMatch[]>([]);
  const [scores, setScores] = useState<Record<string, [string, string]>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeStage, setActiveStage] = useState("group");
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/results?groupId=${id}`)
      .then((r) => {
        if (r.status === 403) {
          router.push(`/groups/${id}`);
          return null;
        }
        return r.json();
      })
      .then((data: ResultMatch[] | null) => {
        if (!data) return;
        setMatches(data);
        // Precargar scores existentes
        const scoresMap: Record<string, [string, string]> = {};
        data.forEach((m) => {
          if (m.officialHomeScore !== null) {
            scoresMap[m.id] = [String(m.officialHomeScore), String(m.officialAwayScore)];
          } else {
            scoresMap[m.id] = ["", ""];
          }
        });
        setScores(scoresMap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  async function handleSave(matchId: string) {
    const score = scores[matchId];
    if (!score || score[0] === "" || score[1] === "") return;

    setSaving((prev) => ({ ...prev, [matchId]: true }));
    setMessage(null);

    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: id,
        matchId,
        homeScore: parseInt(score[0]),
        awayScore: parseInt(score[1]),
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "✅ Resultado guardado" });
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                officialHomeScore: parseInt(score[0]),
                officialAwayScore: parseInt(score[1]),
                hasResult: true,
              }
            : m
        )
      );
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: `❌ ${err.error || "Error al guardar"}` });
    }

    setSaving((prev) => ({ ...prev, [matchId]: false }));
    setTimeout(() => setMessage(null), 3000);
  }

  const filtered = matches.filter((m) =>
    activeStage === "all" ? true : m.stage === activeStage
  );

  const stages = ["group", "round_of_32", "round_of_16", "quarter_final", "semi_final", "third_place", "final"];
  const stageLabels: Record<string, string> = {
    group: "Fase Grupos",
    round_of_32: "32avos",
    round_of_16: "16avos",
    quarter_final: "Cuartos",
    semi_final: "Semifinal",
    third_place: "3er Puesto",
    final: "Final",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Cargando partidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href={`/groups/${id}/settings`}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver a configuración
        </Link>
        <h1 className="text-2xl font-bold text-foreground mt-2">
          Cargar resultados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresá los scores oficiales de los partidos para calcular puntos.
        </p>
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

      {/* CSV Upload */}
      <div className="bg-card border border-border rounded-xl p-4">
        <button
          onClick={() => setCsvOpen(!csvOpen)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <span className="material-symbols-outlined text-primary">upload_file</span>
          Carga masiva por CSV
          <span className="material-symbols-outlined text-muted-foreground text-base ml-auto">
            {csvOpen ? "expand_less" : "expand_more"}
          </span>
        </button>
        {csvOpen && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Formato: <code>matchNumber,stage,homeScore,awayScore</code> (uno por línea)
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-xs font-mono focus:border-primary focus:ring-0 outline-none resize-none"
              placeholder="1,group,2,1&#10;2,group,0,0&#10;3,group,1,3"
            />
            <button
              onClick={async () => {
                setBulkSaving(true);
                setBulkResult(null);
                const lines = csvText
                  .split("\n")
                  .map((l) => l.trim())
                  .filter((l) => l && !l.startsWith("#"));
                const results = lines.map((line) => {
                  const [matchNumber, stage, homeScore, awayScore] = line
                    .split(",")
                    .map((s) => s.trim());
                  return {
                    matchNumber: parseInt(matchNumber),
                    stage,
                    homeScore: parseInt(homeScore),
                    awayScore: parseInt(awayScore),
                  };
                });
                const res = await fetch("/api/results/bulk", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ groupId: id, results }),
                });
                const data = await res.json();
                if (res.ok) {
                  setBulkResult(
                    `✅ ${data.loaded} resultados cargados.` +
                      (data.errors?.length
                        ? `\n⚠️ ${data.errors.length} errores`
                        : "")
                  );
                  // Recargar página
                  setTimeout(() => window.location.reload(), 1500);
                } else {
                  setBulkResult(`❌ ${data.error || "Error"}`);
                }
                setBulkSaving(false);
              }}
              disabled={bulkSaving || !csvText.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {bulkSaving ? "Cargando..." : "Cargar resultados"}
            </button>
            {bulkResult && (
              <pre className="text-xs whitespace-pre-wrap text-foreground">
                {bulkResult}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Stage tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveStage("all")}
          className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeStage === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos
        </button>
        {stages.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStage(s)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStage === s
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {stageLabels[s]}
          </button>
        ))}
      </div>

      {/* Matches */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No hay partidos en esta fase
          </p>
        )}
        {filtered.map((match) => {
          const isPast = new Date(match.startsAt) < new Date();

          return (
            <div
              key={match.id}
              className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${
                match.hasResult ? "border-green-500/30 bg-green-500/5" : "border-border"
              }`}
            >
              {/* Match info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="font-medium">{stageLabels[match.stage] || match.stage}</span>
                  {match.venue && <span>· {match.venue}</span>}
                  <span>· {new Date(match.startsAt).toLocaleDateString("es-AR")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {match.homeTeam?.shortName || "?"}
                  </span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {match.awayTeam?.shortName || "?"}
                  </span>
                </div>
              </div>

              {/* Score inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={scores[match.id]?.[0] ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [match.id]: [e.target.value, prev[match.id]?.[1] || ""],
                    }))
                  }
                  className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:ring-0 outline-none"
                  placeholder="?"
                />
                <span className="text-lg font-bold text-muted-foreground">:</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={scores[match.id]?.[1] ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [match.id]: [prev[match.id]?.[0] || "", e.target.value],
                    }))
                  }
                  className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:ring-0 outline-none"
                  placeholder="?"
                />
                {match.hasResult && (
                  <span className="text-green-600 text-xs font-medium ml-1">✓</span>
                )}
              </div>

              {/* Save */}
              <button
                onClick={() => handleSave(match.id)}
                disabled={saving[match.id] || !scores[match.id]?.[0] || !scores[match.id]?.[1]}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving[match.id] ? "..." : match.hasResult ? "Actualizar" : "Guardar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
