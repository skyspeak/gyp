import Link from "next/link";
import { listUpcomingDeadlines } from "@/lib/programs";
import { formatDeadline, formatDateShort, daysUntil } from "@/lib/format";
import { FilterPill } from "@/components/filter-pill";
import { cn } from "@/lib/utils";

export const metadata = { title: "Deadlines — Gap Year Platform" };

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const degreeParam = Array.isArray(sp.degree) ? sp.degree[0] : sp.degree;
  const degreeRequired = degreeParam === "0" ? 0 : degreeParam === "1" ? 1 : undefined;

  const deadlines = await listUpcomingDeadlines({ degreeRequired });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Deadlines</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {deadlines.length} upcoming, soonest first
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

      <ul className="mt-5 divide-y rounded-xl border overflow-hidden">
        {deadlines.map((d) => {
          const days = daysUntil(d.due_at);
          const urgent = days != null && days <= 30;
          return (
            <li key={d.id}>
              <Link
                href={`/programs/${d.program_slug}`}
                className="flex flex-col gap-1.5 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{d.program_name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.cycle_label} · {d.kind.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-baseline gap-3 text-sm sm:flex-col sm:items-end sm:gap-0.5">
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      urgent ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {days}d left
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDateShort(d.due_at)}
                  </span>
                </div>
              </Link>
              {/* Timezone is stated once, quietly, rather than in every row's
                  main line — but never dropped, since a 5pm ET cutoff read as
                  local time is how someone misses a deadline by three hours. */}
              <p className="px-4 pb-2 -mt-1 text-[11px] text-muted-foreground">
                {formatDeadline(d.due_at, d.source_tz)}
              </p>
            </li>
          );
        })}
        {deadlines.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">No dated deadlines on file yet.</li>
        )}
      </ul>
    </div>
  );
}
