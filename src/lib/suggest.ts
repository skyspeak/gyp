// Turns "what do you want out of this year" into a year that is already laid
// out, using each program's real term length.
//
// The previous builder asked people to pick start and end months from
// dropdowns. That was wrong twice over: it made a parent guess a duration the
// database already knows (NCCC is 10 months, not whatever you drag it to), and
// it opened with a scheduling chore instead of a question about what the year
// is for. Intent comes first here, and length is derived, never invented.

import type { Program } from "./programs";
import { approxAnnualUsd } from "./pay-sort";

export type Intent =
  | "earn"
  | "outdoors"
  | "abroad"
  | "try_career"
  | "serve"
  | "credential"
  | "unsure";

export const INTENTS: { id: Intent; label: string; blurb: string }[] = [
  { id: "earn", label: "Bank real money", blurb: "Come out with savings, not debt" },
  { id: "outdoors", label: "Be outside", blurb: "Physical work, land, weather" },
  { id: "abroad", label: "Live somewhere else", blurb: "Another country, long enough to matter" },
  { id: "try_career", label: "Test-drive a career", blurb: "Before committing years to it" },
  { id: "serve", label: "Do something useful", blurb: "Service, community, public good" },
  { id: "credential", label: "Come out qualified", blurb: "A licence, certification or trade" },
  { id: "unsure", label: "Honestly not sure yet", blurb: "Show a spread worth reacting to" },
];

// Which categories each intent draws from. An intent is a behaviour, not a
// taxonomy, so several map to overlapping buckets on purpose.
const INTENT_CATEGORIES: Record<Intent, string[]> = {
  earn: ["work", "conservation", "service", "trades", "teaching_abroad"],
  outdoors: ["conservation", "outdoor", "work"],
  abroad: ["teaching_abroad", "travel_study"],
  try_career: ["health", "research", "trades", "work"],
  serve: ["service", "health", "conservation"],
  credential: ["trades", "health"],
  unsure: ["service", "conservation", "work", "teaching_abroad", "outdoor", "trades", "health"],
};

export type Ambition = "year" | "semester" | "summer";

export const AMBITION_MONTHS: Record<Ambition, number> = {
  year: 12,
  semester: 6,
  summer: 3,
};

function weeksToMonths(weeks: number): number {
  return Math.max(1, Math.round(weeks / 4.345));
}

// A program's real length in months. Prefers the minimum term — the shortest
// honest commitment — and returns null when the catalog has no term data, so
// callers can say "length not published" instead of guessing.
export function programMonths(p: Program): number | null {
  if (p.term_min_weeks == null) return null;
  return weeksToMonths(p.term_min_weeks);
}

export type Suggestion = { program: Program; months: number };

// Greedily fills the requested window with the best-fitting programs, longest
// commitments first so a year reads as one or two real experiences rather than
// twelve one-month fragments.
export function suggestPlan(
  programs: Program[],
  intents: Intent[],
  ambition: Ambition
): Suggestion[] {
  const budget = AMBITION_MONTHS[ambition];
  const wanted = new Set(intents.flatMap((i) => INTENT_CATEGORIES[i] ?? []));

  const scored = programs
    .filter((p) => p.funding_status !== "defunded" && p.us_eligible === 1)
    .map((p) => {
      const months = programMonths(p);
      if (months == null || months > budget) return null;

      let score = 0;
      if (wanted.has(p.category)) score += 100;
      if (p.money_direction === "participant_earns") score += 60;
      else if (p.money_direction === "participant_pays") score -= 40;
      if (intents.includes("earn")) score += Math.min(40, approxAnnualUsd(p) / 2000);
      if (p.funding_status === "active") score += 15;
      // Prefer something substantial over a two-week taster.
      score += Math.min(25, months * 3);
      return { program: p, months, score };
    })
    .filter((x): x is { program: Program; months: number; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);

  const out: Suggestion[] = [];
  const usedOperators = new Set<string>();
  let remaining = budget;

  for (const cand of scored) {
    if (remaining <= 0) break;
    if (cand.months > remaining) continue;
    // Avoid proposing three flavours of the same operator.
    if (usedOperators.has(cand.program.operator)) continue;
    out.push({ program: cand.program, months: cand.months });
    usedOperators.add(cand.program.operator);
    remaining -= cand.months;
    if (out.length >= 4) break;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Placement. Blocks are laid end-to-end from the start of the cycle, each one
// as long as its program actually is.
// ---------------------------------------------------------------------------

export function cycleMonths(cycleLabel: string | null): string[] {
  const startYear = cycleLabel ? Number(cycleLabel.slice(0, 4)) : new Date().getFullYear();
  const y = Number.isFinite(startYear) ? startYear : new Date().getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const m = 9 + i;
    const year = m > 12 ? y + 1 : y;
    return `${year}-${String(m > 12 ? m - 12 : m).padStart(2, "0")}`;
  });
}

export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

// Finds the first stretch of free months long enough to hold `months`, so an
// added program lands somewhere sensible without anyone dragging anything.
export function firstFreeSlot(
  taken: { starts_on: string | null; ends_on: string | null }[],
  months: number,
  cycleLabel: string | null
): { startsOn: string; endsOn: string } {
  const cycle = cycleMonths(cycleLabel);
  const occupied = new Set<string>();
  for (const t of taken) {
    if (!t.starts_on || !t.ends_on) continue;
    for (const m of cycle) if (m >= t.starts_on && m <= t.ends_on) occupied.add(m);
  }

  for (let i = 0; i + months <= cycle.length; i++) {
    const window = cycle.slice(i, i + months);
    if (window.every((m) => !occupied.has(m))) {
      return { startsOn: window[0], endsOn: window[window.length - 1] };
    }
  }

  // Nothing free inside the cycle — append after the last block rather than
  // silently overlapping. The UI shows this as running past the year.
  const last = taken
    .map((t) => t.ends_on)
    .filter((x): x is string => Boolean(x))
    .sort()
    .pop();
  const start = last ? addMonths(last, 1) : cycle[0];
  return { startsOn: start, endsOn: addMonths(start, months - 1) };
}
