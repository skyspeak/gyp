import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findOrCreatePerson, findOrCreateDraftPlan, addWatchItem, logPlanEvent } from "@/lib/people";
import { sendEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const programId = typeof body?.programId === "string" ? body.programId : "";
  const cohort = body?.cohort === "pre_college" ? "pre_college" : "post_grad";

  if (!EMAIL_RE.test(email) || !programId) {
    return NextResponse.json({ error: "Valid email and programId are required." }, { status: 400 });
  }

  const program = await db().execute({ sql: "SELECT id, name FROM programs WHERE id = ?", args: [programId] });
  if (!program.rows[0]) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  const person = await findOrCreatePerson(email, "student");
  const plan = await findOrCreateDraftPlan(person.id, cohort);
  const planId = String(plan.id);
  const itemId = await addWatchItem(planId, programId);
  await logPlanEvent(planId, person.id, "watch_added", { programId, itemId });

  await sendEmail({
    to: email,
    subject: `Watching: ${program.rows[0].name}`,
    html: `<p>You're now watching <strong>${program.rows[0].name}</strong> on Stipend Clock. We'll email you at 30, 7, and 1 day before each deadline.</p>
           <p><a href="${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/deadlines">See all your deadlines</a></p>
           <p style="color:#888;font-size:12px">Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/unsubscribe?token=${person.unsub_token}</p>`,
  });

  return NextResponse.json({ ok: true, planId, itemId });
}
