# The email sequence

What the list gets after someone signs up. Today they get one welcome email
and then silence until a deadline reminder fires, which for most signups is
never, because reminders only go to programs someone explicitly watched.

Blocked until `RESEND_FROM_EMAIL` points at a verified domain. Until then
every one of these reaches Gautam's own inbox and nobody else's.

Rules that hold for all of it:

- **No email without a fact in it.** A digest with nothing to report does not
  go out. A quiet month is a quiet month.
- **Plain text, one link, no images.** It has to look like a person wrote it,
  because a person did.
- **Unsubscribe in the first email and every email**, one click, no questions.
- **Never sell anything.** There is nothing to sell. The moment this reads
  like a funnel, the neutrality that makes the whole thing worth reading is
  gone.

---

## Email 1 — on signup (already live)

Subject: `You're on the list`

Keep what is there. One change: name the next real deadline, pulled at send
time, so the first email proves the promise instead of describing it.

```
We'll email you when something you're counting on is closing, or has closed.

Next up: {{soonest deadline name}} closes {{date}}, in {{n}} days.
{{link to that program}}

Everything we track: https://gyp-psi.vercel.app/programs?ref=welcome

No commissions, no paid placements, and we never sell your address.
Unsubscribe any time: {{unsub link}}
```

## Email 2 — day 3

Subject: `The part nobody else will tell you`

The closure data is the thing no other gap year site publishes, so it comes
second, while attention is still there.

```
One thing worth knowing early.

Programs stop running, and the pages recommending them do not catch up.
Six on our list have shut down and three have paused. Fifteen pages
elsewhere still present one of them as open, including three university
fellowship pages.

The evidence, with dates and sources:
https://gyp-psi.vercel.app/deadlinks?ref=nurture-2

If you're counting on a specific program, reply with its name and I'll
tell you when we last confirmed it was running.

Gautam
```

That last line is the point of the email. A reply gives us a real signal about
what people are actually considering, which no analytics tool provides.

## Email 3 — day 10

Subject: `232 pay you, 93 charge you`

```
The catalog splits one way: does the program pay you, or do you pay it?

232 pay a stipend, wage or education award. 93 charge. The split runs by
category, and it is not even:

  Conservation     40 pay,  8 charge
  Paid work        61 pay,  1 charge
  Teaching abroad  29 pay,  5 charge
  Travel and study 32 pay, 47 charge
  Outdoor           4 pay, 15 charge

If the year you have in mind is outdoor or travel-and-study, you are
shopping in the two categories where charging is normal. Worth knowing
before the first brochure.

Sorted by what they pay:
https://gyp-psi.vercel.app/programs?sort=pay&ref=nurture-3

Gautam
```

## Email 4 — day 21, only for signups before college

Subject: `If you need to ask for a deferral`

```
If a gap year means asking a college to hold your place, the letter
matters more than people expect. Admissions offices want a plan with
names and dates in it, not a paragraph about growth.

Template, and what to put in the plan:
https://gyp-psi.vercel.app/deferral-letter?ref=nurture-4

Two things that catch people out: earning credit elsewhere during a
deferral can turn a deferred admit into a transfer applicant, and merit
aid and need-based aid follow different rules. Get both in writing from
admissions before you commit to anything.

Gautam
```

Skip this one for anyone who signed up from a post-grad page. They have no
deferral to ask for.

---

## The monthly digest

First Monday. Send only when at least two of the three sections have
something in them.

Subject: `{{Month}}: {{n}} closing, {{n}} changed`

```
Closing in the next 30 days
  {{name}} — {{date}} — {{pays or costs}}
  {{name}} — {{date}} — {{pays or costs}}
  ...up to six, then "and {{n}} more"

Changed since last month
  {{name}}: {{was}} → {{now}}, {{source}}
  ...or "nothing changed, which is unusual"

Added
  {{n}} programs, {{n}} of which pay. The notable one: {{name}}, {{pay}}

All deadlines: https://gyp-psi.vercel.app/programs?sort=deadline&ref=digest
Calendar feed for your own calendar: https://gyp-psi.vercel.app/api/calendar.ics

Unsubscribe: {{unsub link}}
```

Pull the closing list from the live feed rather than typing it:

```bash
curl -s https://gyp-psi.vercel.app/api/calendar.ics | grep -E "SUMMARY|DTSTART"
```

## The alert that justifies the list

When a program's status changes, the people watching it hear the same day.
That email already exists in `src/lib/status.ts`. Do not add a marketing line
to it. A closure notice with a pitch attached teaches people to stop opening
closure notices.

---

## Segments, kept deliberately crude

Two fields decide everything: the page someone signed up from, and whether
they said they were before or after college. That is enough for the one fork
above (email 4) and nothing else. A list this size does not need more, and
every extra field is another thing to get wrong in public.
