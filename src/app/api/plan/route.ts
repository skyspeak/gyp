import { NextRequest, NextResponse } from "next/server";
import { createPlan, addPlanItem } from "@/lib/plans";
import { listPrograms } from "@/lib/programs";
import {
  suggestPlan,
  firstFreeSlot,
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

  const title = studentName ? `${studentName}'s ${ambition === "year" ? "gap year" : ambition}` : "Gap year plan";

  const plan = await createPlan({ title, studentName, cohort, cycleLabel, createdBy });

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
