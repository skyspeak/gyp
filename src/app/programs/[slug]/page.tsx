import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProgramBySlug,
  getDeadlinesForProgram,
  getFallbacksForProgram,
  CATEGORY_LABELS,
  FUNDING_LABELS,
  CITIZENSHIP_LABELS,
} from "@/lib/programs";
import { formatPay, formatTerm, formatDeadline, formatCents } from "@/lib/format";
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

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{program.name}</h1>
      <p className="mt-1 text-neutral-500">
        {program.operator} · {CATEGORY_LABELS[program.category] ?? program.category} ·{" "}
        {program.degree_required ? "Degree required" : "No degree required"}
      </p>
      <p className="mt-4 text-neutral-800">{program.summary}</p>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">Pay</div>
          <div className="mt-1 font-medium">{formatPay(program)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">Term length</div>
          <div className="mt-1 font-medium">{formatTerm(program.term_min_weeks, program.term_max_weeks) ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-400">Housing</div>
          <div className="mt-1 font-medium">{program.housing_provided ? "Provided" : "Not provided"}</div>
        </div>
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
