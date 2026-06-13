"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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

interface MatchTeam {
  id: string;
  name: string;
  shortName: string;
  code: string;
  flagIcon: string | null;
}

interface AdminMatch {
  id: string;
  tournamentId: string;
  stage: string;
  roundLabel: string | null;
  matchNumber: number | null;
  startsAt: string;
  status: string;
  venue: string | null;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  result: { homeScore: number; awayScore: number } | null;
}

interface TeamOption {
  id: string;
  tournamentId: string;
  name: string;
  shortName: string;
  code: string;
  flagIcon: string | null;
}

interface MatchFormData {
  tournamentId: string;
  stage: string;
  roundLabel: string;
  matchNumber: string;
  homeTeamId: string;
  awayTeamId: string;
  startsAt: string;
  venue: string;
  status: string;
}

const STAGES = [
  { value: "group", label: "Grupos" },
  { value: "round_of_16", label: "Octavos" },
  { value: "quarter_final", label: "Cuartos" },
  { value: "semi_final", label: "Semis" },
  { value: "third_place", label: "3er Puesto" },
  { value: "final", label: "Final" },
];

const MATCH_STATUSES = [
  { value: "scheduled", label: "Programado" },
  { value: "live", label: "En vivo" },
  { value: "finished", label: "Finalizado" },
  { value: "postponed", label: "Postergado" },
  { value: "cancelled", label: "Cancelado" },
];

