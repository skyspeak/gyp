import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../src/lib/db";

async function main() {
  const sql = readFileSync(join(__dirname, "../src/lib/schema.sql"), "utf-8");
  // libSQL's executeMultiple runs a raw script including multiple statements.
  await db().executeMultiple(sql);
  console.log("Migration applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
