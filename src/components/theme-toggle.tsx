"use client";

import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme();

  function cycle() {
    const order: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
  }

  const icon =
    theme === "system"
      ? "settings_brightness"
      : resolved === "dark"
        ? "dark_mode"
        : "light_mode";

  return (
    <button
      onClick={cycle}
      className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={`Tema: ${theme === "system" ? "sistema" : theme}`}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </button>
  );
}
