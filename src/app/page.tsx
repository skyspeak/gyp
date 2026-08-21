import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { listUpcomingDeadlines, listPrograms } from "@/lib/programs";
import { formatDateShort, daysUntil, formatPayShort } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TONE_BADGE } from "@/lib/money-ui";
import { approxAnnualUsd } from "@/lib/pay-sort";

// Reads live catalog data, so it must render per request rather than being
// prerendered at build time. Without this the build tries to query the
// database on Vercel, where no database exists yet at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [deadlines, earning, paying] = await Promise.all([
    listUpcomingDeadlines(),
    listPrograms({ moneyDirection: "participant_earns" }),
    listPrograms({ moneyDirection: "participant_pays" }),
  ]);

  // One row per program here. Several programs carry both a campus and a
  // national deadline, which matters on /deadlines but just looks like a
  // duplicate name on the homepage.
  const seen = new Set<string>();
  const next = deadlines
    .filter((d) => !seen.has(d.program_slug) && seen.add(d.program_slug))
    .slice(0, 6);

  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        <Badge variant="outline" className={TONE_BADGE.earn}>
          No commissions, ever
        </Badge>
        <h1 className="mt-4 text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
          The year off that pays you.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-muted-foreground text-pretty">
          {earning.length} paths with a stipend, wage, or education award — and {paying.length}{" "}
          that charge you, priced honestly so you can tell the difference.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button size="lg" nativeButton={false} render={<Link href="/design" />}>
            Design a gap year <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/start" />}>
            Find my fit
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5">
            <h2 className="text-sm font-semibold">Closing soon</h2>
            <Link
              href="/deadlines"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              All deadlines <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y">
            {next.map((d) => {
              const days = daysUntil(d.due_at);
              const urgent = days != null && days <= 30;
              return (
                <li key={d.id}>
                  <Link
                    href={`/programs/${d.program_slug}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="min-w-0 truncate">{d.program_name}</span>
                    <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
                      <span className="text-muted-foreground">{formatDateShort(d.due_at)}</span>
                      {days != null && days >= 0 && (
                        <span
                          className={
                            urgent ? "font-semibold text-destructive" : "text-muted-foreground"
                          }
                        >
                          {days}d
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
            {next.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                No dated deadlines on file yet.
              </li>
            )}
          </ul>
        </div>

        {/* One concrete comparison does more than a paragraph of positioning. */}
        <TopEarners />
      </section>
    </div>
  );
}

async function TopEarners() {
  const top = (await listPrograms({ moneyDirection: "participant_earns" }))
    .filter((p) => p.pay_low != null)
    .sort((a, b) => approxAnnualUsd(b) - approxAnnualUsd(a))
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border overflow-hidden">
      <div className="border-b bg-muted/40 px-4 py-2.5">
        <h2 className="text-sm font-semibold">Highest paying right now</h2>
      </div>
      <ul className="divide-y">
        {top.map((p) => (
          <li key={p.id}>
            <Link
              href={`/programs/${p.slug}`}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
            >
              <span className="min-w-0 truncate">{p.name}</span>
              <span className="shrink-0 font-semibold tabular-nums">{formatPayShort(p)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
