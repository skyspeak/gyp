import { ImageResponse } from "next/og";
import { OG } from "@/lib/og/theme";

// Static on purpose: no database is reachable at build time, and the site-wide
// card does not need live numbers to make its point.
export const alt = "Gap Year Platform: gap years that pay you instead of charging you";
export const size = OG.size;
export const contentType = "image/png";

export default function Image() {
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
          padding: "72px 80px",
          color: OG.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: OG.pine,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            GY
          </div>
          <div style={{ fontSize: 30, fontWeight: 600 }}>Gap Year Platform</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            A year off to make sense of the world.
          </div>
          <div style={{ marginTop: 26, fontSize: 34, color: OG.soft, maxWidth: 940, lineHeight: 1.35 }}>
            Gap years that pay you, next to the ones that charge you, priced honestly.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: OG.faint }}>
          Free · no commissions · no sponsored listings
        </div>
      </div>
    ),
    size
  );
}
