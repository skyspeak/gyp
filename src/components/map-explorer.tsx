"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Globe2, MousePointerClick } from "lucide-react";
import { WorldMap, BUCKETS } from "@/components/world-map";
import { cn } from "@/lib/utils";

export type MapProgram = {
  id: string;
  slug: string;
  name: string;
  operator: string;
  category: string;
  moneyLine: string;
  moneyLabel: string | null;
  moneyBadge: string;
};

export type MapCountry = { code: string; name: string; open: MapProgram[]; closed: MapProgram[] };

function ProgramCard({ p }: { p: MapProgram }) {
  return (
    <li>
      <Link
        href={`/programs/${p.slug}`}
        className="group block min-w-0 rounded-xl border bg-card p-3 transition-all hover:-translate-y-px hover:border-primary/30 hover:shadow-sm"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0 font-medium leading-snug break-words group-hover:underline decoration-1 underline-offset-2">
            {p.name}
          </span>
          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{p.operator}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums">{p.moneyLine}</span>
          {p.moneyLabel && (
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", p.moneyBadge)}>{p.moneyLabel}</span>
          )}
          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">{p.category}</span>
        </span>
      </Link>
    </li>
  );
}

export function MapExplorer({
  countries,
  counts,
  closedOnly,
  unpinned,
  initialCountry,
}: {
  countries: Record<string, MapCountry>;
  counts: Record<string, number>;
  closedOnly: string[];
  unpinned: MapProgram[];
  initialCountry?: string;
}) {
  const [selected, setSelected] = useState<string | undefined>(initialCountry);
  const [hovered, setHovered] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const href = (code: string | undefined) => (code ? `/map?country=${code}` : "/map");

  const select = (code: string | undefined) => {
    setSelected(code);
    // Keep the URL shareable without a server round trip.
    window.history.replaceState(null, "", href(code));
    // On a phone the list sits under the map; bring it into view so the tap
    // visibly does something. On desktop it is already beside the map.
    const panel = panelRef.current;
    if (code && panel && panel.getBoundingClientRect().top > window.innerHeight * 0.6) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Escape clears the selection, like closing any other panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(undefined);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ranked = Object.values(countries)
    .filter((c) => c.open.length)
    .sort((a, b) => b.open.length - a.open.length || a.name.localeCompare(b.name));

  const current = selected ? countries[selected] : undefined;
  const hover = hovered ? countries[hovered] : undefined;

  return (
    <div>
      {/* minmax(0,1fr) on mobile too. With no template the single column is
          sized to its content's min-content width, and one long operator name
          meant to truncate pushed the whole page wider than the phone as soon
          as a country's list rendered. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="relative min-w-0 overflow-hidden rounded-2xl border bg-card p-2 shadow-xs sm:p-4">
          {/* Live hover readout — the native tooltip takes a second to appear.
              Hidden on phones: touch has no hover, and on a small map the pill
              would cover Alaska and most of Canada. */}
          <div className="pointer-events-none absolute left-5 top-5 z-10 hidden rounded-full border bg-background/90 px-3 py-1 text-xs shadow-xs backdrop-blur sm:block">
            {hover ? (
              <>
                <span className="font-medium">{hover.name}</span>
                <span className="text-muted-foreground">
                  {" · "}
                  {hover.open.length
                    ? `${hover.open.length} ${hover.open.length === 1 ? "program" : "programs"}`
                    : "not open to Americans"}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MousePointerClick className="size-3.5" /> Click a country
              </span>
            )}
          </div>

          <WorldMap
            counts={counts}
            closedOnly={closedOnly}
            selected={selected}
            hrefFor={(code) => href(code)}
            onSelect={select}
            onHover={setHovered}
          />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-2 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {BUCKETS.map((b) => (
                <span key={b.label} className="flex items-center gap-1">
                  <svg viewBox="0 0 10 10" className="size-3" aria-hidden>
                    <rect width="10" height="10" rx="2" className={b.fill} />
                  </svg>
                  <span className="tabular-nums">{b.label}</span>
                </span>
              ))}
              <span className="ml-1">programs</span>
            </span>
            {closedOnly.length > 0 && (
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 10 10" className="size-3 text-warn" aria-hidden>
                  <rect width="10" height="10" rx="2" className="fill-warn-muted" />
                  <path d="M-2 8 8-2M2 12 12 2" stroke="currentColor" strokeWidth="2" />
                </svg>
                Not open to Americans
              </span>
            )}
          </div>
        </div>

        <div
          ref={panelRef}
          aria-live="polite"
          className="min-w-0 scroll-mt-20 rounded-2xl border bg-muted/30 p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
        >
          {current ? (
            <>
              <button
                type="button"
                onClick={() => select(undefined)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> All countries
              </button>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{current.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {current.open.length
                  ? `${current.open.length} ${current.open.length === 1 ? "gap year" : "gap years"} you can do here`
                  : "Nothing here is open to American applicants."}
              </p>

              {current.open.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {current.open.map((p) => (
                    <ProgramCard key={p.id} p={p} />
                  ))}
                </ul>
              )}

              {current.closed.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-warn-foreground">Not open to Americans</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    These run here, but the US has no agreement that lets American citizens apply.
                  </p>
                  <ul className="mt-2 space-y-2 opacity-80">
                    {current.closed.map((p) => (
                      <ProgramCard key={p.id} p={p} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold tracking-tight">Pick a country</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Click anywhere shaded on the map, or choose from the list. The darker the green, the
                more you can do there.
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-1.5">
                {ranked.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => select(c.code)}
                      onMouseEnter={() => setHovered(c.code)}
                      onMouseLeave={() => setHovered(null)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border bg-card px-2.5 py-2 text-left text-sm transition-colors hover:border-primary/30 hover:bg-accent"
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-muted-foreground">{c.open.length}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <details className="group mt-5 rounded-xl border bg-card p-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <Globe2 className="size-4 text-muted-foreground" />
                  Worldwide or not tied to one country
                  <span className="text-muted-foreground">({unpinned.length})</span>
                </summary>
                <p className="mt-2 text-xs text-muted-foreground">
                  Run worldwide, at sea, online, or in so many places that pinning them to one country
                  would mislead.
                </p>
                <ul className="mt-2 space-y-2">
                  {unpinned.map((p) => (
                    <ProgramCard key={p.id} p={p} />
                  ))}
                </ul>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
