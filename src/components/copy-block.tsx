"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// A block of text with one job: get copied exactly. Pre-wrapped so the
// template's line breaks survive the paste into an email.
export function CopyBlock({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-xl border bg-card">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Copy this", text);
          }
        }}
        className="absolute right-3 top-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : label}
      </button>
      <pre className="overflow-x-auto whitespace-pre-wrap p-5 pt-14 font-sans text-sm leading-relaxed sm:pt-5 sm:pr-28">{text}</pre>
    </div>
  );
}
