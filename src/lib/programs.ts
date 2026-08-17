import type { InValue } from "@libsql/client";
import { db } from "./db";

export type Program = {
  id: string;
  slug: string;
  name: string;
  operator: string;
  category: string;
  summary: string;
  source_url: string;
  degree_required: number;
  min_age: number | null;
  max_age: number | null;
  citizenship: string | null;
  other_eligibility: string | null;
  pay_type: string;
  pay_low: number | null;
  pay_high: number | null;
  pay_currency: string;
  pay_note: string | null;
  housing_provided: number;
  airfare_covered: number;
  education_award: number | null;
  term_min_weeks: number | null;
  term_max_weeks: number | null;
  funding_status: string;
  funding_note: string | null;
  last_verified_at: string;
};

export type Deadline = {
  id: string;
  program_id: string;
  cycle_label: string;
  kind: string;
  due_at: string | null;
  source_tz: string | null;
  note: string | null;
  source_url: string;
};

export type ProgramFilters = {
  degreeRequired?: 0 | 1; // undefined = both
  category?: string;
  minAge?: number;
  fundingActiveOnly?: boolean;
  sort?: "deadline" | "pay";
};

export async function listPrograms(filters: ProgramFilters = {}): Promise<Program[]> {
  const where: string[] = [];
  const args: InValue[] = [];

  if (filters.degreeRequired === 0 || filters.degreeRequired === 1) {
    where.push("degree_required = ?");
    args.push(filters.degreeRequired);
  }
  if (filters.category) {
    where.push("category = ?");
    args.push(filters.category);
  }
  if (filters.minAge != null) {
    where.push("(max_age IS NULL OR max_age >= ?)");
    args.push(filters.minAge);
  }
  if (filters.fundingActiveOnly) {
    where.push("funding_status = 'active'");
  }

  const sql = `SELECT * FROM programs ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY name ASC`;
  const res = await db().execute({ sql, args });
  return res.rows as unknown as Program[];
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const res = await db().execute({ sql: "SELECT * FROM programs WHERE slug = ?", args: [slug] });
  return (res.rows[0] as unknown as Program) ?? null;
}

export async function getDeadlinesForProgram(programId: string): Promise<Deadline[]> {
  const res = await db().execute({
    sql: "SELECT * FROM deadlines WHERE program_id = ? ORDER BY due_at IS NULL, due_at ASC",
    args: [programId],
  });
  return res.rows as unknown as Deadline[];
}

export async function getSoonestDeadlines(programIds: string[]): Promise<Map<string, Deadline>> {
  if (programIds.length === 0) return new Map();
  const placeholders = programIds.map(() => "?").join(",");
  const res = await db().execute({
    sql: `SELECT * FROM deadlines
          WHERE program_id IN (${placeholders}) AND due_at IS NOT NULL AND due_at > datetime('now')
          ORDER BY due_at ASC`,
    args: programIds,
  });
  const map = new Map<string, Deadline>();
  for (const row of res.rows as unknown as Deadline[]) {
    if (!map.has(row.program_id)) map.set(row.program_id, row);
  }
  return map;
}

export type UpcomingDeadline = Deadline & { program_name: string; program_slug: string; program_degree_required: number };

export async function listUpcomingDeadlines(filters: { degreeRequired?: 0 | 1 } = {}): Promise<UpcomingDeadline[]> {
  const where = ["d.due_at IS NOT NULL", "d.due_at > datetime('now')"];
  const args: InValue[] = [];
  if (filters.degreeRequired === 0 || filters.degreeRequired === 1) {
    where.push("p.degree_required = ?");
    args.push(filters.degreeRequired);
  }
  const res = await db().execute({
    sql: `SELECT d.*, p.name as program_name, p.slug as program_slug, p.degree_required as program_degree_required
          FROM deadlines d JOIN programs p ON p.id = d.program_id
          WHERE ${where.join(" AND ")}
          ORDER BY d.due_at ASC`,
    args,
  });
  return res.rows as unknown as UpcomingDeadline[];
}

export type Fallback = { program_id: string; substitute_id: string; rationale: string };

export async function getFallbacksForProgram(programId: string): Promise<Program[]> {
  const res = await db().execute({
    sql: `SELECT p.* FROM fallbacks f JOIN programs p ON p.id = f.substitute_id WHERE f.program_id = ?`,
    args: [programId],
  });
  return res.rows as unknown as Program[];
}

export const CATEGORY_LABELS: Record<string, string> = {
  service: "Service",
  conservation: "Conservation",
  teaching_abroad: "Teaching abroad",
  research: "Research",
  health: "Health",
  trades: "Trades",
};

export const FUNDING_LABELS: Record<string, { label: string; tone: "ok" | "warn" | "bad" }> = {
  active: { label: "Active", tone: "ok" },
  at_risk: { label: "Funding at risk", tone: "warn" },
  paused: { label: "Paused", tone: "bad" },
  defunded: { label: "Defunded", tone: "bad" },
};

export const CITIZENSHIP_LABELS: Record<string, string> = {
  us_citizen: "U.S. citizen",
  us_citizen_or_lpr: "U.S. citizen or lawful permanent resident",
  any: "Any citizenship",
};
