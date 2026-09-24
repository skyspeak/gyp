# The campaign

Four documents:

- [figures.md](figures.md) — the numbers, dated. Nothing gets quoted from
  anywhere else.
- [icp.md](icp.md) — the five people worth writing to, and the two partner
  types worth a different ask.
- [calendar.md](calendar.md) — what goes out which week, for twelve months.
- [nurture-sequence.md](nurture-sequence.md) — what the email list gets.

Everything they reference already exists in `outreach/`. The inventory is at
the bottom of this page.

## What we are selling, given that nothing is for sale

One sentence: **we know which gap year programs pay you, which charge you, and
which have quietly stopped existing, and nobody else is tracking the third
one.**

That third clause is the entire campaign. Anyone can list programs. The
closures are what make a fellowship adviser reply to a stranger, make a
directory editor fix a page, and make a reporter take a call. 232 programs pay
and 93 charge is the argument that convinces a parent. Six shut down and three
paused, with fifteen pages still advertising them, is the fact that gets us in
the door.

## Constraints, stated once

- No budget. No ads, ever. Anything that needs money is out of scope.
- One person, about five hours a week.
- No commissions and no paid placement, which rules out affiliate deals and
  also rules out writing to the operators we price.
- Email currently reaches only the account owner until a domain is verified in
  Resend. Two channels depend on fixing that.
- Every claim has to survive being checked by the person receiving it, because
  the people we are writing to check things for a living.

## Channels, ranked by what they return per hour

| # | Channel | Who it reaches | Why it works here | First asset |
|---|---|---|---|---|
| 1 | Direct correction email | ICP 1, partner A | We are telling someone their page is wrong, with the source. That is a favour, and favours get answered | `dead-link-emails.md` |
| 2 | Community answers | ICP 4, ICP 5 | The questions are asked daily and the existing answers are years old. Costs nothing but attention | `reddit.md`, `growth/08-parent-groups.md` |
| 3 | Intermediary email | ICP 2, ICP 3 | One counselor newsletter reaches more families than a month of posting | `emails.md`, `growth/05-counselor-newsletter-block.md` |
| 4 | Search and Pinterest | ICP 4, ICP 5 | The only channel that compounds while nobody is working. Slow: 4 to 8 weeks before pins move | `growth/10-page-audit.md`, `pins.html` |
| 5 | Press and newsletters | All | The closure story is a real story with receipts at /deadlinks. One placement outperforms a quarter of emailing | `growth/03-press-pitch.md` |
| 6 | Partnerships and embeds | Partner A, partner B | Alumni networks and libraries hand us their own audience, and correct our data for free | `growth/01-embed-kit.md`, `growth/16-alumni-networks.md` |
| 7 | Short-form video | ICP 5 | Highest variance. One video can outrun everything above, and four can do nothing | `growth/09-video-scripts.md` |

Channels 1 through 3 are worked every week. Channel 4 is set up once and
maintained monthly. Channels 5 to 7 are batched into the windows in
[calendar.md](calendar.md).

## The three moments the year turns on

Sequencing is not a preference here. Three windows do most of the work, and
missing one costs a quarter.

1. **Early October.** Eight Fulbright deadlines on the 6th, Rhodes on the 7th,
   Gates Cambridge on the 14th. Fellowship advisers are editing their pages
   right now, which is the only month a correction is welcome.
2. **Mid-December.** Early decision results. Admitted, deferred and denied
   students all start asking the same week, and counselors have nothing
   neutral to hand them.
3. **Late March to May 1.** Regular decisions, then the commitment deadline,
   then graduating seniors with no job. The post-grad audience arrives in May
   and cares about different numbers: 61 paid work programs, 29 teaching
   abroad that pay.

## How we will know it worked

Per week: replies, corrections landed, signups, `ref=` codes in analytics.

Per quarter, the only four numbers that matter:

| Measure | Now (24 Sep 2026) | Target by 1 Mar 2027 |
|---|---|---|
| Pages corrected after we wrote | 0 of 15 | 6 |
| Counselors or advisers who replied | 0 | 20 |
| Email list | about 15 (people table, 17 Sep) | 250 |
| Press or newsletter placements | 0 | 1 |

Impressions are not on that list on purpose. A pin with 40,000 impressions and
no signups is a decorative failure.

Each channel has a kill rule in [calendar.md](calendar.md). Kill means stop,
not retry with a different subject line.

## Rules that keep this from becoming spam

- Twenty emails a day, maximum, each one written after opening the page it is
  about.
- Never write to someone whose page is already right.
- Answer three questions in a community before posting a link, and never post
  a link-only comment.
- One follow-up, two weeks later, then stop.
- If someone fixes their page, thank them and remove them from the list. Mark
  it in `src/lib/dead-links.ts` so /deadlinks stops showing it as live.
- Every number in every send matches [figures.md](figures.md) on the day it
  goes out.

## Asset inventory

Written and ready to send:

| Asset | For | File |
|---|---|---|
| Correction emails, 6 groups | ICP 1, partner A | `outreach/dead-link-emails.md` |
| Institution outreach emails | ICP 1, ICP 2 | `outreach/emails.md` |
| 117 institutions, tiered | ICP 1, ICP 2 | `outreach/institutions.csv` |
| Reddit answers | ICP 5 | `outreach/reddit.md` |
| Parent group answers | ICP 4 | `outreach/growth/08-parent-groups.md` |
| Newsletter block for counselors | ICP 2 | `outreach/growth/05-counselor-newsletter-block.md` |
| Press pitch and angles | Press | `outreach/growth/03-press-pitch.md` |
| One-page data sheet | Press, ICP 2 | `outreach/growth/03-data-sheet.html` |
| Price card | ICP 2, ICP 4 | `outreach/growth/08-price-card.html` |
| Poster | Libraries, schools | `outreach/growth/07-poster.html` |
| 30 Pinterest pins | ICP 4 | `outreach/pins.html`, `outreach/pinterest.md` |
| Video scripts | ICP 5 | `outreach/growth/09-video-scripts.md` |
| LinkedIn and X posts | ICP 2, ICP 3 | `outreach/linkedin-and-x.md` |
| Hacker News post | Technical | `outreach/hacker-news.md` |
| Embed kit | Partner A | `outreach/growth/01-embed-kit.md` |
| Alumni network email | Partner B | `outreach/growth/16-alumni-networks.md` |
| Librarian email | Libraries | `outreach/growth/13-librarians.md` |
| Webinar proposal | ICP 2 | `outreach/growth/17-counselor-webinar.md` |
| December campaign | ICP 2, 4, 5 | `outreach/growth/18-december-campaign.md` |
| Deferral letter replies | ICP 5 | `outreach/growth/12-deferral-letter.md` |
| Lesson plan and worksheet | Teachers | `outreach/growth/14-lesson-plan.md`, `14-worksheet.html` |
| Visa corrections | Travel writers | `outreach/growth/19-visa-corrections.md` |
| Podcast pitch | Podcasts | `outreach/growth/20-podcasts.md` |
| 20 growth plays | — | `outreach/growth/GROWTH-HACKS.md`, `GROWTH-HACKS-2.md` |

Missing, and worth building next, in this order:

1. **A page for counselors and advisers.** Every intermediary email currently
   lands on /programs, which is built for a student. One page with the price
   card, the deferral template, the calendar feed and the closure list would
   convert the reply we already get.
2. **A monthly digest that sends itself.** The template exists in
   `nurture-sequence.md`; assembling it by hand every month is how it stops
   happening in April.
3. **Printable one-pager as PDF.** `03-data-sheet.html` prints, but counselors
   ask for something to attach, and nobody attaches an HTML file.
