"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark" | "system";

// Runs before paint, so the page never flashes the wrong theme on load.
// Kept as a string because it has to be inlined into <head> ahead of hydration.
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored === 'dark' || (stored !== 'light' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

// Theme lives outside React — in localStorage and the OS setting — so it is
// read as an external store rather than mirrored into state. This also keeps
// two open tabs in sync, since a write in one fires `storage` in the other.
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === "theme" && cb();
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    // Only meaningful while following the system setting.
    if (!localStorage.getItem("theme")) apply("system");
    cb();
  };
  window.addEventListener("storage", onStorage);
  mq.addEventListener("change", onScheme);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", onScheme);
  };
}

const getSnapshot = (): Theme => (localStorage.getItem("theme") as Theme | null) ?? "system";
// The server cannot know the preference; it renders "system" and React
// reconciles once hydrated.
const getServerSnapshot = (): Theme => "system";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function choose(next: Theme) {
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    apply(next);
    for (const cb of listeners) cb();
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      role="radiogroup"
      aria-label="Colour theme"
    >
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            onClick={() => choose(o.value)}
            className={cn(
              "grid size-6 place-items-center rounded-full transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-3" />
          </button>
        );
      })}
    </div>
  );
}
