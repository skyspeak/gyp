# Send checklist

## Before the first email goes out

- [ ] **Read the four closure claims once more against their own pages.** They
      are the entire credibility of the campaign, and a wrong one inverts it.
      Payne, Pickering, Rangel, Mitchell — links in `sources.md`.
- [ ] Build the target list. The Fulbright Program Adviser directory is public:
      https://us.fulbrightonline.org/fulbright-program-advisers
- [ ] For each row, open their public fellowships page and check whether it
      still lists Payne, Pickering, Rangel or Mitchell. Put the URL in
      `their_page_url` and the program name in `dead_program_on_their_page`.
      **Prioritise those rows** — those emails write themselves and convert.
- [ ] Assign a `ref` code per row: `institution-lastname`, lowercase, no spaces.
- [ ] Send yourself Email 1 first and click every link in it.

## Order of sending

1. Advisers whose own page lists a dead program (personalise line 1 by naming
   the page).
2. Remaining Fulbright Program Advisers.
3. Institutions that fund their own gap year — Princeton, UNC, Duke and
   similar. They already believe the thesis.
4. High school counselors, using the variant email.

## Rules

- 50 a day, from your normal address, plain text.
- Reply to every response within a day, even "no thanks".
- If someone points out an error, fix it that day and reply telling them it is
  fixed. That exchange converts better than the original email.

## After

- [ ] Log replies in `targets.csv` as they arrive.
- [ ] After two weeks, read the numbers:

```bash
turso db shell gap-year-platform "SELECT referrer, COUNT(*) FROM people WHERE referrer IS NOT NULL GROUP BY 1 ORDER BY 2 DESC"
```

```bash
turso db shell gap-year-platform "SELECT source, COUNT(*) FROM people GROUP BY 1 ORDER BY 2 DESC"
```

  Visitors come from the Cloudflare Web Analytics dashboard. Conversion is
  signups ÷ unique visitors. Ad blockers suppress the beacon, so real
  conversion is somewhat lower than it will appear.

- [ ] The bar set in the original spec: reply rate above 8%, and 3+ advisers
      forwarding or linking. Below 5% signup conversion is the kill signal.

## Known weak points, so they do not surprise you

- **`RESEND_API_KEY` may still be unset in production.** If it is, someone can
  subscribe and will never receive anything. Check before you send:
  `curl -s "https://gyp-psi.vercel.app/api/health?token=$CRON_SECRET"` and look
  at `emailEnabled`.
- **225 of 381 catalog rows are unverified bulk imports.** None are cited in
  these emails, but an adviser who browses may hit one. The fellowships — what
  this audience checks first — are hand-verified.
- **The closure list no longer has a page.** It used to live at `/changes`,
  which was deleted, so the evidence is in the email body instead. That is why
  Email 1 spells out all four rather than linking to a list.
