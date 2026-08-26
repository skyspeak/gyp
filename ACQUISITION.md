# Acquiring the first users

The spec already picked the channel and told us to run it: **campus fellowship
advisers**. Every participating university designates one, they are findable
and emailable, each runs a mailing list, and they are the phase 3 lead list.
This document is how to actually execute that, and why the opening move is not
"here is my directory."

## The asset nobody else has

We can now state, with sources and dates, that **17 of 381 tracked paths are
not operating normally** and **10 more are widely recommended to Americans who
cannot use them**. That list is at `/changes`.

Nobody publishes this. Operators do not announce closures, and advising pages
keep listing dead programs for years:

| Program | Reality | Still listed as live? |
|---|---|---|
| Payne Fellowship | Terminated 27 Feb 2025 with the USAID shutdown | Yes, on university advising pages |
| Pickering / Rangel | 2026 cycles postponed pending State Dept. direction | Yes |
| Mitchell Scholarship | Selection paused since March 2024 | Yes |
| Frontier | UK parent dissolved 26 Sept 2023 (Companies House) | Yes, on gap year directories |
| Thinking Beyond Borders | Closed; last Form 990 covers FY2016 | Yes |
| Winterline | Domain no longer belongs to the education company | Yes |
| Global Health Corps | No longer a paid placement | Yes, described as paid |

**This is the wedge.** A directory is a thing an adviser might look at. A list
of programs on *their own page* that no longer exist is a thing they have to
act on.

## The opening email

Do not pitch. Lead with the thing that is wrong on their page, name it
specifically, and give the evidence. Offer nothing in the first email.

> Subject: Payne and Rangel on your fellowships page
>
> Hi [name] — I maintain a free, non-commercial index of gap year and
> post-grad paths and noticed your fellowships page still lists the Payne
> Fellowship as open. It was terminated on 27 February 2025 alongside the
> USAID shutdown. Pickering and Rangel have both postponed their 2026 cycles,
> and the Mitchell Scholarship paused selection in March 2024.
>
> I keep a running list of what has closed or paused, with the source for
> each: [link to /changes]
>
> No ask — I thought you would rather know before advising season. If it is
> useful I can flag changes as they happen.
>
> [name]

Why this works: it is checkable in thirty seconds, it is professionally
relevant, and the only "ask" is an offer to keep helping. The link is to the
changes page, not the home page — lead with the useful thing, not the brand.

## Targeting, in order

1. **Fulbright Program Advisers.** The official directory is public:
   https://us.fulbrightonline.org/fulbright-program-advisers — this is the
   list. Prioritise institutions whose public advising pages still carry a
   dead program, because those emails write themselves.
2. **Institutions that fund their own gap year.** Princeton, UNC, Duke and
   the rest already believe the thesis and have staff who own it. They are
   also the warmest phase 3 prospects.
3. **Premed advising offices.** NIH Postbac IRTA is a canonical premed gap
   year and hiring is decentralised, so advisers field the same questions
   endlessly. `/connect` answers them.
4. **High school counsellors at schools with high deferral rates.** They own
   the pre-college cohort and have nothing good to hand a family.

## What to send after they reply

- The deadline view, filtered to their cohort. **October 2026 holds 15 of 33
  upcoming deadlines** — that is a slide in someone's advising presentation.
- `/connect`, which is a ready-made handout: who to ask, and 19 questions
  drawn from real failure modes.
- The `/gallery` card that undercuts the pitch they hear most: a $29,800 year
  against roughly $29,981 earned over the same seven months.

## Channels that are not this

- **Paid acquisition: no.** The unit economics do not work against a $0 phase
  1, and buying traffic for a trust product is the wrong first signal.
- **The operators themselves: never.** They would want placement in exchange,
  which is the one thing that cannot be sold here.
- **SEO: build for it, do not wait on it.** 381 program pages against
  long-tail queries compound over four to six months. `/changes` is the best
  organic bet — "is [program] still running" is a real query with no good
  answer — but it will not produce this cycle.
- **Reddit and program forums: slowly, as a participant.** Each has a stickied
  FAQ answering the same questions repeatedly. Answer them with a link only
  where the link is actually the answer.

## The measurement problem — fix before running any of this

**There is currently no analytics of any kind.** The phase 1 gate is defined
in the spec as:

- Watcher signups / unique visitors above **15%**
- Watchers tracking 2+ programs above **30%**
- Adviser reply rate above **8%**, and **3+** advisers forwarding or linking
- Kill criterion: watcher conversion under **5%**

None of that is measurable today. `plan_events` records what happens inside a
plan, but nothing counts visitors, so conversion has no denominator. Running
outreach before this is in place means burning the one list that matters and
being unable to say whether it worked.

Minimum viable instrumentation:

1. A privacy-respecting pageview count (no cookies, no third-party
   trackers — a trust product cannot ship surveillance).
2. `?ref=` on every adviser link, recorded on the watch event, so a forward is
   attributable to the adviser who sent it. That is the "3+ advisers forwarded
   it" metric, and it is otherwise unknowable.
3. A simple funnel readout: visitors → watch signups → watchers with 2+
   programs.

## Honest risks

- **A wrong closure is worse than a missed one, and we nearly shipped three.**
  The importer inferred status by scanning the whole status note for closure
  words, so it read "ACTIVE — Note: College Possible *Philadelphia* closed" as
  a dead organisation, along with AmeriCorps State & National (its *grants*
  were terminated, not the program) and USFS Direct Hire (its *application
  windows* closed). Emailing an adviser to say College Possible had shut down
  would have inverted the wedge permanently. The parser now trusts the note's
  leading verdict. **Read every row of `/changes` yourself before sending a
  single email** — this page's only value is that it is right.
- **The catalog is not fully verified.** 225 rows are `provenance='bulk_import'`
  and carry an unverified banner. If the first adviser we email finds a wrong
  figure, the wedge inverts and becomes the reason not to trust us. Verify the
  programs an adviser cohort actually cares about — the fellowships — before
  emailing anyone.
- **Fellowship advisers serve the post-grad cohort**, while the pre-college
  deferral cohort sits with high school counsellors and admissions offices.
  The spec's primary cohort and its primary channel are not the same audience.
- **The name.** "Gap Year Platform" reads as deferrals to an admissions office
  and as failure to a 22-year-old applying for Rhodes — the two audiences this
  outreach targets. Worth settling before mass emailing anyone.
