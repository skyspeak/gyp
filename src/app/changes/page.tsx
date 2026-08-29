import Link from "next/link";
import { Ban, PauseCircle, TriangleAlert, Globe, ArrowUpRight } from "lucide-react";
import { listPrograms, type Program } from "@/lib/programs";
import { ShareMenu } from "@/components/share-menu";
import { LeadForm } from "@/components/lead-form";
import { TONE_ALERT, TONE_BADGE } from "@/lib/money-ui";
import { dedupeByName } from "@/lib/dedupe";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "What changed this cycle — Gap Year Platform",
  description:
    "Gap year and post-grad programs that shut down, paused, or lost funding — and the ones Americans are not eligible for. Checked against primary sources, with dates.",
};

// This page is the one thing here nobody else publishes. Operators do not
// announce closures, and advising pages keep listing programs for years after
// they end — the Payne Fellowship was terminated in February 2025 and is still
// on university lists. Anyone routing students anywhere needs this more than
// they need another directory.
const GROUPS: {
  status: string;
  title: string;
  blurb: string;
  icon: typeof Ban;
  tone: keyof typeof TONE_ALERT;
}[] = [
  {
    status: "defunded",
    title: "Shut down",
    blurb: "Confirmed closed or dissolved. Several are still being marketed.",
    icon: Ban,
    tone: "danger",
  },
  {
    status: "paused",
    title: "Paused",
    blurb: "The organisation still exists but is not currently selecting.",
    icon: PauseCircle,
    tone: "warn",
  },
  {
    status: "at_risk",
    title: "Funding at risk",
    blurb: "Operating, but with a live threat to the money behind it.",
    icon: TriangleAlert,
    tone: "warn",
  },
];

function Row({ p }: { p: Program }) {
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Link href={`/programs/${p.slug}`} className="font-medium hover:underline">
          {p.name}
        </Link>
        <a
          href={p.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-muted-foreground hover:underline"
        >
          {(() => {
            try {
              return new URL(p.source_url).hostname.replace(/^www\./, "");
            } catch {
              return "source";
            }
          })()}
        </a>
      </div>
      {p.funding_note && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.funding_note}</p>
      )}
    </li>
  );
}

export default async function ChangesPage() {
  const all = await listPrograms({ moneyDirection: "all", includeUsIneligible: true });

  const byStatus = (s: string) =>
    dedupeByName(all.filter((p) => p.funding_status === s && p.us_eligible === 1));
  const ineligible = all.filter((p) => p.us_eligible === 0);
  const affected = GROUPS.reduce((n, g) => n + byStatus(g.status).length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-balance">
            What changed this cycle
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-pretty">
            {affected} of the {all.length} paths we track are not operating normally, and{" "}
            {ineligible.length} more are widely recommended to Americans who cannot actually use
            them. Operators rarely announce this, so advising pages keep listing them for years.
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <ShareMenu
            title="Gap year programs that shut down, paused, or lost funding"
            summary={`${affected} programs are not operating normally this cycle.`}
          />
        </div>
      </div>

      <div className={cn("mt-6 rounded-xl border p-4 text-sm", TONE_ALERT.neutral)}>
        <p className="font-semibold">If you advise students, start here</p>
        <p className="mt-1 text-muted-foreground">
          Every row links the source it was checked against. If your own list still carries any of
          these, that is worth fixing before the next cycle opens — and it is the reason this page
          exists rather than another directory.
        </p>
      </div>

      {GROUPS.map((g) => {
        const rows = byStatus(g.status);
        if (rows.length === 0) return null;
        const Icon = g.icon;
        return (
          <section key={g.status} className="mt-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Icon className="size-4 text-muted-foreground" />
              {g.title}
              <span className="text-sm font-normal text-muted-foreground">({rows.length})</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{g.blurb}</p>
            <ul className="mt-2 divide-y border-t">
              {rows.map((p) => (
                <Row key={p.id} p={p} />
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Globe className="size-4 text-muted-foreground" />
          Alive, but not open to Americans
          <span className="text-sm font-normal text-muted-foreground">({ineligible.length})</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These programs are running perfectly well. The United States simply has no agreement
          with the country in question, which blog posts routinely get wrong.
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {ineligible.map((p) => (
            <li key={p.id}>
              <Link
                href={`/programs/${p.slug}`}
                className={cn(
                  "inline-block rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted",
                  TONE_BADGE.neutral
                )}
              >
                {p.name.replace(/ — US Eligibility Status$/i, "")}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <LeadForm
        source="changes"
        className="mt-12"
        heading="Get told the next time this list changes"
        blurb="Programs close quietly and advising pages keep recommending them for years. We email you when one on this list changes status — nothing else."
        pitch="One email when a program on this list closes, pauses, or drops US eligibility."
      />

      <div className="mt-12 rounded-xl border p-5">
        <h2 className="font-semibold">How this stays current</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          A nightly job re-reads each program&apos;s own page and flags language suggesting a
          pause or closure. Nothing here is published automatically: a person confirms every
          change first, because a wrong closure is as damaging as a missed one.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link href="/connect" className="inline-flex items-center gap-1 font-medium hover:underline">
            Check an operator yourself <ArrowUpRight className="size-3.5" />
          </Link>
          <Link href="/programs" className="inline-flex items-center gap-1 font-medium hover:underline">
            Browse what is running <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
