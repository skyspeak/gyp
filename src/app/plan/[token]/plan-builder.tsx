"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Check, Link2, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/format";
import { MONEY_UI, TONE_BADGE, TONE_TEXT } from "@/lib/money-ui";
import { formatMonth, type PlanTotals } from "@/lib/plans";
import { CATEGORY_LABELS } from "@/lib/programs";
import { cn } from "@/lib/utils";

function addMonthsClient(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

function monthSpan(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return Math.max(1, (by - ay) * 12 + (bm - am) + 1);
}

type ProgramLite = {
  id: string; name: string; operator: string; category: string;
  moneyDirection: string; payType: string;
  payLow: number | null; payHigh: number | null; payCurrency: string;
  costLow: number | null; costHigh: number | null;
  termMinWeeks?: number | null; fundingStatus: string;
};
type Item = {
  id: string; startsOn: string | null; endsOn: string | null; note: string | null;
  program: (ProgramLite & { slug: string }) | null;
};

export default function PlanBuilder({
  token, plan, items, totals, gaps, suggested, allCount,
}: {
  token: string;
  plan: { title: string | null; studentName: string | null; cohort: string; cycleLabel: string | null; createdBy: string | null };
  items: Item[];
  totals: PlanTotals;
  gaps: string[];
  suggested: ProgramLite[];
  allCount: number;
}) {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const cycleMonths = useMemo(() => {
    const startYear = plan.cycleLabel ? Number(plan.cycleLabel.slice(0, 4)) : new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const m = 9 + i;
      const year = m > 12 ? startYear + 1 : startYear;
      return `${year}-${String(m > 12 ? m - 12 : m).padStart(2, "0")}`;
    });
  }, [plan.cycleLabel]);

  async function call(url: string, init: RequestInit) {
    setBusy(true);
    try {
      await fetch(url, init);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  const addProgram = (programId: string) =>
    call(`/api/plan/${token}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId }),
    }).then(() => setPicking(false));

  const removeItem = (itemId: string) =>
    call(`/api/plan/${token}/items/${itemId}`, { method: "DELETE" });

  // Moving a block moves its whole span. The end is always start + length,
  // so a 10-month program can never be squeezed into three.
  const setStart = (itemId: string, startsOn: string | null, lengthMonths: number | null) => {
    const endsOn =
      startsOn && lengthMonths ? addMonthsClient(startsOn, lengthMonths - 1) : null;
    return call(`/api/plan/${token}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsOn, endsOn }),
    });
  };

  const working = busy || pending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:pb-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            {plan.title ?? "Gap year plan"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.cycleLabel ?? "Undated"} ·{" "}
            {plan.cohort === "post_grad" ? "After college" : "Before college"} · Draft
          </p>
        </div>
        <ShareButton token={token} />
      </header>

      <MoneyBar totals={totals} itemCount={items.length} />

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">The year</h2>
          <span className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "block" : "blocks"}
          </span>
        </div>

        <Timeline months={cycleMonths} items={items} gaps={gaps} />

        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              months={cycleMonths}
              disabled={working}
              onRemove={() => removeItem(item.id)}
              onStart={(start, len) => setStart(item.id, start, len)}
            />
          ))}
        </ul>

        {items.length === 0 && (
          <div className="mt-3 rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing in the plan yet. Add something that pays.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => setPicking(true)}
          disabled={working}
        >
          <Plus className="size-4" /> Add to the year
        </Button>
      </section>

      {gaps.length > 0 && items.length > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-warn/30 bg-warn-muted/50 p-3 text-sm text-warn-foreground">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>{gaps.length} month{gaps.length === 1 ? "" : "s"} unplanned.</strong>{" "}
            {gaps.slice(0, 4).map(formatMonth).join(", ")}
            {gaps.length > 4 && ` +${gaps.length - 4} more`}. Deferral reviewers ask about these.
          </span>
        </p>
      )}

      {picking && (
        <ProgramPicker
          programs={suggested}
          allCount={allCount}
          onPick={addProgram}
          onClose={() => setPicking(false)}
          busy={working}
        />
      )}
    </div>
  );
}

