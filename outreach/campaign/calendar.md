# Sequencing — 12 months from 24 September 2026

Built around two calendars that are not ours: the fellowship deadlines that
cluster in October, and the college decision dates in December, March and May.
Everything here rides one of those.

Working assumption: one person, about five hours a week, no budget, no
advertising. Volumes are set so every email is written by hand. Twenty a day
is the ceiling from a personal address; forty in a day is how a domain starts
landing in spam folders.

## Week 0 — before anything goes out

Three things are broken or missing and they block whole channels.

| Blocker | Blocks | Fix |
|---|---|---|
| `RESEND_FROM_EMAIL` is Resend's shared test sender | Every email the site sends reaches only Gautam's own inbox | Verify a domain in Resend, set the variable, redeploy |
| No Google Search Console property | The entire search channel is unmeasured | `growth/11-search-console.md` |
| `ADMIN_USER` / `ADMIN_PASSWORD` empty | /admin/review returns 503, so corrections cannot be approved | Set both in Vercel |

Also this week: reread `campaign/figures.md`, then fix the stale numbers in any
asset you are about to send. The 230 and 89 pair is wrong as of 24 September.

---

## Phase 1 — Fellowship season (29 Sep to 8 Nov)

The one time of year when a correction is a favour rather than an
interruption. Eight Fulbright deadlines fall on 6 October, Rhodes on the 7th,
Gates Cambridge on the 14th, Soros on the 29th, Churchill on 2 November.

| Week | Channel | To | Send | Check |
|---|---|---|---|---|
| 29 Sep | Email | ICP 1, the six verified pages | 6 corrections, one at a time, from `dead-link-emails.md` §1 to §3 | Replies, and whether the page changes |
| 6 Oct | Email | Partner type A | 4 directory corrections, §4 to §6 | Same |
| 6 Oct | Reddit | ICP 5 | Answer 3 deadline threads in r/ApplyingToCollege, no link unless asked | Comment karma, removals |
| 13 Oct | Email | ICP 1, tier 4 | Open 20 fellowship pages from `institutions.csv`. Write only to the ones that are wrong | Hit rate: how many of 20 are stale |
| 13 Oct | Press | Media | Pitch the closure story with `/deadlinks` as receipts, `growth/03-press-pitch.md` | Replies within 5 working days |
| 20 Oct | Pinterest | ICP 4 | Publish the first 10 pins from `pins.html`. They take 4 to 8 weeks to compound, which is why they go now | Impressions in 30 days |
| 20 Oct | Email | ICP 1, tier 4 | Next 20 pages, same rule | Cumulative corrections landed |
| 27 Oct | Partnerships | Partner type B | 6 JETAA chapters and 6 NPCA affiliate groups, `growth/16-alumni-networks.md` | Replies, corrections offered |
| 3 Nov | Email | ICP 2 | 20 counselors, the file-it-for-December email | Opens are unmeasurable, so count replies |

Stop rule for the tier 4 sweep: if 40 opened pages produce fewer than 8 stale
ones, the list is exhausted. Move the hours to Phase 2.

---

## Phase 2 — Build the December ammunition (9 Nov to 11 Dec)

Nothing ships to students in this window. It is for the things that need lead
time.

| Week | Channel | To | Do |
|---|---|---|---|
| 10 Nov | Partnerships | ICP 2 | Propose spring professional development sessions to 3 NACAC affiliates, `growth/17-counselor-webinar.md`. Affiliate programme committees plan a term ahead |
| 10 Nov | Owned | List | Ship the nurture sequence, `campaign/nurture-sequence.md`. Nothing has gone to the list since the welcome email |
| 17 Nov | Search | ICP 4, 5 | Page audit, `growth/10-page-audit.md`. Titles and descriptions for the two dozen pages that matter |
| 17 Nov | Video | ICP 5 | Record the three scripts in `growth/09-video-scripts.md`. Post nothing yet |
| 24 Nov | Partnerships | Libraries | 12 public library teen services desks, `growth/13-librarians.md` |
| 1 Dec | Everything | — | Recheck every figure against `campaign/figures.md`. Confirm the deferral letter page and the map load. Pull the list of counselors who replied |
| 8 Dec | Standby | — | Watch for the first large university to publish its early decision release date. The campaign below shifts to that week |

---

## Phase 3 — Decision week (the week ED results land, usually mid-December)

