import Link from "next/link";
import { cn } from "@/lib/utils";

// A link that looks like a toggle. Deliberately not shadcn's ToggleGroup:
// that carries client state, and the directory's filters live in the
// querystring so a filtered view stays shareable and server-rendered.
export function FilterPill({
  href,
  active,
  children,
  size = "default",
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  size?: "default" | "sm";
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border whitespace-nowrap transition-colors",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
