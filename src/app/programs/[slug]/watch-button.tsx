"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WatchButton({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [cohort, setCohort] = useState<"pre_college" | "post_grad">("post_grad");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  if (status === "done") {
    return (
      <p className="flex items-center gap-1.5 text-sm text-earn-foreground">
        <Check className="size-4" /> Watching {programName} — reminders go to {email}
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Bell className="size-3.5" /> Remind me
      </Button>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
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
      <Input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="sm:w-52"
      />
      <Select value={cohort} onValueChange={(v) => setCohort(v as "pre_college" | "post_grad")}>
        <SelectTrigger className="sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="post_grad">Recent / upcoming grad</SelectItem>
          <SelectItem value="pre_college">Deferred college seat</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Saving…" : "Watch"}
      </Button>
      {status === "error" && (
        <span className="text-sm text-destructive">Something went wrong.</span>
      )}
    </form>
  );
}
