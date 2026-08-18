// Maps research-agent JSON output into SeedProgram rows.
//
// Research agents emit a flatter, more verbose shape than SeedProgram (money
// as *_cents, booleans instead of 0/1, plus meta fields like confidence and
// selectivity_note). Transcribing that by hand across dozens of entries is
// exactly how a wrong pay figure gets introduced, so we map it mechanically
// and fold the meta fields into caveat_note instead of dropping them.
//
// Anything below "medium" confidence gets an explicit warning prepended to
// caveat_note, so low-confidence figures are visible on the page rather than
// buried in a scratch file.

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { SeedProgram, SeedDeadline, Category, MoneyDirection } from "./seed-data";

type ResearchDeadline = {
  cycle_label: string;
  kind: string;
  due_at_iso: string | null;
  source_tz: string | null;
  note: string | null;
};

type ResearchProgram = {
  slug: string;
  name: string;
  operator: string;
  category: string;
  stage?: string | null;
  money_direction?: string;
  summary: string;
  source_url: string;
  degree_required: number;
  min_age: number | null;
  max_age: number | null;
  citizenship: string | null;
  us_eligible?: boolean;
  other_eligibility: string | null;
  selectivity?: string | null;
  selectivity_note?: string | null;
  pay_type: string;
  pay_low_cents: number | null;
  pay_high_cents: number | null;
  pay_currency?: string | null;
  pay_note: string | null;
  net_take_home_note?: string | null;
  cost_low_cents?: number | null;
  cost_high_cents?: number | null;
  cost_note?: string | null;
  financial_aid_note?: string | null;
  housing_provided: boolean;
  meals_provided?: boolean;
  airfare_covered: boolean;
  education_award_cents?: number | null;
  term_min_weeks: number | null;
  term_max_weeks: number | null;
  college_credit_note?: string | null;
  funding_status: string;
  funding_note?: string | null;
  deadlines: ResearchDeadline[];
  confidence?: string;
  caveat_note?: string | null;
  legal_note?: string | null;
  notes?: string | null;
  exclude_reason?: string | null;
};

const VALID_KINDS = new Set(["national", "campus", "intent_to_apply", "opens", "rolling"]);

function bool01(v: boolean | undefined, fallback: 0 | 1 = 0): 0 | 1 {
  if (v === undefined) return fallback;
  return v ? 1 : 0;
}

function joinNotes(...parts: (string | null | undefined)[]): string | null {
  const kept = parts.map((p) => p?.trim()).filter((p): p is string => Boolean(p));
  return kept.length ? kept.join(" ") : null;
}

function toSeedDeadline(d: ResearchDeadline): SeedDeadline {
  return {
    cycle_label: d.cycle_label,
    // Anything unrecognised becomes 'rolling' rather than being invented into
    // a kind the UI doesn't know how to label.
    kind: (VALID_KINDS.has(d.kind) ? d.kind : "rolling") as SeedDeadline["kind"],
    due_at: d.due_at_iso ?? null,
    source_tz: d.source_tz ?? null,
    note: d.note ?? null,
  };
}

export function toSeedProgram(r: ResearchProgram): SeedProgram {
  const lowConfidence =
    r.confidence === "low"
      ? "Some figures here could not be confirmed against an official source and are marked unverified in the notes below — check them yourself before relying on them."
      : null;

  return {
    slug: r.slug,
    name: r.name,
    operator: r.operator,
    category: r.category as Category,
    summary: r.summary,
    source_url: r.source_url,
    degree_required: (r.degree_required === 1 ? 1 : 0) as 0 | 1,
    money_direction: (r.money_direction ?? "participant_earns") as MoneyDirection,
    stage: (r.stage as SeedProgram["stage"]) ?? null,
    min_age: r.min_age,
    max_age: r.max_age,
    citizenship: (r.citizenship as SeedProgram["citizenship"]) ?? null,
    us_eligible: bool01(r.us_eligible, 1),
    other_eligibility: r.other_eligibility,
    selectivity: (r.selectivity as SeedProgram["selectivity"]) ?? null,
    pay_type: r.pay_type as SeedProgram["pay_type"],
    pay_low: r.pay_low_cents ?? null,
    pay_high: r.pay_high_cents ?? null,
    pay_currency: r.pay_currency ?? "USD",
    pay_note: joinNotes(r.pay_note, r.net_take_home_note),
    cost_low: r.cost_low_cents ?? null,
    cost_high: r.cost_high_cents ?? null,
    cost_note: joinNotes(r.cost_note, r.financial_aid_note),
    housing_provided: bool01(r.housing_provided),
    meals_provided: bool01(r.meals_provided),
    airfare_covered: bool01(r.airfare_covered),
    education_award: r.education_award_cents ?? null,
    term_min_weeks: r.term_min_weeks,
    term_max_weeks: r.term_max_weeks,
    college_credit_note: r.college_credit_note ?? null,
    // Everything a reader should know before committing, in one verbatim field.
    caveat_note: joinNotes(lowConfidence, r.caveat_note, r.legal_note, r.notes, r.selectivity_note),
    funding_status: r.funding_status as SeedProgram["funding_status"],
    funding_note: r.funding_note ?? null,
    deadlines: (r.deadlines ?? []).map(toSeedDeadline),
  };
}

// Reads a research JSON file from scratch/ and returns seed rows. Entries with
// an exclude_reason are dropped: the agent flagged them as not meeting the
// directory's bar (fee-only, defunct, or duplicate).
export function loadResearch(filename: string): SeedProgram[] {
  const path = join(__dirname, "../scratch", filename);
  if (!existsSync(path)) {
    console.warn(`  (skipping ${filename} — not present)`);
    return [];
  }
  const raw = JSON.parse(readFileSync(path, "utf-8")) as ResearchProgram[];
  const kept = raw.filter((r) => !r.exclude_reason);
  const dropped = raw.length - kept.length;
  if (dropped > 0) console.log(`  ${filename}: dropped ${dropped} flagged entr${dropped === 1 ? "y" : "ies"}`);
  return kept.map(toSeedProgram);
}
