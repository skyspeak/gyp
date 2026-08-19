import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { fetchAndExtract } from "@/lib/verify";
import { diffExtraction } from "@/lib/review-queue";
import { newId, nowIso } from "@/lib/ids";
import { sendEmail } from "@/lib/email";
import type { Program, Deadline } from "@/lib/programs";

const RECHECK_AFTER_DAYS = 14;

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = db();
  const cutoff = new Date(Date.now() - RECHECK_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const due = await client.execute({
    sql: "SELECT * FROM programs WHERE last_verified_at < ?",
    args: [cutoff],
  });

  let checked = 0;
  let flagged = 0;
  let atRisk = 0;
  let skipped = 0;

  for (const row of due.rows as unknown as Program[]) {
    checked++;
    const extraction = await fetchAndExtract(row.source_url, row.name);
    if (!extraction) {
      // Parse/fetch failure: leave the record untouched, don't bump last_verified_at,
      // so it gets retried on the next run.
      skipped++;
      continue;
    }

    const deadlineRows = await client.execute({ sql: "SELECT * FROM deadlines WHERE program_id = ?", args: [row.id] });
    const diffs = diffExtraction(row, deadlineRows.rows as unknown as Deadline[], extraction);

    if (diffs.length > 0) {
      flagged++;
      await client.execute({
        sql: `INSERT INTO review_queue (id, program_id, field_diffs, raw_extract, suspicion, status, created_at)
              VALUES (?,?,?,?,?,?,?)`,
        args: [
          newId("rq"),
          row.id,
          JSON.stringify(diffs),
          JSON.stringify(extraction),
          extraction.suspension_language,
          "pending",
          nowIso(),
        ],
      });
    }

    // Funding-risk detection is the one auto-published field: erring toward
    // caution outranks "never auto-publish" here, per spec. Deadlines and pay
    // still wait for a human in review_queue.
    if (extraction.suspension_language && row.funding_status === "active") {
      atRisk++;
      await client.execute({
        sql: "UPDATE programs SET funding_status = 'at_risk', funding_note = ?, updated_at = ? WHERE id = ?",
        args: [`Auto-flagged by verification cron: "${extraction.suspension_language}". Needs human confirmation.`, nowIso(), row.id],
      });
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `[Gap Year Platform] Funding risk detected: ${row.name}`,
          html: `<p><strong>${row.name}</strong> was auto-flagged at_risk based on source page language:</p><blockquote>${extraction.suspension_language}</blockquote><p>Source: <a href="${row.source_url}">${row.source_url}</a></p>`,
        });
      }
    }

    await client.execute({
      sql: "UPDATE programs SET last_verified_at = ? WHERE id = ?",
      args: [nowIso(), row.id],
    });
  }

  return NextResponse.json({ ok: true, checked, flagged, atRisk, skipped });
}
