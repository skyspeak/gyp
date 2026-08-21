"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CYCLES = ["2027-28", "2028-29", "2029-30"];

export default function DesignForm() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [cohort, setCohort] = useState<"pre_college" | "post_grad">("pre_college");
  const [cycleLabel, setCycleLabel] = useState(CYCLES[0]);
  const [createdBy, setCreatedBy] = useState<"parent" | "student">("parent");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: studentName.trim() || null, cohort, cycleLabel, createdBy }),
      });
      if (!res.ok) throw new Error();
      const { token } = await res.json();
      router.push(`/plan/${token}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="studentName" className="text-sm font-medium">
          Who is this for?
        </label>
        <Input
          id="studentName"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Their first name"
          className="mt-1.5"
          autoFocus
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Optional — it just names the plan.
        </p>
      </div>

      <Choice
        label="Where are they now?"
        value={cohort}
        onChange={(v) => setCohort(v as typeof cohort)}
        options={[
          { value: "pre_college", label: "Before college", hint: "Deferring or applying" },
          { value: "post_grad", label: "After college", hint: "Graduated or about to" },
        ]}
      />

      <div>
        <span className="text-sm font-medium">Which year?</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CYCLES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycleLabel(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                cycleLabel === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Choice
        label="Who's building this?"
        value={createdBy}
        onChange={(v) => setCreatedBy(v as typeof createdBy)}
        options={[
          { value: "parent", label: "I'm a parent", hint: "You can hand it over later" },
          { value: "student", label: "It's my own year", hint: "" },
        ]}
      />

      <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Creating…
          </>
        ) : (
          <>
            Start building <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      {status === "error" && (
        <p className="text-sm text-destructive">Couldn&apos;t create that. Try again.</p>
      )}
    </form>
  );
}

function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; hint: string }[];
}) {
  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              value === o.value ? "border-primary bg-muted/60" : "hover:bg-muted/40"
            )}
          >
            <span className="block text-sm font-medium">{o.label}</span>
            {o.hint && <span className="mt-0.5 block text-xs text-muted-foreground">{o.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
