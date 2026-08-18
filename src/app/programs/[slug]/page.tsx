import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProgramBySlug,
  getDeadlinesForProgram,
  getFallbacksForProgram,
  listPrograms,
  CATEGORY_LABELS,
  FUNDING_LABELS,
  CITIZENSHIP_LABELS,

  SELECTIVITY_LABELS,
} from "@/lib/programs";
import { formatPay, formatCostShort, formatTerm, formatDeadline, formatCents, formatPayShort } from "@/lib/format";
import WatchButton from "./watch-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return {};
  return { title: `${program.name} — Stipend Clock` };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const [deadlines, fallbacks] = await Promise.all([
    getDeadlinesForProgram(program.id),
    getFallbacksForProgram(program.id),
  ]);

  const funding = FUNDING_LABELS[program.funding_status] ?? FUNDING_LABELS.active;

  const cost = formatCostShort(program);

  // For a pay-to-participate path, the single most useful thing we can show is
  // what the same time spent on an earning path would pay instead. We surface
  // that comparison and take nothing from either side. Prefer same-category
  // alternatives, but fall back to the whole earning catalog rather than show
  // nothing — "these pay instead" is the point, not the category match.
  let earningAlternatives: typeof fallbacks = [];
  if (program.money_direction === "participant_pays") {
    const sameCohort = { moneyDirection: "participant_earns" as const, degreeRequired: (program.degree_required === 1 ? 1 : 0) as 0 | 1 };
    const byPay = (list: typeof fallbacks) =>
      list
        .filter((p) => p.pay_low != null)
        .sort((a, b) => (b.pay_high ?? b.pay_low ?? 0) - (a.pay_high ?? a.pay_low ?? 0));

    const inCategory = byPay(await listPrograms({ ...sameCohort, category: program.category }));
    earningAlternatives = (inCategory.length >= 2 ? inCategory : byPay(await listPrograms(sameCohort))).slice(0, 3);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/programs" className="text-sm text-neutral-500 hover:underline">
        &larr; All programs
      </Link>

      {funding.tone !== "ok" && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            funding.tone === "warn"
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <p className="font-semibold">{funding.label}</p>
          {program.funding_note && <p className="mt-1">{program.funding_note}</p>}
          {fallbacks.length > 0 && (
            <p className="mt-2">
              Comparable options:{" "}
              {fallbacks.map((f, i) => (
                <span key={f.id}>
                  {i > 0 && ", "}
                  <Link href={`/programs/${f.slug}`} className="underline font-medium">
                    {f.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {program.money_direction === "participant_pays" && (
        <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">You pay for this one{cost ? ` — ${cost}` : ""}</p>
          {program.cost_note && <p className="mt-1 font-medium">{program.cost_note}</p>}
          <p className="mt-1">
            We list it so you can compare it honestly. We are not paid to show it, we take no
            commission if you enroll, and we have no relationship with the operator.
          </p>
          {earningAlternatives.length > 0 && (
            <p className="mt-2">
              Paths that pay you instead:{" "}
              {earningAlternatives.map((alt, i) => (
                <span key={alt.id}>
                  {i > 0 && ", "}
                  <Link href={`/programs/${alt.slug}`} className="underline font-medium">
                    {alt.name}
                  </Link>{" "}
                  ({formatPayShort(alt)})
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {program.us_eligible === 0 && (
        <div className="mt-4 rounded-lg border border-neutral-400 bg-neutral-100 p-4 text-sm text-neutral-800">
          <p className="font-semibold">Not open to U.S. citizens</p>
          <p className="mt-1">
            Listed because it is widely and incorrectly recommended to Americans. Read the
            eligibility note before spending time on it.
          </p>
        </div>
      )}

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{program.name}</h1>
      <p className="mt-1 text-neutral-500">
        {program.operator} · {CATEGORY_LABELS[program.category] ?? program.category} ·{" "}
        {program.degree_required ? "Degree required" : "No degree required"}
      </p>
      <p className="mt-4 text-neutral-800">{program.summary}</p>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {cost ? (
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">Cost to you</div>
            <div className="mt-1 font-medium text-rose-800">{cost}</div>
          </div>
        ) : (
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">Pay</div>
            <div className="mt-1 font-medium">{formatPay(program)}</div>
          </div>
        )}
        {cost && program.pay_type !== "none" && (program.pay_low != null || program.pay_note) && (
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">Pay</div>
            <div className="mt-1 font-medium">{formatPay(program)}</div>
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">Term length</div>
          <div className="mt-1 font-medium">{formatTerm(program.term_min_weeks, program.term_max_weeks) ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">Housing</div>
          <div className="mt-1 font-medium">{program.housing_provided ? "Provided" : "Not provided"}</div>
        </div>
        {program.meals_provided === 1 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">Meals</div>
            <div className="mt-1 font-medium">Provided</div>
          </div>
        )}
        {program.selectivity && (
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">Selectivity</div>
            <div className="mt-1 font-medium">
              {SELECTIVITY_LABELS[program.selectivity] ?? program.selectivity}
            </div>
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">Airfare</div>
          <div className="mt-1 font-medium">{program.airfare_covered ? "Covered" : "Not covered"}</div>
        </div>
        {program.education_award != null && (
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400">Education award</div>
            <div className="mt-1 font-medium">{formatCents(program.education_award)}</div>
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">Citizenship</div>
          <div className="mt-1 font-medium">
            {program.citizenship ? CITIZENSHIP_LABELS[program.citizenship] ?? program.citizenship : "See eligibility"}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Eligibility</h2>
        <ul className="mt-2 text-sm text-neutral-700 space-y-1">
          {(program.min_age || program.max_age) && (
            <li>
              Age {program.min_age ?? "—"}
              {program.max_age ? `–${program.max_age}` : "+"}
            </li>
          )}
          {program.other_eligibility && <li>{program.other_eligibility}</li>}
        </ul>
      </section>

      {/* Rendered verbatim and never summarised: visa/legal reality, operator
          finances, marketing-vs-reality. */}
      {program.caveat_note && (
        <section className="mt-8 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
          <h2 className="text-sm font-semibold">Before you commit</h2>
          <p className="mt-1 text-sm text-neutral-700">{program.caveat_note}</p>
        </section>
      )}

      {program.college_credit_note && (
        <section className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">College credit and financial aid</h2>
          <p className="mt-1 text-sm text-amber-900">{program.college_credit_note}</p>
          <p className="mt-2 text-sm text-amber-900">
            Generally: merit money usually rides through a deferral, need-based aid usually
            requires refiling the FAFSA, and enrolling for credit anywhere can convert a deferred
            admit into a transfer applicant — forfeiting the original offer and its scholarships.
            Confirm with the admissions office in writing before enrolling for credit.
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Deadlines</h2>
        <ul className="mt-2 divide-y divide-neutral-200 border-t border-b border-neutral-200">
          {deadlines.map((d) => (
            <li key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 text-sm">
              <div>
                <span className="font-medium">{d.cycle_label}</span>{" "}
                <span className="text-neutral-500">
                  ({d.kind.replace("_", " ")}
                  {d.note ? ` — ${d.note}` : ""})
                </span>
              </div>
              <div className="text-neutral-700 shrink-0">{formatDeadline(d.due_at, d.source_tz)}</div>
            </li>
          ))}
          {deadlines.length === 0 && (
            <li className="py-3 text-sm text-neutral-500">No deadlines on file yet.</li>
          )}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href={program.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700"
        >
          Apply on official site
        </a>
        <WatchButton programId={program.id} programName={program.name} />
      </div>

      <p className="mt-6 text-xs text-neutral-400">
        Last verified {new Date(program.last_verified_at).toLocaleDateString()}. Source:{" "}
        <a href={program.source_url} className="underline" target="_blank" rel="noopener noreferrer">
          {new URL(program.source_url).hostname}
        </a>
      </p>
    </div>
  );
}
