// Five worked examples of a gap year, built from the live catalog.
//
// These are generated at render time rather than stored as rows: a stored
// example goes stale the moment a program's pay or status changes, and a
// public plan whose share token grants edit rights would get vandalised.
// Anyone who wants one forks it into a real plan of their own.
//
// One of the five deliberately costs money. A gallery showing only earning
// years would be marketing; showing an expensive year priced honestly, next
// to what the same months could have paid, is the actual argument.

import type { Program } from "./programs";
import { listPrograms } from "./programs";
import { computeTotals, type PlanTotals, type PlanItemWithProgram } from "./plans";
import { programMonths, firstFreeSlot, type Intent, type Ambition } from "./suggest";

export type GalleryTemplate = {
  id: string;
  title: string;
  question: string; // the thing a parent is actually asking
  cohort: "pre_college" | "post_grad";
  ambition: Ambition;
  intents: Intent[];
  // Tried in order. Anything missing from the catalog is skipped, so the
  // gallery degrades rather than breaking when the catalog changes.
  prefer: string[];
  note?: string;
};

export const GALLERY: GalleryTemplate[] = [
  {
    id: "bank-it",
    title: "Come back with money in the bank",
    question: "Can a year off actually pay?",
    cohort: "pre_college",
    ambition: "year",
    intents: ["earn"],
    prefer: [
      "us-flag-small-ship-crew",
      "cal-fire-seasonal-firefighter",
      "contract-wildland-fire-crew",
      "alaska-seafood-processing",
    ],
    note: "Seasonal work stacked back to back. Hard, weather-dependent, and the highest-paying thing an 18-year-old can do without a degree.",
  },
  {
    id: "outdoors",
    title: "A year outside",
    question: "What if they just need to be out of a classroom?",
    cohort: "pre_college",
    ambition: "year",
    intents: ["outdoors", "serve"],
    prefer: [
      "washington-conservation-corps",
      "montana-conservation-corps",
      "texas-conservation-corps",
      "conservation-legacy",
    ],
    note: "Conservation corps pay modestly but usually cover housing, and most carry an AmeriCorps education award on top.",
  },
  {
    id: "qualified",
    title: "Come out holding a certification",
    question: "How do they end the year more employable than they started?",
    cohort: "pre_college",
    ambition: "year",
    intents: ["credential", "try_career"],
    prefer: [
      "volunteer-fire-dept-free-firefighter-i-ii-emt-basic",
      "youthbuild-americorps",
      "year-up",
      "habitat-for-humanity-americorps",
    ],
    note: "Credential-first. The pay is lower, but the year ends with a licence someone will hire on.",
  },
  {
    id: "abroad",
    title: "Live somewhere else, get paid for it",
    question: "Can they go abroad without us funding it?",
    cohort: "post_grad",
    ambition: "year",
    intents: ["abroad", "earn"],
    prefer: ["jet-alt", "tfetp-taiwan", "epik-south-korea", "tapif"],
    note: "Government teaching programs pay a local salary. Needs a degree, and applications close nine to twelve months ahead.",
  },
  {
    id: "the-expensive-one",
    title: "The one you were quoted for",
    question: "We were quoted a lot of money. Is it worth it?",
    cohort: "pre_college",
    ambition: "year",
    intents: ["abroad"],
    // One program, not a stack. Stacking two fee programs invents a year
    // nobody actually buys and inflates the number past honesty.
    prefer: ["carpe-diem-latitudes-year"],
    note: "Shown at full price, with what the same months would have paid instead. We take nothing from anyone on this page.",
  },
];

export type Proposal = {
  template: GalleryTemplate;
  blocks: { program: Program; months: number; startsOn: string; endsOn: string }[];
  totals: PlanTotals;
  monthsFilled: number;
  /** Only set for the pay-to-participate example. */
  couldHaveEarned: number | null;
  /** True when pay is in a foreign currency, so a USD total would read $0. */
  paidAbroad: boolean;
  /** The YEAR is pay-to-participate — not merely an earning year that has an
   *  upfront outlay like STCW certification or fire boots. */
  isPayingYear: boolean;
};

const CYCLE = "2027-28";

export async function buildGallery(): Promise<Proposal[]> {
  const [all, earners] = await Promise.all([
    listPrograms({ moneyDirection: "all" }),
    listPrograms({ moneyDirection: "participant_earns" }),
  ]);
  const bySlug = new Map(all.map((p) => [p.slug, p]));

  return GALLERY.map((template) => {
    const placed: { starts_on: string | null; ends_on: string | null }[] = [];
    const blocks: Proposal["blocks"] = [];

    for (const slug of template.prefer) {
      const program = bySlug.get(slug);
      if (!program) continue;
      const months = programMonths(program);
      if (months == null) continue;

      const budget = template.ambition === "year" ? 12 : template.ambition === "semester" ? 6 : 3;
      const used = blocks.reduce((n, b) => n + b.months, 0);
      if (used + months > budget) continue;

      const slot = firstFreeSlot(placed, months, CYCLE);
      blocks.push({ program, months, startsOn: slot.startsOn, endsOn: slot.endsOn });
      placed.push({ starts_on: slot.startsOn, ends_on: slot.endsOn });
    }

    const items = blocks.map(
      (b) =>
        ({
          id: b.program.id,
          plan_id: "",
          program_id: b.program.id,
          kind: "intent",
          starts_on: b.startsOn,
          ends_on: b.endsOn,
          note: null,
          created_at: "",
          program: b.program,
        }) as PlanItemWithProgram
    );

    const totals = computeTotals(items);

    // For the expensive example, price the same months against the best
    // earning option available to that cohort. This is the comparison the
    // rest of the industry has no reason to show.
    const isPayingYear = blocks.some((b) => b.program.money_direction === "participant_pays");

    let couldHaveEarned: number | null = null;
    if (isPayingYear && totals.costHigh > 0) {
      const monthsUsed = blocks.reduce((n, b) => n + b.months, 0) || 6;
      const best = earners
        .filter((p) => p.pay_low != null && p.pay_type === "monthly" && (p.pay_currency ?? "USD") === "USD")
        .sort((a, b) => (b.pay_high ?? b.pay_low ?? 0) - (a.pay_high ?? a.pay_low ?? 0))[0];
      if (best?.pay_low) couldHaveEarned = (best.pay_high ?? best.pay_low) * monthsUsed;
    }

    // A yen or won salary is deliberately excluded from the USD total, which
    // would otherwise render a well-paid year abroad as "$0". Say so instead.
    const paidAbroad =
      totals.earnsHigh === 0 &&
      totals.costHigh === 0 &&
      blocks.some((b) => (b.program.pay_currency ?? "USD") !== "USD");

    return {
      template,
      blocks,
      totals,
      monthsFilled: blocks.reduce((n, b) => n + b.months, 0),
      couldHaveEarned,
      paidAbroad,
      isPayingYear,
    };
  }).filter((p) => p.blocks.length > 0);
}
