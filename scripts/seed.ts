import { db } from "../src/lib/db";
import { newId, nowIso } from "../src/lib/ids";
import { CORE_PROGRAMS, type SeedProgram } from "./seed-data";
import { EXPANSION_PROGRAMS } from "./seed-data-2";

const ALL_PROGRAMS: SeedProgram[] = [...CORE_PROGRAMS, ...EXPANSION_PROGRAMS];

async function upsertProgram(p: SeedProgram) {
  const client = db();
  const existing = await client.execute({
    sql: "SELECT id FROM programs WHERE slug = ?",
    args: [p.slug],
  });

  const id = existing.rows[0]?.id ? String(existing.rows[0].id) : newId("prog");
  const now = nowIso();

  await client.execute({
    sql: `INSERT INTO programs (
        id, slug, name, operator, category, summary, source_url,
        degree_required, min_age, max_age, citizenship, other_eligibility,
        pay_type, pay_low, pay_high, pay_currency, pay_note,
        housing_provided, airfare_covered, education_award,
        term_min_weeks, term_max_weeks,
        funding_status, funding_note, last_verified_at, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?, ?,?, ?,?,?,?,?)
      ON CONFLICT(slug) DO UPDATE SET
        name=excluded.name, operator=excluded.operator, category=excluded.category,
        summary=excluded.summary, source_url=excluded.source_url,
        degree_required=excluded.degree_required, min_age=excluded.min_age,
        max_age=excluded.max_age, citizenship=excluded.citizenship,
        other_eligibility=excluded.other_eligibility, pay_type=excluded.pay_type,
        pay_low=excluded.pay_low, pay_high=excluded.pay_high, pay_currency=excluded.pay_currency, pay_note=excluded.pay_note,
        housing_provided=excluded.housing_provided, airfare_covered=excluded.airfare_covered,
        education_award=excluded.education_award, term_min_weeks=excluded.term_min_weeks,
        term_max_weeks=excluded.term_max_weeks, funding_status=excluded.funding_status,
        funding_note=excluded.funding_note, last_verified_at=excluded.last_verified_at,
        updated_at=excluded.updated_at`,
    args: [
      id, p.slug, p.name, p.operator, p.category, p.summary, p.source_url,
      p.degree_required, p.min_age, p.max_age, p.citizenship, p.other_eligibility,
      p.pay_type, p.pay_low, p.pay_high, p.pay_currency ?? "USD", p.pay_note,
      p.housing_provided, p.airfare_covered, p.education_award,
      p.term_min_weeks, p.term_max_weeks,
      p.funding_status, p.funding_note, now, now, now,
    ],
  });

  // Deadlines: replace this program's set on reseed to keep it idempotent.
  await client.execute({ sql: "DELETE FROM deadlines WHERE program_id = ?", args: [id] });
  for (const d of p.deadlines) {
    await client.execute({
      sql: `INSERT INTO deadlines (id, program_id, cycle_label, kind, due_at, source_tz, note, source_url, confirmed_at, confirmed_by)
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
      args: [
        newId("dl"), id, d.cycle_label, d.kind, d.due_at, d.source_tz, d.note,
        p.source_url, now, "seed",
      ],
    });
  }

  return { id, slug: p.slug };
}

async function main() {
  const client = db();
  const slugToId = new Map<string, string>();

  for (const p of ALL_PROGRAMS) {
    const { id, slug } = await upsertProgram(p);
    slugToId.set(slug, id);
    console.log(`upserted ${slug}`);
  }

  // Fallbacks, second pass once every id is known
  await client.execute("DELETE FROM fallbacks");
  for (const p of ALL_PROGRAMS) {
    if (!p.fallback_slugs) continue;
    const fromId = slugToId.get(p.slug);
    for (const subSlug of p.fallback_slugs) {
      const subId = slugToId.get(subSlug);
      if (!fromId || !subId) continue;
      await client.execute({
        sql: `INSERT INTO fallbacks (program_id, substitute_id, rationale) VALUES (?,?,?)
              ON CONFLICT(program_id, substitute_id) DO NOTHING`,
        args: [fromId, subId, `Comparable pay/term if ${p.name} is paused or at risk`],
      });
    }
  }

  console.log(`Seeded ${ALL_PROGRAMS.length} programs.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
