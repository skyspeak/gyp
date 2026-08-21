import Link from "next/link";
import { Search } from "lucide-react";
import { buildGallery } from "@/lib/gallery";
import { formatCents } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/programs";
import { formatMonth } from "@/lib/plans";
import { MONEY_UI, TONE_BADGE, TONE_TEXT } from "@/lib/money-ui";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ForkButton from "./fork-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Five worked gap years — Gap Year Platform",
  description:
    "Five gap years built from real programs, with real durations and what each one actually pays or costs. Fork any of them.",
};

export default async function GalleryPage() {
  const proposals = await buildGallery();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-balance">
        Five years, priced.
      </h1>
      <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-pretty">
        Each one is assembled from real programs, using each program&apos;s actual term length —
        not a guess. Take any of them as a starting point and change everything.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {proposals.map((p) => {
          const net = p.totals.netHigh;
          // Cost only leads when the year itself is pay-to-participate. An
          // earning year with an upfront outlay still leads with its pay.
          const costs = p.isPayingYear && p.totals.costHigh > 0;
          const upfront = !p.isPayingYear && p.totals.costHigh > 0 ? p.totals.costHigh : 0;
          const ambiguous = p.totals.netLow < 0 && p.totals.netHigh > 0;

          return (
            <article
              key={p.template.id}
              className={cn(
                "flex flex-col rounded-2xl border p-5",
                costs && "border-pay/30 bg-pay-muted/25"
              )}
            >
              <p className="text-xs text-muted-foreground">{p.template.question}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-balance">
                {p.template.title}
              </h2>

              {/* The bottom line, before the detail. */}
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    costs ? TONE_TEXT.pay : ambiguous ? TONE_TEXT.warn : TONE_TEXT.earn
                  )}
                >
                  {costs
                    ? `−${formatCents(p.totals.costHigh)}`
                    : p.paidAbroad
                      ? "Paid locally"
                      : p.totals.earnsLow === p.totals.earnsHigh
                        ? formatCents(net)
                        : `${formatCents(p.totals.earnsLow)}–${formatCents(p.totals.earnsHigh)}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.paidAbroad
                    ? `salary in local currency · ${p.monthsFilled} months`
                    : `over ${p.monthsFilled} month${p.monthsFilled === 1 ? "" : "s"}`}
                  {p.totals.educationAward > 0 &&
                    ` · +${formatCents(p.totals.educationAward)} education award`}
                  {upfront > 0 && ` · ${formatCents(upfront)} upfront to start`}
                </span>
              </div>

              {p.couldHaveEarned != null && (
                <p className="mt-2 rounded-lg border border-earn/25 bg-earn-muted/50 p-2.5 text-xs text-earn-foreground">
                  The same {p.monthsFilled} months on the best-paying option we list would have
                  earned about <strong>{formatCents(p.couldHaveEarned)}</strong> instead — a swing
                  of roughly {formatCents(p.couldHaveEarned + p.totals.costHigh)}.
                </p>
              )}

              <ol className="mt-4 space-y-1.5">
                {p.blocks.map((b, i) => {
                  const money = MONEY_UI[b.program.money_direction] ?? MONEY_UI.participant_earns;
                  return (
                    <li key={b.program.id} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold tabular-nums">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <Link
                          href={`/programs/${b.program.slug}`}
                          className="font-medium hover:underline"
                        >
                          {b.program.name}
                        </Link>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="tabular-nums">
                            {formatMonth(b.startsOn)} – {formatMonth(b.endsOn)} · {b.months} mo
                          </span>
                          {money.tone !== "earn" && (
                            <Badge variant="outline" className={TONE_BADGE[money.tone]}>
                              {money.label}
                            </Badge>
                          )}
                          <span>{CATEGORY_LABELS[b.program.category] ?? b.program.category}</span>
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>

              {p.template.note && (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {p.template.note}
                </p>
              )}

              <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
                <div className="sm:flex-1">
                  <ForkButton
                    slugs={p.blocks.map((b) => b.program.slug)}
                    cohort={p.template.cohort}
                    title={p.template.title}
                  />
                </div>
                {/* The onward path: the rest of the catalog shaped like this
                    card, already filtered. */}
                <Link
                  href={p.moreLike.href}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted sm:flex-1"
                >
                  <Search className="size-3.5 text-muted-foreground" />
                  {p.moreLike.count} {p.moreLike.label}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        None of these are recommendations and nobody paid to appear here.{" "}
        <Link href="/design" className="underline">
          Build your own instead
        </Link>
        .
      </p>
    </div>
  );
}
