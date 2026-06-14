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

interface ScoreDetail {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  predHomeScore: number;
  predAwayScore: number;
  points: number;
  reason: string;
  updatedAt: string | null;
  hitExact: boolean;
  hitOutcome: boolean;
  hitOneTeam: boolean;
}

interface GroupInfo {
  id: string;
  name: string;
  tournament: { name: string } | null;
}

async function downloadPDF(sorted: MemberRank[], groupName: string, groupId: string) {
  // Obtener detalle de cada usuario
  const detailsPromises = sorted.map(async (member) => {
    const res = await fetch(`/api/groups/${groupId}/ranking?userId=${member.userId}`);
    return res.ok ? await res.json() : [];
  });
  const allDetails = await Promise.all(detailsPromises);

  // Generar HTML para PDF
  const today = new Date().toLocaleDateString("es-AR");
  let html = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ranking - ${groupName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #236391; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #236391; color: white; }
        .rank-header { background: #f5f5f5; font-weight: bold; }
        .points { font-weight: bold; color: #236391; }
        .match-row { font-size: 12px; }
        .match-row td { padding: 4px 8px; }
        .points-detail { display: flex; justify-content: space-between; padding: 10px; margin: 5px 0; background: #f9f9f9; border-radius: 4px; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Ranking: ${groupName}</h1>
      <p>Fecha: ${today}</p>
      
      <h2>Tabla General</h2>
      <table>
        <tr>
          <th>#</th>
          <th>Participante</th>
          <th> Pronósticos</th>
          <th>Exactos</th>
          <th>Ganador</th>
          <th>Un equipo</th>
          <th>Puntos</th>
        </tr>
  `;

  sorted.forEach((m, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${m.userName || `Usuario ${m.userId.slice(0, 6)}`}</td>
        <td>${m.predictionsCount}</td>
        <td>${m.exactScore}</td>
        <td>${m.outcome}</td>
        <td>${m.oneTeamScore}</td>
        <td class="points">${m.totalPoints}</td>
      </tr>
    `;
  });

  html += "</table>";

  // Agregar detalle de cada usuario
  for (let i = 0; i < sorted.length; i++) {
    const member = sorted[i];
    const details = allDetails[i];

    html += `
      <h2>${i + 1}. ${member.userName || `Usuario ${member.userId.slice(0, 6)}`} - ${member.totalPoints} pts</h2>
      <table>
        <tr>
          <th>Partido</th>
          <th>Pronóstico</th>
          <th>Resultado</th>
          <th>Puntos</th>
          <th>Detalle</th>
        </tr>
    `;

    details.forEach((d: ScoreDetail) => {
      html += `
        <tr class="match-row">
          <td>${d.homeTeam} vs ${d.awayTeam}</td>
          <td>${d.predHomeScore} - ${d.predAwayScore}</td>
          <td>${d.homeScore !== null ? `${d.homeScore} - ${d.awayScore}` : "-"}</td>
          <td class="points">${d.points}</td>
          <td>${d.reason}</td>
        </tr>
      `;
    });

    html += "</table>";
  }

  html += `
      <div class="footer">Generado por ElijoCreer - ${today}</div>
    </body>
    </html>
  `;

  // Abrir en nueva ventana para imprimir
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export default function RankingPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [ranking, setRanking] = useState<MemberRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<MemberRank | null>(null);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  // Cargar detalle de puntos al seleccionar usuario
  useEffect(() => {
    if (!selectedUser || !id) return;
    setLoadingDetails(true);
    fetch(`/api/groups/${id}/ranking?userId=${selectedUser.userId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setScoreDetails(data);
        setLoadingDetails(false);
      })
      .catch(() => setLoadingDetails(false));
  }, [selectedUser, id]);

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
              onClick={() => downloadPDF(sorted, group?.name || "ranking", id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              Exportar PDF
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
              onClick={() => setSelectedUser(member)}
              className={`bg-card border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors ${
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
      {/* Modal de detalle de puntos */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  {selectedUser.userName || `Usuario ${selectedUser.userId.slice(0, 6)}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.totalPoints} puntos totales
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingDetails ? (
                <p className="text-center text-muted-foreground">Cargando...</p>
              ) : scoreDetails.length === 0 ? (
                <p className="text-center text-muted-foreground">Sin partidos jugados</p>
              ) : (
                <div className="space-y-2">
                  {scoreDetails.map((s) => (
                    <div key={s.matchId} className="flex items-center justify-between p-2 bg-surface rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {s.homeTeam} vs {s.awayTeam}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pronóstico: {s.predHomeScore}-{s.predAwayScore}
                          {s.homeScore !== null && ` | Resultado: ${s.homeScore}-${s.awayScore}`}
                        </p>
                        {s.updatedAt && (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            Últ. act.: {new Date(s.updatedAt).toLocaleString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{s.points} pts</p>
                        <p className="text-xs text-muted-foreground">{s.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
