import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyBlock } from "@/components/copy-block";

export const metadata = {
  title: "Gap year deferral letter template — Gap Year Platform",
  description:
    "A free template for asking your college to defer your admission for a gap year, with what admissions offices usually want to see in the plan.",
};

// Someone searching for a deferral letter has already been admitted and has
// decided to take the year. The letter asks what the year is for, which is the
// question the rest of the site answers, and a plan that pays is an easier
// sell to a parent and an admissions office than one that costs $40,000.
const TEMPLATE = `Subject: Request to defer enrollment to [Fall 20XX] — [Your full name], [Applicant/Student ID]

Dear [Name of admissions officer, or "Office of Admissions"],

Thank you again for admitting me to [College] for [Fall 20XX]. I am writing to request a one-year deferral of my enrollment so I can take a gap year before starting in [Fall 20XX].

What I plan to do
From [month] to [month], I will [what you will do] with [program or organization]. [One or two sentences on what the work involves.] [If it pays: The position pays a stipend of about [amount], which I will put toward my education.]

Why this year matters
[Two or three sentences, specific to you: what you want to learn, test, or earn, and how it connects to what you plan to study.]

What I will not do
I understand the conditions of a deferral. I will not enroll as a degree-seeking student at another college or university during the year, and I will [confirm any other condition listed in your college's deferral policy].

I have [submitted my enrollment deposit / will submit it by [date]]. I am happy to send more detail about the program or a month-by-month plan if that would help.

Thank you for considering my request.

Sincerely,
[Full name]
[Applicant/Student ID]
[Email] · [Phone]`;

export default function DeferralLetterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-balance">
        Gap year deferral letter template
      </h1>
      <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-pretty">
        If you&apos;ve been admitted and want to take a year first, most colleges ask for a written
        request, and many want to approve the plan before granting it. Here&apos;s a letter you
        can adapt.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">Before you write it</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">Find your college&apos;s deferral policy.</span>{" "}
          Search the admissions site for &ldquo;defer&rdquo; or &ldquo;gap year&rdquo;. It will say the
          deadline, whether they want your enrollment deposit first, and what the plan must include.
        </li>
        <li>
          <span className="font-medium text-foreground">Have a real plan, with names and dates.</span>{" "}
          &ldquo;Travel and work&rdquo; is easy to decline. &ldquo;A 10-month conservation corps crew
          from September to June&rdquo; is not.
        </li>
        <li>
          <span className="font-medium text-foreground">Follow their conditions exactly.</span>{" "}
          Deferral policies often rule out enrolling at another college for credit during the year.
          If yours says so, say you understand it.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">The letter</h2>
      <p className="mt-1 mb-3 text-sm text-muted-foreground">
        Replace everything in [brackets]. Delete the stipend line if your year doesn&apos;t pay.
      </p>
      <CopyBlock text={TEMPLATE} label="Copy letter" />

      <div className="mt-10 rounded-2xl border bg-muted/30 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Still deciding what the year is?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hundreds of gap years pay a stipend or wage instead of charging you, and a specific plan is
          the strongest thing a deferral request can have.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/programs"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Browse gap years that pay <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/design"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Plan the year month by month
          </Link>
        </div>
      </div>
    </div>
  );
}
