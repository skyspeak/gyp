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

  const setDates = (itemId: string, startsOn: string | null, endsOn: string | null) =>
    call(`/api/plan/${token}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsOn, endsOn }),
    });

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

      {/* A parent-built plan is a proposal, not an instruction. Saying so is the
          difference between the student engaging and ignoring it. */}
      {plan.createdBy === "parent" && (
        <p className="mt-4 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Anyone with this link can edit it. Send it to{" "}
          {plan.studentName ?? "them"} — it&apos;s a starting point to argue with, not a done deal.
        </p>
      )}

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
              onDates={(s, e) => setDates(item.id, s, e)}
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
            Could go either way — depends which options you land
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

// A 12-month strip. On a phone this is the fastest way to see shape and gaps
// without reading a single number.
function Timeline({ months, items, gaps }: { months: string[]; items: Item[]; gaps: string[] }) {
  const gapSet = new Set(gaps);
  const colorFor = (m: string) => {
    const idx = items.findIndex((i) => i.startsOn && i.endsOn && m >= i.startsOn && m <= i.endsOn);
    if (idx === -1) return null;
    return idx;
  };
  const PALETTE = ["bg-earn/70", "bg-primary/60", "bg-warn/60", "bg-earn/40", "bg-primary/35"];

  return (
    <div className="mt-3 overflow-hidden rounded-xl border">
      <div className="flex">
        {months.map((m) => {
          const idx = colorFor(m);
          return (
            <div key={m} className="flex-1 border-r last:border-r-0">
              <div
                className={cn(
                  "h-8",
                  idx !== null ? PALETTE[idx % PALETTE.length] : gapSet.has(m) ? "bg-muted" : "bg-muted/40"
                )}
                title={formatMonth(m)}
              />
              <div className="border-t py-1 text-center text-[9px] text-muted-foreground">
                {formatMonth(m).slice(0, 1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemRow({
  item, months, disabled, onRemove, onDates,
}: {
  item: Item;
  months: string[];
  disabled: boolean;
  onRemove: () => void;
  onDates: (s: string | null, e: string | null) => void;
}) {
  const p = item.program;
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

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <MonthSelect
          value={item.startsOn}
          months={months}
          placeholder="Start"
          disabled={disabled}
          onChange={(v) => onDates(v, item.endsOn)}
        />
        <span className="text-muted-foreground">→</span>
        <MonthSelect
          value={item.endsOn}
          months={months}
          placeholder="End"
          disabled={disabled}
          onChange={(v) => onDates(item.startsOn, v)}
        />
        {!item.startsOn && (
          <span className="text-muted-foreground">Add months to count its pay</span>
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
