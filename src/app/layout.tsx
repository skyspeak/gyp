import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle, THEME_INIT_SCRIPT } from "@/components/theme-toggle";
import { NavLinks } from "@/components/nav-links";
import { SiteChrome } from "@/components/site-chrome";
import { baseUrl } from "@/lib/base-url";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Display face for headings. Variable optical sizing so a 40px h1 and a 20px
// h3 are both drawn correctly rather than one being a scaled version of the
// other.
const newsreader = Newsreader({
  variable: "--font-heading-face",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  // Share-image URLs are absolute and built from this. Without it they come
  // from whatever host served the page, which on Vercel can be a one-off
  // deployment URL rather than the real domain, so previews break once that
  // deployment is gone. baseUrl() treats a blank NEXT_PUBLIC_BASE_URL as unset.
  metadataBase: new URL(baseUrl() || "http://localhost:3000"),
  title: "Gap Year Platform — Paid gap year and post-grad paths",
  description:
    "A free directory and deadline tracker for gap year and post-grad paths that pay you: stipends, living allowances, education awards and wages, with the price of the ones that charge you set beside them. No commissions, ever.",
};

// Two destinations. Everything that was a separate tab is now reachable from
// inside one of them: deadlines are a sort on the catalog, examples sit under
// the builder. /connect still exists at its URL but is out of the bar.
const NAV = [
  { href: "/programs", label: "Catalog" },
  { href: "/map", label: "Map" },
  { href: "/design", label: "Design your year" },
];

// Cloudflare Web Analytics: cookieless, no cross-site tracking, no personal
// data — the only kind of measurement this product can ship without
// contradicting itself. The beacon token is a public identifier meant to sit
// in the page source; it is not a secret and grants no access.
//
// Skipped in local development so `npm run dev` does not inflate the numbers
// with page loads nobody made. Deliberately NOT gated on VERCEL_ENV: this
// exists to fix a measurement gap, and a gate that silently fails to fire in
// production would recreate the exact problem it was added to solve.
const ANALYTICS_TOKEN = "fa3124e035494640a1064439634727a1";
const ANALYTICS_ON = process.env.NODE_ENV !== "development";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets the theme class before first paint so there is no flash of the
            wrong colours. Has to be inline and ahead of hydration. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <SiteChrome>
          <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap"
              >
                <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground text-[11px] font-bold shadow-xs">
                  GY
                </span>
                <span className="text-sm sm:text-base">Gap Year Platform</span>
              </Link>
              {/* Five links plus the wordmark no longer fit at 375px, so the
                  nav scrolls sideways on small screens rather than truncating
                  the last items out of reach. */}
              <nav className="-mr-4 flex min-w-0 items-center gap-0 overflow-x-auto whitespace-nowrap pr-4 text-[11px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mr-0 sm:gap-1 sm:overflow-visible sm:pr-0 sm:text-sm">
                <NavLinks items={NAV} />
                <span className="ml-1 hidden sm:block">
                  <ThemeToggle />
                </span>
              </nav>
            </div>
          </header>
          </SiteChrome>

          <main className="flex-1">{children}</main>

          <SiteChrome>
          <footer className="border-t mt-16">
            <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
              <p>No commissions. No referral fees. No paid placements, in either direction.</p>
              <div className="flex items-center gap-3">
                <span className="sm:hidden">
                  <ThemeToggle />
                </span>
                <p>&copy; {new Date().getFullYear()} Gap Year Platform</p>
              </div>
            </div>
          </footer>
          </SiteChrome>
        </TooltipProvider>

        {/* Vercel Web Analytics, alongside Cloudflare's. Same bargain:
            cookieless, no cross-site tracking, no personal data. It reports
            per-route numbers next to the deploys, which Cloudflare's dashboard
            cannot do. The component no-ops outside a Vercel deployment, so a
            local run adds nothing. */}
        <Analytics />

        {ANALYTICS_ON && (
          <Script
            id="cf-beacon"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: ANALYTICS_TOKEN })}
          />
        )}
      </body>
    </html>
  );
}
