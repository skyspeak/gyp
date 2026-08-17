"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { newId, nowIso } from "@/lib/ids";
import type { FieldDiff } from "@/lib/review-queue";

export async function approveReview(formData: FormData) {
  const id = String(formData.get("id"));
  const initials = String(formData.get("initials") ?? "").trim();
  if (!initials) throw new Error("Initials are required to confirm a review.");

  const client = db();
  const row = await client.execute({ sql: "SELECT * FROM review_queue WHERE id = ?", args: [id] });
  const entry = row.rows[0];
  if (!entry || entry.status !== "pending") return;

  const programId = String(entry.program_id);
  const diffs = JSON.parse(String(entry.field_diffs)) as FieldDiff[];
  const now = nowIso();

  const program = await client.execute({ sql: "SELECT source_url FROM programs WHERE id = ?", args: [programId] });
  const sourceUrl = String(program.rows[0]?.source_url ?? "");

  for (const diff of diffs) {
    if (diff.type === "program_field") {
      await client.execute({
        sql: `UPDATE programs SET ${diff.field} = ?, updated_at = ? WHERE id = ?`,
        args: [diff.new_value, now, programId],
      });
    } else {
      const existing = await client.execute({
        sql: "SELECT id FROM deadlines WHERE program_id = ? AND cycle_label = ? AND kind = ?",
        args: [programId, diff.cycle_label, diff.kind],
      });
      if (existing.rows[0]) {
        await client.execute({
          sql: `UPDATE deadlines SET due_at = ?, source_tz = ?, note = ?, confirmed_at = ?, confirmed_by = ? WHERE id = ?`,
          args: [diff.new_due_at, diff.source_tz, diff.note, now, initials, existing.rows[0].id],
        });
      } else {
        await client.execute({
          sql: `INSERT INTO deadlines (id, program_id, cycle_label, kind, due_at, source_tz, note, source_url, confirmed_at, confirmed_by)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
          args: [newId("dl"), programId, diff.cycle_label, diff.kind, diff.new_due_at, diff.source_tz, diff.note, sourceUrl, now, initials],
        });
      }
    }
  }

  await client.execute({
    sql: "UPDATE review_queue SET status = 'approved', resolved_at = ?, resolved_by = ? WHERE id = ?",
    args: [now, initials, id],
  });

  revalidatePath("/admin/review");
}

export async function rejectReview(formData: FormData) {
  const id = String(formData.get("id"));
  const initials = String(formData.get("initials") ?? "").trim();
  if (!initials) throw new Error("Initials are required to reject a review.");

  const client = db();
  await client.execute({
    sql: "UPDATE review_queue SET status = 'rejected', resolved_at = ?, resolved_by = ? WHERE id = ? AND status = 'pending'",
    args: [nowIso(), initials, id],
  });

  revalidatePath("/admin/review");
}
