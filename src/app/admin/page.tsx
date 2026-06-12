"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/skeleton";

interface Stats {
  users: number;
  groups: number;
  matches: number;
  predictions: number;
}

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  tournament_name: string;
  member_count: number;
  created_at: string;
}

interface User {
  id: string;
  display_name: string;
  role: string;
  group_count: number;
  prediction_count: number;
  created_at: string;
}

interface Tournament {
  id: string;
  name: string;
  year: number;
  status: string;
  team_count: number;
  match_count: number;
}

interface Activity {
  id: string;
  action: string;
  entityType: string;
  userId: string;
  userName: string;
  createdAt: string;
  description: string;
}

interface GroupPredictions {
  group: { id: string; name: string; tournament: string };
  members: { user_id: string; role: string; display_name: string }[];
  predictions: any[];
  totalPredictions: number;
}

type Tab = "stats" | "groups" | "users" | "tournaments" | "predictions" | "activity" | "export" | "metrics" | "scoring" | "notifications";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [selectedGroupPredictions, setSelectedGroupPredictions] = useState<GroupPredictions | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [scoringConfig, setScoringConfig] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingScoring, setLoadingScoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    loadData();
  }, [status, router]);

  // Load activity when tab is selected
  useEffect(() => {
    if (activeTab === "activity" && activity.length === 0) {
      loadActivity();
    }
    if (activeTab === "metrics" && !metrics) {
      loadMetrics();
    }
    if (activeTab === "scoring" && !scoringConfig) {
      loadScoringConfig();
    }
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      // Load stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.status === 401 || statsRes.status === 403) {
        setAuthError(true);
        throw new Error("No autorizado");
      } else {
        setAuthError(false);
      }
      if (!statsRes.ok) {
        const errData = await statsRes.json().catch(() => ({}));
        throw new Error(errData?.error || errData?.detail || "Error al cargar estadísticas");
      }
      setStats(await statsRes.json());

      // Load groups
      const groupsRes = await fetch("/api/admin/groups");
      if (groupsRes.ok) setGroups(await groupsRes.json());

      // Load users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) setUsers(await usersRes.json());

      // Load tournaments
      const tournamentsRes = await fetch("/api/admin/tournaments");
      if (tournamentsRes.ok) setTournaments(await tournamentsRes.json());

      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadActivity() {
    setLoadingActivity(true);
    try {
      const res = await fetch("/api/admin/activity?limit=50");
      if (res.ok) {
        setActivity(await res.json());
      }
    } catch (e) {
      console.error("Error loading activity:", e);
    } finally {
      setLoadingActivity(false);
    }
  }

  async function loadGroupPredictions() {
    if (!selectedGroupId) return;
    setLoadingPredictions(true);
    try {
      const res = await fetch(`/api/admin/group-predictions?groupId=${selectedGroupId}`);
      if (res.ok) {
        setSelectedGroupPredictions(await res.json());
      }
    } catch (e) {
      console.error("Error loading predictions:", e);
    } finally {
      setLoadingPredictions(false);
    }
  }

  function downloadExport(type: string) {
    window.open(`/api/admin/export?type=${type}`, "_blank");
  }

  async function loadMetrics() {
    setLoadingMetrics(true);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) setMetrics(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoadingMetrics(false); }
  }

  async function loadScoringConfig() {
    setLoadingScoring(true);
    try {
      const res = await fetch("/api/admin/scoring-config");
      if (res.ok) setScoringConfig(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoadingScoring(false); }
  }

  async function saveScoringConfig() {
    setLoadingScoring(true);
    try {
      const res = await fetch("/api/admin/scoring-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoringConfig),
      });
      if (res.ok) alert("Configuración guardada");
    } catch (e) { alert("Error al guardar"); }
    finally { setLoadingScoring(false); }
  }

  async function deleteGroup(groupId: string) {
    if (!confirm("¿Estás seguro de eliminar este grupo?")) return;
    setActionLoading(groupId);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (res.ok) {
        setGroups(groups.filter((g) => g.id !== groupId));
      } else {
        alert("Error al eliminar grupo");
      }
    } catch {
      alert("Error al eliminar grupo");
    } finally {
      setActionLoading(null);
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        alert("Error al actualizar rol");
      }
    } catch {
      alert("Error al actualizar rol");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar usuario");
      }
    } catch {
      alert("Error al eliminar usuario");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteTournament(tournamentId: string) {
    if (!confirm("¿Estás seguro de eliminar este torneo y todos sus datos? Esta acción no se puede deshacer.")) return;
    setActionLoading(tournamentId);
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId }),
      });
      if (res.ok) {
        setTournaments(tournaments.filter((t) => t.id !== tournamentId));
      } else {
        alert("Error al eliminar torneo");
      }
    } catch {
      alert("Error al eliminar torneo");
    } finally {
      setActionLoading(null);
    }
  }

  const tabs = [
    { id: "stats" as Tab, label: "Estadísticas", icon: "analytics" },
    { id: "groups" as Tab, label: "Grupos", icon: "group" },
    { id: "users" as Tab, label: "Usuarios", icon: "person" },
    { id: "tournaments" as Tab, label: "Torneos", icon: "emoji_events" },
    { id: "predictions" as Tab, label: "Pronósticos", icon: "rate_review" },
    { id: "activity" as Tab, label: "Actividad", icon: "history" },
    { id: "export" as Tab, label: "Exportar", icon: "download" },
    { id: "metrics" as Tab, label: "Métricas", icon: "trending_up" },
    { id: "scoring" as Tab, label: "Scoring", icon: "score" },
    { id: "notifications" as Tab, label: "Notificaciones", icon: "notifications" },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-20 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && authError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <span className="material-symbols-outlined text-5xl text-destructive mb-3">
          lock
        </span>
        <p className="text-foreground font-medium text-lg">Acceso restringido</p>
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <span className="material-symbols-outlined text-5xl text-destructive mb-3">
          error
        </span>
        <p className="text-foreground font-medium text-lg">Error cargando panel</p>
        <p className="text-muted-foreground text-sm mt-1">{error}</p>
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={() => {
              setError(null);
              loadData();
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Panel de Admin</h1>
        <p className="text-muted-foreground text-sm">Gestión global del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Usuarios", value: stats.users, icon: "person", color: "text-blue-500" },
            { label: "Grupos", value: stats.groups, icon: "group", color: "text-green-500" },
            { label: "Partidos", value: stats.matches, icon: "sports_soccer", color: "text-orange-500" },
            { label: "Pronósticos", value: stats.predictions, icon: "rate_review", color: "text-purple-500" },
          ].map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <span className={`material-symbols-outlined text-3xl ${card.color}`}>{card.icon}</span>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === "groups" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Torneo</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Miembros</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Creado</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No hay grupos</td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group.id} className="border-t border-border">
                      <td className="p-3">
                        <p className="font-medium text-foreground">{group.name}</p>
                        <p className="text-xs text-muted-foreground">/{group.slug}</p>
                      </td>
                      <td className="p-3 text-sm text-foreground">{group.tournament_name || "-"}</td>
                      <td className="p-3 text-center text-sm text-foreground">{group.member_count}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(group.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteGroup(group.id)}
                          disabled={actionLoading === group.id}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                          title="Eliminar grupo"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rol</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Grupos</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Pronósticos</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Creado</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No hay usuarios</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t border-border">
                      <td className="p-3">
                        <p className="font-medium text-foreground">{user.display_name || "Sin nombre"}</p>
                      </td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={actionLoading === user.id}
                          className="text-sm bg-background border border-border rounded px-2 py-1 text-foreground disabled:opacity-50"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 text-center text-sm text-foreground">{user.group_count}</td>
                      <td className="p-3 text-center text-sm text-foreground">{user.prediction_count}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                          title="Eliminar usuario"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tournaments Tab */}
      {activeTab === "tournaments" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Año</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Equipos</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Partidos</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No hay torneos</td>
                  </tr>
                ) : (
                  tournaments.map((tournament) => (
                    <tr key={tournament.id} className="border-t border-border">
                      <td className="p-3 font-medium text-foreground">{tournament.name}</td>
                      <td className="p-3 text-center text-foreground">{tournament.year}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                            tournament.status === "active"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tournament.status === "active" ? "Activo" : tournament.status}
                        </span>
                      </td>
                      <td className="p-3 text-center text-foreground">{tournament.team_count}</td>
                      <td className="p-3 text-center text-foreground">{tournament.match_count}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteTournament(tournament.id)}
                          disabled={actionLoading === tournament.id}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                          title="Eliminar torneo"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Actividad Reciente</h2>
            <button
              onClick={loadActivity}
              disabled={loadingActivity}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loadingActivity ? "Cargando..." : "Actualizar"}
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Acción</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {activity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      {loadingActivity ? "Cargando..." : "No hay actividad registrada"}
                    </td>
                  </tr>
                ) : (
                  activity.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="p-3 text-sm text-foreground">{item.userName}</td>
                      <td className="p-3 text-sm text-foreground">{item.description}</td>
                      <td className="p-3 text-sm text-muted-foreground">{item.entityType}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === "export" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Exportar Datos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: "users", label: "Usuarios", desc: "Exportar todos los usuarios registrados" },
              { type: "groups", label: "Grupos", desc: "Exportar todos los grupos con miembros" },
              { type: "predictions", label: "Pronósticos", desc: "Exportar todos los pronósticos" },
              { type: "matches", label: "Partidos", desc: "Exportar todos los partidos" },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => downloadExport(item.type)}
                className="bg-card border border-border rounded-xl p-4 text-left hover:bg-accent transition-colors"
              >
                <p className="font-semibold text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === "predictions" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Ver Predicciones de Grupo</h2>
          <div className="flex gap-3">
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                setSelectedGroupPredictions(null);
              }}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="">Seleccionar grupo...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.member_count} miembros)
                </option>
              ))}
            </select>
            <button
              onClick={loadGroupPredictions}
              disabled={!selectedGroupId || loadingPredictions}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loadingPredictions ? "Cargando..." : "Ver"}
            </button>
          </div>
          {selectedGroupPredictions && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground">{selectedGroupPredictions.group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedGroupPredictions.group.tournament} • {selectedGroupPredictions.totalPredictions} pronósticos
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Partido</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Predicción</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroupPredictions.predictions.slice(0, 100).map((p: any, i: number) => (
                        <tr key={i} className="border-t border-border">
                          <td className="p-3 text-sm text-foreground">
                            {p.homeTeam} vs {p.awayTeam}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {p.userId?.slice(0, 8)}...
                          </td>
                          <td className="p-3 text-center text-sm font-semibold text-primary">
                            {p.predictedHomeScore} - {p.predictedAwayScore}
                          </td>
                          <td className="p-3 text-center text-sm text-foreground">
                            {p.actualHomeScore != null ? `${p.actualHomeScore} - ${p.actualAwayScore}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === "metrics" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Métricas y Gráficos</h2>
            <button
              onClick={loadMetrics}
              disabled={loadingMetrics}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent disabled:opacity-50"
            >
              {loadingMetrics ? "Cargando..." : "Actualizar"}
            </button>
          </div>
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-foreground">{metrics.users.total}</p>
                <p className="text-sm text-muted-foreground">Usuarios totales</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-foreground">{metrics.users.active7d}</p>
                <p className="text-sm text-muted-foreground">Usuarios activos (7d)</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-foreground">{metrics.predictions.total}</p>
                <p className="text-sm text-muted-foreground">Pronósticos totales</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-foreground">{metrics.groups.total}</p>
                <p className="text-sm text-muted-foreground">Grupos totales</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scoring Config Tab */}
      {activeTab === "scoring" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Configuración de Puntos</h2>
          {scoringConfig && (
            <div className="space-y-3">
              {Object.entries(scoringConfig).map(([key, data]: [string, any]) => (
                <div key={key} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{key}</p>
                    <p className="text-sm text-muted-foreground">{data.description}</p>
                  </div>
                  <input
                    type="number"
                    value={data.value}
                    onChange={(e) => setScoringConfig({ ...scoringConfig, [key]: { ...data, value: e.target.value } })}
                    className="w-20 bg-background border border-border rounded-lg px-3 py-2 text-foreground text-center"
                  />
                </div>
              ))}
              <button
                onClick={saveScoringConfig}
                disabled={loadingScoring}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loadingScoring ? "Guardando..." : "Guardar Configuración"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Enviar Notificación Masiva</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: (form.elements.namedItem("title") as HTMLInputElement).value,
                  message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
                  type: (form.elements.namedItem("type") as HTMLSelectElement).value,
                  targetAudience: (form.elements.namedItem("audience") as HTMLSelectElement).value,
                }),
              });
              const data = await res.json();
              alert(data.message || data.error);
              form.reset();
            }}
            className="space-y-3 bg-card border border-border rounded-xl p-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Título</label>
              <input name="title" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mensaje</label>
              <textarea name="message" required rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
                <select name="type" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground">
                  <option value="info">Información</option>
                  <option value="warning">Advertencia</option>
                  <option value="alert">Alerta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Audiencia</label>
                <select name="audience" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground">
                  <option value="all">Todos los usuarios</option>
                  <option value="active">Usuarios activos</option>
                  <option value="groups">En grupos</option>
                </select>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Enviar Notificación
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
