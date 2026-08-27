"use client";

import { useState } from "react";
import { ArrowRight, Check, GraduationCap, Users, BellRing, Loader2 } from "lucide-react";
import Link from "next/link";
import { INTENTS } from "@/lib/suggest";
import type { LeadRole } from "@/lib/leads";
import { cn } from "@/lib/utils";

const ROLES: { id: LeadRole; label: string; sub: string; icon: typeof Users }[] = [
  { id: "student", label: "Student", sub: "It's my year", icon: GraduationCap },
  { id: "parent", label: "Parent", sub: "Planning with my kid", icon: Users },
  { id: "adviser", label: "Adviser", sub: "I counsel students", icon: BellRing },
];

// The offer changes with who is asking. An adviser does not want deadline
// reminders for themselves — they want to know when something on their own
// list dies, which is the one alert nobody else sends.
const PITCH: Record<LeadRole, string> = {
  student: "Deadlines that fit what you want, 30, 7 and 1 day out.",
  parent: "Deadlines that fit, early enough to act — and no paid placements, ever.",
  adviser: "Get told when a program on your list closes, pauses, or drops US eligibility.",
};

// INTENTS labels are written to be read on the /design page, where each sits
// on its own line with a blurb. Here seven of them stacked one per row on a
// 375px screen and pushed the email field two thumb-scrolls below the fold,
// so this context gets shorter labels. Same ids — only the wording is compact.
const SHORT_INTENT: Record<string, string> = {
  earn: "Earn money",
  outdoors: "Be outside",
  abroad: "Go abroad",
  try_career: "Try a career",
  serve: "Do good",
  credential: "Get qualified",
  unsure: "Not sure yet",
};

// A chip has to be comfortable under a thumb. 44px is the floor, and the
// touch-manipulation class kills the 300ms double-tap-zoom delay on iOS.
const CHIP =
  "min-h-11 touch-manipulation rounded-xl border px-3.5 text-sm transition-all " +
  "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function LeadForm({
  source,
  heading = "Know before the deadline does",
  blurb = "One email when something you care about is closing — or has closed. Free, and we never take a cut from any program listed here.",
  // Shown in the fine print before a role is picked. Defaulting to the student
  // pitch made the card promise deadline reminders under a heading offering
  // closure alerts — two different promises in one box.
  pitch = "One email when something you are counting on is closing, or has closed.",
  className,
}: {
  source: string;
  heading?: string;
  blurb?: string;
  pitch?: string;
  className?: string;
}) {
  const [role, setRole] = useState<LeadRole | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const chosen = role ?? "student";
  const finePrint = role ? PITCH[role] : pitch;

  if (status === "done") {
    return (
      <div
        className={cn(
          "rounded-2xl border bg-gradient-to-b from-earn-muted to-transparent p-6 text-center sm:p-8",
          className
        )}
      >
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-earn-muted text-earn-foreground">
          <Check className="size-5" />
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">Check your inbox</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
          {finePrint} Sent to <span className="font-medium text-foreground">{email}</span>.
        </p>
        <Link
          href={chosen === "adviser" ? "/changes" : "/programs"}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {chosen === "adviser" ? "See what changed this cycle" : "Browse what pays"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
      className={cn("rounded-2xl border bg-card p-5 shadow-sm sm:p-7", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("loading");
        setError("");
        try {
          const res = await fetch("/api/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              role: chosen,
              intent,
              source,
              // Set by an adviser forwarding a link with ?ref=, which is the
              // only way to attribute a signup back to who passed it along.
              referrer:
                typeof window === "undefined"
                  ? null
                  : new URLSearchParams(window.location.search).get("ref"),
              institutionName: chosen === "adviser" ? institution : null,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error ?? "Couldn't save that.");
          setStatus("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't save that.");
          setStatus("error");
        }
      }}
    >
      <h3 className="text-lg font-semibold tracking-tight text-balance sm:text-xl">{heading}</h3>
      <p className="mt-1.5 text-pretty text-sm text-muted-foreground">{blurb}</p>

      <fieldset className="mt-5">
        <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          I&apos;m a
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {ROLES.map((r) => {
            const on = role === r.id;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                onClick={() => setRole(r.id)}
                className={cn(
                  CHIP,
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-2 text-center",
                  on
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "hover:border-foreground/30 hover:bg-muted"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-xs font-medium leading-tight sm:text-sm">{r.label}</span>
                <span
                  className={cn(
                    "hidden text-[10px] leading-tight sm:block",
                    on ? "text-primary-foreground/75" : "text-muted-foreground"
                  )}
                >
                  {r.sub}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Second question only appears once the first is answered, so the form
          opens as one short question rather than a wall of fields. */}
      {role && role !== "adviser" && (
        <fieldset className="mt-4">
          <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Mostly after <span className="normal-case opacity-70">(optional)</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTENTS.map((i) => {
              const on = intent === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setIntent(on ? null : i.id)}
                  className={cn(
                    CHIP,
                    "px-3 py-2 text-xs sm:px-3.5 sm:text-sm",
                    on
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "hover:border-foreground/30 hover:bg-muted"
                  )}
                >
                  {SHORT_INTENT[i.id] ?? i.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {role === "adviser" && (
        <div className="mt-4">
          <label
            htmlFor="lead-institution"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Institution <span className="normal-case opacity-70">(optional)</span>
          </label>
          <input
            id="lead-institution"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Where you advise"
            autoComplete="organization"
            className="mt-2 min-h-11 w-full rounded-xl border bg-transparent px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          aria-invalid={status === "error"}
          // inputMode brings up the @ keyboard; the rest stops iOS from
          // capitalising or autocorrecting an address into something invalid.
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="min-h-12 flex-1 rounded-xl border bg-transparent px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-60 touch-manipulation"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving
            </>
          ) : (
            <>
              Notify me <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-sm text-destructive">
        {status === "error" ? error : ""}
      </p>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {finePrint} Unsubscribe in one click. We never sell your address, and we take no
        commission from any program listed here.
      </p>
    </form>
  );
}
