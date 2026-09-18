// Pages elsewhere on the web that still send people to programs that have
// shut down or stopped taking applicants, and where those programs' own
// addresses lead now. Backs the private /deadlinks page.
//
// Every referrer here was opened and read by hand on the date shown. Nothing
// is inferred from search snippets or from outreach notes: 96 rows of
// outreach/institutions.csv say "check whether this office still lists
// Payne", which is a to-do, not evidence, and counting them would have
// inflated this list twentyfold. Search also surfaced Payne pages at
// Georgetown and Boston University; both have since been removed or
// redirected, so they are not here.

export type ReferrerState =
  /** Presents the program as available, with no closure notice. */
  | "live"
  /** Has a closure notice, but the top of the page still reads as open. */
  | "buried"
  /** Marks the program closed. Kept so nobody re-checks it. */
  | "fixed";

export type Referrer = {
  site: string;
  kind: "Directory" | "University" | "High school" | "Advocacy group";
  url: string;
  /** Slugs this page still points people at. */
  programs: string[];
  says: string;
  /** Where its outbound link or call to action lands. */
  sendsTo?: string;
  state: ReferrerState;
  contact?: string;
  checkedOn: string;
  /** Per-program override, e.g. a page that is right about one program and wrong about another. */
  fixedFor?: string[];
};