function MoneyBar({ totals, itemCount }: { totals: PlanTotals; itemCount: number }) {
  if (itemCount === 0) return null;
  const earns = totals.earnsHigh > 0;
  const costs = totals.costHigh > 0 || totals.costLow > 0;

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-3">
      <div className="rounded-xl border p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pays</p>
        <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", earns && TONE_TEXT.earn)}>
          {earns
            ? totals.earnsLow === totals.earnsHigh
              ? formatCents(totals.earnsHigh)
              : `${formatCents(totals.earnsLow)}–${formatCents(totals.earnsHigh)}`
            : "—"}
        </p>
      </div>
      <div className="rounded-xl border p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Costs</p>
        <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", costs && TONE_TEXT.pay)}>
          {costs
            ? totals.costLow === totals.costHigh
              ? formatCents(totals.costHigh)
              : `${formatCents(totals.costLow)}–${formatCents(totals.costHigh)}`
            : "—"}
        </p>
      </div>
      <div className="rounded-xl border bg-muted/40 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Net</p>
        <p
          className={cn(
            "mt-0.5 text-lg font-semibold tabular-nums",
            // Colour by the WHOLE range, not its top end. A span of
            // -$15,788 to +$558 is not a green number: reading it as "this
            // pays" is exactly the mistake this product exists to prevent.
            totals.netLow > 0
              ? TONE_TEXT.earn
              : totals.netHigh < 0
                ? TONE_TEXT.pay
                : TONE_TEXT.warn
          )}
        >
          {totals.netLow === totals.netHigh
            ? formatCents(totals.netHigh)
            : `${formatCents(totals.netLow)} to ${formatCents(totals.netHigh)}`}
        </p>
        {totals.netLow < 0 && totals.netHigh > 0 && (
          <p className="mt-0.5 text-[11px] text-warn-foreground">
            Could go either way, depending which options you land
          </p>
        )}
        {totals.educationAward > 0 && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            +{formatCents(totals.educationAward)} education award
          </p>
        )}
      </div>

      {(totals.unpricedCount > 0 || totals.hasForeignCurrency) && (
        <p className="text-xs text-muted-foreground sm:col-span-3">
          {totals.unpricedCount} item{totals.unpricedCount === 1 ? "" : "s"} not counted
          {totals.hasForeignCurrency && " (paid in a foreign currency, or no published figure)"}
          . Add start and end months to include rate-based pay in the total.
        </p>
      )}
    </div>
  );
}

// One labelled row per block, spanning the months it actually runs, coloured
// by whether it pays you. The strip this replaced was twelve anonymous
// squares: you could see that something filled November without ever learning
// what, and three of the twelve month labels were the letter J.
// A bar is read as colour and length before it is read as text, so it needs
// more fill than the badges in the list below.
const BAR_TONE: Record<string, string> = {
  earn: "border-earn/45 bg-earn/30 text-earn-foreground",
  neutral: "border-border bg-muted-foreground/20 text-foreground",
  pay: "border-pay/45 bg-pay/30 text-pay-foreground",
};

const TRACK =
  "grid grid-cols-[6.5rem_repeat(12,minmax(0,1fr))] sm:grid-cols-[10rem_repeat(12,minmax(0,1fr))] items-center gap-x-1";

