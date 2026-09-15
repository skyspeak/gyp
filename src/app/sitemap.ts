import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { baseUrl } from "@/lib/base-url";

// Program pages are the long tail people actually search for ("is the Payne
// Fellowship still running", "JET programme pay"), and until this existed
// nothing handed them to a search engine at all.
//
// Request-time rather than build-time: there is no database during a build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sitemap URLs must be absolute; a relative <loc> is rejected by search
  // engines. baseUrl() alone returned "" wherever no base URL or Vercel
  // domain was set, which produced exactly that, so fall back to the host
  // that requested the sitemap.
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const base = baseUrl(host ? `${proto}://${host}` : undefined) || "https://gyp-psi.vercel.app";
  const rows = await db().execute("SELECT slug, updated_at, last_verified_at FROM programs ORDER BY slug");

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/programs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/map`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/design`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/deferral-letter`, changeFrequency: "monthly", priority: 0.6 },
  ];

  for (const r of rows.rows as unknown as { slug: string; updated_at: string | null; last_verified_at: string | null }[]) {
    const touched = r.last_verified_at ?? r.updated_at;
    pages.push({
      url: `${base}/programs/${r.slug}`,
      lastModified: touched ? new Date(touched) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  return pages;
}
