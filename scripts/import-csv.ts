// Imports the exhaustive-scan CSV into SeedProgram rows.
//
// DELIBERATE: no dollar figures are parsed out of this file.
// 176 of its 252 money strings carry several amounts wrapped in caveats
// ("FY2026 exact dollar unverified", "varies by county", "e.g., one Michigan
// listing..."). Extracting cents from that would inject wrong numbers into a
// catalog whose whole value is that its numbers are right, so the prose is
// stored verbatim in pay_note/cost_note and the structured pay_low/pay_high
// stay null. Those rows render as "Pays, amount varies" and are counted as
// unpriced by the plan builder rather than guessed at.
//
// Everything imported here is marked provenance='bulk_import', which is the
// signal that a human has not confirmed it against the source yet.

import { readFileSync } from "fs";
import { join } from "path";
import type { SeedProgram, Category, MoneyDirection } from "./seed-data";

const CSV = "gap-year-opportunities-exhaustive-scan-2026.csv";

// Minimal RFC4180 parser — the file has quoted fields containing commas and
// newlines, so splitting on commas would silently corrupt rows.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function slugify(s: string): string {
  return s
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

const MONEY: Record<string, MoneyDirection> = {
  "YOU GET PAID": "participant_earns",
  "NET NEUTRAL": "net_neutral",
  "YOU PAY": "participant_pays",
};

// Category is inferred from the description, since the CSV has no such column.
// Order matters: the first match wins, so the more specific patterns lead.
const CATEGORY_RULES: [RegExp, Category][] = [
  [/\b(teach|tefl|tesol|esl|english assistant|language assistant|tutor|classroom|au pair|nanny)\b/i, "teaching_abroad"],
  [/\b(conservation|trail crew|forestry|wildland|habitat|watershed|restoration|park service|ecolog|environmental steward)\b/i, "conservation"],
  [/\b(emt|ems\b|paramedic|nurs|cna\b|health|medical|clinic|hospital|caregiv|doula|phlebotom)\b/i, "health"],
  [/\b(research|laborator|\blab\b|intramural|postbac|scientific)\b/i, "research"],
  [/\b(apprentice|welding|electric|plumb|carpent|hvac|\bcdl\b|machinist|cosmetolog|culinary|automotive|manufactur|union training|pre-?apprentice)\b/i, "trades"],
  [/\b(wilderness|outward bound|nols|expedition|mountaineer|backcountry|sail|climb|raft|guide (course|certification)|instructor certification|outdoor educat)\b/i, "outdoor"],
  // Employment before service: a lodge job and a working-holiday visa are work,
  // even when the copy is full of feel-good language.
  [/\b(working holiday|seasonal (job|work|position|employment)|lodge|resort|hospitality|hotel|ranch hand|deckhand|fishing|cannery|processing|ski (patrol|resort)|barista|line cook|housekeep|wage|hourly|paid employment|employer)\b/i, "work"],
  [/\b(study abroad|language school|immersion|homestay|semester abroad|cultural exchange|study center|retreat|work college|college program|academy)\b/i, "travel_study"],
  [/\b(americorps|vista|service year|city year|service corps|peace corps|mission|volunteer)\b/i, "service"],
  [/\b(job|crew member|farm|agricultur|internship)\b/i, "work"],
];

function inferCategory(text: string): Category {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat;
  // Falls back to travel_study rather than service: an unclassified gap-year
  // row is more likely an experience than an act of national service, and
  // over-filling "service" was making that filter useless.
  return "travel_study";
}

function inferStage(raw: string): SeedProgram["stage"] {
  const s = raw.toLowerCase();
  const hs = /post-hs|high school|pre-college|before college/.test(s);
  const pg = /post-college|post-grad|graduate|bachelor/.test(s);
  if (hs && pg) return "both";
  if (pg) return "post_undergrad";
  if (hs) return "post_hs";
  return "both";
}

