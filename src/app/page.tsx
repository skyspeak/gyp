import Link from "next/link";
import { listUpcomingDeadlines } from "@/lib/programs";
import { formatDateShort, daysUntil } from "@/lib/format";

export default async function Home() {
  const deadlines = (await listUpcomingDeadlines()).slice(0, 5);

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          Every deadline for the year that pays you.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-xl mx-auto">
          A free directory of gap year and post-grad programs with a stipend, living
          allowance, education award, or wage — for students with a deferred college seat and
          for grads figuring out what&apos;s next. We never list a program you pay to join, and
          we never take a commission on a placement.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/start"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-neutral-700"
          >
            Find my fit
          </Link>
          <Link
            href="/programs"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium hover:border-neutral-500"
          >
            Browse all programs
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-xl border border-neutral-200 p-4 sm:p-6">
          <h2 className="font-semibold">Next deadlines</h2>
          <ul className="mt-4 divide-y divide-neutral-200">
            {deadlines.map((d) => {
              const days = daysUntil(d.due_at);
              return (
                <li key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 text-sm">
                  <Link href={`/programs/${d.program_slug}`} className="hover:underline">
                    {d.program_name}
                  </Link>
                  <span className="text-neutral-500 shrink-0">
                    {formatDateShort(d.due_at)}
                    {days != null && days >= 0 && ` · ${days}d`}
                  </span>
                </li>
              );
            })}
            {deadlines.length === 0 && (
              <li className="py-3 text-sm text-neutral-500">No fixed deadlines on file yet.</li>
            )}
          </ul>
          <Link href="/deadlines" className="mt-4 inline-block text-sm underline text-neutral-600">
            See all upcoming deadlines →
          </Link>
        </div>
      </section>
    </div>
  );
}
