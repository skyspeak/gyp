// Turns a program's free-text location into the countries you could actually
// be standing in. The location column is prose written by researchers, not
// data: 218 distinct strings across 381 programs, and 156 programs with none.
//
// The rule is to paint only what the text names. A program described as
// "Worldwide (155+ countries)" is not painted onto 155 countries — that would
// make every country look like it has a program it does not specifically
// have. Programs that name no country are returned empty and shown in a
// separate list, never guessed onto the map.
import { COUNTRY_NAMES } from "./country-names";

const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

// Phrases that only ever mean the United States in this catalog.
const US_PHRASES = [
  "United States", "USA", "U.S.A.", "U.S.", "National Park", "National Forest",
  "national park", "national forest", "BLM lands", "Appalachian", "Los Angeles",
  "San Francisco", "Philadelphia", "Seattle", "Chicago", "Boston", "Oakland",
  "Washington DC", "New York City", "National Guard",
];

// "Nationwide" means the United States only when no other country is named.
// It first sat in the list above, which put "Japan (placements nationwide)",
// "South Korea (public schools nationwide)" and "Canada (farms nationwide)"
// on the US as well — the nation in "nationwide" is whichever one the entry
// is about.
const WEAK_US = ["Nationwide", "nationwide", "statewide", "State-specific"];

// Aliases this dataset actually uses that the ISO name table does not carry.
const EXTRA: Record<string, string[]> = {
  GB: ["England", "Scotland", "Wales", "Britain"],
  KR: ["Korea"],
  NL: ["Holland"],
  LA: ["Laos"],
  SY: ["Syria"],
  EC: ["Galapagos", "Galápagos"],
  AQ: ["Antarctic"],
  // Cities, only where the city is unambiguous in this data.
  FR: ["Paris", "Antibes"],
  ES: ["Madrid", "Barcelona", "Seville", "Andalucia"],
  IT: ["Rome", "Florence"],
  JP: ["Tokyo"],
  AU: ["Sydney"],
  DE: ["Mainz"],
  CA: ["Ottawa"],
  PE: ["Cusco"],
  TH: ["Bangkok"],
};

