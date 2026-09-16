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
        <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:py-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Free · no account · takes a minute
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            What should this year do for them?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground text-pretty">
            Answer three questions and we&apos;ll lay out a year using each program&apos;s real
            length — then you can argue with it. You get a link to send.
          </p>
          <Link
            href="/deferral-letter"
            className="mt-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-xs transition-colors hover:bg-muted"
          >
            <FileText className="size-3.5 text-muted-foreground" />
            Already admitted? Use the deferral letter template
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <DesignForm />
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