export const REFERRERS: Referrer[] = [
  // Winterline
  {
    site: "College Prep Guide",
    kind: "Directory",
    url: "https://college-prep-guide.com/winterline-global-education/",
    programs: ["winterline-global-skills"],
    says: "Describes the nine-month gap year in the present tense (“Join us for a global adventure”). No closure note.",
    sendsTo: "Five links to winterline.com, which is now a domain brokerage",
    state: "live",
    checkedOn: "2026-09-17",
  },
  {
    site: "College Prep Guide — gap year programs guide",
    kind: "Directory",
    url: "https://college-prep-guide.com/gap-year-programs-expert-guide/",
    programs: ["winterline-global-skills", "thinking-beyond-borders"],
    says: "Lists Winterline and Thinking Beyond Borders among the programs to consider.",
    sendsTo: "Its own Winterline and TBB profiles, both of which present them as open",
    state: "live",
    checkedOn: "2026-09-17",
  },
  {
    site: "One World 365",
    kind: "Directory",
    url: "https://www.oneworld365.org/company/winterline-global-education",
    programs: ["winterline-global-skills"],
    says: "Present-tense company listing (“Whether you spend a semester or a week on a Winterline program…”).",
    sendsTo: "An on-page Enquiry form, for a company that no longer runs programs",
    state: "live",
    checkedOn: "2026-09-17",
  },
  {
    site: "Go Overseas — Winterline program page",
    kind: "Directory",
    url: "https://www.gooverseas.com/gap-year/multiple-countries/winterline-global-education/67179",
    programs: ["winterline-global-skills"],
    says: "Opens with ratings, “77 travelers are looking at this program” and a Learn More button. The “no longer in operation” note is further down.",
    state: "buried",
    checkedOn: "2026-09-17",
  },
  {
    site: "High school gap year handout (PDF)",
    kind: "High school",
    url: "https://core-docs.s3.us-east-1.amazonaws.com/documents/asset/uploaded_file/4900/HPS/4490325/GAP_YEAR_INFORMATION.pdf",
    programs: ["winterline-global-skills", "thinking-beyond-borders"],
    says: "A 15-page counseling handout hosted on a school-website CDN (school code HPS). Lists Winterline and Thinking Beyond Borders as options, with phone numbers.",
    sendsTo: "www.winterline.com, info@winterline.com and thinkingbeyondborders.org",
    state: "live",
    checkedOn: "2026-09-17",
  },

  // Thinking Beyond Borders
  {
    site: "College Prep Guide",
    kind: "Directory",
    url: "https://college-prep-guide.com/thinking-beyond-borders/",
    programs: ["thinking-beyond-borders"],
    says: "“TBB offers two programs: a global gap year and a Latin America gap semester.” No closure note.",
    sendsTo: "Three links to thinkingbeyondborders.org, which returns 404",
    state: "live",
    checkedOn: "2026-09-17",
  },
  {
    site: "Go Overseas",
    kind: "Directory",
    url: "https://www.gooverseas.com/organization/thinking-beyond-borders-reviews",
    programs: ["thinking-beyond-borders"],
    says: "Marked “expired … no longer offered”, but still shows a 4.96 rating from 78 reviews.",
    sendsTo: "A Website link to thinkingbeyondborders.org, which returns 404",
    state: "fixed",
    checkedOn: "2026-09-17",
  },

  // Frontier
  {
    site: "Volunteer Forever",
    kind: "Directory",
    url: "https://www.volunteerforever.com/program/frontier/",
    programs: ["frontier-gap-year"],
    says: "“Frontier has over 400 projects in countries throughout Africa, South America…” One review on the page says the company no longer exists; the listing itself does not.",
    sendsTo: "A “Visit Frontier’s website” prompt. frontier.ac.uk no longer resolves",
    state: "live",
    checkedOn: "2026-09-17",
  },
  {
    site: "Volunteer World",
    kind: "Directory",
    url: "https://www.volunteerworld.com/en/review/frontier",
    programs: ["frontier-gap-year"],
    says: "Titled “Frontier | Volunteer Abroad 2026”. Profile and reviews with no closure notice, though no booking button.",
    state: "live",
    checkedOn: "2026-09-17",
  },
  {
    site: "Go Overseas",
    kind: "Directory",
    url: "https://www.gooverseas.com/organization/frontier-reviews",
    programs: ["frontier-gap-year"],
    says: "Marked “expired and its programs are no longer offered”.",
    state: "fixed",
    checkedOn: "2026-09-17",
  },
  {
    site: "Best Gap Year",
    kind: "Directory",
    url: "https://www.bestgapyear.co.uk/400/Volunteering-and-Internship-Placements-Worldwide.php",
    programs: ["frontier-gap-year"],
    says: "“Sorry, this Gap Year is not currently available.”",
    state: "fixed",
    checkedOn: "2026-09-17",
  },

  // American Climate Corps
  {
    site: "Moms Clean Air Force",
    kind: "Advocacy group",
    url: "https://www.momscleanairforce.org/american-climate-corps-apply-now/",
    programs: ["american-climate-corps"],
    says: "“Apply Now for Green Youth Jobs Galore” (April 2024). No note that the federal program was revoked in January 2025.",
    sendsTo: "acc.gov/join, which no longer resolves",
    state: "live",
    checkedOn: "2026-09-17",
  },

  // State Department and USAID fellowships — from outreach/institutions.csv,
  // tier 1, the only rows there that were actually opened.
  {
    site: "University of Maryland — National Scholarships Office",
    kind: "University",
    url: "https://scholarships.umd.edu/payne",
    programs: ["payne-fellowship"],
    says: "Presents Payne as open, with a national deadline of Oct 24, 2024.",
    state: "live",
    contact: "scholarships@umd.edu",
    checkedOn: "2026-09-15",
  },
  {
    site: "University of Miami — Prestigious Awards and Fellowships",
    kind: "University",
    url: "https://oae.miami.edu/prestigious-awards-and-fellowships/search-scholarship-listings/payne.html",
    programs: ["payne-fellowship"],
    says: "“Deadline: November, 2023” and “Apply directly through the Payne website”.",
    sendsTo: "“The Payne website”. paynefellows.org is now a parked page",
    state: "live",
    contact: "prestigiousawards@miami.edu",
    checkedOn: "2026-09-15",
  },
  {
    site: "University of Missouri — Global and National Fellowships",
    kind: "University",
    url: "https://fellowships.missouri.edu/fellowship/payne-international-development-fellowship-program",
    programs: ["payne-fellowship"],
    says: "Presents Payne as active, and still refers to graduate entry in fall 2015.",
    state: "live",
    contact: "fellowships@missouri.edu",
    checkedOn: "2026-09-15",
  },
  {
    site: "Temple University — Scholar Development and Fellowships",
    kind: "University",
    url: "https://undergraduate.temple.edu/fellowships-advising/find-fellowship/payne-pickering-and-rangel-fellowships",
    programs: ["payne-fellowship", "pickering-fellowship", "rangel-fellowship"],
    fixedFor: ["payne-fellowship"],
    says: "Correctly marks Payne terminated, but lists Pickering and Rangel as open with a mid-September deadline.",
    state: "live",
    contact: "Office contact form (address obfuscated on the page)",
    checkedOn: "2026-09-15",
  },
  {
    site: "UT San Antonio — Nationally Competitive Awards",
    kind: "University",
    url: "https://honors.utsa.edu/onca/awards/rangel-pickering.html",
    programs: ["pickering-fellowship", "rangel-fellowship"],
    says: "Presents both as open, with a September 1 campus deadline.",
    state: "live",
    contact: "honors@utsa.edu",
    checkedOn: "2026-09-15",
  },
  {
    site: "San Francisco State — Fellowships Office",
    kind: "University",
    url: "https://fellowships.sfsu.edu/mitchell-scholarship",
    programs: ["mitchell-scholarship"],
    says: "Presents Mitchell as open: “submitted to the Fellowships Office by Noon on May 25 annually”.",
    state: "live",
    contact: "fellows1@sfsu.edu",
    checkedOn: "2026-09-15",
  },
];

