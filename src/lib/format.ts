// Zero-decimal currencies store pay_low/pay_high as whole units (e.g. yen),
// same convention Stripe uses for "cents" fields — everyone else is x100.
const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "VND"]);

export function formatCents(cents: number | null | undefined, currency: string = "USD"): string | null {
  if (cents == null) return null;
  const divisor = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
  return (cents / divisor).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

const PAY_TYPE_LABEL: Record<string, string> = {
  hourly: "/hr",
  weekly: "/wk",
  monthly: "/mo",
  annual: "/yr",
  stipend_total: " total",
  none: "",
};

type PayFields = {
  pay_type: string;
  pay_low: number | null;
  pay_high: number | null;
  pay_note: string | null;
  pay_currency?: string;
};

export function formatPayShort(program: PayFields): string {
  if (program.pay_type === "none") return "No cash pay listed";
  if (program.pay_low == null && program.pay_high == null) return "Pays, amount varies";
  const suffix = PAY_TYPE_LABEL[program.pay_type] ?? "";
  const currency = program.pay_currency ?? "USD";
  const low = formatCents(program.pay_low, currency);
  const high = formatCents(program.pay_high, currency);
  if (low && high && low !== high) return `${low}–${high}${suffix}`;
  return `${low ?? high}${suffix}`;
}

export function formatPay(program: PayFields): string {
  if (program.pay_type === "none" || (program.pay_low == null && program.pay_high == null)) {
    return program.pay_note ?? "No cash pay listed";
  }
  const suffix = PAY_TYPE_LABEL[program.pay_type] ?? "";
  const currency = program.pay_currency ?? "USD";
  const low = formatCents(program.pay_low, currency);
  const high = formatCents(program.pay_high, currency);
  let base: string;
  if (low && high && low !== high) {
    base = `${low}–${high}${suffix}`;
  } else {
    base = `${low ?? high}${suffix}`;
  }
  return program.pay_note ? `${base} · ${program.pay_note}` : base;
}

type CostFields = {
  cost_low: number | null;
  cost_high: number | null;
  cost_note?: string | null;
};

// Cost renders with the same weight as pay, never in smaller or greyer type.
// A student comparing a $17,950 fee against $600/wk should see both figures
// stated the same way.
export function formatCostShort(program: CostFields): string | null {
  if (program.cost_low == null && program.cost_high == null) return null;
  const low = formatCents(program.cost_low);
  const high = formatCents(program.cost_high);
  if (low && high && low !== high) return `${low}–${high}`;
  return `${low ?? high}`;
}

export function formatCost(program: CostFields): string | null {
  const base = formatCostShort(program);
  if (!base) return program.cost_note ?? null;
  return program.cost_note ? `${base} · ${program.cost_note}` : base;
}

export function formatTerm(minWeeks: number | null, maxWeeks: number | null): string | null {
  if (minWeeks == null && maxWeeks == null) return null;
  // Pick one unit for both ends of the range (by the larger value) so a
  // range never mixes units, e.g. "7 mo–30 wk".
  const useMonths = Math.max(minWeeks ?? 0, maxWeeks ?? 0) >= 16;
  const fmt = (w: number) => (useMonths ? `${Math.round(w / 4.345)} mo` : `${w} wk`);
  if (minWeeks != null && maxWeeks != null && minWeeks !== maxWeeks) {
    return `${fmt(minWeeks)}–${fmt(maxWeeks)}`;
  }
  return fmt(minWeeks ?? maxWeeks!);
}

// Renders in the viewer's local time, but always labels the timezone the
// source published in, per spec: "Store with offset, render local, label
// the source timezone."
export function formatDeadline(dueAt: string | null, sourceTz: string | null): string {
  if (!dueAt) return "Rolling / no fixed deadline";
  const d = new Date(dueAt);
  const local = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return sourceTz ? `${local} (source: ${sourceTz})` : local;
}

export function formatDateShort(dueAt: string | null): string {
  if (!dueAt) return "Rolling";
  return new Date(dueAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(dueAt: string | null): number | null {
  if (!dueAt) return null;
  const diff = new Date(dueAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
