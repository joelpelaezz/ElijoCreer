"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Group {
  groupId: string;
  role: string;
  joinedAt: string;
  groupName: string;
  groupSlug: string | null;
  inviteCode: string;
  ownerUserId: string;
  createdAt: string;
}

export function GroupList({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then(setGroups)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-card border border-border animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground mb-4">
          No estás en ningún grupo todavía
        </p>
        <Link
          href="/groups/new"
          className="text-primary hover:underline font-medium"
        >
          Creá tu primer grupo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <Link
          key={g.groupId}
          href={`/groups/${g.groupId}`}
          className="block p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">{g.groupName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {g.ownerUserId === userId ? "Owner" : `Member`}
                {" · "}
                Código: {g.inviteCode}
              </p>
            </div>
            <span className="material-symbols-outlined text-muted-foreground">
              chevron_right
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
