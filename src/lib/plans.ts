import { db } from "./db";
import { newId, newToken, nowIso } from "./ids";
import type { Program } from "./programs";

export type Plan = {
  id: string;
  student_id: string;
  cohort: string;
  cycle_label: string | null;
  status: string;
  share_token: string;
  title: string | null;
  student_name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanItem = {
  id: string;
  plan_id: string;
  program_id: string | null;
  kind: string;
  starts_on: string | null; // 'YYYY-MM' — month granularity is enough to plan a year
  ends_on: string | null;
  note: string | null;
  created_at: string;
};

export type PlanItemWithProgram = PlanItem & { program: Program | null };

// Every mutation writes here. Append-only, never updated or deleted — phase 4's
// "what did deferred admits actually do" analysis is reconstructed from this.
export async function logPlanEvent(
  planId: string,
  actorId: string | null,
  eventType: string,
  payload: Record<string, unknown>
) {
  await db().execute({
    sql: "INSERT INTO plan_events (id, plan_id, actor_id, event_type, payload, occurred_at) VALUES (?,?,?,?,?,?)",
    args: [newId("evt"), planId, actorId, eventType, JSON.stringify(payload), nowIso()],
  });
}

// A plan is *for* a student who may not have an account, or even be known to us
// yet — a parent can start one before the kid is involved. We still create a
// real person row, because the spec models people rather than emails, and fill
// in a real address later when someone claims the plan.
async function createPlaceholderStudent(name: string | null): Promise<string> {
  const id = newId("person");
  await db().execute({
    sql: "INSERT INTO people (id, email, display_name, role, institution_id, created_at, unsub_token) VALUES (?,?,?,?,?,?,?)",
    args: [id, `pending+${newToken().slice(0, 16)}@plan.local`, name, "student", null, nowIso(), newToken()],
  });
  return id;
}

export async function createPlan(input: {
  title: string | null;
  studentName: string | null;
  cohort: "pre_college" | "post_grad";
  cycleLabel: string | null;
  createdBy: "parent" | "student";
}): Promise<Plan> {
  const studentId = await createPlaceholderStudent(input.studentName);
  const id = newId("plan");
  const shareToken = newToken();
  const now = nowIso();

  await db().execute({
    sql: `INSERT INTO plans (id, student_id, cohort, cycle_label, status, institution_id,
            share_token, title, student_name, created_by, created_at, updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      id, studentId, input.cohort, input.cycleLabel, "draft", null,
      shareToken, input.title, input.studentName, input.createdBy, now, now,
    ],
  });

  await logPlanEvent(id, null, "plan_created", {
    createdBy: input.createdBy,
    cohort: input.cohort,
    cycleLabel: input.cycleLabel,
  });

  return (await getPlanByToken(shareToken))!;
}

export async function getPlanByToken(token: string): Promise<Plan | null> {
  const res = await db().execute({
    sql: "SELECT * FROM plans WHERE share_token = ?",
    args: [token],
  });
  return (res.rows[0] as unknown as Plan) ?? null;
}

export async function getPlanItems(planId: string): Promise<PlanItemWithProgram[]> {
  const res = await db().execute({
    sql: `SELECT pi.*, p.id as p_id FROM plan_items pi
          LEFT JOIN programs p ON p.id = pi.program_id
          WHERE pi.plan_id = ? AND pi.kind != 'watch'
          ORDER BY pi.starts_on IS NULL, pi.starts_on ASC, pi.created_at ASC`,
    args: [planId],
  });

  const items = res.rows as unknown as PlanItem[];
  const programIds = items.map((i) => i.program_id).filter((x): x is string => Boolean(x));
  if (programIds.length === 0) return items.map((i) => ({ ...i, program: null }));

  const progs = await db().execute({
    sql: `SELECT * FROM programs WHERE id IN (${programIds.map(() => "?").join(",")})`,
    args: programIds,
  });
  const byId = new Map((progs.rows as unknown as Program[]).map((p) => [p.id, p]));
  return items.map((i) => ({ ...i, program: i.program_id ? byId.get(i.program_id) ?? null : null }));
}

export async function addPlanItem(
  planId: string,
  input: { programId: string | null; startsOn: string | null; endsOn: string | null; note: string | null }
): Promise<string> {
  const id = newId("item");
  await db().execute({
    sql: "INSERT INTO plan_items (id, plan_id, program_id, kind, starts_on, ends_on, note, created_at) VALUES (?,?,?,?,?,?,?,?)",
    args: [id, planId, input.programId, "intent", input.startsOn, input.endsOn, input.note, nowIso()],
  });
  await touchPlan(planId);
  await logPlanEvent(planId, null, "item_added", { itemId: id, ...input });
  return id;
}

export async function removePlanItem(planId: string, itemId: string) {
  // plan_items is mutable working state; the audit trail lives in plan_events,
  // which is why deleting here is safe and the event below is not optional.
  await db().execute({
    sql: "DELETE FROM plan_items WHERE id = ? AND plan_id = ?",
    args: [itemId, planId],
  });
  await touchPlan(planId);
  await logPlanEvent(planId, null, "item_removed", { itemId });
}

export async function updatePlanItem(
  planId: string,
  itemId: string,
  input: { startsOn?: string | null; endsOn?: string | null; note?: string | null }
) {
  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (input.startsOn !== undefined) { sets.push("starts_on = ?"); args.push(input.startsOn); }
  if (input.endsOn !== undefined) { sets.push("ends_on = ?"); args.push(input.endsOn); }
  if (input.note !== undefined) { sets.push("note = ?"); args.push(input.note); }
  if (sets.length === 0) return;

  await db().execute({
    sql: `UPDATE plan_items SET ${sets.join(", ")} WHERE id = ? AND plan_id = ?`,
    args: [...args, itemId, planId],
  });
  await touchPlan(planId);
  await logPlanEvent(planId, null, "item_updated", { itemId, ...input });
}

export async function renamePlan(planId: string, title: string, studentName: string | null) {
  await db().execute({
    sql: "UPDATE plans SET title = ?, student_name = ?, updated_at = ? WHERE id = ?",
    args: [title, studentName, nowIso(), planId],
  });
  await logPlanEvent(planId, null, "plan_renamed", { title, studentName });
}

async function touchPlan(planId: string) {
  await db().execute({
    sql: "UPDATE plans SET updated_at = ? WHERE id = ?",
    args: [nowIso(), planId],
  });
}

// ---------------------------------------------------------------------------
// The money math. This is the reason to build a plan here rather than in a
// shared doc: a year assembled from real programs has a real bottom line, and
// nobody selling gap years will show you it.
// ---------------------------------------------------------------------------

const PERIODS_PER_MONTH: Record<string, number> = {
  hourly: 160, // ~40h/wk
  weekly: 4.345,
  monthly: 1,
  annual: 1 / 12,
  stipend_total: 0, // handled separately: a lump sum, not a rate
  none: 0,
};

function monthsBetween(startsOn: string | null, endsOn: string | null): number | null {
  if (!startsOn || !endsOn) return null;
  const [sy, sm] = startsOn.split("-").map(Number);
  const [ey, em] = endsOn.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return null;
  return Math.max(0, (ey - sy) * 12 + (em - sm) + 1);
}

export type PlanTotals = {
  earnsLow: number; // USD cents
  earnsHigh: number;
  costLow: number;
  costHigh: number;
  netLow: number;
  netHigh: number;
  monthsPlanned: number;
  educationAward: number;
  hasForeignCurrency: boolean;
  unpricedCount: number;
};

// Only USD figures are summed. Converting a JET yen salary at a guessed rate to
// put it in a family's budget total would be inventing a number, so foreign-pay
// items are counted as unpriced and flagged in the UI instead.
export function computeTotals(items: PlanItemWithProgram[]): PlanTotals {
  let earnsLow = 0, earnsHigh = 0, costLow = 0, costHigh = 0;
  let monthsPlanned = 0, educationAward = 0, unpricedCount = 0;
  let hasForeignCurrency = false;

  for (const item of items) {
    const p = item.program;
    const months = monthsBetween(item.starts_on, item.ends_on);
    if (months) monthsPlanned += months;
    if (!p) continue;

    const currency = (p.pay_currency ?? "USD").toUpperCase();
    if (currency !== "USD" && (p.pay_low != null || p.pay_high != null)) {
      hasForeignCurrency = true;
      unpricedCount++;
      continue;
    }

    if (p.education_award) educationAward += p.education_award;

    // Cost is always USD in this catalog and is a one-off, not a rate.
    if (p.cost_low != null) costLow += p.cost_low;
    if (p.cost_high != null) costHigh += p.cost_high ?? p.cost_low ?? 0;

    const low = p.pay_low, high = p.pay_high ?? p.pay_low;
    if (low == null) {
      if (p.money_direction === "participant_earns") unpricedCount++;
      continue;
    }

    if (p.pay_type === "stipend_total") {
      earnsLow += low;
      earnsHigh += high ?? low;
    } else {
      // A rate needs a duration. Without dates we can't total it honestly.
      if (!months) { unpricedCount++; continue; }
      const per = PERIODS_PER_MONTH[p.pay_type] ?? 0;
      earnsLow += Math.round(low * per * months);
      earnsHigh += Math.round((high ?? low) * per * months);
    }
  }

  return {
    earnsLow, earnsHigh, costLow, costHigh,
    netLow: earnsLow - costHigh, // pessimistic: least pay against most cost
    netHigh: earnsHigh - costLow,
    monthsPlanned, educationAward, hasForeignCurrency, unpricedCount,
  };
}

// Months in the cycle with nothing scheduled. The spec calls for a timeline
// with gaps visible: an unplanned stretch is the thing a deferral reviewer
// asks about, and the thing a parent most wants to see.
export function findGaps(items: PlanItemWithProgram[], cycleLabel: string | null): string[] {
  const startYear = cycleLabel ? Number(cycleLabel.slice(0, 4)) : new Date().getFullYear();
  if (!Number.isFinite(startYear)) return [];

  // A gap year cycle runs Sept–Aug, matching how schools and most programs think.
  const cycle: string[] = [];
  for (let i = 0; i < 12; i++) {
    const m = 9 + i;
    const year = m > 12 ? startYear + 1 : startYear;
    const month = m > 12 ? m - 12 : m;
    cycle.push(`${year}-${String(month).padStart(2, "0")}`);
  }

  const covered = new Set<string>();
  for (const item of items) {
    if (!item.starts_on || !item.ends_on) continue;
    for (const m of cycle) if (m >= item.starts_on && m <= item.ends_on) covered.add(m);
  }
  return cycle.filter((m) => !covered.has(m));
}

export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
