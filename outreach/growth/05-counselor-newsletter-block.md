# 5. Counselor newsletter block

A block of real deadlines counselors can paste into their monthly newsletter.
Dates were pulled from the catalog on 15 September 2026, with closed and paused
programs excluded.

**Before each send:** recheck every date against the program's site, and
delete anything that has already passed.

## October 2026 block (plain text, pastes anywhere)

Replace `SCHOOLCODE` with the school's ref code.

```
FUNDED GAP YEAR AND POST-GRAD DEADLINES THIS MONTH

Oct 1  Marshall Scholarship (UK graduate study)
Oct 5  Washington Conservation Corps: applications open
Oct 6  Fulbright U.S. Student Program, English Teaching Assistant
       awards, including Brazil, Czech Republic, Indonesia, Jordan,
       Morocco and Poland
Oct 6  Fulbright Public Policy Fellowship
Oct 6  Knight-Hennessy Scholars (Stanford)
Oct 7  Rhodes Scholarship
Oct 14 Gates Cambridge Scholarship
Oct 29 Paul & Daisy Soros Fellowships for New Americans

Coming in November: Churchill Scholarship (Nov 2).

Every program here is funded. Confirm each date on the program's own site;
campus deadlines are often earlier.

More deadlines, and gap years that pay instead of charge:
https://gyp-psi.vercel.app/?ref=newsletter-SCHOOLCODE
```

Marshall appears twice in the catalog, on 29 September and 1 October. Check
the official site before sending and use whichever is current.

## The offer email

**Subject:** `A ready-made deadline block for your newsletter`

```
Hi {{first_name}},

I keep a free, non-commercial calendar of funded gap year and post-grad
deadlines. Every month I put together a short block of the ones coming up,
formatted to paste straight into a counseling or advising newsletter.

Here's October's. Use it, trim it, or ignore it:

[paste the block]

If it's useful, I'm happy to send one each month. No sponsorships, and
nothing in it is paid placement.

Gautam
```

## Each month

Pull next month's dates:

```bash
turso db shell gap-year-platform "SELECT substr(d.due_at,1,10) AS due, p.name FROM deadlines d JOIN programs p ON p.id = d.program_id WHERE d.due_at >= date('now','start of month','+1 month') AND d.due_at < date('now','start of month','+2 months') AND p.funding_status NOT IN ('defunded','paused') AND p.us_eligible = 1 ORDER BY d.due_at"
```

Keep the block to programs that pay or are fully funded, so it matches what
the site says it's for.
