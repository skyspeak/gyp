import { Resend } from "resend";

let resend: Resend | null = null;

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY?.trim()) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/**
 * The sender address, or null when it is not configured.
 *
 * There is deliberately no default. The old fallback was
 * `deadlines@example.com`, a domain nobody here owns: with an API key set and
 * this variable missing, every send was handed to Resend, rejected, and the
 * rejection came back in the response body rather than as a thrown error — so
 * the app reported success and nobody ever got an email.
 */
export function senderAddress(): string | null {
  return process.env.RESEND_FROM_EMAIL?.trim() || null;
}

/** True when both halves of the configuration are present. */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && senderAddress());
}

/**
 * Resolves true only when Resend accepted the message. Never throws: one bad
 * address must not abort a cron fan-out. Every failure is logged with enough
 * detail to tell a configuration problem from a delivery one.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const r = client();
  if (!r) {
    console.error(
      `[email:SKIPPED] RESEND_API_KEY is not set — nothing was sent. to=${opts.to} subject="${opts.subject}"`
    );
    return false;
  }

  const from = senderAddress();
  if (!from) {
    console.error(
      `[email:REFUSED] RESEND_FROM_EMAIL is not set — refusing to send from a domain we do not own. ` +
        `Set it to a verified Resend sender. to=${opts.to} subject="${opts.subject}"`
    );
    return false;
  }

  try {
    // Resend returns API-level failures in `error` rather than throwing, so a
    // bare await would report an unverified domain as a successful send.
    const { error } = await r.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error(
        `[email:REJECTED] ${error.name ?? "error"}: ${error.message} to=${opts.to} subject="${opts.subject}"`
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[email:FAILED] ${err instanceof Error ? err.message : String(err)} to=${opts.to} subject="${opts.subject}"`
    );
    return false;
  }
}
