import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listPrograms, CATEGORY_LABELS, type Program } from "@/lib/programs";
import { programCountries, countryName } from "@/lib/geo";
import { formatPayShort, formatCostShort } from "@/lib/format";
import { MONEY_UI, TONE_BADGE } from "@/lib/money-ui";
import { MapExplorer, type MapCountry, type MapProgram } from "@/components/map-explorer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Where you can do a gap year — Gap Year Platform",
  description:
    "A world map of gap year and post-grad programs. Click a country to see every gap year you can do there, with what each one pays or costs.",
};

const MONEY_VALUES = ["all", "participant_earns", "participant_pays"] as const;
type MoneyValue = (typeof MONEY_VALUES)[number];

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

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]);

  const rawMoney = one("money");
  const money: MoneyValue = MONEY_VALUES.includes(rawMoney as MoneyValue) ? (rawMoney as MoneyValue) : "all";
  const rawCountry = (one("country") ?? "").toUpperCase();

  // Programs that pay you come first in every country's list, then the ones
  // that break even, then the ones that charge. Alphabetical opened the United
  // States list on a paid whitewater certification — the wrong first thing to
  // show on a site whose point is gap years that pay.
  const ORDER: Record<string, number> = { participant_earns: 0, net_neutral: 1, participant_pays: 2 };

  const programs = (await listPrograms({ moneyDirection: money, includeUsIneligible: true }))
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

  const counts = Object.fromEntries(
    Object.values(countries)
      .filter((c) => c.open.length)
      .map((c) => [c.code, c.open.length])
  );
  const closedOnly = Object.values(countries)
    .filter((c) => !c.open.length && c.closed.length)
    .map((c) => c.code);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-balance">
        Where you can do a gap year
      </h1>
      <p className="mt-2 mb-5 max-w-2xl text-sm sm:text-base text-muted-foreground text-pretty">
        {Object.keys(counts).length} countries with gap years an American can actually do. Click one
        to see them all.
      </p>

      <MapExplorer
        countries={countries}
        counts={counts}
        closedOnly={closedOnly}
        unpinned={unpinned}
        money={money}
        initialCountry={countries[rawCountry] ? rawCountry : undefined}
      />

      <p className="mt-10 text-xs text-muted-foreground">
        Countries come from what each program&apos;s own description names — nothing is inferred
        from an operator&apos;s home base. Closed and paused programs are left off.{" "}
        <Link href="/programs" className="inline-flex items-center gap-0.5 underline">
          Search the catalog <ArrowUpRight className="size-3" />
        </Link>
      </p>
    </div>
  );
}
