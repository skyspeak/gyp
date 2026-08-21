// Hand-entered seed data. Figures sourced from program spec + operator sites,
// cross-checked against a live web research pass on 2026-08-16. Every deadline
// and pay figure must still be re-confirmed by a human (see review_queue /
// confirmed_by) before being trusted long-term — this file is a strong first
// pass, not a permanent source of truth.
//
// Two programs from the original spec list were deliberately omitted:
// - Princeton Bridge Year: covers costs (need-based) but pays no flat
//   stipend/wage, which conflicts with the site's core "pays the
//   participant" rule.
// - Tufts 1+4 Bridge Year: confirmed paused/on hiatus since the COVID-19
//   disruption with no announced restart date, per Tufts' own program page.

export type SeedDeadline = {
  cycle_label: string;
  kind: "national" | "campus" | "intent_to_apply" | "opens" | "rolling";
  due_at: string | null; // ISO8601 with offset
  source_tz: string | null;
  note: string | null;
};

export type Category =
  | "service"
  | "conservation"
  | "teaching_abroad"
  | "research"
  | "health"
  | "trades"
  | "outdoor"
  | "travel_study"
  | "work";

// Which way the money flows. The directory routes only toward participant_earns.
// participant_pays rows are indexed for comparison and never recommended or sold;
// we take no commission on any row, in either direction.
export type MoneyDirection = "participant_earns" | "net_neutral" | "participant_pays";

export type SeedProgram = {
  slug: string;
  name: string;
  operator: string;
  category: Category;
  summary: string;
  source_url: string;
  degree_required: 0 | 1;
  money_direction: MoneyDirection;
  stage?: "post_hs" | "post_undergrad" | "both" | null;
  min_age: number | null;
  max_age: number | null;
  citizenship: "us_citizen" | "us_citizen_or_lpr" | "any" | null;
  us_eligible?: 0 | 1; // 0 = Americans cannot use this. Kept and labelled on purpose.
  other_eligibility: string | null;
  selectivity?: "open" | "moderate" | "selective" | "highly_competitive" | "quota_limited" | null;
  pay_type: "hourly" | "weekly" | "monthly" | "annual" | "stipend_total" | "none";
  pay_low: number | null; // minor units: cents for USD/EUR, whole units for zero-decimal currencies (e.g. JPY)
  pay_high: number | null;
  pay_currency?: string; // ISO 4217, defaults to USD
  pay_note: string | null;
  cost_low?: number | null; // cents the participant pays out of pocket
  cost_high?: number | null;
  cost_note?: string | null; // must state what the headline fee EXCLUDES
  housing_provided: 0 | 1;
  meals_provided?: 0 | 1;
  airfare_covered: 0 | 1;
  education_award: number | null; // cents
  term_min_weeks: number | null;
  term_max_weeks: number | null;
  college_credit_note?: string | null;
  caveat_note?: string | null;
  referral_note?: string | null;
  location?: string | null;
  provenance?: "hand_verified" | "research_agent" | "bulk_import"; // visa/legal reality, operator finances, marketing-vs-reality
  funding_status: "active" | "at_risk" | "paused" | "defunded";
  funding_note: string | null;
  deadlines: SeedDeadline[];
  fallback_slugs?: string[];
};

const TZ_ET = "America/New_York";
const TZ_PT = "America/Los_Angeles";
const TZ_MT = "America/Denver";
const TZ_CT = "America/Chicago";

const AMERICORPS_TURMOIL_NOTE =
  "AmeriCorps-affiliated. Spring 2025 saw ~$400M in grant terminations and mass layoffs, reversed by federal court injunctions by June 2025. During the Oct–Nov 2025 government shutdown, member stipends at several AmeriCorps programs accrued but went temporarily unpaid. Currently active and recruiting as of Aug 2026, but funding remains more fragile than pre-2025.";

