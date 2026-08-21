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
        Design a gap year
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Two questions to start. You&apos;ll get a link you can send to anyone — no account, no
        sign-up.
      </p>
      <DesignForm />
    </div>
  );
}
