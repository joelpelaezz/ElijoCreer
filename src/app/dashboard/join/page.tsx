"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinGroupPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al unirse");
      setLoading(false);
      return;
    }

    router.push(`/groups/${data.groupId}`);
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-6"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Volver
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        Unirse a un Grupo
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Código de invitación
          </label>
          <input
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Ej: A1B2C3D4"
            maxLength={8}
            className="w-full px-3 py-3 text-center text-xl font-bold tracking-[0.3em] rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || inviteCode.length < 4}
          className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Buscando grupo..." : "Unirse"}
        </button>
      </form>
    </div>
  );
}
