"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Mail, Link2, Check, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sharing happens entirely off-platform: SMS and mail open the person's own
// apps, and copy uses the clipboard. Nothing is posted anywhere, no account is
// needed at either end, and we never see who it was sent to. For a product
// whose whole pitch is not being paid to route people anywhere, harvesting a
// share graph would be the wrong thing to build.
export function ShareMenu({
  url,
  title,
  summary,
  label = "Share",
  variant = "outline",
}: {
  url?: string;
  title: string;
  summary?: string;
  label?: string;
  variant?: "default" | "outline";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Resolved at click time rather than in an effect: the component then works
  // without being told its own URL, with no extra render and no SSR mismatch.
  const currentUrl = () => url ?? window.location.href;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareBody = () => {
    const href = currentUrl();
    return summary ? `${title}\n\n${summary}\n\n${href}` : `${title}\n\n${href}`;
  };

  // `sms:&body=` works on modern iOS and Android alike; the older `?body=`
  // form is Android-only.
  const openSms = () => {
    window.location.href = `sms:&body=${encodeURIComponent(shareBody())}`;
    setOpen(false);
  };

  const openMail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareBody())}`;
    setOpen(false);
  };

  async function copy() {
    await navigator.clipboard.writeText(currentUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: summary, url: currentUrl() });
        setOpen(false);
        return true;
      } catch {
        /* dismissed — fall through to the menu */
      }
    }
    return false;
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant={variant}
        onClick={async () => {
          // On a phone, the OS sheet is better than anything we can draw.
          if (await nativeShare()) return;
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Share2 className="size-3.5" /> {label}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 w-60 overflow-hidden rounded-xl border bg-popover shadow-lg"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">Send it to someone</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <button
            role="menuitem"
            onClick={openSms}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
          >
            <MessageSquare className="size-4 text-muted-foreground" /> Text message
          </button>
          <button
            role="menuitem"
            onClick={openMail}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
          >
            <Mail className="size-4 text-muted-foreground" /> Email
          </button>
          <button
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-2.5 border-t px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className={cn("size-4", "text-earn-foreground")} /> Link copied
              </>
            ) : (
              <>
                <Link2 className="size-4 text-muted-foreground" /> Copy link
              </>
            )}
          </button>

          <p className="border-t px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            Opens your own messages or mail. Nothing is posted anywhere and we don&apos;t see who
            you send it to.
          </p>
        </div>
      )}
    </div>
  );
}
