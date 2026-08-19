// Ordering helper for "sort by pay".
//
// Raw pay_low/pay_high are NOT comparable across rows: they differ in currency
// (₫30,000,000/mo is about $1,200, not more than $80,000) and in period
// (/hr vs /mo vs a lump-sum total). Sorting on the raw integer ranks a
// Vietnamese teaching salary above a Churchill Scholarship, which is worse
// than offering no sort at all.
//
// So we normalise to an approximate annualised USD figure purely for ordering.
// These rates are deliberately coarse and are NEVER rendered — no user ever
// sees a converted number, which is what keeps this consistent with the rule
// against publishing figures we haven't verified. Ordering being roughly right
// is useful; a displayed conversion being subtly wrong would not be.

// Approximate units of currency per 1 USD. Coarse on purpose; refresh whenever
// they drift far enough to reorder the list, not to chase accuracy.
const PER_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.5,
  CZK: 23,
  HUF: 355,
  JPY: 150,
  KRW: 1350,
  TWD: 32,
  THB: 35,
  VND: 25000,
  CNY: 7.2,
  ILS: 3.7,
  CAD: 1.36,
  NZD: 1.65,
  CLP: 950,
  COP: 4000,
  MXN: 18,
  ZAR: 18,
  INR: 84,
};

// Zero-decimal currencies store whole units; everything else stores hundredths.
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "COP", "HUF"]);

const PERIODS_PER_YEAR: Record<string, number> = {
  hourly: 2080,
  weekly: 52,
  monthly: 12,
  annual: 1,
  stipend_total: 1, // a lump sum for the whole term; close enough for ordering
  none: 0,
};

export function approxAnnualUsd(p: {
  pay_type: string;
  pay_low: number | null;
  pay_high: number | null;
  pay_currency?: string | null;
}): number {
  const minor = p.pay_high ?? p.pay_low;
  if (minor == null) return -1; // unknown pay sorts below anything with a figure
  const currency = (p.pay_currency ?? "USD").toUpperCase();
  const divisor = ZERO_DECIMAL.has(currency) ? 1 : 100;
  const rate = PER_USD[currency] ?? 1;
  const perPeriodUsd = minor / divisor / rate;
  return perPeriodUsd * (PERIODS_PER_YEAR[p.pay_type] ?? 1);
}
