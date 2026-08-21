import { NextRequest, NextResponse } from "next/server";
import { getPlanByToken, getPlanItems, addPlanItem, renamePlan } from "@/lib/plans";
import { db } from "@/lib/db";
import { programMonths, firstFreeSlot } from "@/lib/suggest";

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
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) || null : null;

  if (!programId && !note) {
    return NextResponse.json({ error: "Pick a program or write a note." }, { status: 400 });
  }

  // Length comes from the program, never from the person adding it. A block is
  // placed in the first stretch of free months long enough to hold its real
  // term, so nobody has to know that NCCC runs 10 months.
  let startsOn: string | null = null;
  let endsOn: string | null = null;

  if (programId) {
    const res = await db().execute({ sql: "SELECT * FROM programs WHERE id = ?", args: [programId] });
    const program = res.rows[0] as unknown as Parameters<typeof programMonths>[0] | undefined;
    const months = program ? programMonths(program) : null;
    if (months) {
      const existing = await getPlanItems(plan.id);
      const slot = firstFreeSlot(existing, months, plan.cycle_label);
      startsOn = slot.startsOn;
      endsOn = slot.endsOn;
    }
  }

  const itemId = await addPlanItem(plan.id, { programId, startsOn, endsOn, note });
  return NextResponse.json({ ok: true, itemId });
}
