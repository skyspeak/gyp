"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForkButton({
  slugs,
  cohort,
  title,
}: {
  slugs: string[];
  cohort: "pre_college" | "post_grad";
  title: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function fork() {
    setStatus("loading");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // fromSlugs copies this exact proposal rather than re-suggesting, so
        // what lands in the editor is what was on the card.
        body: JSON.stringify({
          fromSlugs: slugs,
          cohort,
          cycleLabel: "2027-28",
          createdBy: "parent",
          title,
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
    <div>
      <Button variant="outline" className="w-full" onClick={fork} disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Copying…
          </>
        ) : (
          <>
            Start from this <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      {status === "error" && (
        <p className="mt-1.5 text-xs text-destructive">Couldn&apos;t copy that. Try again.</p>
      )}
    </div>
  );
}
