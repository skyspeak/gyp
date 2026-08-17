import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sendEmail } from "@/lib/email";
import { newId, nowIso } from "@/lib/ids";
import { formatDeadline } from "@/lib/format";

const OFFSETS_DAYS = [30, 7, 1];

function dayRange(daysFromNow: number) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + daysFromNow);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = db();
  let sent = 0;
  let skipped = 0;

  for (const offset of OFFSETS_DAYS) {
    const { start, end } = dayRange(offset);
    const deadlines = await client.execute({
      sql: `SELECT d.*, p.name as program_name, p.slug as program_slug
            FROM deadlines d JOIN programs p ON p.id = d.program_id
            WHERE d.due_at >= ? AND d.due_at < ?`,
      args: [start, end],
    });

    for (const deadline of deadlines.rows) {
      const watchers = await client.execute({
        sql: `SELECT DISTINCT pe.id as person_id, pe.email, pe.unsub_token, pl.id as plan_id
              FROM plan_items pi
              JOIN plans pl ON pl.id = pi.plan_id
              JOIN people pe ON pe.id = pl.student_id
              WHERE pi.kind = 'watch' AND pi.program_id = ?`,
        args: [deadline.program_id],
      });

      for (const w of watchers.rows) {
        const dedupeKey = `reminder:${deadline.id}:${offset}`;
        const already = await client.execute({
          sql: `SELECT id FROM plan_events WHERE plan_id = ? AND event_type = 'reminder_sent' AND payload LIKE ?`,
          args: [w.plan_id, `%${dedupeKey}%`],
        });
        if (already.rows[0]) {
          skipped++;
          continue;
        }

        await sendEmail({
          to: String(w.email),
          subject: `${offset} day${offset === 1 ? "" : "s"} left: ${deadline.program_name}`,
          html: `<p><strong>${deadline.program_name}</strong> — ${deadline.cycle_label} ${String(deadline.kind).replace("_", " ")} deadline is ${formatDeadline(
            deadline.due_at as string,
            deadline.source_tz as string | null
          )}.</p>
                 <p><a href="${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/programs/${deadline.program_slug}">View program</a></p>
                 <p style="color:#888;font-size:12px">Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/unsubscribe?token=${w.unsub_token}</p>`,
        });

        await client.execute({
          sql: "INSERT INTO plan_events (id, plan_id, actor_id, event_type, payload, occurred_at) VALUES (?,?,?,?,?,?)",
          args: [
            newId("evt"),
            w.plan_id,
            null,
            "reminder_sent",
            JSON.stringify({ dedupeKey, deadlineId: deadline.id, offsetDays: offset }),
            nowIso(),
          ],
        });
        sent++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
