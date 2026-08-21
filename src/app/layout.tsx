import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gap Year Platform — Paid gap year and post-grad paths",
  description:
    "A free directory and deadline tracker for gap year and post-grad paths that pay you — stipends, living allowances, education awards, and wages — with honest cost comparisons against the ones that charge you. No commissions, ever.",
};

const NAV = [
  { href: "/programs", label: "Programs" },
  { href: "/deadlines", label: "Deadlines" },
  { href: "/gallery", label: "Examples" },
  { href: "/design", label: "Design a year" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap"
              >
                <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground text-[11px] font-bold">
                  GY
                </span>
                <span className="text-sm sm:text-base">Gap Year Platform</span>
              </Link>
              {/* Tight on mobile so the full wordmark and all three links stay
                  on one line at 375px. */}
              <nav className="flex items-center gap-0 text-[11px] whitespace-nowrap sm:gap-1 sm:text-sm">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-1.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-2.5"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t mt-16">
            <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
              <p>No commissions. No referral fees. No paid placements — in either direction.</p>
              <p>&copy; {new Date().getFullYear()} Gap Year Platform</p>
            </div>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
