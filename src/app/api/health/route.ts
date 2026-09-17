import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { baseUrl } from "@/lib/base-url";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

// Which configuration is actually present in the running deployment, and what
// silently stops working when it is not. Reports presence only — never a
// value, not even a prefix.
//
// Guarded by CRON_SECRET because "which integrations are unconfigured" is a
// map of where this app is weakest.
//
// A blank env var counts as MISSING here. NEXT_PUBLIC_BASE_URL was set to an
// empty string in production, which is not the same as unset to `??` but is
// exactly the same to everything that matters — it put relative URLs in the
// calendar feed and dead links in every email.
const set = (v: string | undefined) => Boolean(v && v.trim());

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const e = process.env;
  const checks = [
    { key: "TURSO_DATABASE_URL", ok: set(e.TURSO_DATABASE_URL), breaks: "everything — no database" },
    { key: "TURSO_AUTH_TOKEN", ok: set(e.TURSO_AUTH_TOKEN), breaks: "everything — no database" },
    { key: "CRON_SECRET", ok: set(e.CRON_SECRET), breaks: "cron routes become public" },
    { key: "NEXT_PUBLIC_BASE_URL", ok: set(e.NEXT_PUBLIC_BASE_URL), breaks: "nothing now — falls back to the request origin or the Vercel domain" },
    { key: "RESEND_API_KEY", ok: set(e.RESEND_API_KEY), breaks: "ALL email: deadline reminders, watch confirmations, status alerts" },
    { key: "RESEND_FROM_EMAIL", ok: set(e.RESEND_FROM_EMAIL), breaks: "ALL email — there is no default sender, and sends are refused without it" },
    { key: "GEMINI_API_KEY", ok: set(e.GEMINI_API_KEY), breaks: "" },
    { key: "ANTHROPIC_API_KEY", ok: set(e.ANTHROPIC_API_KEY), breaks: "" },
    { key: "ADMIN_USER", ok: set(e.ADMIN_USER), breaks: "/admin/review returns 503" },
    { key: "ADMIN_PASSWORD", ok: set(e.ADMIN_PASSWORD), breaks: "/admin/review returns 503" },
    { key: "ADMIN_EMAIL", ok: set(e.ADMIN_EMAIL), breaks: "nobody is told when the cron auto-flags a program" },
  ];

  // Either extraction key is enough; neither means the nightly verification
  // cron fetches nothing and silently no-ops.
  const extraction = set(e.GEMINI_API_KEY) || set(e.ANTHROPIC_API_KEY);

  let database = "unreachable";
  let programs: number | null = null;
  let alertTables = false;
  try {
    const r = await db().execute("SELECT COUNT(*) n FROM programs");
    programs = Number(r.rows[0].n);
    database = "ok";
    await db().execute("SELECT COUNT(*) n FROM program_alerts");
    alertTables = true;
  } catch {
    /* leave the defaults; the point is to report, not to throw */
  }

  const missing = checks.filter((c) => !c.ok && c.breaks).map((c) => c.key);

  return NextResponse.json({
    database,
    programs,
    alertTablesMigrated: alertTables,
    emailEnabled: set(e.RESEND_API_KEY) && set(e.RESEND_FROM_EMAIL),
    extractionEnabled: extraction,
    resolvedBaseUrl: baseUrl(req.nextUrl.origin),
    env: Object.fromEntries(checks.map((c) => [c.key, c.ok])),
    missingThatMatter: extraction ? missing : [...missing, "GEMINI_API_KEY or ANTHROPIC_API_KEY"],
  });
}
