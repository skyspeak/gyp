import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import {
  listPrograms,
  getSoonestDeadlines,
  CATEGORY_LABELS,
  type ProgramFilters,
} from "@/lib/programs";
import { formatPayShort, formatCostShort, formatDateShort, daysUntil } from "@/lib/format";
import { MONEY_UI, FUNDING_UI, TONE_BADGE, TONE_TEXT } from "@/lib/money-ui";
import { approxAnnualUsd } from "@/lib/pay-sort";
import { FilterPill } from "@/components/filter-pill";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalog — Gap Year Platform",
  description:
    "Search every gap year and post-grad path we track, filter by what it pays, and sort by what closes next.",
};

const MONEY_TABS = [
  { value: undefined, label: "Pays you" },
  { value: "net_neutral", label: "Breaks even" },
  { value: "participant_pays", label: "You pay" },
  { value: "all", label: "Compare all" },
] as const;

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]);
  const degreeParam = one("degree");
  const categoryParam = one("category");
  const sortParam = one("sort");
  const moneyParam = one("money");
  const q = (one("q") ?? "").trim();
  // Absorbed from the old deadlines page: its only real filter was "what is
  // closing", which is a filter on the catalog, not a page of its own.
  const soonParam = one("soon") === "1";

  const moneyDirection =
    moneyParam === "all" || moneyParam === "net_neutral" || moneyParam === "participant_pays"
      ? moneyParam
      : "participant_earns";

  const filters: ProgramFilters = {
    degreeRequired: degreeParam === "0" ? 0 : degreeParam === "1" ? 1 : undefined,
    moneyDirection,
    category: categoryParam || undefined,
  };

  const programs = await listPrograms(filters);
  const deadlineMap = await getSoonestDeadlines(programs.map((p) => p.id));

  const needle = q.toLowerCase();
  const matched = programs.filter((p) => {
    if (needle && !`${p.name} ${p.operator}`.toLowerCase().includes(needle)) return false;
    if (soonParam) {
      const due = deadlineMap.get(p.id)?.due_at;
      const days = due ? daysUntil(due) : null;
      if (days == null || days < 0 || days > 60) return false;
    }
    return true;
  });

  const sorted = [...matched].sort((a, b) => {
    if (sortParam === "pay") return approxAnnualUsd(b) - approxAnnualUsd(a);
    const da = deadlineMap.get(a.id)?.due_at;
    const db_ = deadlineMap.get(b.id)?.due_at;
    if (da && db_) return da.localeCompare(db_);
    if (da) return -1;
    if (db_) return 1;
    return a.name.localeCompare(b.name);
  });

  const hasActiveFilters = Boolean(
    moneyDirection !== "participant_earns" || degreeParam || categoryParam || soonParam || q
  );

  function qs(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = {
      degree: degreeParam,
      category: categoryParam,
      sort: sortParam,
      money: moneyParam,
      q: q || undefined,
      soon: soonParam ? "1" : undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/programs?${s}` : "/programs";
  }

  return (
    <div>
      {/* The search box IS the page. With 380-odd rows, typing a name or a
          word like "conservation" beats any amount of scrolling, so the first
          screen is nothing but the field and the filters that narrow it. The
          catalog itself starts below the fold on purpose. */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="mx-auto flex min-h-[82svh] max-w-3xl flex-col justify-center px-4 py-12">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {programs.length} paths tracked · nothing here is sponsored
          </p>
          <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Search every gap year we know of
          </h1>

          {/* A GET form keeps the query in the URL like every other filter, so
              the page stays server-rendered and a shared link reproduces the
              exact result. */}
          <form action="/programs" className="mt-7">
            {degreeParam && <input type="hidden" name="degree" value={degreeParam} />}
            {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
            {sortParam && <input type="hidden" name="sort" value={sortParam} />}
            {moneyParam && <input type="hidden" name="money" value={moneyParam} />}
            {soonParam && <input type="hidden" name="soon" value="1" />}
            <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-md transition-shadow focus-within:border-ring focus-within:shadow-lg">
              <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Program, operator, or keyword"
                aria-label="Search programs"
                enterKeyHint="search"
                className="min-h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="min-h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-6"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Try</span>
            {["AmeriCorps", "conservation", "Japan"].map((example) => (
              <Link
                key={example}
                href={qs({ q: example })}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {example}
              </Link>
            ))}
          </div>

          {/* Filters are visible, not folded away behind a disclosure: they are
              the second half of the search box, and a filter nobody can see is
              a filter nobody uses. */}
          <div className="mt-8 space-y-3 rounded-2xl border bg-card/60 p-4 sm:p-5">
            <FilterRow label="Money">
              {MONEY_TABS.map((t) => (
                <FilterPill
                  key={t.label}
                  href={qs({ money: t.value })}
                  active={moneyDirection === (t.value ?? "participant_earns")}
                  size="sm"
                >
                  {t.label}
                </FilterPill>
              ))}
            </FilterRow>

            <FilterRow label="Type">
              <FilterPill href={qs({ category: undefined })} active={!categoryParam} size="sm">
                All types
              </FilterPill>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <FilterPill
                  key={key}
                  href={qs({ category: key })}
                  active={categoryParam === key}
                  size="sm"
                >
                  {label}
                </FilterPill>
              ))}
            </FilterRow>

            <FilterRow label="Stage">
              <FilterPill href={qs({ degree: undefined })} active={!degreeParam} size="sm">
                Any stage
              </FilterPill>
              <FilterPill href={qs({ degree: "0" })} active={degreeParam === "0"} size="sm">
                No degree
              </FilterPill>
              <FilterPill href={qs({ degree: "1" })} active={degreeParam === "1"} size="sm">
                Have a degree
              </FilterPill>
              <FilterPill
                href={qs({ soon: soonParam ? undefined : "1" })}
                active={soonParam}
                size="sm"
              >
                Closing in 60 days
              </FilterPill>
            </FilterRow>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <a href="#results" className="font-medium text-foreground underline underline-offset-4">
              {sorted.length} {sorted.length === 1 ? "path" : "paths"} below
            </a>
            {hasActiveFilters && (
              <>
                {" · "}
                <Link href="/programs" className="underline underline-offset-4">
                  Clear filters
                </Link>
              </>
            )}
          </p>
        </div>
      </section>

      <div id="results" className="mx-auto max-w-6xl scroll-mt-4 px-4 py-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {sorted.length} of {programs.length} paths
              {q && <> matching &ldquo;{q}&rdquo;</>}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {moneyDirection === "participant_earns"
                ? "Every one of these pays you."
                : "Comparison view — some of these charge."}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="mr-1 text-muted-foreground">Sort</span>
            <FilterPill href={qs({ sort: undefined })} active={sortParam !== "pay"} size="sm">
              Deadline
            </FilterPill>
            <FilterPill href={qs({ sort: "pay" })} active={sortParam === "pay"} size="sm">
              Pay
            </FilterPill>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {sorted.map((p) => {
            const money = MONEY_UI[p.money_direction] ?? MONEY_UI.participant_earns;
            const funding = FUNDING_UI[p.funding_status];
            const cost = formatCostShort(p);
            const isPaying = p.money_direction === "participant_pays" && Boolean(cost);
            const deadline = deadlineMap.get(p.id);
            const days = daysUntil(deadline?.due_at ?? null);

            return (
              <Link
                key={p.id}
                href={`/programs/${p.slug}`}
                className="group relative flex flex-col rounded-xl border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium leading-snug group-hover:underline decoration-1 underline-offset-2">
                    {p.name}
                  </h3>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {p.operator}
                </p>

                {/* The money figure is the point of the card, so it gets the size.
                    Cost leads ONLY when the participant is net paying — an earning
                    job with an upfront cost (STCW certification, fire boots) still
                    leads with its pay, and shows the outlay underneath. */}
                <p
                  className={cn(
                    "mt-3 text-lg font-semibold tabular-nums",
                    isPaying ? TONE_TEXT.pay : "text-foreground"
                  )}
                >
                  {isPaying ? cost : formatPayShort(p)}
                  {isPaying && <span className="ml-1 text-xs font-normal opacity-70">to join</span>}
                </p>
                {!isPaying && cost && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{cost} upfront to start</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {money.tone !== "earn" && (
                    <Badge variant="outline" className={TONE_BADGE[money.tone]}>
                      {money.label}
                    </Badge>
                  )}
                  {funding && (
                    <Badge variant="outline" className={TONE_BADGE[funding.tone]}>
                      {funding.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {CATEGORY_LABELS[p.category] ?? p.category}
                  </Badge>
                  {p.degree_required === 1 && (
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      Degree
                    </Badge>
                  )}
                </div>

                <div className="mt-3 border-t pt-2.5 text-xs text-muted-foreground">
                  {deadline?.due_at ? (
                    <span>
                      Due {formatDateShort(deadline.due_at)}
                      {days != null && days >= 0 && (
                        <span className="text-foreground font-medium"> · {days}d left</span>
                      )}
                    </span>
                  ) : (
                    <span>Rolling — no fixed deadline</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Nothing matches those filters.{" "}
            <Link href="/programs" className="underline">
              Clear them
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}

// Label + pills on one line, stacking on a phone. Keeps three groups of
// filters legible without a card each.
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="w-full shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:w-14">
        {label}
      </span>
      {children}
    </div>
  );
}
