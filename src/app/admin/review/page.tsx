import { db } from "@/lib/db";
import type { FieldDiff } from "@/lib/review-queue";
import { formatCents } from "@/lib/format";
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
  const client = db();
  const res = await client.execute(
    `SELECT rq.id, rq.program_id, rq.field_diffs, rq.suspicion, rq.created_at, p.name as program_name, p.slug as program_slug
     FROM review_queue rq JOIN programs p ON p.id = rq.program_id
     WHERE rq.status = 'pending'
     ORDER BY rq.created_at ASC`
  );
  const rows = res.rows as unknown as ReviewRow[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Review queue</h1>
      <p className="mt-2 text-neutral-600">
        Changes staged by the nightly verification cron. Nothing here is live until a human
        confirms it — deadlines and pay never auto-publish.
      </p>

      <div className="mt-8 space-y-8">
        {rows.map((row) => {
          const diffs = JSON.parse(row.field_diffs) as FieldDiff[];
          return (
            <div key={row.id} className="rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{row.program_name}</h2>
                <span className="text-xs text-neutral-400">{new Date(row.created_at).toLocaleString()}</span>
              </div>

              {row.suspicion && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-300 p-3 text-sm text-amber-900">
                  <strong>Suspension language detected</strong> (funding_status already auto-set to at_risk): &ldquo;
                  {row.suspicion}&rdquo;
                </div>
              )}

              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-400 text-xs uppercase">
                    <th className="py-1 font-medium">Field</th>
                    <th className="py-1 font-medium">Current</th>
                    <th className="py-1 font-medium">Proposed</th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.map((d, i) => (
                    <tr key={i} className="border-t border-neutral-100">
                      {d.type === "program_field" ? (
                        <>
                          <td className="py-2 pr-2">{d.label}</td>
                          <td className="py-2 pr-2 text-neutral-500">{formatDiffValue(d.field, d.old_value)}</td>
                          <td className="py-2 font-medium">{formatDiffValue(d.field, d.new_value)}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 pr-2">
                            Deadline: {d.cycle_label} ({d.kind})
                          </td>
                          <td className="py-2 pr-2 text-neutral-500">{d.old_due_at ?? "none on file"}</td>
                          <td className="py-2 font-medium">{d.new_due_at}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex items-center gap-3">
                <form action={approveReview} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    name="initials"
                    placeholder="Your initials"
                    required
                    className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm w-32"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-neutral-900 text-white px-4 py-1.5 text-sm font-medium hover:bg-neutral-700"
                  >
                    Approve &amp; publish
                  </button>
                </form>
                <form action={rejectReview} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    name="initials"
                    placeholder="Your initials"
                    required
                    className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm w-32"
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-neutral-300 px-4 py-1.5 text-sm font-medium hover:border-neutral-500"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-neutral-500">Nothing pending review.</p>}
      </div>
    </div>
  );
}
