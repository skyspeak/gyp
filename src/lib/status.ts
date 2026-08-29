import { db } from "./db";
import { newId, nowIso } from "./ids";
import { sendEmail } from "./email";
import { baseUrl } from "./base-url";

export type FundingStatus = "active" | "at_risk" | "paused" | "defunded";

export const STATUS_UI: Record<
  FundingStatus,
  { label: string; blurb: string; tone: "earn" | "warn" | "danger" }
> = {
  active: { label: "Running", blurb: "Operating and accepting applicants.", tone: "earn" },
  at_risk: { label: "At risk", blurb: "Running, but the money behind it is threatened.", tone: "warn" },
  paused: { label: "Paused", blurb: "Still exists, not currently selecting.", tone: "warn" },
  defunded: { label: "Shut down", blurb: "Confirmed closed or dissolved.", tone: "danger" },
};

// How stale a check is allowed to get before the page stops implying the
// status is current. Saying "Running" about a page nobody has read in three
// months is a claim we cannot actually support.
export const STALE_AFTER_DAYS = 45;

export function isStale(lastVerifiedAt: string | null): boolean {
  if (!lastVerifiedAt) return true;
  const age = Date.now() - new Date(lastVerifiedAt).getTime();
  return age > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Move a program to a new status, record the transition, and notify everyone
 * watching it. A no-op when the status has not actually changed — otherwise a
 * nightly cron would email the same people every night about nothing.
 */
export async function recordStatusChange(opts: {
  programId: string;
  programName: string;
  programSlug: string;
  from: FundingStatus | null;
  to: FundingStatus;
  note?: string | null;
  detectedBy: "cron" | "human" | "seed";
  sourceUrl?: string | null;
  /** Skip the emails — used by the backfill, which is not news. */
  silent?: boolean;
}): Promise<{ changed: boolean; notified: number }> {
  if (opts.from === opts.to) return { changed: false, notified: 0 };

  const client = db();
  const now = nowIso();

  await client.execute({
    sql: `INSERT INTO status_history (id, program_id, from_status, to_status, note, detected_by, source_url, changed_at)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [
      newId("sh"),
      opts.programId,
      opts.from,
      opts.to,
      opts.note ?? null,
      opts.detectedBy,
      opts.sourceUrl ?? null,
      now,
    ],
  });

  await client.execute({
    sql: "UPDATE programs SET funding_status = ?, updated_at = ? WHERE id = ?",
    args: [opts.to, now, opts.programId],
  });

  if (opts.silent) return { changed: true, notified: 0 };
  return { changed: true, notified: await notifyWatchers(opts) };
}

async function notifyWatchers(opts: {
  programId: string;
  programName: string;
  programSlug: string;
  from: FundingStatus | null;
  to: FundingStatus;
  note?: string | null;
  sourceUrl?: string | null;
}): Promise<number> {
  const client = db();

  // program_id IS NULL is the "tell me about everything" subscription.
  const subs = await client.execute({
    sql: `SELECT DISTINCT pe.email, pe.unsub_token
          FROM program_alerts a
          JOIN people pe ON pe.id = a.person_id
          WHERE a.program_id = ? OR a.program_id IS NULL`,
    args: [opts.programId],
  });

  const base = baseUrl();
  const wasLabel = opts.from ? STATUS_UI[opts.from].label : "Unknown";
  const nowLabel = STATUS_UI[opts.to].label;

  let sent = 0;
  for (const row of subs.rows as unknown as { email: string; unsub_token: string }[]) {
    // One failed address must not stop the rest of the fan-out.
    const ok = await sendEmail({
      to: row.email,
      subject: `${opts.programName}: ${wasLabel} → ${nowLabel}`,
      html: `<p><strong>${opts.programName}</strong> changed from <strong>${wasLabel}</strong> to <strong>${nowLabel}</strong>.</p>
             ${opts.note ? `<blockquote>${opts.note}</blockquote>` : ""}
             <p>${STATUS_UI[opts.to].blurb}</p>
             ${opts.sourceUrl ? `<p>Source checked: <a href="${opts.sourceUrl}">${opts.sourceUrl}</a></p>` : ""}
             <p><a href="${base}/programs/${opts.programSlug}">See the program</a> · <a href="${base}/status">All statuses</a></p>
             <p style="color:#888;font-size:12px">You asked to be told when this changed. Unsubscribe: ${base}/api/unsubscribe?token=${row.unsub_token}</p>`,
    }).catch(() => false);
    if (ok) sent++;
  }
  return sent;
}
