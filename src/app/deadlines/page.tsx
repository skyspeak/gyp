import Link from "next/link";
import { listUpcomingDeadlines } from "@/lib/programs";
import { formatDeadline, daysUntil } from "@/lib/format";

export const metadata = { title: "Deadlines — Stipend Clock" };

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const degreeParam = Array.isArray(sp.degree) ? sp.degree[0] : sp.degree;
  const degreeRequired = degreeParam === "0" ? 0 : degreeParam === "1" ? 1 : undefined;

  const deadlines = await listUpcomingDeadlines({ degreeRequired });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Upcoming deadlines</h1>
      <p className="mt-2 text-neutral-600">Sorted soonest first, across the whole catalog.</p>

      <div className="mt-6 flex gap-2 text-sm">
        <Link
          href="/deadlines"
          className={`px-3 py-1.5 rounded-full border ${!degreeParam ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
        >
          All
        </Link>
        <Link
          href="/deadlines?degree=1"
          className={`px-3 py-1.5 rounded-full border ${degreeParam === "1" ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
        >
          Have a degree / enrolled
        </Link>
        <Link
          href="/deadlines?degree=0"
          className={`px-3 py-1.5 rounded-full border ${degreeParam === "0" ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
        >
          No degree required
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-neutral-200 border-t border-b border-neutral-200">
        {deadlines.map((d) => {
          const days = daysUntil(d.due_at);
          return (
            <li key={d.id} className="py-4 flex items-start justify-between gap-4 text-sm">
              <div>
                <Link href={`/programs/${d.program_slug}`} className="font-medium hover:underline">
                  {d.program_name}
                </Link>
                <p className="text-neutral-500 mt-0.5">
                  {d.cycle_label} · {d.kind.replace("_", " ")}
                  {d.note ? ` — ${d.note}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-medium">{formatDeadline(d.due_at, d.source_tz)}</div>
                {days != null && <div className="text-neutral-500">{days} days away</div>}
              </div>
            </li>
          );
        })}
        {deadlines.length === 0 && (
          <li className="py-4 text-sm text-neutral-500">No fixed deadlines on file yet.</li>
        )}
      </ul>
    </div>
  );
}
