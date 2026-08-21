import { NextRequest, NextResponse } from "next/server";
import { createPlan, addPlanItem } from "@/lib/plans";
import { listPrograms, getProgramBySlug } from "@/lib/programs";
import {
  suggestPlan,
  firstFreeSlot,
  programMonths,
  AMBITION_MONTHS,
  type Intent,
  type Ambition,
} from "@/lib/suggest";

const VALID_INTENTS = new Set<Intent>([
  "earn", "outdoors", "abroad", "try_career", "serve", "credential", "unsure",
]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const cohort = body?.cohort === "post_grad" ? "post_grad" : "pre_college";
  const createdBy = body?.createdBy === "student" ? "student" : "parent";
  const studentName =
    typeof body?.studentName === "string" ? body.studentName.trim().slice(0, 80) || null : null;
  const cycleLabel =
    typeof body?.cycleLabel === "string" ? body.cycleLabel.trim().slice(0, 20) : null;

  const ambition: Ambition =
    body?.ambition === "semester" || body?.ambition === "summer" ? body.ambition : "year";

  const intents: Intent[] = Array.isArray(body?.intents)
    ? body.intents.filter((i: unknown): i is Intent => typeof i === "string" && VALID_INTENTS.has(i as Intent))
    : [];

  // An explicit title wins — forking a gallery proposal should keep its name,
  // so the plan you land in is recognisably the one you clicked.
  const explicitTitle =
    typeof body?.title === "string" && body.title.trim() ? body.title.trim().slice(0, 120) : null;
  const title =
    explicitTitle ??
    (studentName ? `${studentName}'s ${ambition === "year" ? "gap year" : ambition}` : "Gap year plan");

  const plan = await createPlan({ title, studentName, cohort, cycleLabel, createdBy });

  // Forking a gallery proposal: copy its exact programs, keeping each one's
  // real term length, rather than re-running the suggester and handing back
  // something different from what the person just clicked.
  const fromSlugs: string[] = Array.isArray(body?.fromSlugs)
    ? body.fromSlugs.filter((x: unknown): x is string => typeof x === "string").slice(0, 8)
    : [];

  if (fromSlugs.length > 0) {
    const placed: { starts_on: string | null; ends_on: string | null }[] = [];
    for (const slug of fromSlugs) {
      const program = await getProgramBySlug(slug);
      if (!program) continue;
      const months = programMonths(program);
      const slot = months ? firstFreeSlot(placed, months, plan.cycle_label) : null;
      await addPlanItem(plan.id, {
        programId: program.id,
        startsOn: slot?.startsOn ?? null,
        endsOn: slot?.endsOn ?? null,
        note: null,
      });
      if (slot) placed.push({ starts_on: slot.startsOn, ends_on: slot.endsOn });
    }
    return NextResponse.json({ ok: true, token: plan.share_token });
  }

  // Hand back a year that already has something in it. An empty timeline asks
  // the wrong question — people react to a concrete proposal far better than
  // they generate one from nothing.
  if (intents.length > 0) {
    const pool = await listPrograms({
      moneyDirection: "all",
      degreeRequired: cohort === "post_grad" ? 1 : 0,
    });
    const picks = suggestPlan(pool, intents, ambition);

    const placed: { starts_on: string | null; ends_on: string | null }[] = [];
    for (const pick of picks) {
      const slot = firstFreeSlot(placed, pick.months, plan.cycle_label);
      await addPlanItem(plan.id, {
        programId: pick.program.id,
        startsOn: slot.startsOn,
        endsOn: slot.endsOn,
        note: null,
      });
      placed.push({ starts_on: slot.startsOn, ends_on: slot.endsOn });
    }
  }

  return NextResponse.json({
    ok: true,
    token: plan.share_token,
    months: AMBITION_MONTHS[ambition],
  });
}
