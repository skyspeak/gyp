import Link from "next/link";
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
    <div className="px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          What should this year do for them?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Answer that and we&apos;ll lay out a year using each program&apos;s real length — then you
          can argue with it. No account, and you get a link to send.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Already admitted to college?{" "}
          <Link href="/deferral-letter" className="font-medium text-foreground underline">
            Use the deferral letter template
          </Link>
          .
        </p>
        <DesignForm />
      </div>

      {/* A blank builder is intimidating. The worked examples were a separate
          page nobody had a reason to visit first; here they are the fallback
          for anyone who would rather edit something than start one. */}
      <div className="mx-auto mt-16 max-w-5xl border-t pt-12">
        <GallerySection />
      </div>
    </div>
  );
}
