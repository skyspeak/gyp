import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stipend Clock — Paid gap year and post-grad programs",
  description:
    "A free directory and deadline tracker for gap year and post-grad programs that pay you: stipends, living allowances, education awards, and wages. No commissions, no paid placements.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              Stipend Clock
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/programs" className="hover:underline">
                Programs
              </Link>
              <Link href="/deadlines" className="hover:underline">
                Deadlines
              </Link>
              <Link href="/start" className="hover:underline">
                Find my fit
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 mt-16">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-500 flex flex-col gap-2">
            <p>
              Stipend Clock only lists programs that pay participants. We never take a
              commission on a placement and never list a program the participant pays to join.
            </p>
            <p>&copy; {new Date().getFullYear()} Stipend Clock.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
