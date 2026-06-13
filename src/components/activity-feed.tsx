"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/skeleton";

interface ActivityItem {
  id: string;
  activityType: string;
  referenceId: string | null;
  message: string;
  createdAt: string;
  userId: string | null;
  displayName: string | null;
}

const activityIcons: Record<string, string> = {
  prediction_saved: "ads_click",
  prediction_updated: "edit_note",
  prediction_deleted: "delete",
  member_joined: "group_add",
  result_loaded: "sports_score",
};

export function ActivityFeed({ groupId }: { groupId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/activity?groupId=${groupId}&limit=15`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [groupId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Todavía no hay actividad en el grupo.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((item) => (
        <div key={item.id} className="flex items-start gap-3 py-2">
          <span className="material-symbols-outlined text-lg text-primary mt-0.5 shrink-0">
            {activityIcons[item.activityType] || "circle"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">
                {item.displayName || "Alguien"}
              </span>{" "}
              {item.message}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(new Date(item.createdAt))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString("es-AR", { timeZone: "UTC" });
}
