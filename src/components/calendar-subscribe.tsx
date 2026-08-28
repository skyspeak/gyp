"use client";

import { useState } from "react";
import { CalendarPlus, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// Subscribing beats visiting. An adviser who subscribes once sees these
// deadlines in the calendar they already have open, every cycle, without ever
// coming back here — which is the point.
export function CalendarSubscribe({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  // Resolved at click time rather than render time: reading window during
  // render breaks hydration, and there is nothing to show before a click.
  const feedUrl = () =>
    typeof window === "undefined" ? "" : `${window.location.origin}/api/calendar.ics`;

  return (
    <div className={cn("rounded-xl border p-4 sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
          <CalendarPlus className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold tracking-tight">Put these in your calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Subscribe once and every deadline appears in your own calendar, updating each cycle.
            Closed and paused programs are excluded automatically.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // webcal:// makes Apple Calendar and Outlook subscribe rather
                // than download a one-off copy that never updates.
                window.location.href = feedUrl().replace(/^https?:/, "webcal:");
              }}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <CalendarPlus className="size-4" /> Subscribe
            </a>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(feedUrl());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  window.prompt("Copy this feed URL", feedUrl());
                }
              }}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy feed URL"}
            </button>
          </div>

          <p className="mt-2.5 text-xs text-muted-foreground">
            Google Calendar: use <span className="font-medium">Other calendars → From URL</span> and
            paste the copied link — Google does not accept the subscribe button.
          </p>
        </div>
      </div>
    </div>
  );
}
