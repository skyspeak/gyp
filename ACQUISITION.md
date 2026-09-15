# Acquiring the first users

Ideas that would work for any product are not worth writing down. Everything
below is built on something only this catalog has: 381 tracked paths, of which
**234 pay the participant, 93 charge them, 17 are not operating normally, and
9 are recommended to Americans who cannot use them**.

The channel was already chosen in the spec — campus fellowship advisers. What
follows is that bet, plus the assets worth building around it, ranked by
leverage against effort.

---

## The clock, first

Everything is time-boxed by a fact in the data. **18 deadlines fall between
1 September and 31 October 2026**, and they are the ones this audience cares
about most:

| Date | Program |
|---|---|
| 29 Sep / 1 Oct | Marshall Scholarship |
| 6 Oct | **Fulbright US Student Program — ETA** (plus 6 country awards) |
| 6 Oct | Fulbright Public Policy Fellowship |
| 7 Oct | Rhodes Scholarship (US) |
| 14 Oct | Gates Cambridge |
| 29 Oct | Paul & Daisy Soros Fellowships |

Fulbright Program Advisers are target #1, and their busiest three weeks of the
year start in about five. **Email them in the first week of September or wait
until November.** Landing in an adviser's inbox on 5 October is landing in the
one week they will not read anything.

---

## The ideas, ranked

### 1. The dead-programs email to advisers · run this now

The wedge: **17 tracked paths are not operating normally**, and advising pages
keep listing them for years. Payne was terminated 27 Feb 2025. Mitchell paused
selection in March 2024. Pickering and Rangel both postponed 2026 cycles.
Frontier's UK parent dissolved in Sept 2023 and its domain no longer resolves.

Lead with what is wrong on *their* page, cite the date, link `/changes`, ask
for nothing.

> Subject: Payne and Rangel on your fellowships page
>
> Hi [name] — I maintain a free, non-commercial index of gap year and
> post-grad paths and noticed your fellowships page still lists the Payne
> Fellowship as open. It was terminated on 27 February 2025 alongside the
> USAID shutdown. Pickering and Rangel have both postponed their 2026 cycles,
> and the Mitchell Scholarship paused selection in March 2024.
>
> I keep a running list of what has closed or paused, with the source for
> each: [link to /changes?ref=their-name]
>
> No ask — I thought you would rather know before advising season.

Checkable in thirty seconds, professionally relevant, no pitch. Always append
`?ref=`, which is now recorded on signup and is the only way to know who
forwarded what.

**Effort: none, it exists.** **Signal: reply rate above 8%, 3+ forwards.**

### 2. Priced against paid — the substitution pages

The single most persuasive thing in the catalog is that **every category that
gets sold to families has paying equivalents**:

| If they are being sold | Paying alternatives on file |
|---|---|
| Conservation (8 priced) | **39** that pay |
| Teaching abroad (5 priced) | **28** that pay |
| Service (11 priced) | **31** that pay |
| Travel/study (47 priced) | **31** that pay |
| Trades (3 priced) | **13** that pay |

And the prices are real: a postgraduate year at a boarding school runs to
**$75,000**; EF Gap Year $43,750; Verto $33,500; Latitudes $29,800.

