"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Check,
  Compass,
  GraduationCap,
  HeartHandshake,
  Loader2,
  Plane,
  Shuffle,
  Trees,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INTENTS, type Intent, type Ambition } from "@/lib/suggest";
import { cn } from "@/lib/utils";

// An icon per intent. They do real work here: seven near-identical text
// boxes read as a survey, and people stop reading surveys after two rows.
const INTENT_ICONS: Record<Intent, LucideIcon> = {
  earn: Banknote,
  outdoors: Trees,
  abroad: Plane,
  try_career: Compass,
  serve: HeartHandshake,
  credential: GraduationCap,
  unsure: Shuffle,
};

const AMBITIONS: { id: Ambition; label: string; months: string; hint: string }[] = [
  { id: "year", label: "A full year", months: "12", hint: "months" },
  { id: "semester", label: "A semester", months: "6", hint: "months" },
  { id: "summer", label: "A summer", months: "3", hint: "months" },
];

const COHORTS = [
  { v: "pre_college" as const, l: "Before college", h: "Deferring, or applying this year" },
  { v: "post_grad" as const, l: "After college", h: "Graduated, or about to be" },
];

export default function DesignForm() {
  const router = useRouter();
  const [intents, setIntents] = useState<Intent[]>([]);
  const [ambition, setAmbition] = useState<Ambition>("year");
  const [cohort, setCohort] = useState<"pre_college" | "post_grad">("pre_college");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const toggle = (id: Intent) =>
    setIntents((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (intents.length === 0) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intents,
          ambition,
          cohort,
          studentName: null,
          cycleLabel: "2027-28",
          createdBy: "parent",
        }),
      });
      if (!res.ok) throw new Error();
      const { token } = await res.json();
      router.push(`/plan/${token}`);
    } catch {
      setStatus("error");
    }
  }

  const summary = [
    intents.length > 0
      ? `${intents.length} goal${intents.length === 1 ? "" : "s"}`
      : "No goals picked yet",
    AMBITIONS.find((a) => a.id === ambition)?.label.toLowerCase(),
    COHORTS.find((c) => c.v === cohort)?.l.toLowerCase(),
  ].join(" · ");

  return (
    <form onSubmit={submit} className="space-y-10">
      {/* Behaviour first. Not "pick months" — "what is this year for". */}
      <Step n={1} title="What should they get out of it?" hint="Pick as many as apply.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {INTENTS.map((it) => {
            const on = intents.includes(it.id);
            const Icon = INTENT_ICONS[it.id];
            return (
              <button
                key={it.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(it.id)}
                className={cn(
                  "group relative flex items-start gap-3 rounded-2xl border bg-card p-4 text-left shadow-xs transition-all",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  on && "border-primary bg-primary/[0.04] shadow-md ring-1 ring-primary"
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                    on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {on ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium leading-snug">{it.label}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{it.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Step>

      <Step n={2} title="How much time?" hint="Length comes from each program, not a guess.">
        <div className="grid gap-2.5 sm:grid-cols-3">
          {AMBITIONS.map((a) => {
            const on = ambition === a.id;
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={on}
                onClick={() => setAmbition(a.id)}
                className={cn(
                  "rounded-2xl border bg-card p-4 text-left shadow-xs transition-all",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  on && "border-primary bg-primary/[0.04] shadow-md ring-1 ring-primary"
                )}
              >
                <span className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tabular-nums">{a.months}</span>
                  <span className="text-xs text-muted-foreground">{a.hint}</span>
                </span>
                <span className="mt-1 block text-sm font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
      </Step>

      <Step n={3} title="Where are they now?">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {COHORTS.map((o) => {
            const on = cohort === o.v;
            return (
              <button
                key={o.v}
                type="button"
                aria-pressed={on}
                onClick={() => setCohort(o.v)}
                className={cn(
                  "rounded-2xl border bg-card p-4 text-left shadow-xs transition-all",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  on && "border-primary bg-primary/[0.04] shadow-md ring-1 ring-primary"
                )}
              >
                <span className="block font-medium">{o.l}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{o.h}</span>
              </button>
            );
          })}
        </div>
      </Step>

      {/* Sticky so the way out is always on screen, and carrying the current
          answers so nobody has to scroll up to check what they picked. */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4 sm:shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{summary}</p>
          <Button
            type="submit"
            className="h-12 w-full px-6 text-base sm:w-auto"
            disabled={status === "loading" || intents.length === 0}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Building a year…
              </>
            ) : intents.length === 0 ? (
              "Pick at least one goal"
            ) : (
              <>
                Show me a year <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
        {status === "error" && (
          <p className="mt-2 text-sm text-destructive">
            Couldn&apos;t build that — try again, or{" "}
            <Link href="/programs" className="underline">
              browse programs directly
            </Link>
            .
          </p>
        )}
      </div>
    </form>
  );
}

function Step({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="w-full">
        <span className="flex items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
            {n}
          </span>
          <span className="text-lg font-semibold tracking-tight">{title}</span>
        </span>
      </legend>
      {hint && <p className="mt-1 pl-9.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}
