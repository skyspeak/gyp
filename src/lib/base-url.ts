// Absolute base URL for links that leave the site — calendar events and every
// email we send.
//
// `process.env.X ?? fallback` does NOT work here. NEXT_PUBLIC_BASE_URL is
// currently set to an EMPTY STRING in production, and "" is not undefined, so
// the fallback never ran: the .ics feed shipped relative URLs like
// "/programs/epik-south-korea", which resolve to nothing inside a calendar
// client, and every email went out with dead links. Same trap as the empty
// TURSO_DATABASE_URL that silently seeded the wrong database.
//
// So: treat blank as absent, everywhere, and prefer a request's own origin
// over guessing.
export function baseUrl(requestOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (requestOrigin) return requestOrigin.replace(/\/+$/, "");

  // Set by Vercel. The first is the stable production domain; the second is
  // the per-deployment URL, which is at least absolute.
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  return "";
}
