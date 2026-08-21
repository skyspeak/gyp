import { notFound } from "next/navigation";
import { getPlanByToken, getPlanItems, computeTotals, findGaps } from "@/lib/plans";
import { listPrograms } from "@/lib/programs";
import { formatCents } from "@/lib/format";
import PlanBuilder from "./plan-builder";

export const dynamic = "force-dynamic";

// Shared links unfurl with the plan's actual bottom line, which is the whole
// reason anyone forwards one. noindex because a share token is a credential —
// these must never turn up in search results.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const plan = await getPlanByToken(token);
  if (!plan) return { title: "Plan not found" };

  const items = await getPlanItems(plan.id);
  const totals = computeTotals(items);
  const net = totals.netHigh;
  const money =
    items.length === 0
      ? "A gap year plan in progress"
      : net > 0
        ? `Earns up to ${formatCents(net)} over ${totals.monthsPlanned || 12} months`
        : net < 0
          ? `Costs up to ${formatCents(Math.abs(totals.netLow))}`
          : "A gap year plan";

  return {
    title: `${plan.title ?? "Gap year plan"} — Gap Year Platform`,
    description: money,
    robots: { index: false, follow: false },
    openGraph: { title: plan.title ?? "Gap year plan", description: money },
  };
}

export default async function PlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const plan = await getPlanByToken(token);
  if (!plan) notFound();

  const [items, catalog] = await Promise.all([
    getPlanItems(plan.id),
    // Only earning paths are offered by default. The builder can switch to the
    // full catalog, but a plan should start from things that pay.
    listPrograms({
      moneyDirection: "participant_earns",
      degreeRequired: plan.cohort === "post_grad" ? 1 : 0,
    }),
  ]);

  const allPrograms = await listPrograms({ moneyDirection: "all" });

  return (
    <PlanBuilder
      token={token}
      plan={{
        title: plan.title,
        studentName: plan.student_name,
        cohort: plan.cohort,
        cycleLabel: plan.cycle_label,
        createdBy: plan.created_by,
      }}
      items={items.map((i) => ({
        id: i.id,
        startsOn: i.starts_on,
        endsOn: i.ends_on,
        note: i.note,
        program: i.program
          ? {
              id: i.program.id,
              slug: i.program.slug,
              name: i.program.name,
              operator: i.program.operator,
              category: i.program.category,
              moneyDirection: i.program.money_direction,
              payType: i.program.pay_type,
              payLow: i.program.pay_low,
              payHigh: i.program.pay_high,
              payCurrency: i.program.pay_currency,
              costLow: i.program.cost_low,
              costHigh: i.program.cost_high,
              fundingStatus: i.program.funding_status,
            }
          : null,
      }))}
      totals={computeTotals(items)}
      gaps={findGaps(items, plan.cycle_label)}
      suggested={catalog.slice(0, 200).map((p) => ({
        id: p.id,
        name: p.name,
        operator: p.operator,
        category: p.category,
        moneyDirection: p.money_direction,
        payType: p.pay_type,
        payLow: p.pay_low,
        payHigh: p.pay_high,
        payCurrency: p.pay_currency,
        costLow: p.cost_low,
        costHigh: p.cost_high,
        termMinWeeks: p.term_min_weeks,
        fundingStatus: p.funding_status,
      }))}
      allCount={allPrograms.length}
    />
  );
}
