"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";

interface Props {
  user: User;
}

export function UserDropdown({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
      >
        <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {(user.name || user.email || "U")[0].toUpperCase()}
        </span>
        <span className="hidden sm:inline">{user.name || user.email}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            Mi Perfil
          </button>
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
