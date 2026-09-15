import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/base-url";

// Private shared plans (/plan/[token]) and map embeds (/embed/) are kept out
// of search results with a noindex tag on the page, and deliberately NOT
// blocked here. A crawler blocked by robots.txt never reads that tag, and can
// still list a bare URL someone linked to. Blocking is only for things with
// nothing worth crawling.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    sitemap: `${baseUrl() || "https://gyp-psi.vercel.app"}/sitemap.xml`,
  };
}
