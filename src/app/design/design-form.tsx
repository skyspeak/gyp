"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INTENTS, type Intent, type Ambition } from "@/lib/suggest";
import { cn } from "@/lib/utils";

const AMBITIONS: { id: Ambition; label: string; hint: string }[] = [
  { id: "year", label: "A full year", hint: "About 12 months" },
  { id: "semester", label: "A semester", hint: "About 6 months" },
  { id: "summer", label: "A summer", hint: "About 3 months" },
];

export default function DesignForm() {
  const router = useRouter();
  const [intents, setIntents] = useState<Intent[]>([]);
  const [ambition, setAmbition] = useState<Ambition>("year");
  const [cohort, setCohort] = useState<"pre_college" | "post_grad">("pre_college");
  const [studentName, setStudentName] = useState("");
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
          studentName: studentName.trim() || null,
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

  return (
    <form onSubmit={submit} className="mt-8 space-y-8">
      {/* Behaviour first. Not "pick months" — "what is this year for". */}
      <fieldset>
        <legend className="text-base font-medium">
          What should they get out of it?
        </legend>
        <p className="mt-0.5 text-sm text-muted-foreground">Pick as many as apply.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {INTENTS.map((it) => {
            const on = intents.includes(it.id);
            return (
              <button
                key={it.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(it.id)}
                className={cn(
                  "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
                  on ? "border-primary bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                  )}
                >
                  {on && <Check className="size-2.5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{it.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{it.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-base font-medium">How much time?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {AMBITIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={ambition === a.id}
              onClick={() => setAmbition(a.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                ambition === a.id ? "border-primary bg-muted/60" : "hover:bg-muted/40"
              )}
            >
              <span className="block text-sm font-medium">{a.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{a.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-base font-medium">Where are they now?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            { v: "pre_college" as const, l: "Before college", h: "Deferring or applying" },
            { v: "post_grad" as const, l: "After college", h: "Graduated or about to" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              aria-pressed={cohort === o.v}
              onClick={() => setCohort(o.v)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                cohort === o.v ? "border-primary bg-muted/60" : "hover:bg-muted/40"
              )}
            >
              <span className="block text-sm font-medium">{o.l}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{o.h}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="studentName" className="text-sm font-medium">
          Their first name <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="studentName"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Just names the plan"
          className="mt-1.5 sm:max-w-xs"
        />
      </div>

      <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <Button
          type="submit"
          size="lg"
          className="w-full"
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
        {status === "error" && (
          <p className="mt-2 text-sm text-destructive">
            Couldn&apos;t build that — try again, or{" "}
            <Link href="/programs" className="underline">browse programs directly</Link>.
          </p>
        )}
      </div>
    </form>
  );
}