type Tab = "stats" | "groups" | "users" | "tournaments" | "predictions" | "activity" | "export" | "metrics" | "scoring" | "notifications" | "matches" | "late";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [initConfirmText, setInitConfirmText] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [latePredictions, setLatePredictions] = useState<any[]>([]);
  const [loadingLate, setLoadingLate] = useState(false);
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excusingId, setExcusingId] = useState<string | null>(null);
  const [excuseReason, setExcuseReason] = useState("");
  const [excuseError, setExcuseError] = useState<string | null>(null);
  const [excusingLoading, setExcusingLoading] = useState(false);
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchStageFilter, setMatchStageFilter] = useState<string>("");
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<AdminMatch | null>(null);
  const [resultMatch, setResultMatch] = useState<AdminMatch | null>(null);
  const [resultHomeScore, setResultHomeScore] = useState("");
  const [resultAwayScore, setResultAwayScore] = useState("");
  const [matchForm, setMatchForm] = useState<MatchFormData>({
    tournamentId: "",
    stage: "group",
    roundLabel: "",
    matchNumber: "",
    homeTeamId: "",
    awayTeamId: "",
    startsAt: "",
    venue: "",
    status: "scheduled",
  });
  const [matchesActionLoading, setMatchesActionLoading] = useState<string | null>(null);

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
    if (activeTab === "matches") {
      loadMatches();
    }
    if (activeTab === "late") {
      setLoadingLate(true);
      fetch("/api/admin/late-predictions")
        .then((r) => r.json())
        .then((data) => setLatePredictions(Array.isArray(data) ? data : []))
        .catch(() => setLatePredictions([]))
        .finally(() => setLoadingLate(false));
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

      // Check if user is admin (for UI visibility)
      const roleRes = await fetch("/api/admin/verify-role");
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        setIsAdmin(roleData.isAdmin);
      }

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

  async function initializeSystem() {
    setInitLoading(true);
    setInitError(null);
    try {
      const res = await fetch("/api/admin/initialize", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Error al inicializar");
      }
      setShowInitModal(false);
      setShowConfirmModal(false);
      setInitConfirmText("");
      alert("✅ Sistema inicializado correctamente. Redirigiendo al login...");
      await signOut({ redirect: false });
      router.push("/login?initialized=true");
    } catch (e: any) {
      setInitError(e.message);
    } finally {
      setInitLoading(false);
    }
  }

  async function loadMatches() {
    setLoadingMatches(true);
    try {
      const params = new URLSearchParams();
      params.set("includeTeams", "true");
      if (matchStageFilter) params.set("stage", matchStageFilter);
      const res = await fetch(`/api/admin/matches?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches ?? data);
        if (data.teams) setTeamOptions(data.teams);
      }
    } catch (e) {
      console.error("Error loading matches:", e);
    } finally {
      setLoadingMatches(false);
    }
  }

  // Load teams separately for dropdown when modal opens
  async function loadTeamsForModal() {
    try {
      const res = await fetch("/api/admin/matches?includeTeams=true");
      if (res.ok) {
        const data = await res.json();
        if (data.teams) setTeamOptions(data.teams);
        return data.teams || [];
      }
    } catch (e) {
      console.error("Error loading teams:", e);
    }
    return [];
  }

  function openAddMatch() {
    loadTeamsForModal().then((teams) => {
      setMatchForm({
        tournamentId: "",
        stage: "group",
        roundLabel: "",
        matchNumber: "",
        homeTeamId: "",
        awayTeamId: "",
        startsAt: "",
        venue: "",
        status: "scheduled",
      });
      setShowAddMatchModal(true);
    });
  }

  function openEditMatch(match: AdminMatch) {
    loadTeamsForModal().then(() => {
      setEditingMatch(match);
      setMatchForm({
        tournamentId: match.tournamentId,
        stage: match.stage,
        roundLabel: match.roundLabel || "",
        matchNumber: match.matchNumber?.toString() || "",
        homeTeamId: match.homeTeam.id,
        awayTeamId: match.awayTeam.id,
        startsAt: match.startsAt?.slice(0, 16) || "",
        venue: match.venue || "",
        status: match.status,
      });
      setShowEditMatchModal(true);
    });
  }

  function openResultModal(match: AdminMatch) {
    setResultMatch(match);
    setResultHomeScore(match.result?.homeScore?.toString() || "");
    setResultAwayScore(match.result?.awayScore?.toString() || "");
    setShowResultModal(true);
  }

  async function saveMatch() {
    setMatchesActionLoading("save");
    try {
      const body = {
        ...matchForm,
        matchNumber: matchForm.matchNumber ? parseInt(matchForm.matchNumber) : null,
        tournamentId: matchForm.tournamentId || undefined,
      };
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowAddMatchModal(false);
        loadMatches();
      } else {
        const data = await res.json();
        alert(data.error || data.detail || "Error al crear partido");
      }
    } catch (e) {
      alert("Error al crear partido");
    } finally {
      setMatchesActionLoading(null);
    }
  }

  async function updateMatch() {
    if (!editingMatch) return;
    setMatchesActionLoading("update");
    try {
      const body = {
        id: editingMatch.id,
        ...matchForm,
        matchNumber: matchForm.matchNumber ? parseInt(matchForm.matchNumber) : null,
      };
      const res = await fetch("/api/admin/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowEditMatchModal(false);
        setEditingMatch(null);
        loadMatches();
      } else {
        const data = await res.json();
        alert(data.error || data.detail || "Error al actualizar partido");
      }
    } catch (e) {
      alert("Error al actualizar partido");
    } finally {
      setMatchesActionLoading(null);
    }
  }

  async function deleteMatch(matchId: string) {
    if (!confirm("¿Estás seguro de eliminar este partido? También se borrarán predicciones y resultados asociados.")) return;
    setMatchesActionLoading(matchId);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      if (res.ok) {
        setMatches(matches.filter((m) => m.id !== matchId));
      } else {
        const data = await res.json();
        alert(data.error || data.detail || "Error al eliminar partido");
      }
    } catch (e) {
      alert("Error al eliminar partido");
    } finally {
      setMatchesActionLoading(null);
    }
  }

  async function saveResult() {
    if (!resultMatch) return;
    setMatchesActionLoading("result");
    try {
      const res = await fetch("/api/admin/matches/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: resultMatch.id,
          homeScore: parseInt(resultHomeScore),
          awayScore: parseInt(resultAwayScore),
        }),
      });
      if (res.ok) {
        setShowResultModal(false);
        setResultMatch(null);
        loadMatches();
      } else {
        const data = await res.json();
        alert(data.error || data.detail || "Error al cargar resultado");
      }
    } catch (e) {
      alert("Error al cargar resultado");
    } finally {
      setMatchesActionLoading(null);
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
    { id: "matches" as Tab, label: "Partidos", icon: "sports_soccer" },
    { id: "notifications" as Tab, label: "Notificaciones", icon: "notifications" },
    { id: "late" as Tab, label: "Tardíos", icon: "warning" },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto sm:px-6 px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && authError) {
    return (
      <div className="max-w-4xl mx-auto sm:px-6 px-4 py-12 sm:py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
          <span className="material-symbols-outlined text-4xl text-destructive">
            lock
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Acceso restringido</h2>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Necesitás permisos de administrador para acceder.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto sm:px-6 px-4 py-12 sm:py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
          <span className="material-symbols-outlined text-4xl text-destructive">
            error
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Error cargando panel</h2>
        <p className="text-muted-foreground mt-2 text-sm">{error}</p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setError(null);
              loadData();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto sm:px-6 px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Panel de Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestión global del sistema</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Admin
          </span>
        </div>
      </div>

      {/* Tab Navigation — glassmorphism mobile-first */}
      <div className="relative mb-6">
        {/* Desktop nav */}
        <div className="hidden sm:flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        {/* Mobile nav — pills */}
        <div className="flex sm:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all active:scale-95 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-container text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { label: "Usuarios", value: stats.users, icon: "person", gradient: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-500" },
              { label: "Grupos", value: stats.groups, icon: "group", gradient: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-500" },
              { label: "Partidos", value: stats.matches, icon: "sports_soccer", gradient: "from-orange-500/20 to-orange-600/5", iconColor: "text-orange-500" },
              { label: "Pronósticos", value: stats.predictions, icon: "rate_review", gradient: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-500" },
            ].map((card) => (
              <div
                key={card.label}
                className={`relative overflow-hidden bg-card border border-border rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${card.gradient}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{card.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{card.label}</p>
                  </div>
                  <div className={`${card.iconColor} opacity-50`}>
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">{card.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-destructive text-xl">warning</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-destructive mb-1">Zona de Peligro</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Reiniciá el sistema completo: borra TODOS los datos (usuarios, grupos, pronósticos, partidos)
                    y lo deja como recién instalado con el torneo del Mundial 2026.
                  </p>
                  <button
                    onClick={() => setShowInitModal(true)}
                    disabled={initLoading}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                    {initLoading ? "Inicializando..." : "Inicializar Sistema"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Groups Tab */}
      {activeTab === "groups" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Nombre</th>
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Torneo</th>
                  <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Miembros</th>
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Creado</th>
                  <th className="text-right p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No hay grupos</td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group.id} className="border-t border-border/50 hover:bg-accent/20 transition-colors">
                      <td className="p-3 sm:p-4">
                        <p className="font-medium text-foreground text-sm">{group.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">/{group.slug}</p>
                      </td>
                      <td className="p-3 sm:p-4 text-sm text-foreground">{group.tournament_name || "-"}</td>
                      <td className="p-3 sm:p-4 text-center text-sm font-mono text-foreground">{group.member_count}</td>
                      <td className="p-3 sm:p-4 text-sm text-muted-foreground hidden sm:table-cell">
                        {new Date(group.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <button
                          onClick={() => deleteGroup(group.id)}
                          disabled={actionLoading === group.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90 disabled:opacity-50"
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
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Usuario</th>
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Rol</th>
                  <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Grupos</th>
                  <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Pronósticos</th>
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Creado</th>
                  <th className="text-right p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No hay usuarios</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t border-border/50 hover:bg-accent/20 transition-colors">
                      <td className="p-3 sm:p-4">
                        <p className="font-medium text-foreground text-sm">{user.display_name || "Sin nombre"}</p>
                      </td>
                      <td className="p-3 sm:p-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={actionLoading === user.id}
                          className="text-sm bg-background border border-border rounded-xl px-2.5 py-1.5 text-foreground disabled:opacity-50 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 sm:p-4 text-center text-sm font-mono text-foreground">{user.group_count}</td>
                      <td className="p-3 sm:p-4 text-center text-sm font-mono text-foreground">{user.prediction_count}</td>
                      <td className="p-3 sm:p-4 text-sm text-muted-foreground hidden sm:table-cell">
                        {new Date(user.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90 disabled:opacity-50"
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
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Nombre</th>
                  <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Año</th>
                  <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Estado</th>
                  <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Equipos</th>
                  <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Partidos</th>
                  <th className="text-right p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No hay torneos</td>
                  </tr>
                ) : (
                  tournaments.map((tournament) => (
                    <tr key={tournament.id} className="border-t border-border/50 hover:bg-accent/20 transition-colors">
                      <td className="p-3 sm:p-4 font-medium text-foreground text-sm">{tournament.name}</td>
                      <td className="p-3 sm:p-4 text-center font-mono text-foreground">{tournament.year}</td>
                      <td className="p-3 sm:p-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                            tournament.status === "active"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tournament.status === "active" ? "Activo" : tournament.status}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-center font-mono text-foreground hidden sm:table-cell">{tournament.team_count}</td>
                      <td className="p-3 sm:p-4 text-center font-mono text-foreground hidden sm:table-cell">{tournament.match_count}</td>
                      <td className="p-3 sm:p-4 text-right">
                        <button
                          onClick={() => deleteTournament(tournament.id)}
                          disabled={actionLoading === tournament.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90 disabled:opacity-50"
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

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Actividad Reciente</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Usuario</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Acción</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Tipo</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Fecha</th>
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
                      <tr key={item.id} className="border-t border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="p-3 sm:p-4 text-sm text-foreground">{item.userName}</td>
                        <td className="p-3 sm:p-4 text-sm text-foreground max-w-[200px] truncate">{item.description}</td>
                        <td className="p-3 sm:p-4 text-sm text-muted-foreground hidden sm:table-cell">
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-muted">{item.entityType}</span>
                        </td>
                        <td className="p-3 sm:p-4 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-foreground"
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
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
                         <tr key={i} className="border-t border-border/50 hover:bg-accent/20 transition-colors">
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
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
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
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Configuración de Puntos</h2>
            {scoringConfig && (
              <div className="space-y-3">
                {Object.entries(scoringConfig)
                  .filter(([key]) => key.endsWith("Points"))
                  .map(([key, data]: [string, any]) => (
                  <div key={key} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{key}</p>
                      <p className="text-sm text-muted-foreground">{data.description}</p>
                    </div>
                    <input
                      type="number"
                      value={data.value}
                      onChange={(e) => setScoringConfig({ ...scoringConfig, [key]: { ...data, value: e.target.value } })}
                      className="w-20 bg-background border border-border rounded-xl px-3 py-2 text-foreground text-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Configuración de Tiempos</h2>
            {scoringConfig && (
              <div className="space-y-3">
                {Object.entries(scoringConfig)
                  .filter(([key]) => !key.endsWith("Points"))
                  .map(([key, data]: [string, any]) => (
                  <div key={key} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{key}</p>
                      <p className="text-sm text-muted-foreground">{data.description}</p>
                    </div>
                    {key === "latePredictionEnabled" ? (
                      <label className="relative inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.value === "true"}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, [key]: { ...data, value: e.target.checked ? "true" : "false" } })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-5 after:w-5 after:transition-all" />
                        <span className={`text-xs font-semibold min-w-[24px] transition-colors ${data.value === "true" ? "text-primary" : "text-muted-foreground"}`}>
                          {data.value === "true" ? "ON" : "OFF"}
                        </span>
                      </label>
                    ) : (
                      <input
                        type={key === "latePredictionPenaltyPercent" ? "number" : "number"}
                        min={key === "latePredictionPenaltyPercent" ? "0" : "0"}
                        max={key === "latePredictionPenaltyPercent" ? "100" : undefined}
                        value={data.value}
                        onChange={(e) => setScoringConfig({ ...scoringConfig, [key]: { ...data, value: e.target.value } })}
                        className="w-20 bg-background border border-border rounded-xl px-3 py-2 text-foreground text-center"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={saveScoringConfig}
              disabled={loadingScoring}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
            >
              {loadingScoring ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Gestión de Partidos</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={matchStageFilter}
                onChange={(e) => {
                  setMatchStageFilter(e.target.value);
                  setTimeout(loadMatches, 0);
                }}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
              >
                <option value="">Todas las fases</option>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={loadMatches}
                disabled={loadingMatches}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                <span className="hidden sm:inline">{loadingMatches ? "Cargando..." : "Actualizar"}</span>
              </button>
              <button
                onClick={openAddMatch}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                <span className="hidden sm:inline">Agregar Partido</span>
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">#</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Fase</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Local</th>
                    <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground">vs</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Visitante</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Fecha</th>
                    <th className="text-left p-3 sm:p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Sede</th>
                    <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Estado</th>
                    <th className="text-center p-3 sm:p-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Resultado</th>
                    <th className="text-right p-3 sm:p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMatches && matches.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-muted-foreground">Cargando...</td>
                    </tr>
                  ) : matches.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-muted-foreground">No hay partidos</td>
                    </tr>
                  ) : (
                    matches.map((match) => (
                      <tr key={match.id} className="border-t border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="p-3 sm:p-4 text-sm font-mono text-muted-foreground">
                          {match.matchNumber ?? "-"}
                        </td>
                        <td className="p-3 sm:p-4 text-sm text-foreground">
                          {STAGES.find((s) => s.value === match.stage)?.label || match.stage}
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            {match.homeTeam.flagIcon && (
                              <span className="text-lg">{match.homeTeam.flagIcon}</span>
                            )}
                            <span className="text-sm font-semibold text-foreground">
                              {match.homeTeam.shortName || match.homeTeam.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center text-xs text-muted-foreground font-medium">vs</td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            {match.awayTeam.flagIcon && (
                              <span className="text-lg">{match.awayTeam.flagIcon}</span>
                            )}
                            <span className="text-sm font-semibold text-foreground">
                              {match.awayTeam.shortName || match.awayTeam.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-sm text-muted-foreground hidden md:table-cell whitespace-nowrap">
                          {match.startsAt
                            ? new Date(match.startsAt).toLocaleString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "America/Argentina/Buenos_Aires",
                              })
                            : "-"}
                        </td>
                        <td className="p-3 sm:p-4 text-sm text-muted-foreground hidden md:table-cell max-w-[120px] truncate" title={match.venue || ""}>
                          {match.venue || "-"}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                            match.status === "finished"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : match.status === "live"
                              ? "bg-red-500/15 text-red-600 dark:text-red-400"
                              : match.status === "postponed"
                              ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                              : match.status === "cancelled"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {MATCH_STATUSES.find((s) => s.value === match.status)?.label || match.status}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-center hidden sm:table-cell">
                          {match.result ? (
                            <span className="text-sm font-bold text-foreground">
                              {match.result.homeScore} - {match.result.awayScore}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditMatch(match)}
                              disabled={matchesActionLoading === match.id}
                              className="p-1.5 text-foreground hover:bg-accent rounded transition-colors disabled:opacity-50"
                              title="Editar partido"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => openResultModal(match)}
                              disabled={matchesActionLoading === match.id}
                              className="p-1.5 text-foreground hover:bg-accent rounded transition-colors disabled:opacity-50"
                              title={match.result ? "Editar resultado" : "Cargar resultado"}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {match.result ? "edit_note" : "add_circle"}
                              </span>
                            </button>
                            <button
                              onClick={() => deleteMatch(match.id)}
                              disabled={matchesActionLoading === match.id}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                              title="Eliminar partido"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {matches.length > 0 && (
              <div className="p-3 text-sm text-muted-foreground border-t border-border">
                {matches.length} partido{matches.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Agregar Partido */}
      {showAddMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">Agregar Partido</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Torneo</label>
                <select
                  value={matchForm.tournamentId}
                  onChange={(e) => setMatchForm({ ...matchForm, tournamentId: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                >
                  <option value="">Seleccionar torneo...</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Fase</label>
                  <select
                    value={matchForm.stage}
                    onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">N° Partido</label>
                  <input
                    type="number"
                    value={matchForm.matchNumber}
                    onChange={(e) => setMatchForm({ ...matchForm, matchNumber: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ronda (opcional)</label>
                <input
                  type="text"
                  value={matchForm.roundLabel}
                  onChange={(e) => setMatchForm({ ...matchForm, roundLabel: e.target.value })}
                  placeholder="Ej: Grupo A, Octavos 1"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Local</label>
                  <select
                    value={matchForm.homeTeamId}
                    onChange={(e) => setMatchForm({ ...matchForm, homeTeamId: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {teamOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.flagIcon || ""} {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Visitante</label>
                  <select
                    value={matchForm.awayTeamId}
                    onChange={(e) => setMatchForm({ ...matchForm, awayTeamId: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {teamOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.flagIcon || ""} {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={matchForm.startsAt}
                  onChange={(e) => setMatchForm({ ...matchForm, startsAt: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sede (opcional)</label>
                <input
                  type="text"
                  value={matchForm.venue}
                  onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                  placeholder="Ej: Estadio Azteca"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
                <select
                  value={matchForm.status}
                  onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                >
                  {MATCH_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowAddMatchModal(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={saveMatch}
                disabled={matchesActionLoading === "save" || !matchForm.tournamentId || !matchForm.homeTeamId || !matchForm.awayTeamId || !matchForm.startsAt}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                {matchesActionLoading === "save" ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Partido */}
      {showEditMatchModal && editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">Editar Partido</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {editingMatch.homeTeam.shortName} vs {editingMatch.awayTeam.shortName}
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Fase</label>
                  <select
                    value={matchForm.stage}
                    onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">N° Partido</label>
                  <input
                    type="number"
                    value={matchForm.matchNumber}
                    onChange={(e) => setMatchForm({ ...matchForm, matchNumber: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ronda (opcional)</label>
                <input
                  type="text"
                  value={matchForm.roundLabel}
                  onChange={(e) => setMatchForm({ ...matchForm, roundLabel: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Local</label>
                  <select
                    value={matchForm.homeTeamId}
                    onChange={(e) => setMatchForm({ ...matchForm, homeTeamId: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {teamOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.flagIcon || ""} {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Visitante</label>
                  <select
                    value={matchForm.awayTeamId}
                    onChange={(e) => setMatchForm({ ...matchForm, awayTeamId: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {teamOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.flagIcon || ""} {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={matchForm.startsAt}
                  onChange={(e) => setMatchForm({ ...matchForm, startsAt: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sede (opcional)</label>
                <input
                  type="text"
                  value={matchForm.venue}
                  onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
                <select
                  value={matchForm.status}
                  onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm"
                >
                  {MATCH_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => { setShowEditMatchModal(false); setEditingMatch(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={updateMatch}
                disabled={matchesActionLoading === "update"}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                {matchesActionLoading === "update" ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cargar Resultado */}
      {showResultModal && resultMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Cargar Resultado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {resultMatch.homeTeam.shortName} vs {resultMatch.awayTeam.shortName}
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{resultMatch.homeTeam.shortName}</p>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={resultHomeScore}
                  onChange={(e) => setResultHomeScore(e.target.value)}
                  className="w-16 bg-background border border-border rounded-xl px-3 py-2 text-foreground text-center text-xl font-bold"
                />
              </div>
              <span className="text-xl text-muted-foreground font-bold">-</span>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{resultMatch.awayTeam.shortName}</p>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={resultAwayScore}
                  onChange={(e) => setResultAwayScore(e.target.value)}
                  className="w-16 bg-background border border-border rounded-xl px-3 py-2 text-foreground text-center text-xl font-bold"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => { setShowResultModal(false); setResultMatch(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={saveResult}
                disabled={matchesActionLoading === "result" || resultHomeScore === "" || resultAwayScore === ""}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                {matchesActionLoading === "result" ? "Guardando..." : "Guardar Resultado"}
              </button>
            </div>
          </div>
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
              <input name="title" required className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mensaje</label>
              <textarea name="message" required rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
                <select name="type" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground">
                  <option value="info">Información</option>
                  <option value="warning">Advertencia</option>
                  <option value="alert">Alerta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Audiencia</label>
                <select name="audience" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground">
                  <option value="all">Todos los usuarios</option>
                  <option value="active">Usuarios activos</option>
                  <option value="groups">En grupos</option>
                </select>
              </div>
            </div>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95">
              Enviar Notificación
            </button>
          </form>
        </div>
      )}

      {/* Late Predictions Tab */}
      {activeTab === "late" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Pronósticos Tardíos</h2>
          <p className="text-sm text-muted-foreground">
            Pronósticos cargados fuera del deadline. Podés eximir la penalización si corresponden a
            casos de sistema caído, mantenimiento o fuerza mayor.
          </p>
          <button
            onClick={async () => {
              setLoadingLate(true);
              try {
                    const res = await fetch("/api/admin/late-predictions");
                    const data = await res.json();
                    setLatePredictions(Array.isArray(data) ? data : []);
                  } catch {
                    setLatePredictions([]);
                  }
              setLoadingLate(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingLate ? "Cargando..." : "Actualizar"}
          </button>

          {loadingLate ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : latePredictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-3xl mb-2">check_circle</span>
              <p>No hay pronósticos tardíos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latePredictions.map((lp: any) => (
                <div key={lp.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-foreground">{lp.userName}</span>
                      <span className="text-muted-foreground mx-1">·</span>
                      <span className="text-muted-foreground">{lp.homeTeam} vs {lp.awayTeam}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-xs font-medium">
                      🟡 {lp.lateMinutes} min tarde
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Pronóstico:</span>
                    <span className="font-semibold text-foreground">{lp.predictedHomeScore} - {lp.predictedAwayScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {lp.latePenaltyApplied ? (
                        <span className="text-amber-600 font-medium">⚠️ Penalización activa</span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          ✅ Eximido por {lp.excusedByName || "admin"}
                          {lp.lateExcusedReason && `: "${lp.lateExcusedReason}"`}
                        </span>
                      )}
                    </div>
                    {lp.latePenaltyApplied && (
                      <button
                        onClick={async () => {
                          setExcusingId(lp.id);
                          setExcuseReason("");
                          setShowExcuseModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-90"
                      >
                        Eximir penalización
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de excusa */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-3">Eximir penalización</h3>
            <p className="text-sm text-muted-foreground mb-4">
              El pronóstico se marcará como eximido y el scoring se recalculará sin penalización.
            </p>
            <input
              type="text"
              placeholder="Motivo (opcional, ej: sistema caído)"
              value={excuseReason}
              onChange={(e) => setExcuseReason(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground mb-4 text-sm"
            />
            {excuseError && (
              <p className="text-sm text-destructive mb-3 bg-destructive/10 p-2 rounded-lg">{excuseError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowExcuseModal(false); setExcuseReason(""); setExcuseError(null); }}
                disabled={excusingLoading}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setExcusingLoading(true);
                  setExcuseError(null);
                  try {
                    const res = await fetch("/api/admin/late-predictions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ predictionId: excusingId, reason: excuseReason || null }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setShowExcuseModal(false);
                    setExcuseReason("");
                    // Refrescar lista
                    const refreshRes = await fetch("/api/admin/late-predictions");
                    const refreshData = await refreshRes.json();
                    setLatePredictions(Array.isArray(refreshData) ? refreshData : []);
                  } catch (err: any) {
                    setExcuseError(err.message);
                  }
                  setExcusingLoading(false);
                }}
                disabled={excusingLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                {excusingLoading ? "Eximiendo..." : "Eximir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primer Modal — confirmación inicial */}
      {showInitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-destructive text-2xl">warning</span>
              <h3 className="text-lg font-bold text-foreground">¿Inicializar el sistema?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Esto borrará <strong>TODOS</strong> los datos actuales: usuarios, grupos, pronósticos,
              partidos, resultados, configuraciones y metadatos. El sistema quedará como recién instalado,
              con el torneo del Mundial 2026, los 112 equipos y 104 partidos en horario argentina.
            </p>
            {initError && (
              <p className="text-sm text-destructive mb-3 bg-destructive/10 p-2 rounded-lg">
                Error: {initError}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowInitModal(false);
                  setInitError(null);
                }}
                disabled={initLoading}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowInitModal(false);
                  setShowConfirmModal(true);
                  setInitConfirmText("");
                }}
                disabled={initLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segundo Modal — escribir BORRAR */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-destructive text-2xl">dangerous</span>
              <h3 className="text-lg font-bold text-foreground">Confirmación final</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acción es <strong>IRREVERSIBLE</strong>. Escribí <strong>BORRAR</strong> en el campo
              de abajo para confirmar.
            </p>
            <input
              type="text"
              placeholder="Escribí BORRAR para confirmar"
              value={initConfirmText}
              onChange={(e) => setInitConfirmText(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground mb-4 text-sm"
            />
            {initError && (
              <p className="text-sm text-destructive mb-3 bg-destructive/10 p-2 rounded-lg">
                Error: {initError}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setInitConfirmText("");
                  setInitError(null);
                }}
                disabled={initLoading}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={initializeSystem}
                disabled={initConfirmText !== "BORRAR" || initLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                {initLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  "Confirmar y Inicializar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
