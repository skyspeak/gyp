import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { listPrograms, getSoonestDeadlines, CATEGORY_LABELS, type Program } from "@/lib/programs";
import { formatPayShort, formatCostShort, formatDateShort } from "@/lib/format";
import { approxAnnualUsd } from "@/lib/pay-sort";
import { MONEY_UI, TONE_BADGE, TONE_TEXT } from "@/lib/money-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Find my fit — Gap Year Platform" };

type Answers = { age?: string; degree?: string; citizenship?: string };

function filterByAnswers(programs: Program[], answers: Answers): Program[] {
  let list = programs;

  // Removed entirely, not greyed out: if you don't have a degree, a
  // degree-required program is not a "maybe".
  if (answers.degree === "no") list = list.filter((p) => p.degree_required === 0);

  const age = answers.age ? Number(answers.age) : undefined;
  if (age != null && Number.isFinite(age)) {
    list = list.filter(
      (p) => (p.min_age == null || age >= p.min_age) && (p.max_age == null || age <= p.max_age)
    );
  }

  if (answers.citizenship === "non_us") {
    list = list.filter((p) => p.citizenship === "any" || p.citizenship == null);
  } else if (answers.citizenship === "us_citizen_or_lpr") {
    list = list.filter((p) => p.citizenship !== "us_citizen");
  }

  return list;
}

const FIELD =
  "mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]);
  const answers: Answers = {
    age: get("age"),
    degree: get("degree"),
    citizenship: get("citizenship"),
  };
  const answered = Boolean(answers.age && answers.degree);

  let results: Program[] = [];
  let deadlineMap: Awaited<ReturnType<typeof getSoonestDeadlines>> = new Map();
  if (answered) {
    const all = await listPrograms({ moneyDirection: "all" });
    results = filterByAnswers(all, answers).sort(
      (a, b) => approxAnnualUsd(b) - approxAnnualUsd(a)
    );
    deadlineMap = await getSoonestDeadlines(results.map((p) => p.id));
  }

  const earning = results.filter((p) => p.money_direction === "participant_earns");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Find my fit</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Three questions. No account, nothing saved.
      </p>

      {/* GET form so the result is a shareable URL and needs no client state. */}
      <form method="get" action="/start" className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium" htmlFor="age">
            Your age at start
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={16}
            max={45}
            required
            defaultValue={answers.age}
            className={FIELD}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="degree">
            Bachelor&apos;s degree?
          </label>
          <select id="degree" name="degree" defaultValue={answers.degree ?? ""} required className={FIELD}>
            <option value="" disabled>
              Choose…
            </option>
            <option value="yes">Yes / enrolled</option>
            <option value="no">Not yet</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="citizenship">
            Citizenship
          </label>
          <select
            id="citizenship"
            name="citizenship"
            defaultValue={answers.citizenship ?? "us_citizen"}
            className={FIELD}
          >
            <option value="us_citizen">U.S. citizen</option>
            <option value="us_citizen_or_lpr">U.S. permanent resident</option>
            <option value="non_us">Neither</option>
          </select>
        </div>
        <Button type="submit" className="sm:col-span-3 sm:w-fit">
          Show my matches <ArrowRight className="size-4" />
        </Button>
      </form>

      {answered && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold">
              {results.length} match{results.length === 1 ? "" : "es"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {earning.length} pay you · sorted by pay
            </p>
          </div>

          <ul className="mt-3 divide-y rounded-xl border overflow-hidden">
            {results.map((p) => {
              const money = MONEY_UI[p.money_direction] ?? MONEY_UI.participant_earns;
              const cost = formatCostShort(p);
              const isPaying = p.money_direction === "participant_pays" && Boolean(cost);
              const deadline = deadlineMap.get(p.id);
              return (
                <li key={p.id}>
                  <Link
                    href={`/programs/${p.slug}`}
                    className="group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium leading-snug group-hover:underline decoration-1 underline-offset-2">
                        {p.name}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{CATEGORY_LABELS[p.category] ?? p.category}</span>
                        {money.tone !== "earn" && (
                          <Badge variant="outline" className={TONE_BADGE[money.tone]}>
                            {money.label}
                          </Badge>
                        )}
                        {deadline?.due_at && <span>· due {formatDateShort(deadline.due_at)}</span>}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        isPaying && TONE_TEXT.pay
                      )}
                    >
                      {isPaying ? cost : formatPayShort(p)}
                    </span>
                  </Link>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">
                Nothing matched. Try widening your answers, or{" "}
                <Link href="/programs" className="underline">
                  browse everything
                </Link>
                .
              </li>
            )}
          </ul>

          <Link
            href="/programs"
            className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Browse the full directory <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
