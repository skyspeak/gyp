import Link from "next/link";
import { ChevronDown, FileText } from "lucide-react";
import DesignForm from "./design-form";
import { GallerySection } from "@/components/gallery/gallery-section";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Design a gap year — Gap Year Platform",
  description:
    "Start from one of five gap years built out of programs in the catalog, see what each pays or costs, and change everything. Or answer three questions and we'll draft one. No account needed.",
};

export default function DesignPage() {
  return (
    <div>
      {/* Kept short on purpose: the worked years below are the page. */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center sm:py-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Free · no account · nothing here is sponsored
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
            What should this year do for them?
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground text-pretty">
            Five answers, each built from programs in the catalog, at the length each one runs, with
            what the year pays or costs. Take the closest one and argue with it. You get a link to
            send.
          </p>
        </div>
      </section>

      {/* Picking a year that already exists and editing it beats describing
          one from nothing, so the examples lead and the questionnaire waits
          below for anyone none of them fit. */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <GallerySection />
      </div>

      <div className="border-t bg-muted/20">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block font-medium">None of these fit?</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Answer three questions and we&apos;ll draft a year from scratch.
                </span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-6">
              <DesignForm />
            </div>
          </details>

          <Link
            href="/deferral-letter"
            className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            <FileText className="size-3.5" />
            Already admitted? Use the deferral letter template
          </Link>
        </div>
      </div>
    </div>
  );
}
