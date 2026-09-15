# 10 growth hacks

Each one uses something only this site has: the closure data, the priced vs
paid split, the map, or the fact that nobody pays to be listed. Generic
tactics are left out on purpose.

Every hack has its own `?ref=` code. That's how you'll know which ones worked.
Check them with:

```bash
turso db shell gap-year-platform "SELECT referrer, COUNT(*) FROM people WHERE referrer IS NOT NULL GROUP BY 1 ORDER BY 2 DESC"
```

Numbers used throughout, from the live catalog on 15 September 2026, counting
only programs that are still running and open to Americans: **230 pay you, 89
charge you, 55 countries.**

| # | Hack | Effort | Ref code | Start |
|---|---|---|---|---|
| 1 | Get the map embedded on advising sites | 1 hr + emails | the school's own code | This week |
| 2 | Seed the share-my-link loop | 20 min | `f-…` (automatic) | This week |
| 3 | Pitch the data to education reporters | 2 hrs | `press-OUTLET` | This week |
| 4 | Launch the open dataset | 1 hr | `dataset` | This week |
| 5 | Give counselors a newsletter block | 30 min a month | `newsletter-SCHOOL` | This week |
| 6 | Get paying programs to share their listing | 2 hrs | `listed-PROGRAM` | Next week |
| 7 | Put a QR poster in counseling offices | 1 hr + printing | `poster-SCHOOL` | Next week |
| 8 | Answer price questions in parent groups | 15 min a day | `fb-price` | Ongoing |
| 9 | Short videos made from the map | 1 afternoon | `video-PLATFORM` | Next week |
| 10 | Offer advisers a free page audit | 30 min each | `audit-SCHOOL` | After first replies |

---

## 1. Get the map embedded on advising sites

**Why it works.** An advising office links to a resource once and forgets it.
A map embedded on their own gap year page gets seen by every student who
visits, is a permanent backlink, and credits every signup to that school.

**Built:** `https://gyp-psi.vercel.app/embed/map?ref=CODE`

1. Open `institutions.csv`, filter to Tiers 2 and 3. These offices already
   publish gap year pages, so an embed is a natural fit.
2. Give each a ref code, e.g. `stolaf-piper`.
3. Send the email in `01-embed-kit.md`, pasting in their personal snippet.
4. When one says yes, send the snippet again plus the WordPress and
   Squarespace notes from the same file.
5. A week later, view their page source and search for `embed/map` to confirm it's live.

**Collateral:** `01-embed-kit.md`

---

## 2. Seed the share-my-link loop

**Why it works.** Right after signing up, people now get a personal link to
send to one friend. The loop only starts turning once there are people in it.
Your first subscribers are the most motivated people you'll ever have.

**Built:** the signup confirmation shows "Share my link" automatically.

1. Wait until you have 20+ subscribers.
2. Send them the one-time note in `02-referral-seed.md`. It asks for one
   forward, not a campaign.
3. Don't send it twice. A second ask turns a favor into marketing.

**Collateral:** `02-referral-seed.md`

---

## 3. Pitch the data to education reporters

**Why it works.** Reporters need numbers nobody else has. You have three:
fellowships that ended but are still advertised, $75,000 gap years next to
230 that pay, and the one category where the paid option mostly doesn't
exist.

1. Pick one angle per outlet from `03-press-pitch.md`. Never pitch all three
   at once.
2. Find the education or personal finance reporter at that outlet, on the
   outlet's own staff page.
3. Send the pitch with the data sheet link, and add `?ref=press-OUTLET` to every link.
4. Follow up once, five working days later, then stop.
5. Timing: the closure angle works now, during fellowship season. The price
   angle works best in December, when early decision results arrive and
   families start talking about deferring.

**Collateral:** `03-press-pitch.md`, `03-data-sheet.html` (print to PDF and attach)

---

## 4. Launch the open dataset

**Why it works.** Open datasets get linked from class assignments, resource
pages and curated GitHub lists, which a directory never is. Every row links back.

**Built:** `https://gyp-psi.vercel.app/api/dataset.csv`, 149 hand-verified programs.

1. Create a public GitHub repo named `paid-gap-years`. Paste the README from
   `04-dataset-launch.md` and commit today's CSV.
2. Post to r/datasets using the copy in the same file.
3. Upload to Kaggle with the description provided.
4. Refresh the CSV in the repo once a month.

**Collateral:** `04-dataset-launch.md`

---

## 5. Give counselors a newsletter block

**Why it works.** High school counselors and college advisers send a
newsletter every month and are always short of content. A ready-to-paste
block of real deadlines gets copied in, with your link at the bottom.

1. Copy this month's block from `05-counselor-newsletter-block.md`.
2. Send the offer email in the same file to Tier 3 and Tier 6 offices, and to
   any counselor who replied to earlier outreach.
3. Each month, regenerate the dates from the catalog before sending. Never
   send a block with a deadline that has already passed.

**Collateral:** `05-counselor-newsletter-block.md`

---

## 6. Get paying programs to share their listing

**Why it works.** Conservation corps and AmeriCorps programs are always
recruiting, and they're happy to point applicants to a neutral page saying
they pay. Nobody pays anybody, so it doesn't compromise the site.

1. Start with the 40 conservation programs that pay, then service programs (34).
2. Find each program's recruitment or outreach contact on its own site.
3. Send the email in `06-programs-share-kit.md` with their badge snippet.
4. If anyone offers money for better placement, use the decline reply in the file.

**Collateral:** `06-programs-share-kit.md`

---

## 7. Put a QR poster in counseling offices

**Why it works.** Counseling offices have walls, and families wait in them.
A poster works for months with no further effort.

1. Open `07-poster.html`, print to PDF, and print at letter or tabloid size.
2. For a specific school, regenerate the QR with `?ref=poster-SCHOOL`
   (instructions at the top of the file).
3. Offer it to any counselor who replied to outreach. Mail printed copies to
   the first five who say yes; it costs a few dollars.
4. Bring copies to any college fair you attend.

**Collateral:** `07-poster.html`

---

## 8. Answer price questions in parent groups

**Why it works.** In college-admissions parent groups on Facebook, someone
asks every week whether a $30,000 gap year is worth it. A comparison image
that answers the question gets saved and screenshotted.

1. Join two or three large parent groups about college admissions and paying for college.
2. Read the rules. Most ban links in posts but allow them in helpful comments.
3. When the question comes up, reply with the text in `08-parent-groups.md`
   and attach the image from `08-price-card.html`.
4. Link only when someone asks where the numbers come from.

**Collateral:** `08-parent-groups.md`, `08-price-card.html`

---

## 9. Short videos made from the map

**Why it works.** "Countries where you can do a gap year" is a naturally
visual hook, and the map already looks good on a phone screen. Screen
recordings need no filming.

1. Record your phone screen with the map open. Tap a country, scroll the list.
2. Use a script from `09-video-scripts.md` as the voiceover and on-screen text.
3. Post the same video to TikTok, Instagram Reels and YouTube Shorts, each with
   its own ref code in the bio link.
4. Post one every few days, not all five at once.

**Collateral:** `09-video-scripts.md`

---

## 10. Offer advisers a free page audit

**Why it works.** The cold email points out one closed program. The audit is
what you offer once someone replies: a check of their whole fellowships list.
It takes you 30 minutes and makes you the person they come back to.

1. Only offer it to advisers who replied warmly.
2. Open their fellowships page and check every program against its official
   site, using the steps in `10-page-audit.md`.
3. Fill in the template and send it. Don't publish it, and don't copy it to anyone else.

**Collateral:** `10-page-audit.md`