export const CORE_PROGRAMS: SeedProgram[] = [
  // ==================== degree_required = 1 ====================
  {
    slug: "fulbright-eta",
    name: "Fulbright U.S. Student Program — English Teaching Assistant (ETA) Awards",
    operator: "U.S. Department of State / Institute of International Education (Fulbright Program)",
    category: "teaching_abroad",
    summary:
      "Places U.S. citizens as English teaching assistants in schools abroad for roughly an academic year, with a grant/stipend set independently by each host country. Enrolled students apply through their campus Fulbright Program Adviser; alumni apply At-Large.",
    source_url: "https://us.fulbrightonline.org/applicants/types-of-awards/english-teaching-assistant-awards",
    degree_required: 1,
    money_direction: "participant_earns",
    min_age: null,
    max_age: null,
    citizenship: "us_citizen",
    other_eligibility:
      "Must hold a bachelor's degree by the start of the grant (or complete one before departure). May apply to only one country per cycle; host-country language proficiency requirements vary from none to advanced.",
    pay_type: "monthly",
    pay_low: null,
    pay_high: null,
    pay_note:
      "Grant/stipend amount is set independently by each host country/Fulbright Commission and varies widely by placement (e.g. Taiwan ETAs receive roughly NT$43,000–53,000/month); no single centrally published USD figure exists.",
    housing_provided: 0,
    airfare_covered: 1,
    education_award: null,
    term_min_weeks: 36,
    term_max_weeks: 48,
    funding_status: "at_risk",
    funding_note:
      "The FY2026 White House budget proposed eliminating Fulbright funding entirely (a 93% cut to the Bureau of Educational and Cultural Affairs). House appropriators rejected this and approved roughly $287M (near FY25 levels) in a July 2025 markup, but the bill had not completed the full legislative process as of this check. A substantial number of already-selected 2025-26 ETA candidates also received late rejection letters. Treat as currently operating but politically at-risk heading into FY2027.",
    deadlines: [
      { cycle_label: "2027-28", kind: "intent_to_apply", due_at: null, source_tz: TZ_ET, note: "Set by each campus Fulbright Program Adviser, typically several weeks before the campus deadline" },
      { cycle_label: "2027-28", kind: "campus", due_at: null, source_tz: TZ_ET, note: "Campus deadlines are set by each institution's Fulbright Program Adviser, typically mid-September" },
      { cycle_label: "2027-28", kind: "national", due_at: "2026-10-06T17:00:00-04:00", source_tz: TZ_ET, note: "At-Large (non-enrolled/alumni) national deadline; enrolled students go through their campus deadline instead" },
    ],
  },
  {
    slug: "tapif",
    name: "Teaching Assistant Program in France (TAPIF)",
    operator: "French Ministry of Education, via Villa Albertine / French Embassy Cultural Services",
    category: "teaching_abroad",
    summary:
      "Places U.S. citizens and permanent residents as English teaching assistants in French primary and secondary schools for a 7-month contract (October–April), paying a monthly stipend. Requires B1-level French and at least two years of higher education.",
    source_url: "https://www.tapif.org/",
    degree_required: 1,
    money_direction: "participant_earns",
    min_age: 20,
    max_age: 35,
    citizenship: "us_citizen_or_lpr",
    other_eligibility:
      "Actual academic bar is at least two years of higher education completed — not necessarily a finished bachelor's degree, though it's grouped here with the degree-required cohort. Requires intermediate (B1) French proficiency.",
    pay_type: "monthly",
    pay_low: 101067,
    pay_high: 136440,
    pay_currency: "EUR",
    pay_note: "€1,010.67/month gross (~€810 net) in mainland France; assistants placed in French overseas departments (DOM) receive roughly 30-35% more",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 28,
    term_max_weeks: 30,
    funding_status: "active",
    funding_note: null,
    deadlines: [
      { cycle_label: "2027-28", kind: "opens", due_at: null, source_tz: "Europe/Paris", note: "Applications for the following cohort typically open late October/early November; exact 2027-28 dates not yet published as of Aug 2026" },
    ],
  },
  {
    slug: "jet-alt",
    name: "JET Programme — Assistant Language Teacher (ALT)",
    operator: "Japan Exchange and Teaching (JET) Programme (CLAIR / Japanese government), via JET Program USA",
    category: "teaching_abroad",
    summary:
      "Places U.S. university graduates as Assistant Language Teachers in Japanese public schools on a one-year contract, renewable up to five years, with a set annual salary, airfare, and visa sponsorship. No Japanese language ability required for the ALT track.",
    source_url: "https://jetprogramusa.org/contract-information/",
    degree_required: 1,
    money_direction: "participant_earns",
    min_age: null,
    max_age: null,
    citizenship: "us_citizen",
    other_eligibility:
      "Must hold at least a bachelor's degree (or complete one by roughly late June before departure); junior/associate's degrees do not qualify. Native-level English proficiency required. Cannot have lived in Japan 6+ years total within the prior 10 years.",
    pay_type: "annual",
    pay_low: 4020000,
    pay_high: 4320000,
    pay_currency: "JPY",
    pay_note: "Year 1: ¥4,020,000; Year 2: ¥4,140,000; Year 3: ¥4,260,000; Years 4-5: ¥4,320,000 (rates effective April 2025), before tax",
    housing_provided: 0,
    airfare_covered: 1,
    education_award: null,
    term_min_weeks: 48,
    term_max_weeks: 260,
    funding_status: "active",
    funding_note: null,
    deadlines: [
      { cycle_label: "2027", kind: "opens", due_at: null, source_tz: TZ_ET, note: "2027 Programme application typically opens late September 2026, closing mid-November; exact dates not yet published as of Aug 2026" },
    ],
  },
  {
    slug: "nih-postbac-irta",
    name: "NIH Postbaccalaureate Intramural Research Training Award (IRTA)",
    operator: "National Institutes of Health (NIH), Office of Intramural Training & Education",
    category: "research",
    summary:
      "One- to two-year, full-time paid research position at NIH intramural labs for recent bachelor's-degree graduates planning to apply to grad or med school. Explicitly designed to let students defer graduate school matriculation, hired individually by NIH labs on a rolling basis.",
    source_url: "https://www.training.nih.gov/programs/postbac_irta",
    degree_required: 1,
    money_direction: "participant_earns",
    min_age: null,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility:
      "Must have received a bachelor's degree less than 3 years before the program start date (or a master's degree less than 6 months before starting, if further out from the bachelor's).",
    pay_type: "annual",
    pay_low: 4610000,
    pay_high: 5930000,
    pay_note: "Unified NIH stipend chart effective Oct 1, 2024: Year 1 (0-1 yr research experience) $46,100; Year 2 $55,400; Year 3 $57,300; Years 4-5 $59,300",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 52,
    term_max_weeks: 104,
    funding_status: "active",
    funding_note: null,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: null, note: "No single national deadline; individual NIH labs/institutes recruit and hire on a rolling basis year-round" },
    ],
  },
  {
    slug: "peace-corps",
    name: "Peace Corps",
    operator: "Peace Corps (U.S. federal agency)",
    category: "service",
    summary:
      "27-month international service program (3 months training plus 24 months service) open to U.S. citizens 18 and older. Volunteers receive a country-specific living allowance, full housing, medical/dental care, and a $10,000 readjustment allowance upon completion.",
    source_url: "https://www.peacecorps.gov/volunteer/eligibility/",
    degree_required: 1,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: null,
    citizenship: "us_citizen",
    other_eligibility:
      "Many assignments accept 2-4 years of relevant work/life experience in lieu of a bachelor's degree, though most standard assignments prefer or require one; specialized roles (medical, some technical tracks) require a degree. The shorter Peace Corps Response track (6-12 months) generally requires a bachelor's degree plus 2-5 years of professional experience.",
    pay_type: "stipend_total",
    pay_low: 1000000,
    pay_high: 1000000,
    pay_note:
      "$10,000 pre-tax readjustment allowance paid at completion of a standard 27-month term. Volunteers also receive an in-country monthly living allowance (food/transport/incidentals) that varies by country and isn't published as one USD figure; housing is separately provided.",
    housing_provided: 1,
    airfare_covered: 1,
    education_award: null,
    term_min_weeks: 117,
    term_max_weeks: 117,
    funding_status: "active",
    funding_note:
      "FY2026 congressional appropriations cut Peace Corps funding by roughly $20M (~5% nominal reduction), continuing a longer real-terms decline since FY2015. Volunteers already in the field served uninterrupted through the Oct-Nov 2025 shutdown, funded from carryover balances; no blanket suspension as of Aug 2026.",
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: null, note: "Rolling admissions; applicants typically apply 9-12 months before a desired departure date" },
    ],
  },

  // ==================== degree_required = 0 ====================
  {
    slug: "americorps-nccc",
    name: "AmeriCorps NCCC (National Civilian Community Corps)",
    operator: "AmeriCorps (U.S. federal agency)",
    category: "service",
    summary:
      "Team-based, residential national service program for young adults 18-24 (Team Leaders 18+), serving a 10-month term on disaster response, conservation, and community-development projects nationwide. Members receive a living allowance, room and board, and a Segal Education Award.",
    source_url: "https://www.americorps.gov/serve/americorps/americorps-nccc",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 24,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Team Leaders may apply at 18+ with no upper age limit. Must complete 1,700 hours over the 10-month term, including 80 hours of independent service.",
    pay_type: "weekly",
    pay_low: 9100,
    pay_high: 9100,
    pay_note: "Living allowance computed at roughly $13/day (~$91/week), paid biweekly; room and board separately provided",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: 619500,
    term_min_weeks: 43,
    term_max_weeks: 43,
    funding_status: "active",
    funding_note:
      "NCCC was abruptly demobilized in April 2025 (members sent home, ~$400M in AmeriCorps grants terminated agency-wide) amid a lawsuit by 24 states and AFSCME; a June 2025 preliminary injunction ordered funding and operations restored, and 1,000+ affected programs had grants retroactively validated. AmeriCorps published a 2026-27 NCCC RFP and was actively recruiting as of Aug 2026. FY26 Senate marks hold roughly level funding, but stipends accrued unpaid during the Oct-Nov 2025 shutdown — treat as recovering but still fragile.",
    deadlines: [
      { cycle_label: "2026-27", kind: "rolling", due_at: null, source_tz: TZ_ET, note: "Individual member applications accepted on a rolling basis" },
    ],
    fallback_slugs: ["student-conservation-association", "conservation-legacy"],
  },
  {
    slug: "americorps-vista",
    name: "AmeriCorps VISTA",
    operator: "AmeriCorps (U.S. federal agency)",
    category: "service",
    summary:
      "Full-time, one-year individual-placement anti-poverty service program in which members build capacity at nonprofits and public agencies, from thousands of individual site postings under one national program. Living allowance plus a Segal Education Award or cash stipend at completion.",
    source_url: "https://www.americorps.gov/members-volunteers/vista/benefits",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: null,
    pay_type: "annual",
    pay_low: 2040000,
    pay_high: 4080000,
    pay_note: "FY2026 living allowance range for full-time members ($20,400–$40,800), set to local poverty-line-based rates and varying by service location, paid biweekly",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: 619500,
    term_min_weeks: 52,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note:
      "During the Oct 1–Nov 12, 2025 government shutdown, roughly 3,000 VISTA members continued serving with living-allowance payments delayed rather than paid in real time, producing acute reported financial hardship. Operating and recruiting as of Aug 2026, but funding stability remains more fragile than pre-2025 given repeated FY26 shutdowns (Oct-Nov 2025, Jan-Feb 2026, a Feb-Apr 2026 DHS-only lapse).",
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: null, note: "Each site listing sets its own start date and application window" },
    ],
    fallback_slugs: ["city-year"],
  },
  {
    slug: "conservation-legacy",
    name: "Conservation Legacy (Arizona Conservation Corps / Southwest Conservation Corps)",
    operator: "Conservation Legacy",
    category: "conservation",
    summary:
      "Umbrella nonprofit running regional conservation corps — including Arizona Conservation Corps and Southwest Conservation Corps — offering crew-based and individual-placement conservation service, mostly structured as AmeriCorps positions with a living stipend and education award.",
    source_url: "https://conservationlegacy.org/programs",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Exact age ceiling and eligibility vary by specific sub-program (crew-based vs. individual placement vs. veteran-focused tracks)",
    pay_type: "weekly",
    pay_low: 40000,
    pay_high: 60000,
    pay_note: "Based on a recently observed Arizona/Southwest Conservation Corps crew listing (~$400/wk living stipend plus ~$200/wk housing stipend); varies substantially by sub-program",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 12,
    term_max_weeks: 44,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_MT, note: "Positions posted and filled on a rolling, seasonal basis across sub-programs" },
    ],
  },
  {
    slug: "student-conservation-association",
    name: "Student Conservation Association (SCA)",
    operator: "The Student Conservation Association",
    category: "conservation",
    summary:
      "National nonprofit placing young people in conservation internships and AmeriCorps crew positions on public lands. Most positions include a subsistence living allowance, a $650 one-time travel allowance, and free housing, with many roles earning a Segal Education Award.",
    source_url: "https://thesca.org/sca-and-americorps",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 17,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Requires a high school diploma/equivalency (or agreement to obtain one before using any education award). Must pass an FBI fingerprint and criminal-history review. Maximum of 3 prior AmeriCorps terms.",
    pay_type: "weekly",
    pay_low: null,
    pay_high: null,
    pay_note: "$650 one-time travel allowance plus a weekly subsistence/living allowance; the living-allowance dollar amount isn't published as a single figure and varies by position",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 3,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_ET, note: "Rolling, position-by-position application deadlines" },
    ],
  },
  {
    slug: "american-conservation-experience",
    name: "American Conservation Experience (ACE)",
    operator: "American Conservation Experience",
    category: "conservation",
    summary:
      "Nonprofit conservation corps running AmeriCorps crew and individual-placement programs on public lands nationwide. Members receive a taxable weekly living stipend, free housing during their term, and — for AmeriCorps-affiliated positions — a Segal Education Award.",
    source_url: "https://www.usaconservation.org/conservation-crew/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 17,
    max_age: 35,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Requires a high school diploma/equivalent (or agreement to obtain one). Standard age range extends to 35 for military veterans. Only a subset of positions are AmeriCorps-affiliated — check each listing.",
    pay_type: "weekly",
    pay_low: 24000,
    pay_high: 32000,
    pay_note: "Living stipend varies by position/location, roughly $240-$320/week; taxable",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 12,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: "America/Phoenix", note: "Rolling, position-by-position application deadlines" },
    ],
  },
  {
    slug: "city-year",
    name: "City Year",
    operator: "City Year, Inc. (AmeriCorps program)",
    category: "service",
    summary:
      "Full-time, year-long AmeriCorps tutoring and mentoring program placing young adults in under-resourced K-12 schools across roughly 29 U.S. city sites. Members receive a biweekly living stipend, health coverage, and a Segal Education Award.",
    source_url: "https://www.cityyear.org/experience/benefits-resources/compensation/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 25,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Typical age range 18-25 (exceptions for team/staff leadership roles); requires a high school diploma or GED",
    pay_type: "weekly",
    pay_low: 45350,
    pay_high: 69300,
    pay_note: "Reported as $907-$1,386 paid biweekly depending on site cost-of-living",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: 619500,
    term_min_weeks: 44,
    term_max_weeks: 46,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "2026-27", kind: "rolling", due_at: null, source_tz: TZ_ET, note: "Rolling admissions with several application rounds per year rather than one fixed national deadline" },
    ],
  },
  {
    slug: "year-up",
    name: "Year Up United",
    operator: "Year Up United",
    category: "trades",
    summary:
      "One-year workforce-development program combining about six months of technical/professional-skills training with a six-month paid internship at a partner company. Open to young adults 18-29 with a high school diploma or equivalent; no bachelor's degree required.",
    source_url: "https://www.yearup.org/students/how-it-works",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 29,
    citizenship: "any",
    other_eligibility: "Must have a high school diploma or equivalent and U.S. work authorization; not currently enrolled in a 4-year degree program",
    pay_type: "weekly",
    pay_low: 15000,
    pay_high: 22000,
    pay_note: "$150/week during the ~6-month learning/training phase; $220/week during the ~6-month paid internship phase. Varies by site",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 48,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note: null,
    deadlines: [
      { cycle_label: "2027", kind: "rolling", due_at: null, source_tz: TZ_ET, note: "Multiple cohort start dates per year across roughly 20 U.S. sites" },
    ],
  },
  {
    slug: "unc-global-gap-year-fellowship",
    name: "UNC Global Gap Year Fellowship",
    operator: "University of North Carolina at Chapel Hill (Campus Y / Global Programs)",
    category: "service",
    summary:
      "An $8,000 stipend fellowship for admitted UNC-Chapel Hill first-years (via the Early Action deadline) to pursue a self-designed gap year of travel, service, or work before enrolling. A related Bridge Year Fellowship offers a similar award to a small cohort of current sophomores.",
    source_url: "https://globalgap.unc.edu/global-gap-year-fellowship/application/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: null,
    citizenship: "any",
    other_eligibility:
      "Deferred-admission program for incoming UNC-Chapel Hill first-years admitted via Early Action — not a post-degree program. Applicant must be at least 18 at time of international departure.",
    pay_type: "stipend_total",
    pay_low: 800000,
    pay_high: 800000,
    pay_note: "$8,000 stipend toward gap-year-related expenses; also includes travel insurance and vaccine coverage",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 36,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note: null,
    deadlines: [
      { cycle_label: "2026-27", kind: "campus", due_at: "2025-10-15T23:59:00-04:00", source_tz: TZ_ET, note: "Early Action deadline for the most recently confirmed cohort (already passed). UNC's EA deadline is typically Oct 15 annually — confirm the following cycle's date directly." },
    ],
  },
  {
    slug: "foodcorps",
    name: "FoodCorps",
    operator: "FoodCorps (AmeriCorps program)",
    category: "service",
    summary:
      "AmeriCorps national service program placing members in schools to teach nutrition education and strengthen school food systems over an 11-month term. FoodCorps pays the maximum living stipend allowable for an AmeriCorps grantee.",
    source_url: "https://foodcorps.org/why-foodcorps-is-paying-our-corps-members-the-maximum-stipend-allowed-by-americorps/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: null,
    pay_type: "stipend_total",
    pay_low: 3300000,
    pay_high: 3300000,
    pay_note: "$33,000 total living stipend for a full 11-month term — the maximum stipend allowable for an AmeriCorps grantee, applied regardless of member location",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 44,
    term_max_weeks: 48,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "2026-27", kind: "rolling", due_at: null, source_tz: TZ_ET, note: "Applications generally open earlier in the year for an autumn start; exact dates vary by year" },
    ],
  },
  {
    slug: "national-health-corps-philadelphia",
    name: "National Health Corps (Philadelphia)",
    operator: "Public Health Management Corporation (PHMC) / National Health Corps",
    category: "health",
    summary:
      "AmeriCorps program placing members in full-time community-health roles at Philadelphia-area health organizations for a year of service, with a living stipend and Segal Education Award.",
    source_url: "https://www.nationalhealthcorps.org/serve/chf",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Requires a high school diploma or GED by the start of service; applicants must not have completed more than 4 prior AmeriCorps State/National terms",
    pay_type: "weekly",
    pay_low: null,
    pay_high: null,
    pay_note: "Living stipend confirmed but no NHC-specific published figure found; comparable Philadelphia AmeriCorps VISTA positions report biweekly stipends around $878-$1,050 (not NHC-specific)",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 44,
    term_max_weeks: 48,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_ET, note: null },
    ],
  },
  {
    slug: "california-conservation-corps",
    name: "California Conservation Corps (CCC)",
    operator: "State of California, California Conservation Corps",
    category: "conservation",
    summary:
      "State-run, year-long residential conservation corps for California young adults ages 18-25, providing paid work experience on environmental and emergency-response projects with a monthly stipend plus room and board.",
    source_url: "https://ccc.ca.gov/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 25,
    citizenship: "any",
    other_eligibility: "Must be a California resident; must not be on probation or parole",
    pay_type: "monthly",
    pay_low: 281000,
    pay_high: 281000,
    pay_note: "Monthly stipend of $2,810 as of Nov 2025, paid once a month. State-funded, not AmeriCorps — no automatic Segal Education Award, though some may be available through partner programs",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 48,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note: null,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_PT, note: "Rolling admissions at residential and satellite centers statewide" },
    ],
  },
  {
    slug: "washington-conservation-corps",
    name: "Washington Conservation Corps (WCC)",
    operator: "Washington State Department of Ecology",
    category: "conservation",
    summary:
      "State-run AmeriCorps conservation corps for young adults 18-25 (plus veterans and people with disabilities of any age), running roughly October-September crews on environmental restoration statewide. Living allowance, health insurance, and a Segal Education Award.",
    source_url: "https://ecology.wa.gov/about-us/jobs-at-ecology/washington-conservation-corps/join-wcc",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 25,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "No upper age limit for military veterans or people with mental/sensory disabilities",
    pay_type: "monthly",
    pay_low: 295200,
    pay_high: 321800,
    pay_note: "$1,476 issued twice monthly (~$2,952/mo) in most counties; $1,609 twice monthly (~$3,218/mo) in King, Snohomish, and Clark counties",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: 619500,
    term_min_weeks: 49,
    term_max_weeks: 49,
    funding_status: "active",
    funding_note: "AmeriCorps awarded WCC a $4.4M grant for the 2026-27 service year; statewide recruitment opened in July 2026, indicating funding is currently secure for this term.",
    deadlines: [
      { cycle_label: "2026-27", kind: "opens", due_at: "2026-10-05T00:00:00-07:00", source_tz: TZ_PT, note: "2026-27 term runs Oct 5, 2026 – Sept 15, 2027" },
    ],
  },
  {
    slug: "montana-conservation-corps",
    name: "Montana Conservation Corps (MCC)",
    operator: "Montana Conservation Corps",
    category: "conservation",
    summary:
      "Regional AmeriCorps conservation corps offering crew-based (17-30), youth-leader (21-35), and individual-placement intern/fellow (18+) programs across Montana, each with a biweekly living stipend and Segal Education Award.",
    source_url: "https://www.mtcorps.org/joinmcc/join-mcc-today.html",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 17,
    max_age: 35,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Age range varies by track: Adult Crew Members 17-30 (to 35 for veterans); Youth Program Leaders 21-35; Individual Placement interns/fellows 18+",
    pay_type: "weekly",
    pay_low: 58000,
    pay_high: 68000,
    pay_note: "Converted from biweekly rates: Adult Crew ~$600/wk, Youth Program Leaders ~$680/wk, Interns/Fellows ~$580/wk, all before tax",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: 369750,
    term_min_weeks: 10,
    term_max_weeks: 26,
    funding_status: "active",
    funding_note: "2026-season Crew Member positions were reported closed/full at time of research (normal seasonal cycling); 2027 openings not yet posted.",
    deadlines: [
      { cycle_label: "2026 season", kind: "rolling", due_at: null, source_tz: TZ_MT, note: "Sign up for notifications on 2027 openings; 2026 Crew Member positions were reported full" },
    ],
  },
  {
    slug: "texas-conservation-corps",
    name: "Texas Conservation Corps (American YouthWorks)",
    operator: "American YouthWorks",
    category: "conservation",
    summary:
      "AmeriCorps conservation and disaster-response corps for young people ages 16-35 in Texas, with 3-11 month terms. Members receive a weekly living allowance plus a separate housing stipend and a Segal Education Award.",
    source_url: "https://americanyouthworks.org/what-we-do/cc",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 16,
    max_age: 35,
    citizenship: "any",
    other_eligibility: "Requires U.S. work authorization and a high school diploma/GED; background check required (the program states it encourages justice-involved youth to apply)",
    pay_type: "weekly",
    pay_low: 60000,
    pay_high: 82500,
    pay_note: "$600/week living allowance plus a separate $225/week housing stipend (members arrange their own housing)",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 13,
    term_max_weeks: 48,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_CT, note: null },
    ],
  },
  {
    slug: "vermont-youth-conservation-corps",
    name: "Vermont Youth Conservation Corps (VYCC)",
    operator: "Vermont Youth Conservation Corps",
    category: "conservation",
    summary:
      "AmeriCorps conservation corps in Vermont for members 17 and older with a high school diploma/GED (or working toward one), offering a living stipend during service and a Segal Education Award on completion, under the 'SerVermont' AmeriCorps program.",
    source_url: "https://www.vycc.org/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 17,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Requires a high school diploma/GED, or must be actively working toward one",
    pay_type: "weekly",
    pay_low: null,
    pay_high: null,
    pay_note: "Confirmed living stipend and Segal Education Award; no specific published dollar figure found",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 8,
    term_max_weeks: 44,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_ET, note: null },
    ],
  },
  {
    slug: "northwest-youth-corps",
    name: "Northwest Youth Corps",
    operator: "Northwest Youth Corps",
    category: "conservation",
    summary:
      "Residential conservation corps based in Oregon serving both youth (16-19, spring/fall/leadership programs) and young adults (19+, main AmeriCorps crew programs), providing a stipend plus meals, transportation, and camping accommodations.",
    source_url: "https://www.nwyouthcorps.org/young-adult/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 16,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Main AmeriCorps programs generally for ages 19+; Spring, Fall, BLP, and ASL youth programs accept ages 16-19",
    pay_type: "stipend_total",
    pay_low: 600000,
    pay_high: 768000,
    pay_note: "Camping Crew Member: ~$6,000 total plus $1,956.35 education award. UCF Crew: ~$7,680 total plus education award. Internships: ~$7,200 total (prorated, dispersed monthly)",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: 195635,
    term_min_weeks: 10,
    term_max_weeks: 22,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_PT, note: null },
    ],
  },
  {
    slug: "conservation-corps-minnesota-iowa",
    name: "Conservation Corps Minnesota & Iowa (CCMI)",
    operator: "Conservation Corps Minnesota & Iowa",
    category: "conservation",
    summary:
      "AmeriCorps conservation corps for young adults 18-30 (to 35 for veterans) in Minnesota and Iowa, offering a monthly stipend and Segal Education Award. The organization's Summer Youth Corps track specifically is not running in 2026.",
    source_url: "https://conservationcorps.org/faqs/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 35,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Age limit extends to 35 for military veterans; background check required",
    pay_type: "monthly",
    pay_low: null,
    pay_high: null,
    pay_note: "Confirmed monthly stipend; no single organization-wide figure published, varies by position",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 12,
    term_max_weeks: 48,
    funding_status: "active",
    funding_note: `${AMERICORPS_TURMOIL_NOTE} CCMI's Summer Youth Corps track specifically is a program-specific pause in 2026, separate from the broader turmoil — other CCMI AmeriCorps programs continue running.`,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_CT, note: null },
    ],
  },
  {
    slug: "earthcorps",
    name: "EarthCorps",
    operator: "EarthCorps (Seattle, WA)",
    category: "conservation",
    summary:
      "Seattle-based AmeriCorps program combining a yearlong leadership-training track for U.S. members (18-26) with an International Corps Member track (18-28) open to non-U.S. participants, focused on urban forest and watershed restoration.",
    source_url: "https://www.earthcorps.org/join-the-corps/corps-program-faq/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 28,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "U.S. AmeriCorps track: ages 18-26. International Corps Member track: ages 18-28, open to non-U.S. participants. Requires a high school diploma/GED.",
    pay_type: "monthly",
    pay_low: 300000,
    pay_high: 300000,
    pay_note: "Living stipend of $3,000/month for the yearlong leadership program (an older listing cited $2,278/mo)",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: 649500,
    term_min_weeks: 44,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_PT, note: null },
    ],
  },
  {
    slug: "rocky-mountain-youth-corps",
    name: "Rocky Mountain Youth Corps (RMYC)",
    operator: "Rocky Mountain Youth Corps",
    category: "conservation",
    summary:
      "Residential environmental conservation and education corps based in Colorado (with related programming in New Mexico), serving youth and young adults roughly ages 16-30. Living stipend and AmeriCorps education award for qualifying terms.",
    source_url: "https://youthcorps.org/programs-and-crews/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 16,
    max_age: 30,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: "Age range varies by crew type — reported as roughly 16-30 in some program descriptions, 17-25 in others",
    pay_type: "weekly",
    pay_low: null,
    pay_high: null,
    pay_note: "Confirmed living stipend and AmeriCorps education award for qualifying terms; no specific published dollar figure found",
    housing_provided: 1,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 6,
    term_max_weeks: 24,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "2026", kind: "rolling", due_at: "2026-04-01T00:00:00-06:00", source_tz: TZ_MT, note: "An April 1 deadline was referenced for a 2026 cohort; the recurring annual pattern was not fully confirmed" },
    ],
  },
  {
    slug: "civicorps",
    name: "Civicorps",
    operator: "Civicorps (Oakland, CA)",
    category: "service",
    summary:
      "Oakland-based AmeriCorps program re-engaging young adults 18-26 to earn a high school diploma, gain job skills (including a conservation-corps track), and pursue college or careers. Monthly service stipend and Segal Education Award.",
    source_url: "https://cvcorps.org/programs/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: 26,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: null,
    pay_type: "monthly",
    pay_low: 272700,
    pay_high: 272700,
    pay_note: "$2,727/month service stipend plus up to $10,000 in cumulative education awards (that figure likely combines multiple years/awards — treat with caution)",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 44,
    term_max_weeks: 52,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "rolling", kind: "rolling", due_at: null, source_tz: TZ_PT, note: null },
    ],
  },
  {
    slug: "utah-conservation-corps",
    name: "Utah Conservation Corps (UCC)",
    operator: "Utah State University, Utah Conservation Corps",
    category: "conservation",
    summary:
      "AmeriCorps conservation corps based at Utah State University, offering field-crew and individual-placement positions for members 18 and older. Biweekly living allowance and Segal Education Award; reimburses health-insurance premiums for 1,700-hour members.",
    source_url: "https://ucc.usu.edu/",
    degree_required: 0,
    money_direction: "participant_earns",
    min_age: 18,
    max_age: null,
    citizenship: "us_citizen_or_lpr",
    other_eligibility: null,
    pay_type: "weekly",
    pay_low: null,
    pay_high: null,
    pay_note: "Confirmed biweekly living allowance (taxable); no centrally published dollar figure. Reimburses up to $100/mo in health-insurance premiums for 1,700-hour members",
    housing_provided: 0,
    airfare_covered: 0,
    education_award: null,
    term_min_weeks: 12,
    term_max_weeks: 48,
    funding_status: "active",
    funding_note: AMERICORPS_TURMOIL_NOTE,
    deadlines: [
      { cycle_label: "2026", kind: "rolling", due_at: null, source_tz: TZ_MT, note: null },
    ],
  },
];
