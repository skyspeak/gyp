"use client";

import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// The one alert nobody else sends. A deadline reminder is a commodity; being
// told that the program you were counting on has quietly shut down is not.
export function AlertButton({
  slug,
  programName,
  className,
  label = "Alert me if this changes",
}: {
  slug?: string;
  programName?: string;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (status === "done") {
    return (
      <p className={cn("flex items-center gap-1.5 text-sm text-earn-foreground", className)}>
        <Check className="size-4 shrink-0" />
        Watching{programName ? ` ${programName}` : ""} — we&apos;ll email {email} if it changes.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors hover:bg-muted",
          className
        )}
      >
        <BellRing className="size-3.5" /> {label}
      </button>
    );
  }

  return (
    <form
      className={cn("flex w-full flex-col gap-2 sm:flex-row sm:items-start", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("loading");
        setError("");
        try {
          const res = await fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              slug,
              referrer:
                typeof window === "undefined"
                  ? null
                  : new URLSearchParams(window.location.search).get("ref"),
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
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          aria-invalid={status === "error"}
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="min-h-11 flex-1 rounded-lg border bg-transparent px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive sm:w-56 sm:flex-none md:text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-3.5" />}
          {status === "loading" ? "Saving" : "Watch"}
        </button>
      </div>
      {status === "error" && <p className="text-sm text-destructive sm:pt-2.5">{error}</p>}
    </form>
  );
}
