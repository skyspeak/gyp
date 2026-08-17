import Link from "next/link";
import {
  listPrograms,
  getSoonestDeadlines,
  CATEGORY_LABELS,
  FUNDING_LABELS,
  type ProgramFilters,
} from "@/lib/programs";
import { formatPayShort, formatDateShort } from "@/lib/format";

export const metadata = {
  title: "Programs — Stipend Clock",
};

function toBool(v: string | string[] | undefined) {
  return v === "1" || v === "true";
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const degreeParam = Array.isArray(sp.degree) ? sp.degree[0] : sp.degree;
  const categoryParam = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const sortParam = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const ageParam = Array.isArray(sp.age) ? sp.age[0] : sp.age;
  const activeOnly = toBool(Array.isArray(sp.active) ? sp.active[0] : sp.active);

  const filters: ProgramFilters = {
    degreeRequired: degreeParam === "0" ? 0 : degreeParam === "1" ? 1 : undefined,
    category: categoryParam || undefined,
    minAge: ageParam ? Number(ageParam) : undefined,
    fundingActiveOnly: activeOnly,
  };

  const programs = await listPrograms(filters);
  const deadlineMap = await getSoonestDeadlines(programs.map((p) => p.id));

  const sorted = [...programs].sort((a, b) => {
    if (sortParam === "pay") {
      return (b.pay_high ?? b.pay_low ?? 0) - (a.pay_high ?? a.pay_low ?? 0);
    }
    const da = deadlineMap.get(a.id)?.due_at;
    const db_ = deadlineMap.get(b.id)?.due_at;
    if (da && db_) return da.localeCompare(db_);
    if (da) return -1;
    if (db_) return 1;
    return a.name.localeCompare(b.name);
  });

  function qs(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { degree: degreeParam, category: categoryParam, sort: sortParam, age: ageParam, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `/programs?${s}` : "/programs";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Programs</h1>
      <p className="mt-2 text-neutral-600 max-w-2xl">
        Every program here pays the participant. Filter by whether you have a degree — the two
        lists don&apos;t overlap.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link
          href={qs({ degree: undefined })}
          className={`px-3 py-1.5 rounded-full border ${!degreeParam ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
        >
          All
        </Link>
        <Link
          href={qs({ degree: "1" })}
          className={`px-3 py-1.5 rounded-full border ${degreeParam === "1" ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
        >
          Have a degree / enrolled
        </Link>
        <Link
          href={qs({ degree: "0" })}
          className={`px-3 py-1.5 rounded-full border ${degreeParam === "0" ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
        >
          No degree required
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <Link
          href={qs({ category: undefined })}
          className={`px-3 py-1 rounded-full border text-xs ${!categoryParam ? "bg-neutral-100 border-neutral-400" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}
        >
          All categories
        </Link>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={qs({ category: key })}
            className={`px-3 py-1 rounded-full border text-xs ${categoryParam === key ? "bg-neutral-100 border-neutral-400" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
        <span>Sort:</span>
        <Link href={qs({ sort: undefined })} className={!sortParam || sortParam === "deadline" ? "underline font-medium text-neutral-900" : "hover:underline"}>
          Soonest deadline
        </Link>
        <Link href={qs({ sort: "pay" })} className={sortParam === "pay" ? "underline font-medium text-neutral-900" : "hover:underline"}>
          Highest pay
        </Link>
        <span className="ml-auto">{sorted.length} programs</span>
      </div>

      <ul className="mt-6 divide-y divide-neutral-200 border-t border-b border-neutral-200">
        {sorted.map((p) => {
          const deadline = deadlineMap.get(p.id);
          const funding = FUNDING_LABELS[p.funding_status] ?? FUNDING_LABELS.active;
          return (
            <li key={p.id} className="py-5">
              <Link href={`/programs/${p.slug}`} className="group flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-lg group-hover:underline">{p.name}</span>
                    {funding.tone !== "ok" && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          funding.tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {funding.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {p.operator} · {CATEGORY_LABELS[p.category] ?? p.category} ·{" "}
                    {p.degree_required ? "Degree required" : "No degree required"}
                  </p>
                </div>
                <div className="text-sm text-right shrink-0 w-40">
                  <div className="font-medium">{formatPayShort(p)}</div>
                  <div className="text-neutral-500">
                    {deadline ? `Due ${formatDateShort(deadline.due_at)}` : "Rolling"}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
