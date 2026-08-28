// The catalog holds the same organisation twice when a hand-checked record and
// a bulk-imported one describe it — Thinking Beyond Borders appears once via
// its last Form 990 and once via a directory listing. Both rows are true, but
// counting a single closure twice makes two pages disagree about how many
// programs shut down, which is exactly the kind of contradiction that costs
// trust on pages whose only value is accuracy.
//
// Shared so /changes and /status can never drift apart again.
export type Dedupable = { name: string; provenance: string };

// Exact key equality, NOT prefix matching. Prefix matching was tried across
// the whole catalog and merged "Fulbright U.S. Student Program" into
// "Fulbright U.S. Student Program — English Teaching Assistant (ETA) Awards",
// which are different programs, and chained transitively through the Workaway
// rows. Losing a real program is far worse than showing one duplicate, so the
// rule only collapses names that normalise to exactly the same thing.
function key(name: string): string {
  const flat = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  // Only strip a trailing qualifier when something substantial remains —
  // otherwise "EF Gap Year" degrades to the key "ef".
  const trimmed = flat.replace(/(gapyear(semester)?|program(me)?|fellowship)$/, "");
  return trimmed.length >= 8 ? trimmed : flat;
}

export function dedupeByName<T extends Dedupable>(rows: T[]): T[] {
  const seen = new Map<string, number>();
  const out: T[] = [];
  for (const row of rows) {
    const k = key(row.name);
    const at = seen.get(k);
    if (at === undefined) {
      seen.set(k, out.length);
      out.push(row);
      // Hand-checked evidence beats a directory listing.
    } else if (row.provenance === "hand_verified" && out[at].provenance !== "hand_verified") {
      out[at] = row;
    }
  }
  return out;
}
