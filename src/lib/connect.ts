// Who to actually talk to, and how to check a program yourself.
//
// TWO RULES THIS FILE FOLLOWS.
//
// 1. No invented people. Every entry below is a ROLE that verifiably exists
//    (every participating university designates a Fulbright Program Adviser;
//    Peace Corps runs regional recruiters) plus the official directory where
//    you find the actual human. Listing names of private individuals — or
//    inventing plausible-sounding ones — would be fabricating a record.
//
// 2. No brokered introductions. We do not have a network, we are not paid by
//    anyone here, and nobody on this page is paid to speak to you. The point
//    is to hand over the same directories an insider would use.
//
// Some .gov hosts return 403 to automated link checks (WAF blocking curl, not
// a dead page). Verify those in a browser before "fixing" them.

export type Contact = {
  role: string;
  who: string;
  why: string;
  /** The concrete thing to ask. A link with no question attached gets ignored. */
  ask: string;
  href: string;
  hrefLabel: string;
  free: boolean;
};

export const PEOPLE: { section: string; blurb: string; items: Contact[] }[] = [
  {
    section: "Before you apply anywhere",
    blurb:
      "These people are already paid to help you and cost nothing. Most students never contact them.",
    items: [
      {
        role: "Campus fellowship adviser",
        who: "Every participating university designates a Fulbright Program Adviser, and most also advise on Rhodes, Marshall, Watson and Boren.",
        why: "Campus deadlines run weeks to months before the national ones, and missing the campus round is the single most common way students lose these awards. The adviser sets that date.",
        ask: "What is your internal deadline for the 2027-28 cycle, and do you require a campus endorsement?",
        href: "https://us.fulbrightonline.org/fulbright-program-advisers",
        hrefLabel: "Find your campus adviser",
        free: true,
      },
      {
        role: "Your admissions office",
        who: "The person who signs off deferrals at the college holding your seat.",
        why: "Deferral policies differ wildly, and earning college credit during the year can convert a deferred admit into a transfer applicant — forfeiting the original offer and its scholarships.",
        ask: "If I enrol for credit during my deferral, do I return as a first-year or a transfer, and what happens to my merit award? Please confirm in writing.",
        href: "/programs?money=participant_pays",
        hrefLabel: "See which programs grant credit",
        free: true,
      },
      {
        role: "AmeriCorps program contact",
        who: "Each AmeriCorps program — NCCC, VISTA, and every state corps — lists its own recruiter or program manager rather than a national desk.",
        why: "Living allowances, start dates and site placements vary by program and are frequently out of date on third-party sites.",
        ask: "What is the current living allowance for this term, and is the education award the full or prorated amount?",
        href: "https://www.americorps.gov/serve",
        hrefLabel: "AmeriCorps program finder",
        free: true,
      },
      {
        role: "Peace Corps regional recruiter",
        who: "Peace Corps assigns recruiters by region and runs public information sessions year-round.",
        why: "Placement depends heavily on your background, and a recruiter will tell you which sectors you are actually competitive for before you spend hours applying.",
        ask: "Given my background, which sectors and departure windows should I realistically target?",
        href: "https://www.peacecorps.gov/connect/",
        hrefLabel: "Recruitment events and contacts",
        free: true,
      },
      {
        role: "The NIH lab you want to join",
        who: "Postbac IRTA hiring is decentralised: individual principal investigators hire directly, year-round.",
        why: "There is no central application to wait on. Emailing PIs whose work you have actually read is the process, not a shortcut around it.",
        ask: "Are you taking a postbac for the coming year, and would you look at my CV?",
        href: "https://www.training.nih.gov/programs/postbac_irta",
        hrefLabel: "NIH postbac program",
        free: true,
      },
    ],
  },
  {
    section: "People who have actually done it",
    blurb:
      "Current and former participants are the only source that reliably tells you what a program is like on a bad week.",
    items: [
      {
        role: "Program alumni networks",
        who: "Most established programs run an alumni association or will connect prospective applicants with a current participant if asked.",
        why: "Operators put you in touch with people who enjoyed it. Ask for someone who left early, and notice whether they will.",
        ask: "Can you connect me with a current participant — and with someone who did not finish the term?",
        href: "/programs",
        hrefLabel: "Find a program, then ask its operator",
        free: true,
      },
      {
        role: "Program-specific forums",
        who: "Most large programs have an active subreddit or forum, usually with a stickied FAQ answering the same questions repeatedly.",
        why: "Pay figures, site conditions and how long placement really takes get discussed there far more candidly than on any operator's page.",
        ask: "Read the stickied FAQ first; it usually answers the pay and timeline questions before you post.",
        href: "https://www.reddit.com/r/AmeriCorps/",
        hrefLabel: "Example: r/AmeriCorps",
        free: true,
      },
    ],
  },
];

export type Reference = {
  name: string;
  what: string;
  use: string;
  href: string;
  caveat?: string;
};

export const DUE_DILIGENCE: Reference[] = [
  {
    name: "ProPublica Nonprofit Explorer",
    what: "Full IRS Form 990 filings for US nonprofits, free.",
    use: "Before paying a nonprofit operator, read its most recent 990: revenue, executive pay, and whether it is shrinking. Two operators in this catalog wound up while still marketing.",
    href: "https://projects.propublica.org/nonprofits/",
  },
  {
    name: "Charity Navigator",
    what: "Ratings and financial summaries for larger US charities.",
    use: "Quicker than reading a 990, and flags going-concern problems.",
    href: "https://www.charitynavigator.org/",
    caveat: "Only covers organisations above a revenue threshold — a blank result is not a red flag by itself.",
  },
  {
    name: "UK Companies House",
    what: "Registry of UK companies, including dissolution dates.",
    use: "Several gap-year operators are UK-registered. This is how the Frontier entry in this catalog was confirmed dissolved in September 2023 while still being listed elsewhere.",
    href: "https://find-and-update.company-information.service.gov.uk/",
  },
  {
    name: "USAJOBS",
    what: "Every federal job, including seasonal wildland fire and park service roles.",
    use: "Federal fire hiring runs on a much earlier calendar than other seasonal work — announcements post in autumn for the following summer.",
    href: "https://www.usajobs.gov/",
    caveat: "Its resume format is unusually strict; a normal one-page resume is routinely auto-rejected.",
  },
];

export const PRIMARY_SOURCES: Reference[] = [
  {
    name: "AmeriCorps",
    what: "The federal agency behind NCCC, VISTA and most state conservation corps.",
    use: "Living allowance rates and the current Segal Education Award amount, which third-party sites frequently quote years out of date.",
    href: "https://www.americorps.gov/",
  },
  {
    name: "Fulbright U.S. Student Program",
    what: "Official award listings, country by country.",
    use: "Which countries offer an ETA this cycle, and the national deadline. Country availability changes yearly.",
    href: "https://us.fulbrightonline.org/",
  },
  {
    name: "Peace Corps",
    what: "Open positions with departure dates and required skills.",
    use: "Actual current openings rather than the general pitch.",
    href: "https://www.peacecorps.gov/",
  },
  {
    name: "Gap Year Association",
    what: "The industry's own membership and accreditation body.",
    use: "Useful for checking whether a fee-charging operator is accredited at all.",
    href: "https://www.gapyearassociation.org/",
    caveat:
      "Funded by the operators it accredits, and its membership skews to programs that charge participants. Treat it as an industry directory, not an impartial reviewer.",
  },
];
