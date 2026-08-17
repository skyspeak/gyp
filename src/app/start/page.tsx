import Link from "next/link";
import { listPrograms, getSoonestDeadlines, CATEGORY_LABELS, type Program } from "@/lib/programs";
import { formatPayShort, formatDateShort } from "@/lib/format";

export const metadata = { title: "Find my fit — Stipend Clock" };

type Answers = {
  age?: string;
  degree?: string; // "yes" | "no"
  citizenship?: string; // us_citizen | us_citizen_or_lpr | non_us
  start?: string; // free text season/year, informational
};

function filterByAnswers(programs: Program[], answers: Answers): Program[] {
  let list = programs;

  if (answers.degree === "no") {
    // Removed entirely, not grayed out, per spec.
    list = list.filter((p) => p.degree_required === 0);
  }

  const age = answers.age ? Number(answers.age) : undefined;
  if (age != null && Number.isFinite(age)) {
    list = list.filter((p) => (p.min_age == null || age >= p.min_age) && (p.max_age == null || age <= p.max_age));
  }

  if (answers.citizenship === "non_us") {
    list = list.filter((p) => p.citizenship === "any" || p.citizenship == null);
  } else if (answers.citizenship === "us_citizen_or_lpr") {
    list = list.filter((p) => p.citizenship !== "us_citizen");
  }
  // us_citizen qualifies for everything, no filter needed.

  return list;
}

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
    start: get("start"),
  };
  const hasAnswered = Boolean(answers.age || answers.degree || answers.citizenship || answers.start);

  let results: Program[] = [];
  let deadlineMap: Awaited<ReturnType<typeof getSoonestDeadlines>> = new Map();
  if (hasAnswered) {
    const all = await listPrograms();
    results = filterByAnswers(all, answers);
    deadlineMap = await getSoonestDeadlines(results.map((p) => p.id));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Find my fit</h1>
      <p className="mt-2 text-neutral-600">
        Four questions, no account needed. This just filters the public directory — nothing is saved.
      </p>

      <form method="get" action="/start" className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium" htmlFor="age">
            Your age when the program would start
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={16}
            max={40}
            defaultValue={answers.age}
            required
            className="mt-1.5 w-32 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">
            Do you have (or will you have, before the program starts) a bachelor&apos;s degree?
          </legend>
          <div className="mt-1.5 flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="degree" value="yes" defaultChecked={answers.degree === "yes"} required />
              Yes / currently enrolled
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="degree" value="no" defaultChecked={answers.degree === "no"} />
              No — high school grad, deferred college seat, or similar
            </label>
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium" htmlFor="citizenship">
            Citizenship
          </label>
          <select
            id="citizenship"
            name="citizenship"
            defaultValue={answers.citizenship ?? "us_citizen"}
            className="mt-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="us_citizen">U.S. citizen</option>
            <option value="us_citizen_or_lpr">U.S. lawful permanent resident (not a citizen)</option>
            <option value="non_us">Neither</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="start">
            Earliest you could start
          </label>
          <select
            id="start"
            name="start"
            defaultValue={answers.start ?? ""}
            className="mt-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">No preference</option>
            <option value="fall_2027">Fall 2027</option>
            <option value="spring_2028">Spring 2028</option>
            <option value="summer_2027">Summer 2027</option>
            <option value="flexible">Flexible / rolling</option>
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-neutral-700"
        >
          Show my shortlist
        </button>
      </form>

      {hasAnswered && (
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <h2 className="text-lg font-semibold">
            {results.length} program{results.length === 1 ? "" : "s"} match
          </h2>
          <ul className="mt-4 divide-y divide-neutral-200 border-t border-b border-neutral-200">
            {results.map((p) => {
              const deadline = deadlineMap.get(p.id);
              return (
                <li key={p.id} className="py-4">
                  <Link href={`/programs/${p.slug}`} className="group flex items-baseline justify-between gap-4">
                    <div>
                      <div className="font-medium group-hover:underline">{p.name}</div>
                      <div className="text-sm text-neutral-500">
                        {p.operator} · {CATEGORY_LABELS[p.category] ?? p.category}
                      </div>
                    </div>
                    <div className="text-sm text-right shrink-0">
                      <div>{formatPayShort(p)}</div>
                      <div className="text-neutral-500">
                        {deadline ? `Due ${formatDateShort(deadline.due_at)}` : "Rolling"}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="py-4 text-sm text-neutral-500">
                Nothing matches yet — try widening your answers, or{" "}
                <Link href="/programs" className="underline">
                  browse the full directory
                </Link>
                .
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
