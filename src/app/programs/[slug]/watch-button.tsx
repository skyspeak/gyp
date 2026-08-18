"use client";

import { useState } from "react";

export default function WatchButton({ programId, programName }: { programId: string; programName: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [cohort, setCohort] = useState<"pre_college" | "post_grad">("post_grad");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  if (status === "done") {
    return (
      <p className="text-sm text-green-700">
        You&apos;re watching {programName}. We&apos;ll email deadline reminders to {email}.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:border-neutral-500"
      >
        Watch — get deadline reminders
      </button>
    );
  }

  return (
    <form
      className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 w-full sm:w-auto"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("loading");
        try {
          const res = await fetch("/api/watch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, programId, cohort }),
          });
          if (!res.ok) throw new Error("failed");
          setStatus("done");
        } catch {
          setStatus("error");
        }
      }}
    >
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm w-full sm:w-56"
      />
      <select
        value={cohort}
        onChange={(e) => setCohort(e.target.value as "pre_college" | "post_grad")}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm w-full sm:w-auto"
      >
        <option value="post_grad">I&apos;m a recent/upcoming grad</option>
        <option value="pre_college">I have a deferred college seat</option>
      </select>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50 w-full sm:w-auto"
      >
        {status === "loading" ? "Saving…" : "Start watching"}
      </button>
      {status === "error" && <span className="text-sm text-red-600">Something went wrong. Try again.</span>}
    </form>
  );
}
