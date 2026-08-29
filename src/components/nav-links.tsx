"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// The header had no current-page state at all, so six links looked identical
// no matter where you were. The marker is a filled pill rather than an
// underline: at 11px on a phone an underline is nearly invisible.
export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-lg px-1.5 py-1.5 transition-colors sm:px-2.5",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
