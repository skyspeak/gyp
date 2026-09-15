import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buildMapData } from "@/lib/map-data";
import { MapExplorer } from "@/components/map-explorer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Where you can do a gap year — Gap Year Platform",
  description:
    "A world map of gap year and post-grad programs. Click a country to see every gap year you can do there, with what each one pays or costs.",
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.country) ? sp.country[0] : sp.country;
  const rawCountry = (raw ?? "").toUpperCase();
  const { countries, counts, closedOnly, unpinned } = await buildMapData();

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
