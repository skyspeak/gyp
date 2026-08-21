"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Question } from "@/lib/connect";

// The questions are written to be pasted into an email, so copying one has to
// be a single tap rather than a select-and-drag on a phone.
export function QuestionList({ questions }: { questions: Question[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  async function copy(i: number, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 2000);
  }

  return (
    <ul className="mt-3 space-y-2">
      {questions.map((q, i) => (
        <li key={q.q} className="rounded-xl border p-3.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug">“{q.q}”</p>
            <button
              onClick={() => copy(i, q.q)}
              aria-label={copied === i ? "Copied" : "Copy question"}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {copied === i ? (
                <Check className="size-3.5 text-earn-foreground" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{q.why}</p>
        </li>
      ))}
    </ul>
  );
}