/** The state of a referrer for one particular program. */
export function stateFor(r: Referrer, slug: string): ReferrerState {
  return r.fixedFor?.includes(slug) ? "fixed" : r.state;
}

/**
 * Each closed program's own address, checked live on every page load, plus
 * what a human found there. The live check can see a dead domain or a 404;
 * it cannot see that a 200 is now someone else's business, so that part is
 * written down.
 */
export const PROGRAM_HOMES: Record<string, { url: string; found?: string }> = {
  "winterline-global-skills": {
    url: "https://www.winterline.com/",
    found: "Now a domain brokerage: “Digital Asset Acquisition For Strategic Growth”.",
  },
  "thinking-beyond-borders": { url: "https://www.thinkingbeyondborders.org/" },
  "thinking-beyond-borders-gap-year-semester": { url: "https://www.thinkingbeyondborders.org/" },
  "frontier-gap-year": { url: "https://frontier.ac.uk/" },
  "payne-fellowship": {
    url: "https://www.paynefellows.org/",
    found: "Redirects by script to a parked /lander page.",
  },
  "pickering-fellowship": {
    url: "https://pickeringfellowship.org/",
    found: "Up, with a notice that the 2026 cycle is postponed.",
  },
  "rangel-fellowship": {
    url: "https://rangelprogram.org/",
    found: "Up, with a notice that the 2026 cycle is postponed.",
  },
  "mitchell-scholarship": {
    url: "https://us-irelandalliance.org/mitchellscholarship",
    found: "Up, with the March 2024 pause notice.",
  },
  "american-climate-corps": { url: "https://www.acc.gov/" },
};

export type HomeCheck =
  | { kind: "gone"; label: string }
  | { kind: "broken"; label: string }
  | { kind: "moved"; label: string }
  | { kind: "up"; label: string };

/**
 * What a visitor following a link would hit right now. Manual redirects so a
 * hop to another host is reported rather than silently followed; a short
 * timeout because a dead host is the common case, not the exception.
 */
export async function checkHome(url: string): Promise<HomeCheck> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GapYearPlatform link check)" },
    });
    if (res.status >= 300 && res.status < 400) {
      const to = res.headers.get("location");
      const host = to ? new URL(to, url).host.replace(/^www\./, "") : null;
      const from = new URL(url).host.replace(/^www\./, "");
      return host && host !== from
        ? { kind: "moved", label: `Redirects to ${host}` }
        : { kind: "up", label: `Redirects within the site (${res.status})` };
    }
    if (res.status === 404 || res.status === 410) {
      return { kind: "broken", label: `Page not found (${res.status})` };
    }
    if (res.status >= 500) return { kind: "broken", label: `Server error (${res.status})` };
    if (res.status === 403) return { kind: "up", label: "Responds, but blocks automated checks (403)" };
    return { kind: "up", label: `Responds (${res.status})` };
  } catch (err) {
    const code = (err as { cause?: { code?: string } })?.cause?.code;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
      return { kind: "gone", label: "Domain no longer resolves" };
    }
    if ((err as Error)?.name === "TimeoutError") {
      return { kind: "broken", label: "No response within 5 seconds" };
    }
    return { kind: "broken", label: `Unreachable${code ? ` (${code})` : ""}` };
  }
}
