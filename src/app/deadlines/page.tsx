import Link from "next/link";
import { listUpcomingDeadlines, type UpcomingDeadline } from "@/lib/programs";
import { formatDeadline, formatDateShort, daysUntil } from "@/lib/format";
import { FilterPill } from "@/components/filter-pill";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Deadlines month by month — Gap Year Platform" };

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function nextMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

// Every month from the first deadline to the last, including the empty ones.
// A quiet December is information: it tells you when there is nothing to chase
// and, more usefully, when to be doing the work for the months that are busy.
function monthRange(deadlines: UpcomingDeadline[]): string[] {
  const keys = deadlines.map((d) => monthKey(d.due_at!)).sort();
  if (keys.length === 0) return [];
  const out: string[] = [];
  let cur = keys[0];
  const last = keys[keys.length - 1];
  while (cur <= last && out.length < 36) {
    out.push(cur);
    cur = nextMonth(cur);
  }
  return out;
}

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const degreeParam = Array.isArray(sp.degree) ? sp.degree[0] : sp.degree;
  const degreeRequired = degreeParam === "0" ? 0 : degreeParam === "1" ? 1 : undefined;

  const deadlines = await listUpcomingDeadlines({ degreeRequired });

  const byMonth = new Map<string, UpcomingDeadline[]>();
  for (const d of deadlines) {
    if (!d.due_at) continue;
    const k = monthKey(d.due_at);
    byMonth.set(k, [...(byMonth.get(k) ?? []), d]);
  }

  const months = monthRange(deadlines);
  const peak = months.reduce(
    (best, m) => ((byMonth.get(m)?.length ?? 0) > (byMonth.get(best)?.length ?? 0) ? m : best),
    months[0] ?? ""
  );
  const peakCount = byMonth.get(peak)?.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Deadlines, month by month</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {deadlines.length} upcoming across {months.length} months.
        {peakCount > 1 && (
          <>
            {" "}
            <strong className="text-foreground">
              {monthLabel(peak)} is the crunch — {peakCount} of them.
            </strong>
          </>
        )}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        <FilterPill href="/deadlines" active={!degreeParam} size="sm">
          Any stage
        </FilterPill>
        <FilterPill href="/deadlines?degree=0" active={degreeParam === "0"} size="sm">
          No degree
        </FilterPill>
        <FilterPill href="/deadlines?degree=1" active={degreeParam === "1"} size="sm">
          Have a degree
        </FilterPill>
      </div>

      {/* Shape of the year at a glance, before any reading. */}
      {months.length > 1 && (
        <div className="mt-5 flex items-end gap-1 rounded-xl border p-3">
          {months.map((m) => {
            const n = byMonth.get(m)?.length ?? 0;
            const h = peakCount ? Math.max(3, Math.round((n / peakCount) * 40)) : 3;
            return (
              <div key={m} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted-foreground">{n || ""}</span>
                <div
                  className={cn("w-full rounded-sm", n > 0 ? "bg-foreground/70" : "bg-muted")}
                  style={{ height: `${h}px` }}
                  title={`${monthLabel(m)}: ${n}`}
                />
                <span className="text-[9px] uppercase text-muted-foreground">
                  {monthLabel(m).slice(0, 1)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {months.map((m) => {
          const rows = byMonth.get(m) ?? [];
          return (
            <section key={m}>
              <h2 className="sticky top-14 z-10 -mx-4 flex items-baseline justify-between gap-3 border-y bg-background/95 px-4 py-2 backdrop-blur">
                <span className="text-sm font-semibold">{monthLabel(m)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {rows.length === 0 ? "nothing due" : `${rows.length} due`}
                </span>
              </h2>

              {rows.length === 0 ? (
                <p className="px-1 py-3 text-xs text-muted-foreground">
                  A clear month — good time to be preparing the next one.
                </p>
              ) : (
                <ul className="divide-y">
                  {rows.map((d) => {
                    const days = daysUntil(d.due_at);
                    const urgent = days != null && days <= 30;
                    return (
                      <li key={d.id}>
                        <Link
                          href={`/programs/${d.program_slug}`}
                          className="flex flex-col gap-1 py-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                        >
                          <div className="min-w-0">
                            <p className="font-medium leading-snug">{d.program_name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {d.cycle_label} · {d.kind.replace(/_/g, " ")}
                            </p>
                            {/* Timezone stays visible: a 5pm ET cutoff read as
                                local time is how people miss by three hours. */}
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {formatDeadline(d.due_at, d.source_tz)}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0.5">
                            <span
                              className={cn(
                                "text-sm font-semibold tabular-nums",
                                urgent ? "text-destructive" : "text-foreground"
                              )}
                            >
                              {formatDateShort(d.due_at)}
                            </span>
                            {days != null && (
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {days}d left
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}

        {deadlines.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No dated deadlines on file for this filter.
          </p>
        )}
      </div>
    </div>
  );
}
