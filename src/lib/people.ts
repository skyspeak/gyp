import { db } from "./db";
import { newId, newToken, nowIso } from "./ids";

export type Person = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  institution_id: string | null;
  unsub_token: string;
};

export async function findOrCreatePerson(email: string, role: string): Promise<Person> {
  const client = db();
  const existing = await client.execute({ sql: "SELECT * FROM people WHERE email = ?", args: [email] });
  if (existing.rows[0]) return existing.rows[0] as unknown as Person;

  const id = newId("person");
  const unsub_token = newToken();
  await client.execute({
    sql: "INSERT INTO people (id, email, display_name, role, institution_id, created_at, unsub_token) VALUES (?,?,?,?,?,?,?)",
    args: [id, email, null, role, null, nowIso(), unsub_token],
  });
  return { id, email, display_name: null, role, institution_id: null, unsub_token };
}

export async function findOrCreateDraftPlan(studentId: string, cohort: "pre_college" | "post_grad") {
  const client = db();
  const existing = await client.execute({
    sql: "SELECT * FROM plans WHERE student_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 1",
    args: [studentId],
  });
  if (existing.rows[0]) return existing.rows[0];

  const id = newId("plan");
  const now = nowIso();
  await client.execute({
    sql: "INSERT INTO plans (id, student_id, cohort, cycle_label, status, institution_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
    args: [id, studentId, cohort, null, "draft", null, now, now],
  });
  const row = await client.execute({ sql: "SELECT * FROM plans WHERE id = ?", args: [id] });
  return row.rows[0];
}

export async function addWatchItem(planId: string, programId: string) {
  const client = db();
  const existing = await client.execute({
    sql: "SELECT id FROM plan_items WHERE plan_id = ? AND program_id = ? AND kind = 'watch'",
    args: [planId, programId],
  });
  if (existing.rows[0]) return String(existing.rows[0].id);

  const id = newId("item");
  await client.execute({
    sql: "INSERT INTO plan_items (id, plan_id, program_id, kind, starts_on, ends_on, note, created_at) VALUES (?,?,?,?,?,?,?,?)",
    args: [id, planId, programId, "watch", null, null, null, nowIso()],
  });
  return id;
}

export async function logPlanEvent(planId: string, actorId: string | null, eventType: string, payload: Record<string, unknown>) {
  const client = db();
  await client.execute({
    sql: "INSERT INTO plan_events (id, plan_id, actor_id, event_type, payload, occurred_at) VALUES (?,?,?,?,?,?)",
    args: [newId("evt"), planId, actorId, eventType, JSON.stringify(payload), nowIso()],
  });
}
