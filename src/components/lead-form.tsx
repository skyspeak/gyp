"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// One field. This form previously opened with "I'm a" across three role chips
// and then seven "mostly after" chips — three decisions before reaching the
// only thing actually required. Role and intent are better inferred from
// behaviour, or asked once there is a reason to ask.
export function LeadForm({
  source,
  heading = "Know before the deadline does",
  blurb = "One email when something you care about is closing — or has closed. Free, and we never take a cut from any program listed here.",
  pitch = "One email when something you are counting on is closing, or has closed.",
  className,
}: {
  source: string;
  heading?: string;
  blurb?: string;
  pitch?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [shareCode, setShareCode] = useState<string | null>(null);
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
          {pitch} Sent to <span className="font-medium text-foreground">{email}</span>.
        </p>
        {/* The moment right after someone signs up is when they are most
            convinced this is useful, and a gap year is rarely decided alone —
            there is a friend, sibling or classmate weighing the same thing.
            One link, theirs, credited to them. */}
        {shareCode && (
          <div className="mx-auto mt-5 max-w-sm rounded-xl border bg-card p-3 text-left">
            <p className="text-sm font-medium">Know someone else deciding what to do next year?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Send them your link.</p>
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
                      // Dismissed the share sheet; fall through to copy.
                    }
                  }
                  await copyLink();
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {copied ? <Check className="size-4" /> : <Send className="size-4" />}
                {copied ? "Link copied" : "Share my link"}
              </button>
              <button
                type="button"
                aria-label="Copy link"
                onClick={copyLink}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border px-3 transition-colors hover:bg-muted"
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>
        )}
        <Link
          href="/programs"
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Browse what pays
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
          setStatus("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't save that.");
          setStatus("error");
        }
      }}
    >
      <h3 className="text-lg font-semibold tracking-tight text-balance sm:text-xl">{heading}</h3>
      <p className="mt-1.5 text-pretty text-sm text-muted-foreground">{blurb}</p>

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
          className="min-h-12 flex-1 rounded-xl border bg-transparent px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-12 shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
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
        {pitch} Unsubscribe in one click. We never sell your address, and we take no commission from
        any program listed here.
      </p>
    </form>
  );
}
