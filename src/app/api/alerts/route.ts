import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { baseUrl } from "@/lib/base-url";
import { captureLead, EMAIL_RE, type LeadRole } from "@/lib/leads";
import { newId, nowIso } from "@/lib/ids";
import { sendEmail } from "@/lib/email";

const ROLES: LeadRole[] = ["student", "parent", "adviser"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const slug = typeof body?.slug === "string" ? body.slug : null;
  const role: LeadRole = ROLES.includes(body?.role) ? body.role : "adviser";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const client = db();

  // slug omitted means "tell me about everything", stored as a NULL program_id.
  let programId: string | null = null;
  let programName = "every program we track";
  if (slug) {
    const p = await client.execute({
      sql: "SELECT id, name FROM programs WHERE slug = ?",
      args: [slug],
    });
    if (!p.rows[0]) return NextResponse.json({ error: "Program not found." }, { status: 404 });
    programId = String(p.rows[0].id);
    programName = String(p.rows[0].name);
  }

  try {
    const { id: personId } = await captureLead({
      email,
      role,
      // Nobody asked them; this is a guess to satisfy NOT NULL on a new row.
      roleAssumed: true,
      source: slug ? `alert:${slug}` : "alert:all",
      referrer:
        typeof body?.referrer === "string" && body.referrer.trim()
          ? body.referrer.trim().slice(0, 80)
          : null,
    });

    // Subscribing twice is not an error — the unique index makes it a no-op.
    const existing = await client.execute({
      sql: programId
        ? "SELECT id FROM program_alerts WHERE person_id = ? AND program_id = ?"
        : "SELECT id FROM program_alerts WHERE person_id = ? AND program_id IS NULL",
      args: programId ? [personId, programId] : [personId],
    });

    const alreadyWatching = existing.rows.length > 0;
    if (!alreadyWatching) {
      await client.execute({
        sql: "INSERT INTO program_alerts (id, person_id, program_id, created_at) VALUES (?,?,?,?)",
        args: [newId("alert"), personId, programId, nowIso()],
      });

      const base = baseUrl(req.nextUrl.origin);
      await sendEmail({
        to: email,
        subject: slug ? `Watching: ${programName}` : "Watching every program",
        html: `<p>We'll email you if <strong>${programName}</strong> changes status — shut down, paused, funding at risk, or no longer open to Americans.</p>
               <p>Nothing else. <a href="${base}/programs">Browse the catalog</a>.</p>`,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, alreadyWatching, programName });
  } catch {
    return NextResponse.json({ error: "Couldn't save that. Try again." }, { status: 500 });
  }
}
