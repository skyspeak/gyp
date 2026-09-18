import Link from "next/link";
import { ArrowUpRight, Globe, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { STATUS_UI, type FundingStatus } from "@/lib/status";
import {
  REFERRERS,
  PROGRAM_HOMES,
  checkHome,
  stateFor,
  type HomeCheck,
  type ReferrerState,
} from "@/lib/dead-links";
import { TONE_BADGE } from "@/lib/money-ui";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Private. Gated by the admin login in src/proxy.ts, kept out of the sitemap
// and nav, disallowed in robots.txt, and marked noindex in case a link to it
// ever escapes.
export const metadata = {
  title: "Dead links — Gap Year Platform",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type DeadProgram = {
  id: string;
  slug: string;
  name: string;
  operator: string;
  funding_status: FundingStatus;
  funding_note: string | null;
  caveat_note: string | null;
  plans: number;
  watchers: number;
};

const STATE_UI: Record<ReferrerState, { label: string; className: string }> = {
  live: { label: "Still sending people", className: TONE_BADGE.danger },
  buried: { label: "Notice buried", className: TONE_BADGE.warn },
  fixed: { label: "Marked closed", className: "border-border text-muted-foreground" },
};

const HOME_TONE: Record<HomeCheck["kind"], string> = {
  gone: "text-destructive",
  broken: "text-destructive",
  moved: "text-warn-foreground",
  up: "text-muted-foreground",
};

// The opening of whichever note says why it closed. These notes run to a
// paragraph; the page needs the verdict. Several open with a one-word shout
// ("CLOSED."), so keep taking sentences until there is something to read, and
// do not split after "U.S." — "pending updates from the U." is not a verdict.
function verdict(p: DeadProgram): string | null {
  const text = p.funding_note || p.caveat_note;
  if (!text) return null;
  const sentences = text.split(/(?<!\b[A-Z]\.[A-Z]\.)(?<=[.!?])\s+(?=[A-Z0-9])/);
  let out = "";
  for (const s of sentences) {
    out = out ? `${out} ${s}` : s;
    if (out.length >= 60) break;
  }
  return out.trim();
}

const host = (url: string) => new URL(url).host.replace(/^www\./, "");

export default async function DeadLinksPage() {
  const res = await db().execute(
    `SELECT p.id, p.slug, p.name, p.operator, p.funding_status, p.funding_note, p.caveat_note,
            (SELECT COUNT(*) FROM plan_items i WHERE i.program_id = p.id) AS plans,
            (SELECT COUNT(*) FROM program_alerts a WHERE a.program_id = p.id) AS watchers
     FROM programs p
     WHERE p.funding_status IN ('defunded', 'paused')
     ORDER BY CASE p.funding_status WHEN 'defunded' THEN 0 ELSE 1 END, p.name`
  );
  const programs = res.rows as unknown as DeadProgram[];
  const bySlug = new Map(programs.map((p) => [p.slug, p]));

  // One request per distinct address, in parallel. Two catalog rows share
  // thinkingbeyondborders.org and should not be checked twice.
  const urls = [
    ...new Set(programs.map((p) => PROGRAM_HOMES[p.slug]?.url).filter((u): u is string => !!u)),
  ];
  const checks = new Map(
    await Promise.all(urls.map(async (u) => [u, await checkHome(u)] as const))
  );

  // Only referrers that point at something currently closed. If a program
  // reopens, its referrers drop off this page without anyone editing the list.
  const referrers = REFERRERS.map((r) => ({
    ...r,
    targets: r.programs.filter((s) => bySlug.has(s)),
  }))
    .filter((r) => r.targets.length > 0)
    .map((r) => {
      // Worst state across the programs it names: Temple is right about Payne
      // and wrong about Pickering, so overall it is still sending people.
      const states = r.targets.map((s) => stateFor(r, s));
      const overall: ReferrerState = states.includes("live")
        ? "live"
        : states.includes("buried")
          ? "buried"
          : "fixed";
      return { ...r, overall };
    })
    .sort((a, b) => {
      const order = { live: 0, buried: 1, fixed: 2 };
      return order[a.overall] - order[b.overall] || a.site.localeCompare(b.site);
    });

  const sending = referrers.filter((r) => r.overall !== "fixed");
  const shutDown = programs.filter((p) => p.funding_status === "defunded").length;
  const paused = programs.length - shutDown;
  const deadHomes = urls.filter((u) => checks.get(u)?.kind !== "up").length;
  const internal = programs.reduce((n, p) => n + Number(p.plans) + Number(p.watchers), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <Lock className="size-3" /> Private · not indexed
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Dead links
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
        Programs that have shut down or stopped taking applicants, the pages that still send people
        to them, and where those people end up. Referrers were opened by hand on the date shown; the
        programs&apos; own addresses are checked live on every load.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label="Shut down" value={shutDown} tone="danger" />
        <Stat label="Paused" value={paused} tone="warn" />
        <Stat label="Pages still sending people" value={sending.length} tone="danger" />
        <Stat label="Own sites dead or moved" value={`${deadHomes} of ${urls.length}`} tone="warn" />
      </dl>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Where the traffic comes from</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {sending.length} pages still present a closed program as open, or bury the notice.{" "}
          {referrers.length - sending.length} have fixed it and are listed so nobody checks them
          again.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border bg-card shadow-xs">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Page</th>
                <th className="px-4 py-2.5 font-medium">Sends people to</th>
                <th className="px-4 py-2.5 font-medium">What it says</th>
                <th className="px-4 py-2.5 font-medium">State</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {referrers.map((r) => (
                <tr
                  key={r.url}
                  className={cn("align-top", r.overall === "fixed" && "text-muted-foreground")}
                >
                  <td className="px-4 py-3">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-start gap-1 font-medium text-foreground hover:underline"
                    >
                      {r.site}
                      <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    </a>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.kind} · {host(r.url)}
                    </p>
                    {r.contact && <p className="mt-0.5 text-xs text-muted-foreground">{r.contact}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-0.5">
                      {r.targets.map((s) => (
                        <li key={s}>
                          <a href={`#${s}`} className="hover:underline">
                            {bySlug.get(s)!.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {r.sendsTo && (
                      <p className="mt-1 text-xs text-muted-foreground">→ {r.sendsTo}</p>
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    {r.says}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("whitespace-nowrap", STATE_UI[r.overall].className)}>
                      {STATE_UI[r.overall].label}
                    </Badge>
                    <p className="mt-1 whitespace-nowrap text-[11px] text-muted-foreground tabular-nums">
                      Checked {r.checkedOn}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Program by program</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {internal === 0
            ? "Nothing inside this site points at them: no saved plans or alerts include any of these."
            : `${internal} saved plans or alerts on this site still include one of these.`}
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {programs.map((p) => {
            const status = STATUS_UI[p.funding_status];
            const home = PROGRAM_HOMES[p.slug];
            const check = home ? checks.get(home.url) : undefined;
            const refs = referrers.filter((r) => r.targets.includes(p.slug));
            const live = refs.filter((r) => stateFor(r, p.slug) !== "fixed");

            return (
              <article
                key={p.id}
                id={p.slug}
                className="scroll-mt-6 rounded-xl border bg-card p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug">{p.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.operator}</p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", TONE_BADGE[status.tone])}>
                    {status.label}
                  </Badge>
                </div>

                {verdict(p) && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {verdict(p)}
                  </p>
                )}

                <div className="mt-3 rounded-lg border bg-muted/30 p-2.5 text-xs">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Globe className="size-3.5 text-muted-foreground" />
                    Their own site
                  </p>
                  {home ? (
                    <>
                      <p className="mt-1">
                        <a
                          href={home.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-mono text-[11px] hover:underline"
                        >
                          {host(home.url)}
                        </a>
                        {check && (
                          <span className={cn("ml-2 font-medium", HOME_TONE[check.kind])}>
                            {check.label}
                          </span>
                        )}
                      </p>
                      {home.found && <p className="mt-0.5 text-muted-foreground">{home.found}</p>}
                    </>
                  ) : (
                    <p className="mt-1 text-muted-foreground">No address on file yet.</p>
                  )}
                </div>

                <p className="mt-3 text-xs font-medium">
                  {live.length === 0
                    ? refs.length === 0
                      ? "No referrers researched yet"
                      : "Every referrer found has fixed it"
                    : `${live.length} page${live.length === 1 ? "" : "s"} still sending people here`}
                </p>
                {live.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs">
                    {live.map((r) => (
                      <li key={r.url} className="flex items-baseline gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 translate-y-[-1px] rounded-full",
                            stateFor(r, p.slug) === "live" ? "bg-destructive" : "bg-warn"
                          )}
                        />
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="truncate hover:underline"
                        >
                          {r.site}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {Number(p.plans)} plan{Number(p.plans) === 1 ? "" : "s"} · {Number(p.watchers)}{" "}
                    watcher{Number(p.watchers) === 1 ? "" : "s"}
                  </span>
                  <Link href={`/programs/${p.slug}`} className="hover:text-foreground hover:underline">
                    Catalog entry
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "danger" | "warn";
}) {
  return (
    <div className="rounded-xl border bg-card p-3.5 shadow-xs">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "danger" ? "text-destructive" : "text-warn-foreground"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
