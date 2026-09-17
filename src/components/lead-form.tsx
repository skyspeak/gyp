"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

// One field, one line. This form previously opened with "I'm a" across three
// role chips and then seven "mostly after" chips — three decisions before
// reaching the only thing actually required. Role and intent are better
// inferred from behaviour, or asked once there is a reason to ask.
//
// It is also deliberately small now: the page states the deadline promise
// above it, so the form itself only has to be the box you type into.
export function LeadForm({
  source,
  pitch = "One email when something you are counting on is closing, or has closed.",
  className,
}: {
  source: string;
  pitch?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [shareCode, setShareCode] = useState<string | null>(null);
  // Whether the welcome email actually reached Resend. "Check your inbox" is
  // a promise, and the card must not make it when nothing was sent.
  const [emailed, setEmailed] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareUrl = () => `${window.location.origin}/?ref=${shareCode}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", shareUrl());
    }
  };

  if (status === "done") {
    return (
      <div className={cn("rounded-xl border bg-earn-muted/40 p-3 text-left", className)}>
        <p className="flex items-center gap-2 text-sm font-medium">
          <Check className="size-4 shrink-0 text-earn-foreground" />
          {emailed ? "Check your inbox" : "You're on the list"}
          <span className="truncate font-normal text-muted-foreground">{email}</span>
        </p>
        {/* The moment right after someone signs up is when they are most
            convinced this is useful, and a gap year is rarely decided alone —
            there is a friend, sibling or classmate weighing the same thing.
            One link, theirs, credited to them. */}
        {shareCode && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: "Gap Year Platform",
                      text: "Gap years that pay you instead of charging you. Free, no sponsored listings.",
                      url: shareUrl(),
                    });
                    return;
                  } catch {
                    /* dismissed — fall through to copy */
                  }
                }
                copyLink();
              }}
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Send className="size-3.5" />
              {copied ? "Link copied" : "Send this to someone deciding too"}
            </button>
            <button
              type="button"
              aria-label="Copy link"
              onClick={copyLink}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border bg-card px-2.5 transition-colors hover:bg-muted"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      className={cn("text-left", className)}
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
              source,
              // Set by an adviser forwarding a link with ?ref=, which is the
              // only way to attribute a signup back to who passed it along.
              referrer:
                typeof window === "undefined"
                  ? null
                  : new URLSearchParams(window.location.search).get("ref"),
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error ?? "Couldn't save that.");
          setShareCode(typeof data?.shareCode === "string" ? data.shareCode : null);
          setEmailed(data?.emailed !== false);
          setStatus("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't save that.");
          setStatus("error");
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
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
          className="min-h-11 flex-1 rounded-lg border bg-card px-3.5 text-base shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive sm:text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving
            </>
          ) : (
            <>
              Email me <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <p aria-live="polite" className="mt-1.5 text-xs text-destructive empty:hidden">
        {status === "error" ? error : ""}
      </p>

      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        {pitch} Unsubscribe in one click, and we take no commission from anything listed here.
      </p>
    </form>
  );
}
