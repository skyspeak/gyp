import { ImageResponse } from "next/og";
import map from "@/lib/world-map.json";
import { buildMapData } from "@/lib/map-data";
import { BUCKETS } from "@/components/world-map";
import { OG } from "@/lib/og/theme";

// Rendered per request with live counts, so a shared map link previews the
// map as it is today. The database is not reachable at build time.
export const dynamic = "force-dynamic";
export const alt = "World map of countries where you can do a gap year";
export const size = OG.size;
export const contentType = "image/png";

export default async function Image() {
  const { counts, closedOnly } = await buildMapData();
  const closed = new Set(closedOnly);

  const fillFor = (code: string) => {
    const n = counts[code] ?? 0;
    for (let i = BUCKETS.length - 1; i >= 0; i--) if (n >= BUCKETS[i].min) return OG.buckets[i];
    return closed.has(code) ? OG.notOpen : OG.empty;
  };

  // Satori can't draw a full SVG tree, but it will rasterise one as an image.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${map.width} ${map.height}">` +
    (map.shapes as { code: string; d: string }[])
      .map((s) => `<path d="${s.d}" fill="${fillFor(s.code)}" stroke="#ffffff" stroke-width="0.8"/>`)
      .join("") +
    "</svg>";
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const countries = Object.keys(counts).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG.card,
          padding: "44px 52px 30px",
          color: OG.ink,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: -1.5 }}>Where you can do a gap year</div>
            {/* One string, not "{n} countries…": Satori rejects a block with
                more than one child node unless it is display:flex. */}
            <div style={{ fontSize: 28, color: OG.soft, marginTop: 6 }}>
              {`${countries} countries. Click one to see every gap year there.`}
            </div>
          </div>
          <div style={{ fontSize: 24, color: OG.faint }}>Gap Year Platform</div>
        </div>
        {/* Sized so the southern tip of South America stays in frame; only
            Antarctica falls below the edge. At full width it cut through
            Argentina, which reads as a mistake rather than a crop. */}
        <img src={src} width={920} height={478} alt="" style={{ marginTop: 8, alignSelf: "center" }} />
      </div>
    ),
    size
  );
}
