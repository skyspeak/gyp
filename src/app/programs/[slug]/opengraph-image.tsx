import { ImageResponse } from "next/og";
import { getProgramBySlug, CATEGORY_LABELS } from "@/lib/programs";
import { programCountries, countryName } from "@/lib/geo";
import { formatPayShort, formatCostShort } from "@/lib/format";
import { MONEY_UI } from "@/lib/money-ui";
import { OG } from "@/lib/og/theme";

export const dynamic = "force-dynamic";
export const alt = "Gap year program: what it pays or costs";
export const size = OG.size;
export const contentType = "image/png";

// What someone sees when a program link is pasted into a group chat: the name,
// the one number that matters, and whether that number is money in or out.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProgramBySlug(slug);

  const name = p ? p.name.replace(/\s+—\s+US Eligibility Status$/i, "") : "Gap Year Platform";
  const pays = p?.money_direction === "participant_earns";
  const charges = p?.money_direction === "participant_pays";
  const money = p
    ? charges
      ? (formatCostShort(p) ?? "Fee varies")
      : p.money_direction === "net_neutral"
        ? "Roughly breaks even"
        : formatPayShort(p)
    : "";
  const label = p ? MONEY_UI[p.money_direction]?.label : null;
  const where = p ? programCountries(p).slice(0, 4).map((c) => countryName(c)).join(", ") : "";
  const type = p ? (CATEGORY_LABELS[p.category] ?? p.category) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: OG.ground,
          padding: "64px 76px",
          color: OG.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: OG.faint }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: OG.pine,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            GY
          </div>
          Gap Year Platform{type ? ` · ${type}` : ""}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: name.length > 60 ? 54 : 66,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 1040,
            }}
          >
            {name.length > 110 ? `${name.slice(0, 107)}…` : name}
          </div>
          {p && (
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 34 }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: charges ? OG.payInk : OG.ink }}>{money}</div>
              {label && (
                <div
                  style={{
                    fontSize: 28,
                    padding: "8px 20px",
                    borderRadius: 999,
                    background: pays ? OG.earnBg : charges ? OG.payBg : "#eef1ef",
                    color: pays ? OG.earnInk : charges ? OG.payInk : OG.soft,
                  }}
                >
                  {label}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", fontSize: 26, color: OG.soft }}>
          {where ? `Where: ${where}` : "Free · no commissions · no sponsored listings"}
        </div>
      </div>
    ),
    size
  );
}
