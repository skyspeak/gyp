import { TriangleAlert } from "lucide-react";
import { db } from "@/lib/db";
import type { FieldDiff } from "@/lib/review-queue";
import { formatCents } from "@/lib/format";
import { TONE_ALERT } from "@/lib/money-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { approveReview, rejectReview } from "./actions";

export const metadata = { title: "Review queue — Stipend Clock admin" };
export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  program_id: string;
  program_name: string;
  program_slug: string;
  field_diffs: string;
  suspicion: string | null;
  created_at: string;
};

function formatDiffValue(field: string, v: string | number | null) {
  if (v == null) return "—";
  if (field === "pay_low" || field === "pay_high") return formatCents(Number(v)) ?? String(v);
  return String(v);
}

export default async function ReviewQueuePage() {
  const res = await db().execute(
    `SELECT rq.id, rq.program_id, rq.field_diffs, rq.suspicion, rq.created_at,
            p.name as program_name, p.slug as program_slug
     FROM review_queue rq JOIN programs p ON p.id = rq.program_id
     WHERE rq.status = 'pending'
     ORDER BY rq.created_at ASC`
  );
  const rows = res.rows as unknown as ReviewRow[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Review queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {rows.length} pending. Nothing here is live until you confirm it — deadlines and pay never
        auto-publish.
      </p>

      <div className="mt-6 space-y-4">
        {rows.map((row) => {
          const diffs = JSON.parse(row.field_diffs) as FieldDiff[];
          return (
            <div key={row.id} className="rounded-xl border overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
                <h2 className="font-medium">{row.program_name}</h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(row.created_at).toLocaleString()}
                </span>
              </div>

              {row.suspicion && (
                <div className={cn("m-4 mb-0 rounded-lg border p-3 text-sm", TONE_ALERT.warn)}>
                  <p className="flex items-center gap-1.5 font-semibold">
                    <TriangleAlert className="size-4" /> Suspension language detected
                  </p>
                  <p className="mt-1 opacity-90">
                    Already auto-set to at_risk. &ldquo;{row.suspicion}&rdquo;
                  </p>
                </div>
              )}

              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[440px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="pb-1.5 font-medium">Field</th>
                      <th className="pb-1.5 font-medium">Current</th>
                      <th className="pb-1.5 font-medium">Proposed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffs.map((d, i) => (
                      <tr key={i} className="border-t">
                        {d.type === "program_field" ? (
                          <>
                            <td className="py-2 pr-3">{d.label}</td>
                            <td className="py-2 pr-3 text-muted-foreground line-through">
                              {formatDiffValue(d.field, d.old_value)}
                            </td>
                            <td className="py-2 font-medium">
                              {formatDiffValue(d.field, d.new_value)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 pr-3">
                              Deadline · {d.cycle_label} ({d.kind})
                            </td>
                            <td className="py-2 pr-3 text-muted-foreground line-through">
                              {d.old_due_at ?? "none"}
                            </td>
                            <td className="py-2 font-medium tabular-nums">{d.new_due_at}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t bg-muted/20 p-3 sm:flex-row sm:items-center">
                <form action={approveReview} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <Input name="initials" placeholder="Initials" required className="w-28" />
                  <Button type="submit">Approve &amp; publish</Button>
                </form>
                <form action={rejectReview} className="flex gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <Input name="initials" placeholder="Initials" required className="w-28" />
                  <Button type="submit" variant="outline">
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nothing pending review.
          </p>
        )}
      </div>
    </div>
  );
}