The single highest-intent week of the year. Three groups start asking at once:
admitted and not ready, deferred, denied. Full plan in
`growth/18-december-campaign.md`.

| Day | Channel | To | Do |
|---|---|---|---|
| Release day | Email | ICP 2 | The counselor email, to everyone who replied in the autumn, plus 20 new |
| Release day | LinkedIn | ICP 2, 3 | The post from `growth/18-december-campaign.md`, link in the first comment |
| Day 2 | Reddit | ICP 5 | Deferral threads, using the replies in `growth/12-deferral-letter.md`. Answer, never start a thread |
| Day 3 | Video | ICP 5 | Post video 2, "a gap year can cost $75,000" |
| Day 5 | Facebook | ICP 4 | Parent groups, `growth/08-parent-groups.md`, answering only |
| Day 7 | Measure | — | Count `dec-` referrer codes and list signups |

---

## Phase 4 — Winter follow-through (Jan to mid-Feb)

| Week | Channel | To | Do |
|---|---|---|---|
| 5 Jan | Owned | List | First monthly digest: what closed, what opens next |
| 12 Jan | Email | ICP 3 | 15 independent consultants, the closure-as-insurance angle |
| 19 Jan | Partnerships | ICP 2 | Deliver whichever webinar was accepted |
| 26 Jan | Email | ICP 1 | Second pass on every page corrected in October. Did it stick? |
| 2 Feb | Search | — | Search Console: which queries arrived, which pages need rewriting |
| 9 Feb | Video | ICP 5 | Post video 3 |

---

## Phase 5 — Regular decisions and the summer job cycle (mid-Feb to April)

Two different audiences overlap here. Students hear back in late March.
Conservation corps and seasonal fire hiring run their own earlier calendar,
and the fire calendar is the one nobody tells students about: announcements
post in autumn for the following summer.

| Week | Channel | To | Do |
|---|---|---|---|
| 16 Feb | Reddit | ICP 5 | r/gapyear and r/AmeriCorps, answer summer hiring questions |
| 2 Mar | Email | ICP 2 | Pre-decision email: what to say to a student who does not get in |
| 23 Mar | Everything | ICP 4, 5 | Decision week repeat, smaller. Reddit, parent groups, one video |
| 6 Apr | Owned | List | Digest: what is still open for a September start |
| 20 Apr | Email | Partner type B | AmeriCorps and conservation corps recruiters, ahead of the summer intake |

---

## Phase 6 — The post-grad wave (May to August)

May 1 is the commitment deadline, and the day a different group starts
looking: graduating seniors with no job. Teaching abroad cycles (JET, EPIK)
and the NIH postbac year also start here.

| Week | Channel | To | Do |
|---|---|---|---|
| 4 May | Reddit, LinkedIn | ICP 5 | The post-grad framing: 61 paid work programs, 29 teaching abroad that pay |
| 18 May | Email | Partner type B | University career centres, not fellowship offices. Different building, different list |
| 1 Jun | Owned | List | Digest |
| Jun to Aug | Search, Pinterest | ICP 4, 5 | Maintain. Republish pins that performed, rewrite the two worst-performing pages |
| Aug | Email | ICP 1 | Reopen the fellowship list before the next October. Start Phase 1 again |

---

## The weekly rhythm underneath all of it

Five hours, spent the same way every week:

1. **One hour, data.** Recheck anything you are about to quote. Update
   `/deadlinks` when a page gets fixed, so the list does not rot.
2. **Two hours, sending.** Twenty emails maximum, each one opened and written
   by hand.
3. **One hour, answering.** Reddit, group comments, and every reply that came
   back. A reply answered within a day is worth more than ten new sends.
4. **One hour, one asset.** Write or fix exactly one thing.

## What to count

Per week: replies, corrections landed, signups, `ref=` codes seen in
analytics. Not impressions.

Per channel, a kill rule, decided now so it is not argued about later:

| Channel | Kill if |
|---|---|
| Fellowship corrections | Fewer than 2 replies in the first 10 sends |
| Counselor email | Fewer than 3 replies in 60 sends by 1 February |
| Reddit | Two removals for self-promotion |
| Pinterest | Under 1,000 impressions by 1 December |
| Press | No reply from 12 pitches |
| Video | Under 500 views on three posts |
| Directories | No correction landed from 10 sends |

Kill means stop, not retry with a new subject line.