// A degree requirement is only asserted when the text says so. Defaulting to
// "no degree required" would wrongly widen the no-degree cohort, which is the
// filter an 18-year-old relies on.
function inferDegreeRequired(text: string): 0 | 1 {
  return /\b(bachelor'?s? degree required|requires a bachelor|must hold a bachelor|post-college only|graduate degree)\b/i.test(text)
    ? 1
    : 0;
}

function inferSelectivity(raw: string): SeedProgram["selectivity"] {
  const s = raw.toLowerCase();
  if (/highly competitive|very selective|extremely/.test(s)) return "highly_competitive";
  if (/competitive|selective/.test(s)) return "selective";
  if (/moderate/.test(s)) return "moderate";
  if (/open|low/.test(s)) return "open";
  if (/quota|limited spots|capped/.test(s)) return "quota_limited";
  return null;
}

function inferFundingStatus(raw: string): SeedProgram["funding_status"] {
  const s = raw.toLowerCase();
  if (/defunct|shut down|closed|terminated|dissolved|no longer/.test(s)) return "defunded";
  if (/paused|hiatus|suspended|not accepting|on hold/.test(s)) return "paused";
  if (/caution|at risk|uncertain|unverified status|may be affected|threatened|cuts/.test(s)) return "at_risk";
  return "active";
}

function weeksFromDuration(raw: string): [number | null, number | null] {
  const s = raw.toLowerCase();
  const months = [...s.matchAll(/(\d+)\s*[-–—to]*\s*(\d+)?\s*month/g)][0];
  if (months) {
    const lo = Number(months[1]), hi = months[2] ? Number(months[2]) : lo;
    return [Math.round(lo * 4.345), Math.round(hi * 4.345)];
  }
  const weeks = [...s.matchAll(/(\d+)\s*[-–—to]*\s*(\d+)?\s*week/g)][0];
  if (weeks) return [Number(weeks[1]), weeks[2] ? Number(weeks[2]) : Number(weeks[1])];
  if (/\byear\b/.test(s) && !/\bhalf/.test(s)) return [44, 52];
  return [null, null];
}

// Three CSV rows self-describe as reference material rather than something you
// can apply to ("WARNING ENTRY – Not a single program", "CROSS-REFERENCE
// ENTRY"). They'd be dead ends in a directory, so they're skipped here rather
// than silently mangled into programs. Their content is still worth surfacing
// somewhere — especially the orphanage-tourism safeguarding warning, which
// applies to several operators that ARE in this catalog.
const NOT_AN_OPPORTUNITY =
  /\b(note on non-degree|ethics note|market-wide rate documentation|cross-reference entry)\b/i;

function clean(s: string): string | null {
  const t = s.trim();
  if (!t || t === "N/A" || t === "-" || t === "—") return null;
  return t;
}

export function loadCsvPrograms(): SeedProgram[] {
  const path = join(__dirname, "..", CSV);
  const rows = parseCsv(readFileSync(path, "utf-8").replace(/^﻿/, ""));
  const header = rows[0].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const iName = idx("Program"), iWhat = idx("What It Is"), iMoney = idx("Money Direction");
  const iPay = idx("Participant Pay or Cost 2026"), iRef = idx("Referral / Partner Economics");
  const iLoc = idx("Location"), iDur = idx("Duration"), iStage = idx("Stage");
  const iSel = idx("Selectivity"), iStatus = idx("Status 2026"), iSrc = idx("Source");

  const seen = new Set<string>();
  const skipped: string[] = [];
  const out: SeedProgram[] = [];

  for (const r of rows.slice(1)) {
    const name = clean(r[iName] ?? "");
    const source = clean(r[iSrc] ?? "");
    if (!name || !source || !/^https?:\/\//.test(source)) continue;
    if (NOT_AN_OPPORTUNITY.test(name) || /^(WARNING|CROSS-REFERENCE) ENTRY/i.test(r[iWhat] ?? "")) {
      skipped.push(name);
      continue;
    }

    let slug = slugify(name);
    if (!slug) continue;
    // The CSV has one internal duplicate; suffix rather than silently drop it.
    if (seen.has(slug)) { let n = 2; while (seen.has(`${slug}-${n}`)) n++; slug = `${slug}-${n}`; }
    seen.add(slug);

    const what = clean(r[iWhat] ?? "") ?? name;
    const money = MONEY[(r[iMoney] ?? "").trim().toUpperCase()] ?? "participant_earns";
    const payProse = clean(r[iPay] ?? "");
    const [tmin, tmax] = weeksFromDuration(r[iDur] ?? "");
    const status = r[iStatus] ?? "";

    let operator: string;
    try { operator = new URL(source).hostname.replace(/^www\./, ""); }
    catch { operator = "Unknown"; }

    out.push({
      slug,
      name,
      operator,
      category: inferCategory(`${name} ${what}`),
      summary: what.length > 400 ? what.slice(0, 397) + "…" : what,
      source_url: source,
      degree_required: inferDegreeRequired(`${what} ${r[iStage] ?? ""}`),
      money_direction: money,
      stage: inferStage(r[iStage] ?? ""),
      min_age: null,
      max_age: null,
      citizenship: null,
      other_eligibility: null,
      selectivity: inferSelectivity(r[iSel] ?? ""),
      pay_type: money === "participant_pays" ? "none" : "stipend_total",
      // Never parsed — see the header comment. The prose carries the truth.
      pay_low: null,
      pay_high: null,
      pay_note: money === "participant_pays" ? null : payProse,
      cost_low: null,
      cost_high: null,
      cost_note: money === "participant_pays" ? payProse : null,
      housing_provided: /housing (is )?(provided|included)|room and board|free housing|dorm/i.test(payProse ?? "") ? 1 : 0,
      meals_provided: /meals (are )?(provided|included)|room and board|food provided/i.test(payProse ?? "") ? 1 : 0,
      airfare_covered: /airfare (is )?(covered|provided|included)|flights? (covered|paid)/i.test(payProse ?? "") ? 1 : 0,
      education_award: null,
      term_min_weeks: tmin,
      term_max_weeks: tmax,
      college_credit_note: null,
      caveat_note: clean(status),
      referral_note: clean(r[iRef] ?? ""),
      location: clean(r[iLoc] ?? ""),
      provenance: "bulk_import",
      funding_status: inferFundingStatus(status),
      funding_note: null,
      deadlines: [], // the CSV has no deadline column; never invent one
    });
  }

  if (skipped.length) {
    console.log(`  import-csv: skipped ${skipped.length} reference row(s), not applyable opportunities:`);
    for (const s of skipped) console.log(`    - ${s.slice(0, 80)}`);
  }
  return out;
}
