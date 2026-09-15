import { listPrograms, CATEGORY_LABELS } from "@/lib/programs";
import { programCountries, countryName } from "@/lib/geo";
import { formatPayShort, formatCostShort } from "@/lib/format";
import { MONEY_UI } from "@/lib/money-ui";
import { baseUrl } from "@/lib/base-url";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// A free, citable download of the catalog. Open data gets linked from
// resource pages, class assignments and awesome-lists in a way a directory
// never does, and every row links back here.
//
// Hand-verified rows only. 225 rows came from a bulk import nobody has checked,
// and publishing those as a dataset would put unverified pay figures into
// other people's spreadsheets with this site's name on them.
const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: NextRequest) {
  const base = baseUrl(req.nextUrl.origin);
  const programs = (await listPrograms({ moneyDirection: "all", includeUsIneligible: true })).filter(
    (p) => p.provenance === "hand_verified" && p.funding_status !== "defunded" && p.funding_status !== "paused"
  );

  const header = [
    "name", "operator", "type", "money", "pays_or_costs", "countries",
    "open_to_us_citizens", "funding_status", "program_page", "official_source", "last_verified",
  ];

  const rows = programs.map((p) => [
    p.name,
    p.operator,
    CATEGORY_LABELS[p.category] ?? p.category,
    MONEY_UI[p.money_direction]?.label ?? p.money_direction,
    p.money_direction === "participant_pays" ? (formatCostShort(p) ?? "Fee varies") : formatPayShort(p),
    programCountries(p).map((c) => countryName(c)).join("; ") || "Worldwide or unspecified",
    p.us_eligible === 1 ? "yes" : "no",
    p.funding_status,
    `${base}/programs/${p.slug}?ref=dataset`,
    p.source_url,
    p.last_verified_at?.slice(0, 10) ?? "",
  ]);

  const body = [
    `# Gap Year Platform dataset. Hand-verified programs only (${rows.length}). Free to use with attribution: ${base}/?ref=dataset`,
    header.join(","),
    ...rows.map((r) => r.map(csvCell).join(",")),
  ].join("\n");

  return new Response(body + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="gap-year-programs.csv"',
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
