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

export const CHECK_FUNDING: Reference[] = [
  {
    name: "USAspending.gov",
    what: "Every federal grant and contract award, searchable by recipient.",
    use: "Look up an AmeriCorps grantee by name to see whether it currently holds an award and for how much. The most direct answer to 'is this program actually funded for my term'.",
    href: "https://www.usaspending.gov/",
  },
  {
    name: "IRS Tax Exempt Organization Search",
    what: "The IRS's own register of tax-exempt organisations.",
    use: "Confirms an operator's exempt status is current, and flags automatic revocation for failing to file.",
    href: "https://apps.irs.gov/app/eos/",
    caveat: "Blocks automated checks; open it in a browser.",
  },
  {
    name: "BBB Wise Giving Alliance",
    what: "Charity accountability reports against twenty published standards.",
    use: "Covers governance and truthfulness of appeals, not just finances — useful where a 990 looks fine but the marketing does not.",
    href: "https://www.give.org/",
  },
  {
    name: "SAM.gov",
    what: "The federal contractor and grantee registry.",
    use: "Shows whether an organisation is registered to receive federal money, and whether it has been excluded from doing so.",
    href: "https://sam.gov/",
  },
];

export const BEFORE_YOU_GO: Reference[] = [
  {
    name: "State Department travel advisories",
    what: "Country-by-country risk levels and the reasoning behind them.",
    use: "Check the specific country before committing to any placement abroad. Levels change, and some programs keep recruiting after they do.",
    href: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html",
    caveat: "Blocks automated checks; open it in a browser.",
  },
  {
    name: "CDC Travelers' Health",
    what: "Required and recommended vaccinations by destination.",
    use: "Some vaccine courses take months. Worth checking before you accept a start date, not after.",
    href: "https://wwwnc.cdc.gov/travel",
  },
  {
    name: "Federal Student Aid",
    what: "The official source on FAFSA, Pell and federal loans.",
    use: "The authority on whether a program is aid-eligible — over any operator's marketing claim about it.",
    href: "https://studentaid.gov/",
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


// ---------------------------------------------------------------------------
// Questions worth asking.
//
// Not generic "do your research" advice. Every question below exists because
// something in this catalog turned out to be true and non-obvious: VISTA
// members served unpaid through the Oct-Nov 2025 shutdown, only a subset of
// ACE positions carry an education award, Verto's own FAQ contradicts
// third-party claims about federal aid, EPIK closes early once places fill,
// and Alaska processing pays nothing when the fish do not run.
//
// Written to be pasted into an email as-is.
// ---------------------------------------------------------------------------

export type Question = { q: string; why: string };

export const QUESTION_BANK: { situation: string; blurb: string; questions: Question[] }[] = [
  {
    situation: "Any program that says it pays",
    blurb: "A headline rate is not take-home. These four questions usually move the number.",
    questions: [
      {
        q: "Is the figure you quote before or after tax, and is housing or food deducted from it?",
        why: "A $22/hr resort job with $600/month housing deducted nets less than an $18/hr job with housing free. Several listings quote the gross rate and mention deductions nowhere.",
      },
      {
        q: "What did someone in this role actually take home last term, after everything?",
        why: "Asks for an outcome rather than a rate. If nobody will give you a figure, that is itself the answer.",
      },
      {
        q: "Are the hours guaranteed, or dependent on conditions?",
        why: "Alaska seafood processing pays well on overtime and nothing when the fish do not run. Wildland fire earnings are back-loaded onto deployments that a quiet season may not produce.",
      },
      {
        q: "What are the upfront costs before my first paycheque — certification, gear, travel to the site?",
        why: "Yacht crew needs STCW certification at $900-$2,800 before anyone will hire you. Fire crews often buy their own boots.",
      },
    ],
  },
  {
    situation: "Anything AmeriCorps-affiliated",
    blurb:
      "Roughly a third of this catalog runs on AmeriCorps money, which was materially disrupted in 2025 and is not fully settled.",
    questions: [
      {
        q: "Is this specific position AmeriCorps-affiliated, and does it carry a Segal Education Award?",
        why: "Only a subset of American Conservation Experience positions are. The listing often does not say which.",
      },
      {
        q: "Is the education award the full amount or prorated for my term length?",
        why: "A 1,700-hour term and a 675-hour term carry very different awards, and sites frequently quote only the full-time figure.",
      },
      {
        q: "Was this program affected by the 2025 grant terminations, and is your current grant confirmed for my term?",
        why: "Around $400M in grants were terminated in spring 2025 before courts intervened. Some programs came back; others quietly did not.",
      },
      {
        q: "If there is a federal funding lapse during my term, do I keep being paid on time?",
        why: "During the Oct-Nov 2025 shutdown roughly 3,000 VISTA members kept serving while their living allowance accrued unpaid. Ask before, not during.",
      },
    ],
  },
  {
    situation: "Anything that charges you",
    blurb:
      "The fee is rarely the whole cost, and two operators in this catalog were still selling places while winding up.",
    questions: [
      {
        q: "What is excluded from the fee — airfare, insurance, visa, deposit, personal expenses?",
        why: "A $18,750 headline is realistically $20,000-$21,000 once airfare and visa are counted. The exclusions are usually listed, just not next to the price.",
      },
      {
        q: "Can I use federal financial aid for this? Please confirm in writing.",
        why: "Verto's own FAQ says it is not eligible for federal aid while third-party write-ups claim FAFSA and Pell apply. Assume not eligible until the operator says otherwise on paper.",
      },
      {
        q: "What is your refund policy if you cancel, and what if I withdraw?",
        why: "Two operators here dissolved while still marketing. Ask what happens to a deposit if the program does not run.",
      },
      {
        q: "How many people started your last cohort, and how many finished?",
        why: "Completion rate is the number operators least like publishing and the one that tells you most.",
      },
      {
        q: "Is any part of this scholarship a cash award, or is it a change in accommodation?",
        why: "One advertised award of up to $17,000 turns out to mean a homestay placement rather than money.",
      },
    ],
  },
  {
    situation: "Anything that grants college credit",
    blurb:
      "This is the most expensive mistake available in a gap year, and it is made by accident.",
    questions: [
      {
        q: "If I earn credit during my deferral, do I return as a first-year or as a transfer applicant?",
        why: "Transfer classification commonly forfeits incoming-freshman merit scholarships, first-year-only grants, guaranteed housing and honours eligibility.",
      },
      {
        q: "Does my merit award survive the deferral, and does need-based aid require refiling the FAFSA?",
        why: "Merit money usually rides through a deferral; need-based aid usually does not carry itself.",
      },
      {
        q: "Which institution actually grants the credit, and will my college accept it?",
        why: "Credit is issued by a partner university, and transfers cleanly only where an agreement exists.",
      },
    ],
  },
  {
    situation: "Anything abroad",
    blurb: "Visa reality is the thing most commonly misreported to Americans.",
    questions: [
      {
        q: "Which visa will I hold, who sponsors it, and what happens if I leave early?",
        why: "Work-exchange arrangements are frequently not lawful work on a tourist visa, and carry no employment rights if a placement goes wrong.",
      },
      {
        q: "Is the salary paid in local currency, and what does it cover locally?",
        why: "A yen or won salary converts poorly to a US savings goal. Ask what it covers where you will live, not what it converts to.",
      },
      {
        q: "When does the application actually close — and do you close early once places fill?",
        why: "EPIK reviews on a rolling basis and stops when full, regardless of the published window.",
      },
    ],
  },
];