// Programs whose location is blank and whose country is not in the name, but
// which are unambiguous by what they are. Kept deliberately short and explicit:
// a table someone can read beats inference nobody can check.
export const IDENTITY: Record<string, string[]> = {
  "rhodes-scholarship": ["GB"],
  "marshall-scholarship": ["GB"],
  "churchill-scholarship": ["GB"],
  "gates-cambridge-scholarship": ["GB"],
  "mitchell-scholarship": ["IE"],
  "schwarzman-scholars": ["CN"],
  "yenching-academy": ["CN"],
  "jet-alt": ["JP"],
  "cbyx-young-professionals": ["DE"],
  "alzar-gap": ["CL", "US"],
  "knight-hennessy-scholars": ["US"],
  "soros-fellowship-new-americans": ["US"],
  "nih-postbac-irta": ["US"],
  "americorps-nccc": ["US"],
  "americorps-vista": ["US"],
  "city-year": ["US"],
  "foodcorps": ["US"],
  "teach-for-america": ["US"],
  "public-allies": ["US"],
  "year-up": ["US"],
  "youthbuild-americorps": ["US"],
  "habitat-for-humanity-americorps": ["US"],
  "national-park-concessioner": ["US"],
  "aramark-destinations-park-concession": ["US"],
  "delaware-north-park-concession": ["US"],
  "cal-fire-seasonal-firefighter": ["US"],
  "federal-wildland-firefighter-seasonal": ["US"],
  "contract-wildland-fire-crew": ["US"],
  "dude-ranch-wrangler": ["US"],
  "residential-summer-camp-counselor": ["US"],
  "agricultural-harvest-seasonal": ["US"],
  "ski-patrol-seasonal": ["US"],
  "ski-resort-seasonal": ["US"],
  "traveling-carnival-worker": ["US"],
  "whitewater-raft-guide": ["US"],
  "carnegie-gaither-junior-fellows": ["US"],
  "emerson-national-hunger-fellows": ["US"],
  "scoville-peace-fellowship": ["US"],
  "coro-fellows-public-affairs": ["US"],
  "jesuit-volunteer-corps": ["US"],
  "catholic-volunteer-network-programs": ["US"],
  "minnesota-reading-corps-math-corps": ["US"],
  "venture-for-america": ["US"],
  "student-conservation-association": ["US"],
  "american-conservation-experience": ["US"],
  "southeast-conservation-corps": ["US"],
  "dynamy-internship-year": ["US"],
  "middlebury-language-schools-summer": ["US"],
  "hmi-gap": ["US"],
  "nols-semester-rockies": ["US"],
  "kroka-full-circle-semester": ["US"],
  "civicorps": ["US"],
  "earthcorps": ["US"],
  "northwest-youth-corps": ["US"],
  "rocky-mountain-youth-corps": ["US"],
  "mile-high-youth-corps": ["US"],
  "wiscorps": ["US"],
  "pg-year-boarding-school": ["US"],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Longest names first, so "Papua New Guinea" is consumed before "Guinea" and
// "Dominican Republic" before "Dominica".
const COUNTRY_PATTERNS: { code: string; re: RegExp; len: number }[] = Object.entries(COUNTRY_NAMES)
  .flatMap(([code, names]) => [...names, ...(EXTRA[code] ?? [])].map((n) => ({ code, n })))
  .concat(Object.entries(EXTRA).flatMap(([code, names]) => (COUNTRY_NAMES[code] ? [] : names.map((n) => ({ code, n })))))
  .map(({ code, n }) => ({
    code,
    // Case-sensitive on purpose: locations capitalise place names, and it
    // stops "chad" or "jordan" in lower-case prose from matching.
    re: new RegExp(`(?<![\\p{L}])${escape(n)}(?![\\p{L}])`, "u"),
    len: n.length,
  }))
  .sort((a, b) => b.len - a.len);

const STATE_NAMES = Object.values(US_STATES).sort((a, b) => b.length - a.length);

function blank(text: string, re: RegExp): string {
  return text.replace(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"), (m) => " ".repeat(m.length));
}

/** Countries named in a piece of free text, as ISO alpha-2 codes. */
export function countriesInText(input: string, opts: { stateCodes?: boolean } = {}): string[] {
  let text = input;
  const found = new Set<string>();

  // Georgia first. In this catalog it is a US state everywhere except one
  // entry that says "Georgia (country; ...)".
  if (/Georgia\s*\(country/i.test(text) || /\bTbilisi\b/.test(text)) {
    found.add("GE");
    text = blank(text, /Georgia/);
  }

  // US state names next, and blank them out, so "New Mexico" can never
  // become Mexico and "New Jersey" never becomes Jersey.
  for (const state of STATE_NAMES) {
    const re = new RegExp(`(?<![\\p{L}])${escape(state)}(?![\\p{L}])`, "u");
    if (re.test(text)) {
      found.add("US");
      text = blank(text, re);
    }
  }

  for (const phrase of US_PHRASES) {
    if (text.includes(phrase)) {
      found.add("US");
      text = text.split(phrase).join(" ".repeat(phrase.length));
    }
  }

  // "US" as a standalone capitalised token: "US-Flag", "(US)", "US wilderness".
  // Not when it describes who applies rather than where you go — "Fulbright
  // Austria US Teaching Assistantship", "destinations for US citizens" and
  // "popular for US holders" were all being placed in the United States.
  if (/(?<![A-Za-z])US(?![A-Za-z])(?!\s+(?:citizens?|holders?|passports?|nationals?|Teaching|Student))/.test(text)) {
    found.add("US");
  }

  // "UK" as a destination, in location text only. Not "UK-based" or
  // "UK-originated", which describe an operator's home rather than a place
  // you would be sent — the reason UK is absent from the name table.
  if (opts.stateCodes && /(?<!based in )(?<![A-Za-z])UK(?![A-Za-z-])/.test(text)) found.add("GB");

  // Two-letter postal codes only in location text, where "Lander, WY" is
  // common. Program names are full of acronyms that would collide.
  if (opts.stateCodes) {
    const codes = Object.keys(US_STATES).join("|");
    if (new RegExp(`(?<![A-Za-z])(${codes})(?![A-Za-z])`).test(text)) found.add("US");
  }

  for (const { code, re } of COUNTRY_PATTERNS) {
    if (re.test(text)) {
      found.add(code);
      text = blank(text, re);
    }
  }

  if (found.size === 0 && WEAK_US.some((w) => text.includes(w))) found.add("US");

  return [...found].sort();
}

/** Where a program can be done. Empty means worldwide, at sea, or unknown. */
export function programCountries(p: { slug: string; name: string; location: string | null }): string[] {
  if (IDENTITY[p.slug]) return IDENTITY[p.slug];
  const fromLocation = p.location ? countriesInText(p.location, { stateCodes: true }) : [];
  if (fromLocation.length) return fromLocation;
  return countriesInText(p.name);
}

// The ISO short names are sometimes unusable in a UI ("Korea, Republic of")
// or too terse ("UK"). These are what people actually say.
const DISPLAY: Record<string, string> = {
  US: "United States", GB: "United Kingdom", KR: "South Korea", KP: "North Korea",
  RU: "Russia", IR: "Iran", SY: "Syria", LA: "Laos", VN: "Vietnam", TW: "Taiwan",
  TZ: "Tanzania", BO: "Bolivia", VE: "Venezuela", MD: "Moldova", CZ: "Czechia",
  CD: "DR Congo", CG: "Congo", CI: "Côte d'Ivoire", MK: "North Macedonia",
  PS: "Palestine", AQ: "Antarctica", GE: "Georgia", CN: "China",
};

export function countryName(code: string, fallback?: string): string {
  return DISPLAY[code] ?? COUNTRY_NAMES[code]?.[0] ?? fallback ?? code;
}
