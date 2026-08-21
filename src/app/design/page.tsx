import DesignForm from "./design-form";

export const metadata = {
  title: "Design a gap year — Gap Year Platform",
  description:
    "Build a gap year from real programs, see what it pays or costs, and share it as a link. No account needed.",
};

export default function DesignPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
        What should this year do for them?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Answer that and we&apos;ll lay out a year using each program&apos;s real length — then you
        can argue with it. No account, and you get a link to send.
      </p>
      <DesignForm />
    </div>
  );
}
