import Link from "next/link";
import { ArrowUpRight, ChevronDown, SlidersHorizontal } from "lucide-react";
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

export const metadata = { title: "Programs — Gap Year Platform" };

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

  const sorted = [...programs].sort((a, b) => {
    if (sortParam === "pay") return approxAnnualUsd(b) - approxAnnualUsd(a);
    const da = deadlineMap.get(a.id)?.due_at;
    const db_ = deadlineMap.get(b.id)?.due_at;
    if (da && db_) return da.localeCompare(db_);
    if (da) return -1;
    if (db_) return 1;
    return a.name.localeCompare(b.name);
  });

  // Drives both the summary label and whether the panel starts open, so the
  // collapsed state can never hide a filter that's actually applied.
  const activeSummary = [
    moneyDirection !== "participant_earns"
      ? MONEY_TABS.find((t) => (t.value ?? "participant_earns") === moneyDirection)?.label
      : null,
    degreeParam === "0" ? "No degree" : degreeParam === "1" ? "Have a degree" : null,
    categoryParam ? CATEGORY_LABELS[categoryParam] ?? categoryParam : null,
  ].filter((x): x is string => Boolean(x));
  const hasActiveFilters = activeSummary.length > 0;

  function qs(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = {
      degree: degreeParam,
      category: categoryParam,
      sort: sortParam,
      money: moneyParam,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/programs?${s}` : "/programs";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Programs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sorted.length} paths ·{" "}
            {moneyDirection === "participant_earns" ? "all of these pay you" : "comparison view"}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground mr-1">Sort</span>
          <FilterPill href={qs({ sort: undefined })} active={sortParam !== "pay"} size="sm">
            Deadline
          </FilterPill>
          <FilterPill href={qs({ sort: "pay" })} active={sortParam === "pay"} size="sm">
            Pay
          </FilterPill>
        </div>
      </div>

      {/* Collapsed by default so the catalog is the first thing you see.
          Native <details> rather than a client component: the filters live in
          the querystring, so this page stays server-rendered with no
          hydration. Opens automatically when a filter is already applied, so
          a shared URL never hides the state that produced it. */}
      <details open={hasActiveFilters} className="group mt-5">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {activeSummary.length > 0 && (
            <span className="text-muted-foreground">· {activeSummary.join(", ")}</span>
          )}
          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-3 rounded-xl border bg-muted/20 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Money direction
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
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
          </div>

          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Stage
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <FilterPill href={qs({ degree: undefined })} active={!degreeParam} size="sm">
              Any stage
            </FilterPill>
            <FilterPill href={qs({ degree: "0" })} active={degreeParam === "0"} size="sm">
              No degree
            </FilterPill>
            <FilterPill href={qs({ degree: "1" })} active={degreeParam === "1"} size="sm">
              Have a degree
            </FilterPill>
          </div>

          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Type
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
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
          </div>

          {hasActiveFilters && (
            <Link
              href="/programs"
              className="mt-3 inline-block text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear all filters
            </Link>
          )}
        </div>
      </details>

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
              className="group relative flex flex-col rounded-xl border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium leading-snug group-hover:underline decoration-1 underline-offset-2">
                  {p.name}
                </h2>
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
  );
}
