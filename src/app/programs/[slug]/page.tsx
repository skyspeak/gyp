import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, TriangleAlert, Ban, Info } from "lucide-react";
import {
  getProgramBySlug,
  getDeadlinesForProgram,
  getFallbacksForProgram,
  listPrograms,
  CATEGORY_LABELS,
  CITIZENSHIP_LABELS,
  SELECTIVITY_LABELS,
  type Program,
} from "@/lib/programs";
import {
  formatPay,
  formatPayShort,
  formatCostShort,
  formatTerm,
  formatDeadline,
  formatCents,
  daysUntil,
} from "@/lib/format";
import { approxAnnualUsd } from "@/lib/pay-sort";
import { MONEY_UI, FUNDING_UI, TONE_BADGE, TONE_ALERT, TONE_TEXT } from "@/lib/money-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import WatchButton from "./watch-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return {};
  return { title: `${program.name} — Gap Year Platform` };
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 text-sm font-medium", tone)}>{value}</dd>
    </div>
  );
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const [deadlines, fallbacks] = await Promise.all([
    getDeadlinesForProgram(program.id),
    getFallbacksForProgram(program.id),
  ]);

  const money = MONEY_UI[program.money_direction] ?? MONEY_UI.participant_earns;
  const funding = FUNDING_UI[program.funding_status];
  const cost = formatCostShort(program);
  const isPaying = program.money_direction === "participant_pays" && Boolean(cost);

  // What the same stretch of time would pay instead. Prefer same category,
  // fall back to the whole earning catalog — "these pay instead" is the point,
  // not the category match. Ranked by annualised USD so the comparison is real
  // across currencies and pay periods.
  let alternatives: Program[] = [];
  if (isPaying) {
    const cohort = { moneyDirection: "participant_earns" as const, degreeRequired: (program.degree_required === 1 ? 1 : 0) as 0 | 1 };
    const rank = (list: Program[]) =>
      list.filter((p) => p.pay_low != null).sort((a, b) => approxAnnualUsd(b) - approxAnnualUsd(a));
    const inCategory = rank(await listPrograms({ ...cohort, category: program.category }));
    alternatives = (inCategory.length >= 2 ? inCategory : rank(await listPrograms(cohort))).slice(0, 3);
  }

  const nextDeadline = deadlines.find((d) => d.due_at && new Date(d.due_at) > new Date());

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All programs
      </Link>

      {/* ---- Warnings first. Never collapsed, never softened. ---- */}
      {funding && (
        <div className={cn("mt-5 rounded-lg border p-3.5 text-sm", TONE_ALERT[funding.tone])}>
          <p className="flex items-center gap-1.5 font-semibold">
            {funding.tone === "danger" ? <Ban className="size-4" /> : <TriangleAlert className="size-4" />}
            {funding.label}
          </p>
          {program.funding_note && <p className="mt-1 opacity-90">{program.funding_note}</p>}
          {fallbacks.length > 0 && (
            <p className="mt-2">
              Try instead:{" "}
              {fallbacks.map((f, i) => (
                <span key={f.id}>
                  {i > 0 && ", "}
                  <Link href={`/programs/${f.slug}`} className="font-medium underline">
                    {f.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {program.us_eligible === 0 && (
        <div className={cn("mt-3 rounded-lg border p-3.5 text-sm", TONE_ALERT.neutral)}>
          <p className="flex items-center gap-1.5 font-semibold">
            <Info className="size-4" /> Not open to U.S. citizens
          </p>
          <p className="mt-1 text-muted-foreground">
            Listed because it&apos;s widely — and wrongly — recommended to Americans.
          </p>
        </div>
      )}

      {/* ---- Title ---- */}
      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {money.tone !== "earn" && (
            <Badge variant="outline" className={TONE_BADGE[money.tone]}>
              {money.label}
            </Badge>
          )}
          <Badge variant="outline" className="border-border text-muted-foreground">
            {CATEGORY_LABELS[program.category] ?? program.category}
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">
            {program.degree_required ? "Degree required" : "No degree required"}
          </Badge>
        </div>
        <h1 className="mt-2.5 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          {program.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{program.operator}</p>
      </div>

      {/* ---- The money line, stated once and large ---- */}
      <div
        className={cn(
          "mt-5 rounded-xl border p-4",
          isPaying ? TONE_ALERT.pay : "bg-card"
        )}
      >
        <p className="text-xs uppercase tracking-wide opacity-70">
          {isPaying ? "Costs you" : "Pays you"}
        </p>
        <p className={cn("mt-0.5 text-2xl font-semibold tabular-nums", isPaying && TONE_TEXT.pay)}>
          {isPaying ? cost : formatPay(program)}
        </p>
        {/* Cost notes run long by design (they list everything the headline fee
            excludes). Show the opening lines here and keep the rest one click
            away rather than dropping a wall of prose on the page. */}
        {isPaying && program.cost_note && (
          <p className="mt-2 line-clamp-3 text-sm opacity-90">{program.cost_note}</p>
        )}
        {!isPaying && cost && (
          <p className="mt-1 text-sm text-muted-foreground">{cost} upfront to start</p>
        )}

        {isPaying && (
          <p className="mt-3 border-t border-current/15 pt-2.5 text-xs opacity-80">
            We take no commission if you enroll and have no relationship with the operator.
          </p>
        )}

        {alternatives.length > 0 && (
          <div className="mt-3 border-t border-current/15 pt-3">
            <p className="text-xs font-medium opacity-80">These pay you instead</p>
            <div className="mt-1.5 flex flex-col gap-1">
              {alternatives.map((alt) => (
                <Link
                  key={alt.id}
                  href={`/programs/${alt.slug}`}
                  className="flex items-baseline justify-between gap-3 text-sm hover:underline"
                >
                  <span className="truncate">{alt.name}</span>
                  <span className="shrink-0 font-medium tabular-nums">{formatPayShort(alt)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-foreground/90">{program.summary}</p>

      {/* ---- Facts as a scannable grid, not prose ---- */}
      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Term" value={formatTerm(program.term_min_weeks, program.term_max_weeks) ?? "Varies"} />
        <Stat label="Housing" value={program.housing_provided ? "Provided" : "Not provided"} />
        {program.meals_provided === 1 && <Stat label="Meals" value="Provided" />}
        <Stat label="Airfare" value={program.airfare_covered ? "Covered" : "Not covered"} />
        {program.education_award != null && (
          <Stat label="Education award" value={formatCents(program.education_award) ?? "—"} />
        )}
        {program.selectivity && (
          <Stat
            label="Selectivity"
            value={SELECTIVITY_LABELS[program.selectivity] ?? program.selectivity}
          />
        )}
        {(program.min_age || program.max_age) && (
          <Stat
            label="Age"
            value={`${program.min_age ?? "—"}${program.max_age ? `–${program.max_age}` : "+"}`}
          />
        )}
        <Stat
          label="Citizenship"
          value={
            program.citizenship
              ? CITIZENSHIP_LABELS[program.citizenship] ?? program.citizenship
              : "See eligibility"
          }
        />
      </dl>

      {/* ---- Deadlines ---- */}
      {deadlines.length > 0 && (
        <section className="mt-7">
          <h2 className="text-sm font-semibold">
            Deadlines
            {nextDeadline && daysUntil(nextDeadline.due_at) != null && (
              <span className="ml-2 font-normal text-muted-foreground">
                next in {daysUntil(nextDeadline.due_at)} days
              </span>
            )}
          </h2>
          <ul className="mt-2 divide-y rounded-lg border">
            {deadlines.map((d) => {
              const past = d.due_at ? new Date(d.due_at) < new Date() : false;
              return (
                <li
                  key={d.id}
                  className={cn(
                    "flex flex-col gap-0.5 p-3 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
                    past && "opacity-50"
                  )}
                >
                  <div className="min-w-0">
                    <span className="font-medium">{d.cycle_label}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {d.kind.replace(/_/g, " ")}
                    </span>
                    {d.note && <p className="mt-0.5 text-xs text-muted-foreground">{d.note}</p>}
                  </div>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatDeadline(d.due_at, d.source_tz)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ---- Long-form detail, collapsed. The substance stays; the wall of
             text does not. Anything genuinely dangerous stayed above. ---- */}
      {(program.other_eligibility ||
        program.caveat_note ||
        program.college_credit_note ||
        (isPaying && program.cost_note)) && (
        <Accordion className="mt-7 rounded-lg border px-3">
          {isPaying && program.cost_note && (
            <AccordionItem value="cost">
              <AccordionTrigger>
                <span className={TONE_TEXT.pay}>Full cost breakdown</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {program.cost_note}
              </AccordionContent>
            </AccordionItem>
          )}
          {program.college_credit_note && (
            <AccordionItem value="credit">
              <AccordionTrigger>
                <span className={TONE_TEXT.warn}>College credit &amp; financial aid</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                <p>{program.college_credit_note}</p>
                <p className="mt-2">
                  In general: merit money usually rides through a deferral, need-based aid usually
                  needs a refiled FAFSA, and earning credit anywhere can turn a deferred admit into
                  a transfer applicant — forfeiting the original offer and its scholarships. Get it
                  in writing from admissions first.
                </p>
              </AccordionContent>
            </AccordionItem>
          )}
          {program.other_eligibility && (
            <AccordionItem value="eligibility">
              <AccordionTrigger>Eligibility detail</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {program.other_eligibility}
              </AccordionContent>
            </AccordionItem>
          )}
          {program.caveat_note && (
            <AccordionItem value="caveats">
              <AccordionTrigger>Before you commit</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {program.caveat_note}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      {/* ---- Actions ---- */}
      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Button
          nativeButton={false}
          render={<a href={program.source_url} target="_blank" rel="noopener noreferrer" />}
        >
          Official site <ExternalLink className="size-3.5" />
        </Button>
        <WatchButton programId={program.id} programName={program.name} />
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Verified {new Date(program.last_verified_at).toLocaleDateString()} ·{" "}
        <a
          href={program.source_url}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {new URL(program.source_url).hostname}
        </a>
      </p>
    </div>
  );
}
