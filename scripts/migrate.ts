import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../src/lib/db";

// Columns added after the first schema went out. SQLite has no
// "ADD COLUMN IF NOT EXISTS", so we diff against pragma table_info and add
// what's missing. Additive only — this never drops or rewrites a column,
// because plan_events and the catalog both have to survive migrations.
const ADDITIVE_COLUMNS: Record<string, Record<string, string>> = {
  programs: {
    money_direction: "TEXT NOT NULL DEFAULT 'participant_earns'",
    stage: "TEXT",
    us_eligible: "INTEGER NOT NULL DEFAULT 1",
    selectivity: "TEXT",
    cost_low: "INTEGER",
    cost_high: "INTEGER",
    cost_note: "TEXT",
    meals_provided: "INTEGER NOT NULL DEFAULT 0",
    college_credit_note: "TEXT",
    caveat_note: "TEXT",
  },
};

async function existingColumns(table: string): Promise<Set<string>> {
  const res = await db().execute(`PRAGMA table_info(${table})`);
  return new Set(res.rows.map((r) => String(r.name)));
}

async function main() {
  const sql = readFileSync(join(__dirname, "../src/lib/schema.sql"), "utf-8");
  const [tables, indexes] = sql.split(/^-- @indexes.*$/m);
  if (indexes === undefined) throw new Error("schema.sql is missing its '-- @indexes' marker");

  await db().executeMultiple(tables);
  console.log("Tables applied.");

  for (const [table, columns] of Object.entries(ADDITIVE_COLUMNS)) {
    const have = await existingColumns(table);
    for (const [column, definition] of Object.entries(columns)) {
      if (have.has(column)) continue;
      await db().execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`  + ${table}.${column}`);
    }
  }

  // Indexes run last so they can reference just-added columns.
  await db().executeMultiple(indexes);
  console.log("Indexes applied.");
  console.log("Migration complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
