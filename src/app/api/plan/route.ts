import { NextRequest, NextResponse } from "next/server";
import { createPlan } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const cohort = body?.cohort === "pre_college" ? "pre_college" : "post_grad";
  const createdBy = body?.createdBy === "student" ? "student" : "parent";
  const studentName = typeof body?.studentName === "string" ? body.studentName.trim().slice(0, 80) : null;
  const cycleLabel = typeof body?.cycleLabel === "string" ? body.cycleLabel.trim().slice(0, 20) : null;
  const title =
    typeof body?.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 120)
      : studentName
        ? `${studentName}'s gap year`
        : "Our gap year plan";

  const plan = await createPlan({ title, studentName, cohort, cycleLabel, createdBy });

  return NextResponse.json({ ok: true, token: plan.share_token });
}
