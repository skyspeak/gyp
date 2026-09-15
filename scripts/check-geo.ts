// Regression cases for the location parser behind /map. Every case is a real
// string from the catalog that was, at some point, placed in the wrong country.
// Runs in CI; needs no database.
import { countriesInText, programCountries } from "../src/lib/geo";

const text: [string, string[]][] = [
  // US multi-word states must be consumed before country matching.
  ["Colorado, New Mexico, and other Intermountain West states", ["US"]],
  ["Washington DC, Maryland, New Jersey, California, Texas", ["US"]],
  // Georgia is a US state unless the text says otherwise.
  ["Georgia (country; rural and urban public schools nationwide)", ["GE"]],
  // "Nationwide" is the nation the entry is about, not automatically the US.
  ["Japan (placements nationwide; cities and rural areas)", ["JP"]],
  ["South Korea (public schools nationwide)", ["KR"]],
  // Antigua here is Antigua Guatemala, not Antigua and Barbuda.
  ["Antigua, Guatemala (+ other cities: Quetzaltenango, etc.)", ["GT"]],
  // "US" describing who applies, not where you go.
  ["Australia, New Zealand (primary destinations for US citizens)", ["AU", "NZ"]],
  ["Canada (British Columbia, Ontario, Quebec most popular for US holders)", ["CA"]],
  ["Mountain areas with avalanche terrain across US, Canada, and internationally", ["CA", "US"]],
  // "UK" as a destination, but not as an operator's home base.
  ["USA (NY, PA, WA, CT), UK, Germany, Paraguay, Australia", ["AU", "DE", "GB", "PY", "US"]],
  ["Worldwide (UK-originated, strong European / Atlantic coverage)", []],
  ["US summer camps nationwide (program based in UK for outbound participants)", ["US"]],
  ["Isle of Iona, Scotland, UK", ["GB"]],
  // Worldwide, at sea and online are never painted.
  ["Worldwide (155+ countries)", []],
  ["Ship-based; Spring 2027 route varies from Fall 2026", []],
  ["Online (anywhere)", []],
  ["N/A — program terminated", []],
  // Aliases and multi-country strings.
  ["Latin America (Peru, Guatemala), Southeast Asia", ["GT", "PE"]],
  ["Idaho (US base) + Patagonia exchange (Chile)", ["CL", "US"]],
  ["Alaska, Galapagos, NW Coast, Japan, Antarctica; home port varies by itinerary", ["AQ", "EC", "JP", "US"]],
  ["Lander, WY and western US (canyons, mountains)", ["US"]],
];

const names: [string, string[]][] = [
  ["Fulbright Austria US Teaching Assistantship (USTA)", ["AT"]],
  ["US-Flag Small Ship Crew (Deckhand / Steward)", ["US"]],
  ["Concordia International Volunteer Projects (UK)", []],
  ["Fulbright English Teaching Assistant Award - Czech Republic", ["CZ"]],
];

let failed = 0;
const check = (label: string, got: string[], want: string[]) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) {
    failed++;
    console.error(`FAIL  ${label}\n      want ${JSON.stringify(want)}  got ${JSON.stringify(got)}`);
  }
};

for (const [t, want] of text) check(t, countriesInText(t, { stateCodes: true }), want);
for (const [n, want] of names) check(n, programCountries({ slug: "-", name: n, location: null }), want);

const total = text.length + names.length;
if (failed) {
  console.error(`\n${failed} of ${total} geo cases failed`);
  process.exit(1);
}
console.log(`geo: all ${total} cases pass`);
