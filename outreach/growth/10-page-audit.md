# 10. Page audit

A private, free check of an adviser's whole fellowships or gap year page.
Offer it only to people who have replied warmly to earlier outreach. It takes
about 30 minutes.

## The offer (reply to their reply)

```
Glad it was useful. If you want, I can go through your whole fellowships page
the same way, checking every program against its own site for closures,
paused cycles and stale deadlines, and send you a short list. It's free and
stays between us.
```

## How to do the audit

1. Open their page and list every program it mentions.
2. For each one, open the program's **official** site (not a blog or directory) and note:
   - Is it running? Look for "terminated", "paused", "postponed", "no longer accepting".
   - Is the deadline on their page the current cycle's deadline?
   - Does the link on their page still work?
3. Look the program up on https://gyp-psi.vercel.app/programs as a second
   check, but always confirm on the official site. The catalog can be wrong too.
4. Only record something as a problem if you've seen it on the official source.
5. Fill in the template below. Leave out everything that's fine.

## The template

**Subject:** `Your fellowships page: {{n}} things to update`

```
Hi {{first_name}},

Here's the check of {{page URL}}, done {{date}}. I only listed things I could
confirm on each program's own site.

NOT RUNNING
- {{Program}}: {{what the official site says, e.g. "2026 application
  cycle postponed"}}. Source: {{official URL}}

OUT-OF-DATE DEADLINES
- {{Program}}: your page shows {{old date}}; the current cycle is
  {{new date}}. Source: {{official URL}}

BROKEN LINKS
- {{Program}}: {{link}} no longer loads; the program now lives at
  {{new URL}}.

Everything else on the page checked out.

If it helps, I can re-run this before your next advising cycle.

Gautam
```

## Rules

- Never publish an audit, never share one with anyone else, and never use a
  school's results as an example in press or social posts.
- If you're unsure about a program, leave it out. One wrong "not running" undoes
  everything else on the list.
- Log each audit in `institutions.csv` with the date, so you don't redo it.
