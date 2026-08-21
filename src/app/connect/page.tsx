import Link from "next/link";
import {
  ExternalLink,
  MessageCircleQuestion,
  ShieldCheck,
  BookOpen,
  Info,
  HelpCircle,
  Plane,
  Landmark,
} from "lucide-react";
import {
  PEOPLE,
  QUESTION_BANK,
  DUE_DILIGENCE,
  CHECK_FUNDING,
  BEFORE_YOU_GO,
  PRIMARY_SOURCES,
  type Reference,
} from "@/lib/connect";
import { QuestionList } from "./question-list";
import { TONE_ALERT } from "@/lib/money-ui";
import { ShareMenu } from "@/components/share-menu";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Who to talk to — Gap Year Platform",
  description:
    "The people already paid to help you, the communities that tell you the truth, and how to check an operator's finances before paying one.",
};

function isExternal(href: string) {
  return href.startsWith("http");
}

function RefCard({ r }: { r: Reference }) {
  return (
    <div className="rounded-xl border p-4">
      <a
        href={r.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium hover:underline"
      >
        {r.name} <ExternalLink className="size-3.5 text-muted-foreground" />
      </a>
      <p className="mt-1 text-sm text-muted-foreground">{r.what}</p>
      <p className="mt-2 text-sm">{r.use}</p>
      {r.caveat && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-warn-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {r.caveat}
        </p>
      )}
    </div>
  );
}

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-balance">
            Who to actually talk to
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-pretty">
            Most of the people who can help you are already paid to, and cost nothing. Here is
            where to find them, what to ask, and how to check an operator before you pay one.
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <ShareMenu title="Who to talk to about a gap year" summary="Free advisers, communities, and how to check an operator's finances." />
        </div>
      </div>

      {/* Said plainly and up front, because every other site in this category
          is quietly monetising the introduction. */}
      <div className={cn("mt-6 rounded-xl border p-4 text-sm", TONE_ALERT.neutral)}>
        <p className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="size-4" /> We don&apos;t broker introductions
        </p>
        <p className="mt-1 text-muted-foreground">
          Nobody on this page pays to be here and nobody is paid to speak to you. We have no
          network to sell you — these are the same directories an insider would use, handed over
          directly.
        </p>
      </div>

      {PEOPLE.map((group) => (
        <section key={group.section} className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <MessageCircleQuestion className="size-4 text-muted-foreground" />
            {group.section}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>

          <div className="mt-4 space-y-3">
            {group.items.map((c) => (
              <div key={c.role} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{c.role}</h3>
                  {c.free && (
                    <span className="rounded-full bg-earn-muted px-2 py-0.5 text-[11px] font-medium text-earn-foreground">
                      Free
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.who}</p>
                <p className="mt-2 text-sm">{c.why}</p>

                {/* A link with no question attached gets ignored. */}
                <p className="mt-3 rounded-lg border-l-2 border-foreground/20 bg-muted/40 px-3 py-2 text-sm italic">
                  “{c.ask}”
                </p>

                <div className="mt-3">
                  {isExternal(c.href) ? (
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      {c.hrefLabel} <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={c.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      {c.hrefLabel} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <HelpCircle className="size-4 text-muted-foreground" />
          Questions worth asking
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Not general advice. Each of these exists because something in this catalog turned out
          to be true and non-obvious. Tap to copy any of them into an email.
        </p>
        <div className="mt-5 space-y-8">
          {QUESTION_BANK.map((g) => (
            <div key={g.situation}>
              <h3 className="text-sm font-semibold">{g.situation}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{g.blurb}</p>
              <QuestionList questions={g.questions} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <ShieldCheck className="size-4 text-muted-foreground" />
          Check an operator before you pay them
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Two operators in this catalog were still being marketed after they had wound up. These
          are the free tools that catch that.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DUE_DILIGENCE.map((r) => (
            <RefCard key={r.name} r={r} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Landmark className="size-4 text-muted-foreground" />
          Check the funding is real
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          About a third of this catalog runs on federal money that was materially disrupted in
          2025. These say whether a specific organisation currently holds an award.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CHECK_FUNDING.map((r) => (
            <RefCard key={r.name} r={r} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Plane className="size-4 text-muted-foreground" />
          Before you commit to going
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {BEFORE_YOU_GO.map((r) => (
            <RefCard key={r.name} r={r} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <BookOpen className="size-4 text-muted-foreground" />
          Go to the source
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything in our directory is second-hand by definition. When a figure matters, these
          are the pages it should be checked against.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PRIMARY_SOURCES.map((r) => (
            <RefCard key={r.name} r={r} />
          ))}
        </div>
      </section>

      <p className="mt-12 text-sm text-muted-foreground">
        Found something out of date, or a person worth adding?{" "}
        <Link href="/programs" className="underline">
          Every program page links its own source
        </Link>{" "}
        — that is always the authority over us.
      </p>
    </div>
  );
}
