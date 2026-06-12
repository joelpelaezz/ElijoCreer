"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton, CardSkeleton } from "@/components/skeleton";
import { ActivityFeed } from "@/components/activity-feed";

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  displayName: string | null;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  currentUserId: string;
  isOwner: boolean;
  membershipRole: string;
  tournament: { name: string } | null;
  members: Member[];
  rules: {
    exactScorePoints: number;
    outcomePoints: number;
    oneTeamScorePoints: number;
    bonusPoints: number;
  } | null;
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${id}`)
      .then((r) => {
        if (r.status === 403 || r.status === 404) {
          router.push("/dashboard");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        setGroup(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id, router]);

  async function handleCopyCode() {
    if (group?.inviteCode) {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <CardSkeleton />
        <div className="grid grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Grupo no encontrado.</p>
        <Link
          href="/dashboard"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
        {group.tournament && (
          <p className="text-muted-foreground text-sm mt-1">
            {group.tournament.name}
          </p>
        )}
        {group.description && (
          <p className="text-muted-foreground mt-2">{group.description}</p>
        )}
      </div>

      {/* Invite Code */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Código de invitación
        </h2>
        <div className="flex items-center gap-3">
          <code className="text-2xl font-bold tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-lg select-all">
            {group.inviteCode}
          </code>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Compartí este código con tus amigos para que se unan al grupo.
        </p>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link
          href={`/groups/${id}/fixture`}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:bg-accent transition-colors"
        >
          <span className="material-symbols-outlined text-2xl text-primary">
            stadium
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Fixture</p>
            <p className="text-xs text-muted-foreground">Cargá tus pronósticos</p>
          </div>
        </Link>
        <Link
          href={`/groups/${id}/ranking`}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:bg-accent transition-colors"
        >
          <span className="material-symbols-outlined text-2xl text-primary">
            leaderboard
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Ranking</p>
            <p className="text-xs text-muted-foreground">Posiciones del grupo</p>
          </div>
        </Link>
        <Link
          href={`/groups/${id}/edits`}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:bg-accent transition-colors"
        >
          <span className="material-symbols-outlined text-2xl text-primary">
            history
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Ediciones</p>
            <p className="text-xs text-muted-foreground">Historial de cambios</p>
          </div>
        </Link>
      </div>

      {/* Members */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Miembros ({group.members.length})
        </h2>
        <div className="divide-y divide-border border border-border rounded-xl">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {(member.displayName || member.userId).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground">
                  {member.userId === group.currentUserId
                    ? "Vos"
                    : member.displayName || `Usuario ${member.userId.slice(0, 6)}`}
                </span>
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Actividad reciente
        </h2>
        <div className="bg-card border border-border rounded-xl px-4 py-2">
          <ActivityFeed groupId={id} />
        </div>
      </div>

      {/* Scoring Rules */}
      {group.rules && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Reglas de puntaje
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                +{group.rules.exactScorePoints}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Resultado exacto
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                +{group.rules.outcomePoints}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ganador</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {group.isOwner && (
          <Link
            href={`/groups/${id}/settings`}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base align-text-bottom">settings</span>
            Configuración
          </Link>
        )}
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
