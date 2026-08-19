import { Resend } from "resend";

let resend: Resend | null = null;

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const r = client();
  if (!r) {
    console.log(`[email:skipped, no RESEND_API_KEY] to=${opts.to} subject=${opts.subject}`);
    return;
  }
  const from = process.env.RESEND_FROM_EMAIL ?? "Gap Year Platform <deadlines@example.com>";
  await r.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html });
}
