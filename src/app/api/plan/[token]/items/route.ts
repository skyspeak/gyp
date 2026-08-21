import { NextRequest, NextResponse } from "next/server";
import { getPlanByToken, addPlanItem, renamePlan } from "@/lib/plans";

// The share token is the credential: holding the link grants edit rights, the
// same model as an unlisted document. Phase 1 has no accounts, and requiring
// one would defeat the point of a plan you can hand to someone.
async function planFor(token: string) {
  const plan = await getPlanByToken(token);
  return plan;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const plan = await planFor(token);
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  const body = await req.json().catch(() => null);

  if (body?.action === "rename") {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : plan.title ?? "";
    const studentName =
      typeof body.studentName === "string" ? body.studentName.trim().slice(0, 80) || null : plan.student_name;
    if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });
    await renamePlan(plan.id, title, studentName);
    return NextResponse.json({ ok: true });
  }

  const programId = typeof body?.programId === "string" ? body.programId : null;
  const startsOn = typeof body?.startsOn === "string" && body.startsOn ? body.startsOn : null;
  const endsOn = typeof body?.endsOn === "string" && body.endsOn ? body.endsOn : null;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) || null : null;

  if (!programId && !note) {
    return NextResponse.json({ error: "Pick a program or write a note." }, { status: 400 });
  }

  const itemId = await addPlanItem(plan.id, { programId, startsOn, endsOn, note });
  return NextResponse.json({ ok: true, itemId });
}
