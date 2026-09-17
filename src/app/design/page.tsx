import Link from "next/link";
import { FileText } from "lucide-react";
import DesignForm from "./design-form";
import { GallerySection } from "@/components/gallery/gallery-section";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Design a gap year — Gap Year Platform",
  description:
    "Build a gap year from real programs, see what it pays or costs, and share it as a link. Or start from one of five worked examples. No account needed.",
};

export default function DesignPage() {
  return (
    <div>
      {/* The question, alone on a tinted band. Three answers below it turn
          into a year laid out from real programs, so the header should read
          like the start of a conversation rather than the top of a form. */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        {/* Kept short on purpose: the three questions are the page, and a
            header that fills the screen buries them. */}
        <div className="mx-auto max-w-2xl px-4 py-8 text-center sm:py-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Free · no account · takes a minute
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
            What should this year do for them?
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground text-pretty">
            Answer three questions and we&apos;ll lay out a year using each program&apos;s real
            length — then you can argue with it. You get a link to send.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
        <DesignForm />

        <Link
          href="/deferral-letter"
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          <FileText className="size-3.5" />
          Already admitted? Use the deferral letter template
        </Link>
      </div>

      {/* A blank builder is intimidating. The worked examples were a separate
          page nobody had a reason to visit first; here they are the fallback
          for anyone who would rather edit something than start one. */}
      <div className="border-t bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <GallerySection />
        </div>
      </div>
    </div>
  );
}
