import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Deletes all watch-kind plan_items for this person's draft plans, but leaves
// people/plans/plan_events rows intact — events are append-only and the
// person row is how we know not to re-add them from a stale form submit.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const client = db();
  const person = await client.execute({ sql: "SELECT id FROM people WHERE unsub_token = ?", args: [token] });
  if (!person.rows[0]) return NextResponse.json({ error: "Invalid token." }, { status: 404 });

  const personId = person.rows[0].id;
  const plans = await client.execute({ sql: "SELECT id FROM plans WHERE student_id = ?", args: [personId] });
  for (const row of plans.rows) {
    await client.execute({
      sql: "DELETE FROM plan_items WHERE plan_id = ? AND kind = 'watch'",
      args: [row.id],
    });
  }

  return NextResponse.json({ ok: true, message: "You've been unsubscribed from deadline reminders." });
}
