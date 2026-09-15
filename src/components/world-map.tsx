import map from "@/lib/world-map.json";
import { countryName } from "@/lib/geo";
import { cn } from "@/lib/utils";

type Shape = { code: string; name: string; d: string; cx: number; cy: number };
type Dot = { code: string; name: string; cx: number; cy: number };

// Buckets rather than a continuous scale. The United States has ~220 programs
// and most countries have one or two, so a linear ramp would paint the US
// solid and leave everything else indistinguishable from empty.
//
// The lowest step started at 25%, which in dark mode sat only a few lightness
// units above an empty country: single-program countries like Portugal and
// Egypt effectively vanished. Dark mode gets a higher floor because its ground
// is darker, so the same opacity reads as less.
export const BUCKETS = [
  { min: 1, label: "1", fill: "fill-primary/35 dark:fill-primary/45" },
  { min: 2, label: "2–4", fill: "fill-primary/55 dark:fill-primary/62" },
  { min: 5, label: "5–9", fill: "fill-primary/78 dark:fill-primary/82" },
  { min: 10, label: "10+", fill: "fill-primary" },
] as const;

function fillFor(n: number): string | null {
  for (let i = BUCKETS.length - 1; i >= 0; i--) if (n >= BUCKETS[i].min) return BUCKETS[i].fill;
  return null;
}

// Server component, and deliberately plain: every country is an <a> with a
// native <title> tooltip, so the map works with JavaScript off and ships no
// mapping library. The geometry is pre-projected at build-free generation
// time and imported as static path strings.
export function WorldMap({
  counts,
  closedOnly,
  selected,
  hrefFor,
}: {
  /** Programs a US applicant can do there, by ISO alpha-2 code. */
  counts: Record<string, number>;
  /** Countries whose only programs are closed to Americans. */
  closedOnly: string[];
  selected?: string;
  hrefFor: (code: string) => string;
}) {
  const closed = new Set(closedOnly);
  const shapes = map.shapes as Shape[];
  const dots = map.dots as Dot[];

  // SVG has no z-index. The selected country is drawn last so its outline is
  // not hidden under its neighbours' borders.
  const ordered = selected
    ? [...shapes.filter((s) => s.code !== selected), ...shapes.filter((s) => s.code === selected)]
    : shapes;

  const label = (code: string) => {
    const n = counts[code] ?? 0;
    const name = countryName(code);
    if (n) return `${name}: ${n} ${n === 1 ? "program" : "programs"}`;
    if (closed.has(code)) return `${name}: programs exist, but not open to Americans`;
    return name;
  };

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      className="h-auto w-full"
      role="img"
      aria-label="World map shaded by how many gap year programs you can do in each country"
    >
      <defs>
        {/* currentColor inside a pattern resolves from where the pattern is
            defined, so the warn tone is set here rather than on the path. */}
        <pattern
          id="not-open"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
          className="text-warn"
        >
          <rect width="7" height="7" className="fill-warn-muted" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="2.5" />
        </pattern>
      </defs>

      {ordered.map((s) => {
        const n = counts[s.code] ?? 0;
        const fill = fillFor(n);
        const isClosed = !n && closed.has(s.code);
        const isSelected = s.code === selected;
        const interactive = n > 0 || isClosed;

        const path = (
          <path
            d={s.d}
            fill={isClosed ? "url(#not-open)" : undefined}
            vectorEffect="non-scaling-stroke"
            strokeWidth={isSelected ? 2 : 0.6}
            className={cn(
              isClosed ? "" : (fill ?? "fill-muted"),
              isSelected ? "stroke-foreground" : "stroke-background",
              interactive && "transition-opacity hover:opacity-75"
            )}
          >
            <title>{label(s.code)}</title>
          </path>
        );

        return interactive ? (
          <a key={s.code} href={hrefFor(s.code)} aria-label={label(s.code)}>
            {path}
          </a>
        ) : (
          <g key={s.code}>{path}</g>
        );
      })}

      {/* Countries too small to exist at this scale still get a mark when a
          program goes there — otherwise Singapore and the Seychelles would
          vanish from a map that claims to show where you can go. */}
      {dots
        .filter((d) => (counts[d.code] ?? 0) > 0 || closed.has(d.code))
        .map((d) => {
          const n = counts[d.code] ?? 0;
          return (
            <a key={d.code} href={hrefFor(d.code)} aria-label={label(d.code)}>
              <circle
                cx={d.cx}
                cy={d.cy}
                r={d.code === selected ? 7 : 5}
                fill={n ? undefined : "url(#not-open)"}
                vectorEffect="non-scaling-stroke"
                strokeWidth={d.code === selected ? 2 : 1.2}
                className={cn(n ? (fillFor(n) ?? "fill-muted") : "", "stroke-foreground/60")}
              >
                <title>{label(d.code)}</title>
              </circle>
            </a>
          );
        })}
    </svg>
  );
}
