"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FixtureMatchSkeleton } from "@/components/skeleton";

interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  flagIcon: string | null;
}

interface Match {
  id: string;
  stage: string;
  matchNumber: number;
  startsAt: string;
  status: string;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
}

interface Prediction {
  id: string;
  groupId: string;
  matchId: string;
  userId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  isLocked: boolean;
}

export default function FixturePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [matchesList, setMatchesList] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [scores, setScores] = useState<Record<string, [string, string]>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<any[] | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [scoreDetails, setScoreDetails] = useState<Record<string, any>>({});
  const [loadingScore, setLoadingScore] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState("group");
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    // Cargar info del grupo para obtener tournamentId
    fetch(`/api/groups/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setTournamentId(data.tournament?.id);
        }
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!tournamentId) return;

    // Cargar partidos
    setLoadingMatches(true);
    fetch(`/api/matches?tournamentId=${tournamentId}&stage=${activeStage}`)
      .then((r) => r.json())
      .then((data) => {
        setMatchesList(data);
        setLoadingMatches(false);
      })
      .catch(() => setLoadingMatches(false));

    // Cargar predicciones existentes
    fetch(`/api/predictions?groupId=${id}`)
      .then((r) => r.json())
      .then((data: Prediction[]) => {
        const map: Record<string, Prediction> = {};
        const scoresMap: Record<string, [string, string]> = {};
        data.forEach((p) => {
          map[p.matchId] = p;
          scoresMap[p.matchId] = [
            String(p.predictedHomeScore),
            String(p.predictedAwayScore),
          ];
        });
        setPredictions(map);
        setScores((prev) => ({ ...prev, ...scoresMap }));
      })
      .catch(() => {});
  }, [tournamentId, activeStage, id]);

  async function handleSave(matchId: string) {
    const score = scores[matchId];
    if (!score) return;

    setSaving((prev) => ({ ...prev, [matchId]: true }));
    setMessage(null);

    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: id,
        matchId,
        predictedHomeScore: parseInt(score[0]) || 0,
        predictedAwayScore: parseInt(score[1]) || 0,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Pronóstico guardado");
      // Refrescar predicciones
      const predRes = await fetch(`/api/predictions?groupId=${id}`);
      const predData: Prediction[] = await predRes.json();
      const map: Record<string, Prediction> = {};
      predData.forEach((p) => {
        map[p.matchId] = p;
      });
      setPredictions(map);
    } else {
      setMessage(`❌ ${data.error || "Error al guardar"}`);
    }

    setSaving((prev) => ({ ...prev, [matchId]: false }));
    setTimeout(() => setMessage(null), 3000);
  }

  function isPast(match: Match): boolean {
    return new Date(match.startsAt) < new Date();
  }

  // Agrupar por stage
  const stages = ["group", "round_of_32", "round_of_16", "quarter_final", "semi_final", "third_place", "final"];
  const stageLabels: Record<string, string> = {
    group: "Fase de Grupos",
    round_of_32: "32avos de Final",
    round_of_16: "16avos de Final",
    quarter_final: "Cuartos de Final",
    semi_final: "Semifinal",
    third_place: "Tercer Puesto",
    final: "Final",
  };

  const groupedMatches: Record<string, Match[]> = {};
  matchesList.forEach((m) => {
    if (!groupedMatches[m.stage]) groupedMatches[m.stage] = [];
    groupedMatches[m.stage].push(m);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/groups/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver al grupo
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">Fixture</h1>
        </div>
      </div>

      {message && (
        <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
          {message}
        </div>
      )}

      {/* Stage tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
      <div className="space-y-3">
        {loadingMatches ? (
          <>
            <FixtureMatchSkeleton />
            <FixtureMatchSkeleton />
            <FixtureMatchSkeleton />
          </>
        ) : matchesList.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay partidos en esta fase
          </p>
        ) : null}
        {matchesList.map((match) => {
          const pred = predictions[match.id];
          const isPastMatch = isPast(match);

          return (
            <div
              key={match.id}
              className={`bg-card border rounded-xl p-4 space-y-3 ${
                pred ? "border-primary/30" : "border-border"
              }`}
            >
              {/* Match header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">
                  {new Date(match.startsAt).toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  {new Date(match.startsAt).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>{match.venue}</span>
              </div>

              {/* Teams + Scores */}
              <div className="flex items-center justify-around gap-4">
                {/* Home */}
                <div className="flex flex-col items-center gap-2 w-24">
                  {match.homeTeam?.flagIcon ? (
                    <div className="text-4xl">{match.homeTeam.flagIcon}</div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-sm font-bold text-primary">
                      {match.homeTeam?.code || "?"}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-center text-foreground leading-tight">
                    {match.homeTeam?.shortName || "?"}
                  </span>
                </div>

                {/* Score inputs */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    disabled={isPastMatch || pred?.isLocked}
                    value={scores[match.id]?.[0] ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: [e.target.value, prev[match.id]?.[1] || ""],
                      }))
                    }
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
                      pred
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-surface text-foreground"
                    } focus:border-primary focus:ring-0 outline-none ${
                      isPastMatch || pred?.isLocked
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="?"
                  />
                  <span className="text-xl font-bold text-muted-foreground">
                    :
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    disabled={isPastMatch || pred?.isLocked}
                    value={scores[match.id]?.[1] ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: [prev[match.id]?.[0] || "", e.target.value],
                      }))
                    }
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
                      pred
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-surface text-foreground"
                    } focus:border-primary focus:ring-0 outline-none ${
                      isPastMatch || pred?.isLocked
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="?"
                  />
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-2 w-24">
                  {match.awayTeam?.flagIcon ? (
                    <div className="text-4xl">{match.awayTeam.flagIcon}</div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-sm font-bold text-primary">
                      {match.awayTeam?.code || "?"}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-center text-foreground leading-tight">
                    {match.awayTeam?.shortName || "?"}
                  </span>
                </div>
              </div>

              {/* Status + Save */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span
                  className={`text-xs font-medium ${
                    isPastMatch
                      ? "text-muted-foreground"
                      : "text-green-600"
                  }`}
                >
                  {isPastMatch
                    ? "Finalizado"
                    : pred?.isLocked
                      ? "🔒 Bloqueado"
                      : "Abierto"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (compareOpen === match.id) {
                        setCompareOpen(null);
                        return;
                      }
                      setCompareOpen(match.id);
                      setLoadingCompare(true);
                      const res = await fetch(
                        `/api/predictions/compare?groupId=${id}&matchId=${match.id}`
                      );
                      const data = await res.json();
                      setCompareData(data);
                      setLoadingCompare(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {compareOpen === match.id ? "Ocultar" : "Ver pronósticos"}
                  </button>
                  {isPastMatch && pred && (
                    <button
                      onClick={async () => {
                        if (scoreDetails[match.id]) {
                          setScoreDetails((prev) => {
                            const copy = { ...prev };
                            delete copy[match.id];
                            return copy;
                          });
                          return;
                        }
                        setLoadingScore(match.id);
                        const res = await fetch(
                          `/api/predictions/score?groupId=${id}&matchId=${match.id}`
                        );
                        const data = await res.json();
                        setScoreDetails((prev) => ({ ...prev, [match.id]: data }));
                        setLoadingScore(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {scoreDetails[match.id] ? "Ocultar" : "Ver puntaje"}
                    </button>
                  )}
                  {pred && (
                    <span className="text-xs text-primary font-medium">
                      {pred.predictedHomeScore} - {pred.predictedAwayScore}
                    </span>
                  )}
                  {!isPastMatch && !pred?.isLocked && (
                    <>
                      <button
                        onClick={() => handleSave(match.id)}
                        disabled={saving[match.id]}
                        className="px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {saving[match.id] ? "..." : pred ? "Actualizar" : "Guardar"}
                      </button>
                      {pred && (
                        <button
                          onClick={async () => {
                            setSaving((prev) => ({ ...prev, [match.id]: true }));
                            const res = await fetch("/api/predictions", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ groupId: id, matchId: match.id }),
                            });
                            setSaving((prev) => ({ ...prev, [match.id]: false }));
                            if (res.ok) {
                              setPredictions((prev) => {
                                const copy = { ...prev };
                                delete copy[match.id];
                                return copy;
                              });
                              setScores((prev) => {
                                const copy = { ...prev };
                                delete copy[match.id];
                                return copy;
                              });
                              setMessage("🗑️ Pronóstico eliminado");
                              setTimeout(() => setMessage(null), 3000);
                            } else {
                              const err = await res.json();
                              setMessage(`❌ ${err.error || "Error al borrar"}`);
                              setTimeout(() => setMessage(null), 3000);
                            }
                          }}
                          disabled={saving[match.id]}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-50"
                        >
                          Borrar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Score detail panel */}
              {scoreDetails[match.id] && scoreDetails[match.id].hasResult && (
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tu puntaje
                  </p>
                  {loadingScore === match.id ? (
                    <p className="text-xs text-muted-foreground">Calculando...</p>
                  ) : !scoreDetails[match.id].hasPrediction ? (
                    <p className="text-xs text-muted-foreground">
                      No cargaste pronóstico — resultado:{" "}
                      <strong>
                        {scoreDetails[match.id].actualHomeScore} - {scoreDetails[match.id].actualAwayScore}
                      </strong>
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">Tu pronóstico:</span>
                        <span className="font-semibold text-foreground">
                          {scoreDetails[match.id].predictedHomeScore} - {scoreDetails[match.id].predictedAwayScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">Resultado:</span>
                        <span className="font-semibold text-foreground">
                          {scoreDetails[match.id].actualHomeScore} - {scoreDetails[match.id].actualAwayScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        {scoreDetails[match.id].score.hitExactScore && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">
                            ✅ Exacto (+{scoreDetails[match.id].rules.exactScorePoints}pts)
                          </span>
                        )}
                        {scoreDetails[match.id].score.hitOutcome && !scoreDetails[match.id].score.hitExactScore && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
                            ⚡ Ganador (+{scoreDetails[match.id].rules.outcomePoints}pts)
                          </span>
                        )}
                        {scoreDetails[match.id].score.hitOneTeamScore && !scoreDetails[match.id].score.hitExactScore && !scoreDetails[match.id].score.hitOutcome && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium">
                            🎯 Un equipo (+{scoreDetails[match.id].rules.oneTeamScorePoints}pts)
                          </span>
                        )}
                        {scoreDetails[match.id].score.points === 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-muted-foreground text-xs font-medium">
                            ❌ Sin puntos
                          </span>
                        )}
                        {scoreDetails[match.id].score.points > 0 && (
                          <span className="ml-auto text-lg font-bold text-primary">
                            +{scoreDetails[match.id].score.points} pts
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Compare panel */}
              {compareOpen === match.id && (
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pronósticos del grupo
                  </p>
                  {loadingCompare ? (
                    <p className="text-xs text-muted-foreground">Cargando...</p>
                  ) : compareData?.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nadie pronosticó este partido todavía.
                    </p>
                  ) : (
                    compareData?.map((p: any) => (
                      <div
                        key={p.userId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {p.displayName || `Usuario ${p.userId.slice(0, 6)}`}
                        </span>
                        <span className="font-semibold text-primary">
                          {p.predictedHomeScore} - {p.predictedAwayScore}
                          {p.isLocked && (
                            <span className="text-xs text-muted-foreground ml-1">
                              🔒
                            </span>
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
