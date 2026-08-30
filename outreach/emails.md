# Outreach emails — ready to send

Send window: **Tue 1 – Fri 4 September 2026.** Marshall closes 29 Sep, Fulbright
ETA 6 Oct, Rhodes 7 Oct. After roughly 8 September this audience is buried and
nothing gets read until November.

Merge fields: `{{first_name}}`, `{{institution}}`, `{{ref}}`.
`{{ref}}` is the code from `targets.csv` — it is how a forward gets attributed.

Every factual claim below is hand-verified against the program's own source.
Nothing from the unverified bulk import is used.

---

## Email 1 — the closure notice

Primary send. Plain text, no images, no signature graphics, no tracking pixel.

**Subject:** `Payne, Pickering and Rangel on your fellowships page`

Alternate subject if their page does not list those three:
`Three fellowships that are no longer accepting applications`

```
Hi {{first_name}},

I maintain a free, non-commercial index of gap year and post-grad paths.
While checking fellowship listings I noticed a few that are still commonly
advertised but are not currently open:

• Donald M. Payne International Development Fellowship — terminated
  27 February 2025 alongside the USAID shutdown. No cohort has been
  recruited since.

• Thomas R. Pickering Foreign Affairs Fellowship — the 2026 cycle was
  postponed pending guidance from the State Department, with no restart
  announced.

• Charles B. Rangel International Affairs Fellowship — same posture as
  Pickering, 2026 cycle postponed.

• George J. Mitchell Scholarship — the US-Ireland Alliance paused selection
  of future classes in March 2024. The notice is still on their own
  application page.

I am not asking for anything. I thought you would rather know before advising
season than after a student has spent a month on an application.

If it is useful, I also keep a calendar feed of the deadlines that are still
live — Marshall, Fulbright, Rhodes, Gates Cambridge, Soros and the rest.
Subscribing once puts them in your own calendar and they update each cycle:

https://gyp-psi.vercel.app/api/calendar.ics?ref={{ref}}

Best,
Gautam
https://gyp-psi.vercel.app/?ref={{ref}}
```

**Why this works:** every line is checkable in under a minute against the
program's own site, it is professionally relevant on a deadline, and the only
"ask" is a link they can ignore.

**Do not** add "let me know if you have questions" or "I'd love to hear your
thoughts." The absence of an ask is the entire strategy.

---

## Email 2 — follow-up

Send **only to non-repliers**, 9–10 days after Email 1. Reply in the same
thread so it appears beneath the original.

**Subject:** `Re: Payne, Pickering and Rangel on your fellowships page`

```
Hi {{first_name}},

Following up once, then I'll leave you alone.

The deadline calendar is here if it is useful this cycle:
https://gyp-psi.vercel.app/api/calendar.ics?ref={{ref}}

In Apple Calendar or Outlook the link subscribes directly. In Google Calendar
it is Other calendars → From URL. Closed and paused programs are excluded
automatically, so it will not put Payne or Mitchell back in front of a student.

Best,
Gautam
```

---

## Email 3 — final note

Only if Email 2 also gets no reply. Send late October or November — after
their crunch, not during.

**Subject:** `One update on the fellowships that were paused`

```
Hi {{first_name}},

Last note from me. If any of Payne, Pickering, Rangel or Mitchell restarts, I
will hear about it when their own page changes, and I am happy to forward that
to you rather than have you check.

Reply with "yes" and I'll add you. Otherwise I won't write again.

Best,
Gautam
```

---

## Variant — high school counselors

Different audience, different problem: they own the deferral cohort and have
almost nothing credible to hand a family.

**Subject:** `Gap year options that pay, for the deferral conversation`

```
Hi {{first_name}},

I maintain a free, non-commercial index of gap year programs. It exists
because the ones families find first are the ones with marketing budgets — a
postgraduate year at a boarding school runs to about $75,000, EF Gap Year
around $43,750.

The index tracks 381 programs and separates them by one thing: whether the
program pays the participant or charges them. Most conservation, service and
teaching-abroad options pay a stipend. I list the priced ones too, with the
price, so a family can compare honestly.

https://gyp-psi.vercel.app/?ref={{ref}}

No commissions, no referral fees, and no program can pay to appear. If it is
useful for the deferral conversation, take it. If not, no reply needed.

Best,
Gautam
```

---

## Reply snippets

Paste and adjust. Keep answering fast and short — speed is most of the
credibility here.

**"Who are you / what is this?"**
```
Fair question. I built it after finding that most gap year directories are
paid placement — the operator pays to be listed, so nothing is ever
recommended against. This one takes no money from any program and never will,
which is the only reason its "this one closed" entries are worth anything.
It's free, there is no account, and I'm not selling anything.
```

**"Can I share this with students / put it on our page?"**
```
Please do. If you use this link the signups get attributed to you, which is
the only way I can tell whether any of this is useful:
https://gyp-psi.vercel.app/?ref={{ref}}
```

**"Is X still running?"**
```
Let me check its source page and come back to you today.
```
(Then actually check, and reply with the date and the link. This exchange is
worth more than the original email.)

**"Where did you get this information?"**
```
Each one from the program's own source. Payne from the fellowship's own
program pages; Pickering and Rangel from their application portals; Mitchell
from the US-Ireland Alliance's application process page, which still carries
the pause notice. Frontier from the UK Companies House record — Society for
Environmental Exploration, company 02374609, dissolved 26 September 2023.
Happy to send the links for any of them.
```

**"Do you want to partner / can we be featured?"** (from an operator)
```
Thanks, but no — I don't take placement, sponsorship or referral fees from
programs, in either direction. If anything in your listing is wrong I'll fix
it today; send me the correction and the source.
```

---

## Listserv / forum post

For NAFSA, NACAC or a regional fellowship-advising list. Post once. Do not
cross-post.

```
Subject: Fellowships currently paused or terminated (Payne, Pickering,
Rangel, Mitchell)

Sharing in case it saves someone an advising conversation this cycle:

- Payne Fellowship: terminated 27 Feb 2025 with the USAID shutdown
- Pickering and Rangel: 2026 cycles postponed pending State Dept guidance
- Mitchell Scholarship: selection paused since March 2024

All four are still listed as open on a number of university advising pages.

I keep a free, non-commercial index of these along with a calendar feed of
the deadlines that are still live: https://gyp-psi.vercel.app/

No affiliation with any program and no commissions — happy to send sources
for any of the above.
```

---

## Sending rules

1. **Plain text.** No HTML, no logo, no tracking pixel. An adviser's spam
   filter and their trust both prefer it.
2. **50 a day maximum**, from your normal address. Anything faster looks like
   what it would then be.
3. **One personalised line** at the top when their page actually lists a dead
   program — name the page. That line is worth more than the rest combined.
4. **Never** add an unsubscribe footer to a genuine one-to-one email; it
   converts a personal note into a marketing send.
5. Log every reply in `targets.csv` the day it arrives.
