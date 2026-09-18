import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { listUpcomingDeadlines, listPrograms, CATEGORY_LABELS } from "@/lib/programs";
import { daysUntil, formatPayShort } from "@/lib/format";
import { MONEY_UI, TONE_BADGE } from "@/lib/money-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approxAnnualUsd } from "@/lib/pay-sort";
import { cn } from "@/lib/utils";

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

  // One real date in the hero. A promise about deadlines is worth more when
  // the page can immediately name the one closing next.
  const soonest = next.find((d) => {
    const days = daysUntil(d.due_at);
    return days != null && days >= 0;
  });
  const soonestDays = soonest ? daysUntil(soonest.due_at) : null;

  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pt-12 pb-8 sm:pt-16 sm:pb-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
          A year off to make sense of the world.
        </h1>
        {/* The promise, not the inventory. Anyone can list programs; what
            this does is watch the dates and say something before one passes,
            which is why it belongs above the fold rather than in the fine
            print of a signup box halfway down. */}
        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-muted-foreground text-pretty">
          Most gap year deadlines pass without a word, and you find out afterwards. We track them for{" "}
          {earning.length} paths that pay you and {paying.length} that charge, and email you before
          one closes, or if the program shuts down for good.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button size="lg" nativeButton={false} render={<Link href="/design" />}>
            Design a gap year <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/start" />}>
            Find my fit
          </Button>
        </div>

        {soonest && (
          <p className="mt-6 text-sm text-muted-foreground">
            Closing next:{" "}
            <Link
              href={`/programs/${soonest.program_slug}`}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {soonest.program_name}
            </Link>
            {soonestDays != null && soonestDays >= 0 && (
              <>
                {" "}
                in {soonestDays} day{soonestDays === 1 ? "" : "s"}
              </>
            )}
            .
          </p>
        )}

        <div className="mx-auto mt-4 max-w-md">
          <LeadForm source="home" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">

        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Closing soon</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The next {next.length} dates we&apos;re watching.
            </p>
          </div>
          <Link
            href="/programs?sort=deadline"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            All deadlines <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* A date tile rather than a date column. The old row buried the
            number that matters at the end of a line of grey text, next to a
            four-line summary; here the day you have to act on is the first
            thing on the row, and the summary is trimmed to the one line that
            says what the thing is. */}
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {next.map((d) => {
            const days = daysUntil(d.due_at);
            const money = MONEY_UI[d.program_money_direction] ?? MONEY_UI.participant_earns;
            const due = new Date(d.due_at as string);
            const month = due.toLocaleDateString("en-US", { month: "short" });
            const day = due.toLocaleDateString("en-US", { day: "numeric" });
            const tone =
              days == null ? "muted" : days <= 14 ? "urgent" : days <= 30 ? "soon" : "muted";

            return (
              <li key={d.id}>
                <Link
                  href={`/programs/${d.program_slug}`}
                  className="group flex h-full gap-3.5 rounded-xl border bg-card p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <span
                    className={cn(
                      "flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border text-center leading-none",
                      tone === "urgent"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : tone === "soon"
                          ? "border-warn/30 bg-warn-muted text-warn-foreground"
                          : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wide">{month}</span>
                    <span className="mt-1 text-xl font-semibold tabular-nums">{day}</span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug group-hover:underline decoration-1 underline-offset-2">
                      {d.program_name}
                    </span>
                    {/* line-clamp sets display:-webkit-box, so it silently does
                        nothing next to `block` — which is why the old row ran
                        to four lines despite carrying a clamp. */}
                    {d.program_summary && (
                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {d.program_summary}
                      </span>
                    )}
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      {days != null && days >= 0 && (
                        <Badge
                          variant="outline"
                          className={
                            tone === "urgent"
                              ? TONE_BADGE.danger
                              : tone === "soon"
                                ? TONE_BADGE.warn
                                : "border-border text-muted-foreground"
                          }
                        >
                          {days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}
                        </Badge>
                      )}
                      <Badge variant="outline" className={TONE_BADGE[money.tone]}>
                        {money.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[d.program_category] ?? d.program_category}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          {next.length === 0 && (
            <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground sm:col-span-2">
              No dated deadlines on file yet.
            </li>
          )}
        </ul>

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
