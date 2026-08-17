import { NextRequest } from "next/server";

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Also accept a
// `?token=` query param so the route can be triggered manually with curl.
export function isAuthorizedCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured yet (local dev) — allow
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const token = req.nextUrl.searchParams.get("token");
  return token === secret;
}
