# Outreach

Everything needed to run the first acquisition push. Copy is ready to send;
the only work left is proofreading and filling in names.

| File | What it is |
|---|---|
| `emails.md` | Four adviser emails, reply snippets, listserv post, sending rules |
| `sources.md` | The source behind every factual claim. Check before sending |
| `send-checklist.md` | Pre-send steps, target ordering, how to read the numbers |
| `targets.csv` | Tracking sheet. One row per person, with the `ref` code |
| `institutions.csv` | 117 institutions in six tiers, each with the reason to email and a source link. Tier 1 pages were checked by hand on 15 Sep 2026 |
| `reddit.md` | One r/gapyear post plus six comment templates |
| `hacker-news.md` | Show HN title, first comment, prepared answers |
| `pinterest.md` | Five boards, ten pin titles and descriptions |
| `pins.html` | The ten pin graphics at 1000x1500. Print to PDF to export |
| `creators.md` | Outreach to gap year, counselor and personal-finance creators |
| `linkedin-and-x.md` | Four LinkedIn posts, four for X |

## Growth hacks

`growth/GROWTH-HACKS.md` is ten step-by-step hacks, each with its own
materials in the same folder: embed kit, referral note, press pitch and
printable data sheet, dataset launch, counselor newsletter block, paying
programs kit, QR poster, parent group price card, video scripts and page
audit template.

## The two things that gate all of it

**Send between 1 and 4 September.** Marshall closes 29 September, Fulbright
ETA 6 October, Rhodes 7 October. After roughly 8 September fellowship advisers
are buried and nothing gets read until November.

**Re-read the four closure claims against their own pages first.** Payne,
Pickering, Rangel and Mitchell are the entire credibility of the campaign, and
one wrong claim inverts it. Sources are in `sources.md`.

## Attribution

Every link carries `?ref=`. It is recorded on signup and is the only way to
know who forwarded what.

```sql
SELECT referrer, COUNT(*) FROM people WHERE referrer IS NOT NULL GROUP BY 1 ORDER BY 2 DESC;
SELECT source, role, COUNT(*) FROM people GROUP BY 1, 2 ORDER BY 3 DESC;
```

Visitor counts come from Cloudflare Web Analytics. Conversion is signups over
unique visitors. Ad blockers suppress the beacon, so the real rate is somewhat
lower than it will look.

## Known gaps, so they do not surprise you

- `RESEND_API_KEY` may be unset in production. If it is, people subscribe and
  never hear anything. Check `emailEnabled` at `/api/health` before sending.
- 225 of 371 catalog rows are unverified bulk imports. None are cited in this
  copy. The fellowships are hand-checked, since that is what this audience
  looks at first.
- The closure list has no page. It lived at `/changes`, which was deleted, so
  the evidence sits in the email body instead.
