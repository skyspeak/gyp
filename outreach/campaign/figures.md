# Figures — one source of truth

Every number in an email, post, pin or pitch comes from here. Nothing gets
quoted from an older document, because the catalog moves: between 15 and 24
September 2026 the count of programs that pay went from 230 to 232 and the
count that charge went from 89 to 93. Four assets were quoting the old pair
three weeks later.

**Checked: 24 September 2026.** Recheck before any send week, and change the
date on this line when you do.

## The headline pair

| | Count |
|---|---|
| Programs tracked | 372 |
| Pay the participant | 232 |
| Charge the participant | 93 |
| Break even | 47 |
| Shut down | 6 |
| Paused, not selecting | 3 |

## By category

Pay versus charge, which is the whole argument in one table.

| Category | Pay you | Charge you |
|---|---|---|
| Paid work | 61 | 1 |
| Conservation | 40 | 8 |
| Service | 34 | 11 |
| Travel and study | 32 | 47 |
| Teaching abroad | 29 | 5 |
| Trades | 13 | 3 |
| Health | 11 | 0 |
| Research | 8 | 3 |
| Outdoor and wilderness | 4 | 15 |

Two rows carry the story. Outdoor is the one category where charging is the
norm, 15 to 4. Travel and study is the category families are sold first, and
it is the only other one where the charging programs outnumber the paying
ones, 47 to 32.

Do not say "every category has a paid option". Health has no charging program
and outdoor has almost no paying one. Say the table.

## Prices and pay

- Postgraduate year at a boarding school: up to **$75,000**
- EF Gap Year: about **$43,750**
- Teach For America: **$32,000 to $72,000** a year
- NIH postbac (IRTA): **$46,100 to $59,300** a year

## Closures, and who still links to them

- **6 shut down, 3 paused.** Payne terminated 27 Feb 2025. Pickering and
  Rangel 2026 cycles postponed. Mitchell paused since March 2024. Frontier
  dissolved 26 Sep 2023. Thinking Beyond Borders and Winterline closed.
  American Climate Corps revoked by executive order 20 Jan 2025.
- **15 pages still present one of them as open**, including three university
  fellowship pages and a college-prep site that links five times to
  winterline.com.
- **4 of 8** of those programs' own web addresses are dead or now belong to
  someone else. winterline.com serves a domain brokerage today.

Live list with evidence: https://gyp-psi.vercel.app/deadlinks

## What is closing next

18 deadlines fall inside the next 60 days, 16 of them on programs that pay.
The October cluster is why fellowship advisers are worth writing to in
September rather than November:

| Date | Closes |
|---|---|
| 29 Sep 2026 | Marshall Scholarship |
| 1 Oct 2026 | Verto Education Semester Abroad |
| 6 Oct 2026 | Eight Fulbright deadlines, including six ETA countries |
| 6 Oct 2026 | Knight-Hennessy Scholars |
| 7 Oct 2026 | Rhodes Scholarship (United States) |
| 14 Oct 2026 | Gates Cambridge Scholarship |
| 29 Oct 2026 | Paul and Daisy Soros Fellowships |
| 2 Nov 2026 | Churchill Scholarship |

## How to refresh these

The site is the source. Run these and update the tables above.

```bash
for u in "money=all" "" "money=participant_pays" "money=net_neutral"; do
  curl -s "https://gyp-psi.vercel.app/programs?$u" | grep -o '[0-9]*,\\" paths tracked' | head -1
done
```

Per category, swap the slug through `service conservation teaching_abroad
research health trades outdoor travel_study work`:

```bash
curl -s "https://gyp-psi.vercel.app/programs?money=participant_pays&category=outdoor" | head -c 0
```

Deadlines, as a feed you can read without the site:

```bash
curl -s https://gyp-psi.vercel.app/api/calendar.ics | grep -E "SUMMARY|DTSTART"
```

Closures and referrers: open https://gyp-psi.vercel.app/deadlinks and read the
four stat tiles.
