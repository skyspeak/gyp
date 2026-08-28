import Link from "next/link";
import { CircleCheck, TriangleAlert, PauseCircle, Ban, Search } from "lucide-react";
import { db } from "@/lib/db";
import { AlertButton } from "@/components/alert-button";
import { STATUS_UI, isStale, STALE_AFTER_DAYS, type FundingStatus } from "@/lib/status";
import { TONE_BADGE, TONE_ALERT } from "@/lib/money-ui";
import { dedupeByName } from "@/lib/dedupe";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Is it still running? — Gap Year Platform",
  description:
    "Current operating status for every gap year and post-grad program we track, with the date each was last checked against its own source.",
};

const ORDER: FundingStatus[] = ["defunded", "paused", "at_risk", "active"];
const ICON = { active: CircleCheck, at_risk: TriangleAlert, paused: PauseCircle, defunded: Ban };

type Row = {
  id: string;
  slug: string;
  name: string;
  funding_status: FundingStatus;
  funding_note: string | null;
  source_url: string;
  last_verified_at: string | null;
  us_eligible: number;
  provenance: string;
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function ago(iso: string | null): string {
  if (!iso) return "never checked";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "checked today";
  if (days === 1) return "checked yesterday";
  if (days < 31) return `checked ${days}d ago`;
  return `checked ${Math.floor(days / 30)}mo ago`;
}

export default async function StatusPage({
  searchParams,
}: PageProps<"/status">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  // Validate once, here. Guarding only the SQL filter left the label below
  // reading STATUS_UI[garbage].label — undefined, and .toLowerCase() on it
  // turned ?status=anything into a 500.
  const raw = typeof sp.status === "string" ? sp.status : "";
  const only: FundingStatus | "" = ORDER.includes(raw as FundingStatus)
    ? (raw as FundingStatus)
    : "";

  // Load once and filter in memory: the tiles and the list have to be derived
  // from the SAME deduplicated set, or the counts contradict the rows beneath
  // them. 381 rows is small enough that this is cheaper than staying in sync.
  const res = await db().execute(`
    SELECT p.id, p.slug, p.name, p.funding_status, p.funding_note, p.source_url,
           p.last_verified_at, p.us_eligible, p.provenance
    FROM programs p
    ORDER BY CASE p.funding_status
               WHEN 'defunded' THEN 0 WHEN 'paused' THEN 1
               WHEN 'at_risk' THEN 2 ELSE 3 END,
             p.name`);

  const all = dedupeByName(res.rows as unknown as Row[]);

  const tally = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.funding_status] = (acc[p.funding_status] ?? 0) + 1;
    return acc;
  }, {});
  const total = all.length;

  const needle = q.toLowerCase();
  const rows = all.filter(
    (p) =>
      (!only || p.funding_status === only) &&
      (!needle || p.name.toLowerCase().includes(needle))
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-balance">
        Is it still running?
      </h1>
      <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-pretty">
        Current status for all {total} paths we track, each checked against the program&apos;s own
        page. Operators rarely announce a closure, so this is the answer to a question nobody else
        publishes.
      </p>

      {/* Status tiles double as the filter — the summary is the navigation. */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ORDER.map((s) => {
          const Icon = ICON[s];
          const on = only === s;
          return (
            <Link
              key={s}
              href={on ? "/status" : `/status?status=${s}`}
              className={cn(
                "rounded-xl border p-3 transition-colors hover:bg-muted",
                on && "ring-2 ring-ring"
              )}
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="size-3.5" />
                {STATUS_UI[s].label}
              </span>
              <span className="mt-0.5 block text-2xl font-semibold tabular-nums">
                {tally[s] ?? 0}
              </span>
            </Link>
          );
        })}
      </div>

      <form className="mt-4 flex gap-2" action="/status">
        {only && <input type="hidden" name="status" value={only} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Check a program by name"
            aria-label="Search programs by name"
            enterKeyHint="search"
            className="min-h-11 w-full rounded-lg border bg-transparent pl-9 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
        </div>
        <button
          type="submit"
          className="min-h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Check
        </button>
      </form>

      <div className={cn("mt-4 rounded-xl border p-4 text-sm", TONE_ALERT.neutral)}>
        <p className="font-semibold">Get told instead of checking</p>
        <p className="mt-1 text-muted-foreground">
          We&apos;ll email you the moment any program here changes status. You cannot name in
          advance the one that is going to close, so this watches all {total}.
        </p>
        <AlertButton className="mt-3" label="Alert me about any change" />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Looking for just the ones that changed?{" "}
        <Link href="/changes" className="font-medium text-foreground underline">
          What changed this cycle
        </Link>{" "}
        lists the closures, pauses and funding risks on their own.
      </p>

      <p className="mt-8 text-xs text-muted-foreground">
        {rows.length} {rows.length === 1 ? "program" : "programs"}
        {q && <> matching &ldquo;{q}&rdquo;</>}
        {only && <> · {STATUS_UI[only].label.toLowerCase()}</>}
        {(q || only) && (
          <>
            {" · "}
            <Link href="/status" className="underline">
              clear
            </Link>
          </>
        )}
      </p>

      <ul className="mt-2 divide-y border-t">
        {rows.map((p) => {
          const ui = STATUS_UI[p.funding_status] ?? STATUS_UI.active;
          const stale = isStale(p.last_verified_at);
          return (
            <li key={p.id} className="py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Link href={`/programs/${p.slug}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-xs",
                    TONE_BADGE[ui.tone]
                  )}
                >
                  {ui.label}
                </span>
              </div>

              {p.funding_note && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {p.funding_note}
                </p>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {/* Freshness is part of the claim. "Running" from a page nobody
                    has read in three months is not something we can assert. */}
                <span className={cn(stale && "text-warn-foreground")}>
                  {ago(p.last_verified_at)}
                  {stale && ` · older than ${STALE_AFTER_DAYS}d, treat as unconfirmed`}
                </span>
                {p.us_eligible === 0 && <span>· not open to Americans</span>}
                <a
                  href={p.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  · {hostOf(p.source_url)}
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nothing matches that. <Link href="/status" className="underline">Show everything</Link>.
        </p>
      )}
    </div>
  );
}
