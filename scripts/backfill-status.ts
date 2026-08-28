// Seeds status_history with one baseline row per program, so the status page
// can say "unchanged since" instead of showing nothing at all. Silent by
// design: the current state is not news, and emailing subscribers about 381
// programs they already knew about would be the worst possible first contact.
import { db, describeTarget } from "../src/lib/db";
import { newId, nowIso } from "../src/lib/ids";

console.log(`→ target: ${describeTarget()}`);

async function main() {
  const client = db();
  const rows = await client.execute(`
    SELECT p.id, p.funding_status, p.last_verified_at
    FROM programs p
    WHERE NOT EXISTS (SELECT 1 FROM status_history h WHERE h.program_id = p.id)`);

  let n = 0;
  for (const r of rows.rows as unknown as { id: string; funding_status: string; last_verified_at: string | null }[]) {
    await client.execute({
      sql: `INSERT INTO status_history (id, program_id, from_status, to_status, note, detected_by, source_url, changed_at)
            VALUES (?,?,?,?,?,?,?,?)`,
      args: [newId("sh"), r.id, null, r.funding_status, "Baseline observation.", "seed", null, r.last_verified_at ?? nowIso()],
    });
    n++;
  }
  console.log(`Backfilled ${n} baseline status rows.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
