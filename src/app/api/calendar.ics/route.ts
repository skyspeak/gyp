import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { buildCalendar } from "@/lib/ics";
import { deadlineRowsToEvents, type DeadlineRow } from "@/lib/deadline-feed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ref = sp.get("ref");
  const category = sp.get("category");
  const money = sp.get("money"); // earns | pays

  // A subscribed calendar should not carry last cycle's dates. Deadlines from
  // a previous cycle are worse than absent: UNC's 2025 row literally reads
  // "already passed", and a 2025 date sitting in a 2026 calendar reads as this
  // year's. Keep a 30-day tail so a just-missed deadline is still visible.
  const from = new Date();
  from.setDate(from.getDate() - 30);

  const where = [
    "d.due_at IS NOT NULL",
    "d.due_at >= ?",
    // A calendar must never carry a deadline for something that has shut down
    // or that Americans cannot apply to.
    "p.funding_status NOT IN ('defunded','paused')",
    "p.us_eligible = 1",
  ];
  const args: string[] = [from.toISOString().slice(0, 10)];

  if (category) {
    where.push("p.category = ?");
    args.push(category);
  }
  if (money === "earns" || money === "pays") {
    where.push("p.money_direction = ?");
    args.push(money === "earns" ? "participant_earns" : "participant_pays");
  }

  const res = await db().execute({
    sql: `SELECT d.id AS deadline_id, d.due_at, d.kind, d.cycle_label, d.note, d.source_tz,
                 p.slug, p.name, p.category, p.money_direction
          FROM deadlines d
          JOIN programs p ON p.id = d.program_id
          WHERE ${where.join(" AND ")}
          ORDER BY d.due_at`,
    args,
  });

  const rows = res.rows as unknown as DeadlineRow[];

  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? req.nextUrl.origin;

  const events = deadlineRowsToEvents(rows, base, ref);

  const ics = buildCalendar({
    name: "Gap Year Platform — deadlines",
    description:
      "Application deadlines for paid gap year and post-grad paths. Closed and paused programs are excluded. No commissions, no paid placements.",
    events,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="gap-year-deadlines.ics"',
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
