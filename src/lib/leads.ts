import { db } from "./db";
import { newId, newToken, nowIso } from "./ids";

export type LeadRole = "student" | "parent" | "adviser";

export const LEAD_ROLES: { id: LeadRole; label: string; sub: string }[] = [
  { id: "student", label: "Student", sub: "It's my year" },
  { id: "parent", label: "Parent", sub: "Planning with my kid" },
  { id: "adviser", label: "Adviser", sub: "I counsel students" },
];

export type LeadInput = {
  email: string;
  role: LeadRole;
  intent?: string | null;
  cohort?: "pre_college" | "post_grad" | null;
  source?: string | null;
  referrer?: string | null;
  institutionName?: string | null;
  /**
   * True when the role was assumed rather than chosen. The alerts endpoint has
   * to pick something, and its guess must not overwrite what a person actually
   * told us — a student who clicked "alert me" was being silently rewritten to
   * "adviser", corrupting the one field that measures who the audience is.
   */
  roleAssumed?: boolean;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signing up twice is the normal case, not an error: someone reads /changes in
// August and /gallery in October. Upsert, and let later answers overwrite
// earlier ones only where they actually said something — a second signup that
// skipped the intent chips should not erase the intent they gave the first
// time.
export async function captureLead(input: LeadInput): Promise<{ id: string; isNew: boolean }> {
  const client = db();
  const email = input.email.trim().toLowerCase();

  const existing = await client.execute({
    sql: "SELECT id FROM people WHERE email = ?",
    args: [email],
  });

  if (existing.rows[0]) {
    const id = String(existing.rows[0].id);
    await client.execute({
      sql: `UPDATE people SET
              role             = ${input.roleAssumed ? "role" : "?"},
              intent           = COALESCE(?, intent),
              cohort           = COALESCE(?, cohort),
              referrer         = COALESCE(?, referrer),
              institution_name = COALESCE(?, institution_name)
            WHERE id = ?`,
      args: [
        ...(input.roleAssumed ? [] : [input.role]),
        input.intent ?? null,
        input.cohort ?? null,
        input.referrer ?? null,
        input.institutionName ?? null,
        id,
      ],
    });
    return { id, isNew: false };
  }

  const id = newId("person");
  await client.execute({
    sql: `INSERT INTO people
            (id, email, display_name, role, institution_id, created_at, unsub_token,
             intent, cohort, source, referrer, institution_name)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      id,
      email,
      null,
      input.role,
      null,
      nowIso(),
      newToken(),
      input.intent ?? null,
      input.cohort ?? null,
      input.source ?? null,
      input.referrer ?? null,
      input.institutionName ?? null,
    ],
  });
  return { id, isNew: true };
}
