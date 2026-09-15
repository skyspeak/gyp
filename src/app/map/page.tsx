import Link from "next/link";
import { ArrowUpRight, Globe2, X } from "lucide-react";
import { listPrograms, type Program } from "@/lib/programs";
import { programCountries, countryName } from "@/lib/geo";
import { formatPayShort, formatCostShort } from "@/lib/format";
import { MONEY_UI, TONE_BADGE } from "@/lib/money-ui";
import { WorldMap, BUCKETS } from "@/components/world-map";
import { FilterPill } from "@/components/filter-pill";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Where you can do a gap year — Gap Year Platform",
  description:
    "A world map of gap year and post-grad programs, shaded by how many you can do in each country, with the ones closed to Americans marked.",
};

const MONEY = [
  { value: "all", label: "Everything" },
  { value: "participant_earns", label: "Pays you" },
  { value: "participant_pays", label: "You pay" },
] as const;

type MoneyValue = (typeof MONEY)[number]["value"];

function moneyLine(p: Program): string {
  if (p.money_direction === "participant_pays") return formatCostShort(p) ?? "Fee varies";
  if (p.money_direction === "net_neutral") return "Roughly breaks even";
  return formatPayShort(p);
}

function ProgramRow({ p }: { p: Program }) {
  const money = MONEY_UI[p.money_direction];
  return (
    <li>
      <Link
        href={`/programs/${p.slug}`}
        className="group flex items-start justify-between gap-4 py-3 transition-colors"
      >
        <span className="min-w-0">
          <span className="block font-medium leading-snug group-hover:underline decoration-1 underline-offset-2">
            {p.name}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{p.operator}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1 text-right">
          <span className="text-sm font-semibold tabular-nums">{moneyLine(p)}</span>
          {money && (
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", TONE_BADGE[money.tone])}>
              {money.label}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]);

  const rawMoney = one("money");
  const money: MoneyValue = MONEY.some((m) => m.value === rawMoney) ? (rawMoney as MoneyValue) : "all";
  const rawCountry = (one("country") ?? "").toUpperCase();

  const programs = (await listPrograms({ moneyDirection: money, includeUsIneligible: true }))
    // A map of where you can go has no business showing somewhere that has
    // shut down or stopped selecting.
    .filter((p) => p.funding_status !== "defunded" && p.funding_status !== "paused");

  const open = new Map<string, Program[]>();
  const notOpen = new Map<string, Program[]>();
  const unpinned: Program[] = [];

  for (const p of programs) {
    const codes = programCountries(p);
    if (!codes.length) {
      if (p.us_eligible === 1) unpinned.push(p);
      continue;
    }
    const bucket = p.us_eligible === 1 ? open : notOpen;
    for (const code of codes) bucket.set(code, [...(bucket.get(code) ?? []), p]);
  }

  const counts = Object.fromEntries([...open].map(([code, list]) => [code, list.length]));
  const closedOnly = [...notOpen.keys()].filter((code) => !open.has(code));
  const ranked = [...open].sort((a, b) => b[1].length - a[1].length || countryName(a[0]).localeCompare(countryName(b[0])));

  // An unknown or empty country code falls back to the overview rather than
  // rendering a heading for a country with nothing in it.
  const selected = open.has(rawCountry) || notOpen.has(rawCountry) ? rawCountry : undefined;

  const qs = (over: { money?: MoneyValue; country?: string }) => {
    const params = new URLSearchParams();
    const m = over.money ?? money;
    if (m !== "all") params.set("money", m);
    const c = "country" in over ? over.country : selected;
    if (c) params.set("country", c);
    const s = params.toString();
    return s ? `/map?${s}` : "/map";
  };

  const here = selected ? (open.get(selected) ?? []) : [];
  const closedHere = selected ? (notOpen.get(selected) ?? []) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-balance">
            Where you can do a gap year
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground text-pretty">
            {open.size} countries, shaded by how many programs an American can do there. Tap a
            country to see them.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {MONEY.map((m) => (
            <FilterPill key={m.value} href={qs({ money: m.value })} active={money === m.value} size="sm">
              {m.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card p-2 shadow-xs sm:p-4">
        <WorldMap counts={counts} closedOnly={closedOnly} selected={selected} hrefFor={(code) => qs({ country: code })} />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-2 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {BUCKETS.map((b) => (
              <span key={b.label} className="flex items-center gap-1">
                <svg viewBox="0 0 10 10" className="size-3" aria-hidden>
                  <rect width="10" height="10" rx="2" className={b.fill} />
                </svg>
                <span className="tabular-nums">{b.label}</span>
              </span>
            ))}
            <span className="ml-1">programs</span>
          </span>
          {closedOnly.length > 0 && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 10 10" className="size-3 text-warn" aria-hidden>
                <rect width="10" height="10" rx="2" className="fill-warn-muted" />
                <path d="M-2 8 8-2M2 12 12 2" stroke="currentColor" strokeWidth="2" />
              </svg>
              Programs exist, but not open to Americans
            </span>
          )}
        </div>
      </div>

      {selected ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">{countryName(selected)}</h2>
            <Link href={qs({ country: undefined })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <X className="size-3.5" /> All countries
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {here.length
              ? `${here.length} ${here.length === 1 ? "program" : "programs"} you can do here`
              : "Nothing here is open to American applicants."}
          </p>

          {here.length > 0 && <ul className="mt-2 divide-y border-t">{here.map((p) => <ProgramRow key={p.id} p={p} />)}</ul>}

          {closedHere.length > 0 && (
            <div className="mt-6 rounded-xl border border-warn/25 bg-warn-muted/50 p-4">
              <p className="text-sm font-semibold text-warn-foreground">Not open to Americans</p>
              <p className="mt-1 text-sm text-muted-foreground">
                These run here, and blog posts often recommend them to Americans, but the United
                States has no agreement that lets US citizens apply.
              </p>
              <ul className="mt-2 divide-y border-t border-warn/20">{closedHere.map((p) => <ProgramRow key={p.id} p={p} />)}</ul>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Every country</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Easier than tapping a small country on a phone.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {ranked.map(([code, list]) => (
                <li key={code}>
                  <Link
                    href={qs({ country: code })}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-accent"
                  >
                    <span className="truncate">{countryName(code)}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-muted-foreground">{list.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="self-start rounded-xl border bg-card p-4">
            <h2 className="flex items-center gap-2 font-semibold tracking-tight">
              <Globe2 className="size-4 text-muted-foreground" />
              Not tied to one country
              <span className="text-sm font-normal text-muted-foreground">({unpinned.length})</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Run worldwide, at sea, online, or in so many places that pinning them to one would
              mislead. They are not painted onto the map.
            </p>
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-sm font-medium text-primary hover:underline [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show all {unpinned.length}</span>
                <span className="hidden group-open:inline">Hide</span>
              </summary>
              <ul className="mt-2 divide-y border-t">{unpinned.map((p) => <ProgramRow key={p.id} p={p} />)}</ul>
            </details>
          </aside>
        </section>
      )}

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
