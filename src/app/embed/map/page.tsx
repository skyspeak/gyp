import { buildMapData } from "@/lib/map-data";
import { MapExplorer } from "@/components/map-explorer";
import { baseUrl } from "@/lib/base-url";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Where you can do a gap year",
  // An embed is a copy of /map inside someone else's page; the canonical page
  // is the one that should be indexed.
  robots: { index: false, follow: true },
};

// The map as an iframe for advising offices, counselors and bloggers to put on
// their own sites. Every program link opens on this site in a new tab carrying
// the embedder's ref, so an embed is both a backlink and attributable.
export default async function EmbedMapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]);
  const refCode = (one("ref") ?? "embed").replace(/[^a-z0-9_-]/gi, "").slice(0, 60) || "embed";
  const rawCountry = (one("country") ?? "").toUpperCase();

  const h = await headers();
  // Vercel terminates TLS in front of the app, so the scheme comes from the
  // forwarded header; a bare local server has none and is plain http.
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = baseUrl(host ? `${proto}://${host}` : undefined);
  const { countries, counts, closedOnly, unpinned } = await buildMapData();

  return (
    <div className="px-3 py-3">
      <MapExplorer
        countries={countries}
        counts={counts}
        closedOnly={closedOnly}
        unpinned={unpinned}
        initialCountry={countries[rawCountry] ? rawCountry : undefined}
        embed={{ refCode, origin }}
      />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        <a
          href={`${origin}/map?ref=${encodeURIComponent(refCode)}`}
          target="_blank"
          rel="noopener"
          className="underline"
        >
          Gap Year Platform
        </a>{" "}
        · free, no commissions, no sponsored listings
      </p>
    </div>
  );
}