function Timeline({ months, items, gaps }: { months: string[]; items: Item[]; gaps: string[] }) {
  const gapSet = new Set(gaps);
  const scheduled = items.filter((i) => i.startsOn && i.endsOn);
  const undated = items.filter((i) => !i.startsOn || !i.endsOn);
  if (items.length === 0) return null;

  // A block can start before the plan's window or run past it. Clamp to the
  // edge rather than dropping the row: a bar that runs off the side is true,
  // an invisible bar is not.
  const indexFor = (ym: string) => {
    const i = months.indexOf(ym);
    if (i !== -1) return i;
    return ym < months[0] ? 0 : months.length - 1;
  };

  return (
    <div className="mt-3 overflow-x-auto pb-1">
      <div className="min-w-[32rem] space-y-1">
        <div className={cn(TRACK, "pb-0.5")}>
          <span />
          {months.map((m) => {
            const [name, year] = formatMonth(m).split(" ");
            return (
              <span
                key={m}
                className={cn(
                  "text-center text-[10px] font-medium",
                  gapSet.has(m) ? "text-warn-foreground" : "text-muted-foreground"
                )}
                title={formatMonth(m)}
              >
                {name}
                {name === "Jan" && <span className="block opacity-70">{year}</span>}
              </span>
            );
          })}
        </div>

        {scheduled.map((item) => {
          const start = indexFor(item.startsOn!);
          const span = Math.max(1, indexFor(item.endsOn!) - start + 1);
          const tone = item.program
            ? (MONEY_UI[item.program.moneyDirection] ?? MONEY_UI.participant_earns).tone
            : "neutral";
          const label = item.program?.name ?? item.note ?? "Untitled block";

          return (
            <div key={item.id} className={TRACK}>
              <span className="truncate text-xs font-medium" title={label}>
                {label}
              </span>
              <span
                style={{ gridColumn: `${start + 2} / span ${span}` }}
                className={cn(
                  "flex h-7 items-center justify-center rounded-md border px-1.5 text-[10px] font-medium tabular-nums",
                  BAR_TONE[tone] ?? BAR_TONE.neutral
                )}
                title={`${formatMonth(item.startsOn!)} – ${formatMonth(item.endsOn!)}`}
              >
                {span > 1 && `${span} mo`}
              </span>
            </div>
          );
        })}

        {undated.map((item) => {
          const label = item.program?.name ?? item.note ?? "Untitled block";
          return (
            <div key={item.id} className={TRACK}>
              <span className="truncate text-xs font-medium text-muted-foreground" title={label}>
                {label}
              </span>
              <span className="col-span-12 flex h-7 items-center rounded-md border border-dashed px-2 text-[10px] text-muted-foreground">
                No start month yet
              </span>
            </div>
          );
        })}

        {gaps.length > 0 && (
          <div className={cn(TRACK, "pt-0.5")}>
            <span className="truncate text-xs text-warn-foreground">Unplanned</span>
            {months.map((m) => (
              <span
                key={m}
                className={cn(
                  "h-2 rounded-sm",
                  gapSet.has(m) ? "bg-warn/40" : "bg-transparent"
                )}
                title={gapSet.has(m) ? `${formatMonth(m)}: nothing planned` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item, months, disabled, onRemove, onStart,
}: {
  item: Item;
  months: string[];
  disabled: boolean;
  onRemove: () => void;
  onStart: (start: string | null, lengthMonths: number | null) => void;
}) {
  const p = item.program;
  // Prefer the program's published term; fall back to whatever the block
  // currently spans so an unpublished-length item still shows something true.
  const lengthMonths =
    p?.termMinWeeks != null
      ? Math.max(1, Math.round(p.termMinWeeks / 4.345))
      : item.startsOn && item.endsOn
        ? monthSpan(item.startsOn, item.endsOn)
        : null;
  const money = p ? MONEY_UI[p.moneyDirection] ?? MONEY_UI.participant_earns : null;

  return (
    <li className="rounded-xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {p ? (
            <Link href={`/programs/${p.slug}`} className="font-medium hover:underline">
              {p.name}
            </Link>
          ) : (
            <span className="font-medium">{item.note ?? "Untitled block"}</span>
          )}
          {p && <p className="mt-0.5 text-xs text-muted-foreground">{p.operator}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {money && money.tone !== "earn" && (
              <Badge variant="outline" className={TONE_BADGE[money.tone]}>{money.label}</Badge>
            )}
            {p && (
              <Badge variant="outline" className="border-border text-muted-foreground">
                {CATEGORY_LABELS[p.category] ?? p.category}
              </Badge>
            )}
            {p && p.fundingStatus !== "active" && (
              <Badge variant="outline" className={TONE_BADGE.warn}>Check status</Badge>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Length is the program's, not the planner's. You choose when it
          starts; how long it runs is a fact about the program. */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Starts</span>
        <MonthSelect
          value={item.startsOn}
          months={months}
          placeholder="Pick a month"
          disabled={disabled}
          onChange={(v) => onStart(v, lengthMonths)}
        />
        {lengthMonths ? (
          <span className="rounded-full bg-muted px-2 py-1 font-medium">
            {lengthMonths} month{lengthMonths === 1 ? "" : "s"} long
          </span>
        ) : (
          <span className="text-muted-foreground">Length not published</span>
        )}
        {item.startsOn && item.endsOn && (
          <span className="text-muted-foreground">
            through {formatMonth(item.endsOn)}
          </span>
        )}
      </div>
    </li>
  );
}

function MonthSelect({
  value, months, placeholder, disabled, onChange,
}: {
  value: string | null;
  months: string[];
  placeholder: string;
  disabled: boolean;
  onChange: (v: string | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value || null)}
      className="rounded-md border bg-background px-2 py-1.5 text-xs disabled:opacity-40"
    >
      <option value="">{placeholder}</option>
      {months.map((m) => (
        <option key={m} value={m}>{formatMonth(m)}</option>
      ))}
    </select>
  );
}

function ProgramPicker({
  programs, allCount, onPick, onClose, busy,
}: {
  programs: ProgramLite[];
  allCount: number;
  onPick: (id: string) => void;
  onClose: () => void;
  busy: boolean;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return programs.slice(0, 40);
    return programs
      .filter((p) => p.name.toLowerCase().includes(s) || p.operator.toLowerCase().includes(s))
      .slice(0, 40);
  }, [q, programs]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative flex max-h-[85vh] w-full flex-col rounded-t-2xl border bg-background sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center gap-2 border-b p-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${programs.length} paths that pay`}
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <ul className="min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onPick(p.id)}
                disabled={busy}
                className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.operator}</span>
                </span>
                <span className="shrink-0 text-xs font-medium tabular-nums">
                  {p.payLow != null ? formatCents(p.payLow, p.payCurrency) : ""}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              Nothing matches. <Link href="/programs" className="underline">Browse all {allCount}</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ShareButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/plan/${token}`;
    // Native share sheet on phones, clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share({ title: "Gap year plan", url });
        return;
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button onClick={share} variant={copied ? "outline" : "default"}>
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
