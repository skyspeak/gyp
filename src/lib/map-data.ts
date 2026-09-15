import { listPrograms, CATEGORY_LABELS, type Program } from "./programs";
import { programCountries, countryName } from "./geo";
import { formatPayShort, formatCostShort } from "./format";
import { MONEY_UI, TONE_BADGE } from "./money-ui";
import type { MapCountry, MapProgram } from "@/components/map-explorer";

// Programs that pay you come first in every country's list, then the ones that
// break even, then the ones that charge. Alphabetical opened the United States
// list on a paid whitewater certification — the wrong first thing to show on a
// site whose point is gap years that pay.
const ORDER: Record<string, number> = { participant_earns: 0, net_neutral: 1, participant_pays: 2 };

function toMapProgram(p: Program): MapProgram {
  const money = MONEY_UI[p.money_direction];
  return {
    id: p.id,
    slug: p.slug,
    // Ten imported working-holiday rows carry a research label in the name.
    name: p.name.replace(/\s+—\s+US Eligibility Status$/i, ""),
    operator: p.operator,
    category: CATEGORY_LABELS[p.category] ?? p.category,
    moneyLine:
      p.money_direction === "participant_pays"
        ? (formatCostShort(p) ?? "Fee varies")
        : p.money_direction === "net_neutral"
          ? "Roughly breaks even"
          : formatPayShort(p),
    moneyLabel: money?.label ?? null,
    moneyBadge: money ? TONE_BADGE[money.tone] : "",
  };
}

/** Everything the map, its embed and its share image need, from one query. */
export async function buildMapData() {
  const programs = (await listPrograms({ moneyDirection: "all", includeUsIneligible: true }))
    // A map of where you can go has no business showing somewhere that has
    // shut down or stopped selecting.
    .filter((p) => p.funding_status !== "defunded" && p.funding_status !== "paused")
    .sort((a, b) => (ORDER[a.money_direction] ?? 3) - (ORDER[b.money_direction] ?? 3) || a.name.localeCompare(b.name));

  const countries: Record<string, MapCountry> = {};
  const unpinned: MapProgram[] = [];

  for (const p of programs) {
    const codes = programCountries(p);
    if (!codes.length) {
      if (p.us_eligible === 1) unpinned.push(toMapProgram(p));
      continue;
    }
    const mp = toMapProgram(p);
    for (const code of codes) {
      const c = (countries[code] ??= { code, name: countryName(code), open: [], closed: [] });
      (p.us_eligible === 1 ? c.open : c.closed).push(mp);
    }
  }

  const counts: Record<string, number> = Object.fromEntries(
    Object.values(countries)
      .filter((c) => c.open.length)
      .map((c) => [c.code, c.open.length])
  );
  const closedOnly = Object.values(countries)
    .filter((c) => !c.open.length && c.closed.length)
    .map((c) => c.code);

  return { countries, counts, closedOnly, unpinned };
}
