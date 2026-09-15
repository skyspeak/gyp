import { NextRequest, NextResponse } from "next/server";
import { baseUrl } from "@/lib/base-url";
import { captureLead, EMAIL_RE, shareCodeFor, type LeadRole } from "@/lib/leads";
import { sendEmail } from "@/lib/email";

const ROLES: LeadRole[] = ["student", "parent", "adviser"];

// What the signup is actually worth, said plainly. Deadline alerts are table
// stakes; the closure alerts are the part nobody else can send, so they lead.
const WHAT_THEY_GET: Record<LeadRole, string> = {
  student:
    "We'll email you when a deadline that fits what you're after is 30, 7 and 1 day out — and if a program you're counting on shuts down or pauses.",
  parent:
    "We'll email you when a deadline that fits is 30, 7 and 1 day out — and if a program you're counting on shuts down or pauses. Nothing here is a paid placement.",
  adviser:
    "We'll email you when a program changes status — closed, paused, or newly unavailable to Americans — so your advising page never sends a student somewhere that no longer exists.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  // The form no longer asks. When no role is sent we still need one to satisfy
  // NOT NULL, but it is a guess and must not overwrite what someone already
  // told us — same reason /api/alerts marks its role assumed.
  const roleProvided = ROLES.includes(body?.role);
  const role: LeadRole = roleProvided ? body.role : "student";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const str = (v: unknown, max = 120) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  try {
    const { id, isNew } = await captureLead({
      email,
      role,
      roleAssumed: !roleProvided,
      intent: str(body?.intent, 40),
      cohort: body?.cohort === "pre_college" || body?.cohort === "post_grad" ? body.cohort : null,
      source: str(body?.source, 80),
      referrer: str(body?.referrer, 80),
      institutionName: str(body?.institutionName),
    });

    const base = baseUrl(req.nextUrl.origin);
    // A failed welcome email must not fail the signup — the lead is already
    // saved, and telling someone "something went wrong" would invite a
    // duplicate submission for a row that exists.
    await sendEmail({
      to: email,
      subject: role === "adviser" ? "Program status alerts" : "You're on the list",
      html: `<p>${WHAT_THEY_GET[role]}</p>
             <p><a href="${base}/programs">Browse the catalog</a></p>
             <p style="color:#888;font-size:12px">No commissions, no paid placements, and we never sell your address. Unsubscribe any time: ${base}/api/unsubscribe</p>`,
    }).catch(() => {});

    return NextResponse.json({ ok: true, isNew, shareCode: shareCodeFor(id) });
  } catch {
    return NextResponse.json({ error: "Couldn't save that. Try again." }, { status: 500 });
  }
}