Build one page per priced program: *this costs $X — here are the N programs in
the same category that pay instead*. That is 93 pages generated from data that
already exists, each targeting a query a parent actually types ("EF Gap Year
cost", "is Verto worth it"). It is also the most forwardable thing here: it
answers a question a parent is already arguing about.

**Effort: a day, mostly a template.** **Signal: organic traffic in 3–5 months,
and shares from parents.**

### 3. Outdoor is the honest exception — say so

**Outdoor is 15 priced against only 4 that pay.** Every other category has a
paying substitute; this one mostly does not. Publishing that openly costs
nothing and buys more credibility than any of the pages above, because it is
the one place the product's own thesis does not hold. It is also the highest
signal to an adviser that the list is not a pitch.

**Effort: a paragraph.** **Signal: qualitative — it is what makes the rest
believable.**

### 4. A calendar feed advisers subscribe to

**Only 28 programs have a dated deadline** — 125 have a deadline row, but most
are rolling with no date. That scarcity is the point: the 34 dated events are
the whole calendar, and nobody else publishes them in a subscribable form.

**Built.** `/api/calendar.ics` — subscribe once and the deadlines appear in
your own calendar every cycle. Closed, paused and US-ineligible programs are
excluded; `?ref=`, `?category=` and `?money=` narrow it.

This is the only idea here that creates *recurring* presence without sending
anything. It also converts the deadline data from a page someone must remember
to visit into an object living in their workflow.

**Effort: half a day; `.ics` is plain text.** **Signal: subscriber count —
each one is a standing relationship.**

### 5. "Is [program] still running?" — the query nobody answers

`/changes` targets a real search with no good answer today. Operators do not
publish closures and directories go stale. Give each program a status page
stating plainly whether it is running, with the date and the source.

Slow — four to six months before it compounds — which is exactly why it should
start now rather than when it is needed.

**Effort: a template over existing data.** **Signal: organic impressions on
"[program] + closed / still running / 2027".**

### 6. The printable adviser handout

`/connect` is already a handout: who to ask, and 19 questions drawn from real
failure modes. Make it print to one page, with a `?ref=` link. Advisers hand
out paper at fairs and info sessions; a handout with their code on it is
distribution that keeps working after the email.

**Effort: a print stylesheet.** **Signal: `?ref=` signups with no email
open — those came off paper.**

### 7. "Tell me when this opens"

The 256 programs with no deadline are a gap, but the gap is the hook: put
*notify me when applications open* on those pages. It captures the person who
arrives eleven months early — the best possible lead, and today they leave
with nothing.

**Effort: reuses the lead form.** **Signal: signups on undated programs.**

### 8. Forums, as a participant

r/gapyear, r/Fulbright, r/AmeriCorps and the premed forums answer the same
questions weekly. Answer them properly and link only where the link *is* the
answer — a closure date, a deadline, a pay figure. Never post the directory.

**Effort: ongoing, unglamorous.** **Signal: nothing measurable. Do it anyway,
in small amounts.**

---

## Not this

- **Paid acquisition.** The economics do not work against a $0 product, and
  buying traffic for a trust product is the wrong first signal.
- **The operators.** They would want placement in exchange, which is the one
  thing that cannot be sold here without destroying the asset.
- **Anything that implies endorsement.** The value is that nothing is
  recommended and nobody paid to appear.

---

## What has to be true first

- **Verify the fellowships before emailing anyone.** 225 of 381 rows are
  `provenance='bulk_import'` and unverified. The fellowships are exactly what
  this audience checks first, and one wrong figure inverts the wedge.
- **A wrong closure is worse than a missed one.** The importer once read
  "ACTIVE — Note: College Possible *Philadelphia* closed" as a dead
  organisation, along with AmeriCorps State & National (its *grants* were
  terminated) and USFS Direct Hire (its *application windows* closed). All
  three would have gone out as "shut down". Read every row of `/changes`
  yourself before sending a single email.
- **Conversion is now measurable.** Cloudflare Web Analytics is live on every
  page — cookieless, no personal data, which is the only kind of measurement
  this product can ship without contradicting its own pitch. That supplies the
  denominator the phase 1 gate needs (watcher signups ÷ unique visitors ≥ 15%,
  kill below 5%). Signups already record `source`, `role` and `referrer`, so
  forwards are attributable and the audience mix is visible:

  ```sql
  SELECT source, role, COUNT(*) FROM people GROUP BY 1, 2 ORDER BY 3 DESC;
  SELECT referrer, COUNT(*) FROM people WHERE referrer IS NOT NULL GROUP BY 1;
  ```

  Read visitors in the Cloudflare dashboard and signups from the query above.
  One caveat before trusting the ratio: Cloudflare's beacon is blocked by some
  ad blockers, so visitors are undercounted and the true conversion rate is
  somewhat *lower* than it will appear. Judge the 15% gate with that in mind.
- **The name.** "Gap Year Platform" reads as deferral to an admissions office
  and as failure to a 22-year-old applying for Rhodes — the two audiences this
  targets. Worth settling before mass emailing anyone.

---

## If only one thing happens

Send idea #1 in the first week of September, with `?ref=` on every link, after
reading `/changes` line by line. Everything else compounds later; that window
closes on 6 October.
