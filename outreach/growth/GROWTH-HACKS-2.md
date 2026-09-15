# 10 more growth hacks

None of these repeat the first ten or the earlier email, Reddit, Hacker News,
Pinterest, LinkedIn or creator work. Two needed small site changes, which are
now live: a sitemap with status-aware page titles, and a deferral letter page.

Same rule as before: every hack has its own `?ref=` code.

```bash
turso db shell gap-year-platform "SELECT referrer, COUNT(*) FROM people WHERE referrer IS NOT NULL GROUP BY 1 ORDER BY 2 DESC"
```

| # | Hack | Effort | Ref code | Start |
|---|---|---|---|---|
| 11 | Get closed-program pages into Google | 45 min once | organic | Today |
| 12 | Promote the deferral letter template | 30 min | `deferral-*` | December |
| 13 | Get listed in library research guides | 2 hrs | `lib-SCHOOL` | This week |
| 14 | A personal finance lesson for teachers | 1 hr | `lesson` | This week |
| 15 | College Advising Corps advisers | 1 hr | `cac-STATE` | This week |
| 16 | Alumni networks of paying programs | 1 hr | `alumni-GROUP` | Next week |
| 17 | A webinar for counselor associations | 2 hrs | `webinar-AFFILIATE` | Next week |
| 18 | The December deferral season push | 2 hrs, planned now | `dec-*` | 10–20 Dec |
| 19 | Correct travel posts about visas Americans can't use | 30 min each | `visa-fix` | Ongoing |
| 20 | Podcast guest appearances | 1 hr + recordings | `pod-SHOW` | Next week |

---

## 11. Get closed-program pages into Google

**Why it works.** People search "is the Payne Fellowship still running" and
find stale pages. Program pages now answer in the title itself, for example
"Is X still running? No, it has shut down", and there is finally a sitemap.
Google still has to find them.

**Built:** `/sitemap.xml` (386 pages), `/robots.txt`, status-aware titles.

1. Add the site to Google Search Console. Steps are in `11-search-console.md`.
2. Submit `https://gyp-psi.vercel.app/sitemap.xml`.
3. Use URL Inspection → Request indexing on the eight shut-down or paused
   program pages listed in the file. They answer questions nobody else does.
4. After a month, open Performance → Queries and look for "still running",
   "discontinued", "2027".

**Collateral:** `11-search-console.md`

---

## 12. Promote the deferral letter template

**Why it works.** A student searching for a deferral letter has already been
admitted and decided to take the year. The template answers that search, and
the next question is what to do with the year.

**Built:** `https://gyp-psi.vercel.app/deferral-letter`

1. Wait for December. Early decision results arrive mid-month and deferral
   questions spike.
2. Answer deferral questions on Reddit (r/ApplyingToCollege, r/gapyear) with
   the replies in `12-deferral-letter.md`.
3. Send the counselor note in the same file to anyone who replied to earlier
   outreach.

**Collateral:** `12-deferral-letter.md`

---

## 13. Get listed in library research guides

**Why it works.** Librarians maintain LibGuides, curated resource pages that
schools and colleges link students to. Gap year guides already exist at
schools like Milton Academy, Antioch College and Cypress College. Librarians
add good free resources and rarely take anything down.

1. Find guides with the searches in `13-librarians.md`.
2. Note anything on their guide that has closed or that charges money
   without saying so. That's your opening, the same as the adviser emails.
3. Send the email to the guide's listed owner.

**Collateral:** `13-librarians.md`

---

## 14. A personal finance lesson for teachers

**Why it works.** Next Gen Personal Finance gives free curriculum to more
than 51,000 teachers, and teachers share lessons that work. "Should you pay
$43,750 for a gap year?" is a real cost-comparison exercise with a real
decision attached.

1. Use the lesson plan and worksheet in `14-lesson-plan.md` and `14-worksheet.html`.
2. Post it free on Teachers Pay Teachers, where NGPF also publishes, and
   share it in teacher communities.
3. Offer it to NGPF directly using the note in the file.

**Collateral:** `14-lesson-plan.md`, `14-worksheet.html`

---

## 15. College Advising Corps advisers

**Why it works.** College Advising Corps places recent college graduates as
full-time advisers in low-income high schools, funded through AmeriCorps.
They're a double audience: they advise first-generation students who can
least afford a paid gap year, and they're doing a paid service year
themselves and will need to know what comes next.

1. Find the state programs on College Advising Corps' site.
2. Send the email in `15-college-advising-corps.md` to each state program's
   leadership, not to individual advisers.

**Collateral:** `15-college-advising-corps.md`

---

## 16. Alumni networks of paying programs

**Why it works.** JET alumni have 19 US chapters. The National Peace Corps
Association has more than 145 affiliate groups. Alumni get asked "how did you
do that?" constantly, and would like a neutral place to send people.

1. Find chapter contacts on the JETAA USA chapter page and the NPCA affiliate directory.
2. Send the email in `16-alumni-networks.md`.
3. Offer the program's own page on the site as the link.

**Collateral:** `16-alumni-networks.md`

---

## 17. A webinar for counselor associations

**Why it works.** NACAC has 23 regional affiliates, each running professional
development for counselors. A 45-minute session on paid gap years puts you in
front of a room of counselors at once, and it's educational rather than a
pitch, which is what their proposal rules require.

1. Use the proposal and outline in `17-counselor-webinar.md`.
2. Send it to the professional development chair of two or three affiliates.
3. Make the slides from the outline. Every slide uses data already in the data sheet.

**Collateral:** `17-counselor-webinar.md`

---

## 18. The December deferral season push

**Why it works.** Early decision results arrive in mid-December. Deferred,
admitted-but-unsure and rejected students all start asking the same question
that week. Most of this can be prepared now and scheduled.

1. Follow the day-by-day plan in `18-december-campaign.md`.
2. Prepare the posts and emails in November.

**Collateral:** `18-december-campaign.md`

---

## 19. Correct travel posts about visas Americans can't use

**Why it works.** The same wedge as the fellowship emails, aimed at travel
bloggers. Posts routinely tell Americans they can do working holidays in
countries that have no agreement with the US. A polite, sourced correction
often earns a link.

**Read the file first.** The catalog was wrong about Canada, which *is* open
to Americans through one organization. Only use the claims marked verified.

1. Search for posts using the queries in `19-visa-corrections.md`.
2. Check the claim against the official page listed for that country.
3. Send the correction email.

**Collateral:** `19-visa-corrections.md`

---

## 20. Podcast guest appearances

**Why it works.** College admissions and personal finance podcasts need
guests with something new to say. "Fellowships that ended are still being
advertised" and "$75,000 gap years next to 230 that pay" are both new.

1. Find shows with the search approach in `20-podcasts.md`.
2. Send the pitch, with the data sheet attached.
3. Use the talking points so every number you say on air is correct.

**Collateral:** `20-podcasts.md`
