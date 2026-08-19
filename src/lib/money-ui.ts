// Single source of truth for how money direction and funding status look.
// Kept out of the page components so a badge on the directory and a banner on
// the detail page can never drift apart — the whole product rests on a student
// reading "pays you" and "you pay" the same way everywhere they appear.

export type Tone = "earn" | "neutral" | "pay" | "warn" | "danger";

export const MONEY_UI: Record<string, { label: string; tone: Tone }> = {
  participant_earns: { label: "Pays you", tone: "earn" },
  net_neutral: { label: "Breaks even", tone: "neutral" },
  participant_pays: { label: "You pay", tone: "pay" },
};

export const FUNDING_UI: Record<string, { label: string; tone: Tone } | null> = {
  active: null, // no badge: the default state should not add noise
  at_risk: { label: "Funding at risk", tone: "warn" },
  paused: { label: "Paused", tone: "danger" },
  defunded: { label: "Shut down", tone: "danger" },
};

// Badge classes. Muted fills rather than saturated blocks, so a page with
// several badges still reads calmly.
export const TONE_BADGE: Record<Tone, string> = {
  earn: "bg-earn-muted text-earn-foreground border-earn/20",
  neutral: "bg-muted text-muted-foreground border-border",
  pay: "bg-pay-muted text-pay-foreground border-pay/20",
  warn: "bg-warn-muted text-warn-foreground border-warn/25",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
};

// Full-width callouts.
export const TONE_ALERT: Record<Tone, string> = {
  earn: "bg-earn-muted/60 border-earn/25 text-earn-foreground",
  neutral: "bg-muted border-border text-foreground",
  pay: "bg-pay-muted/60 border-pay/25 text-pay-foreground",
  warn: "bg-warn-muted/60 border-warn/30 text-warn-foreground",
  danger: "bg-destructive/8 border-destructive/25 text-destructive",
};

export const TONE_TEXT: Record<Tone, string> = {
  earn: "text-earn-foreground",
  neutral: "text-foreground",
  pay: "text-pay-foreground",
  warn: "text-warn-foreground",
  danger: "text-destructive",
};
