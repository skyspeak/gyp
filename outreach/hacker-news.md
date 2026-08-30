# Hacker News

One shot. If it flops you don't get another for months, so post it on a
Tuesday, Wednesday or Thursday between 8 and 10am Eastern, and be at your desk
for the next four hours.

HN doesn't care about gap years. It cares about the data problem: directories
that take money can't tell you a program died. Lead with that.

## Title

Use this one:

```
Show HN: A gap year directory that takes no commissions, so it can say what closed
```

Backups if you want a different angle:

```
Show HN: I tracked 371 gap year programs and 17 have quietly shut down
Show HN: Gap year programs sorted by whether they pay you or charge you
```

Don't use exclamation marks, don't say "excited to share," and don't put the
year in the title.

## Post body

Show HN posts take a URL and an optional text box. Put the URL in the URL
field and leave the text box empty. Then post the detail as the first comment,
immediately, from the same account.

URL: `https://gyp-psi.vercel.app`

## First comment, post it within a minute

```
I built this after noticing that every gap year directory I could find was
paid placement. The operator pays to be listed, which means the list can never
tell you an operator is in trouble. Nobody publishes closures.

So the index takes no money from any program, in either direction, and the
main thing it can do that the others can't is say what stopped running.

371 programs. 231 pay a stipend, wage or education award. 93 charge you, and
the prices are higher than most people assume: a postgraduate year at a
boarding school runs to $75,000, EF Gap Year around $43,750.

17 aren't operating normally but are still listed as open on university
advising pages. The Payne Fellowship was terminated in February 2025 with the
USAID shutdown. The Mitchell Scholarship paused selection in March 2024 and
the notice is still on their own application page. Pickering and Rangel both
postponed their 2026 cycles.

Things I got wrong while building it, since they were the interesting part:

The importer inferred program status by scanning a status note for closure
words. That read explanations as verdicts. "ACTIVE, note: College Possible
Philadelphia closed" became a dead organisation. So did AmeriCorps State and
National, where the grants were terminated rather than the program, and a
forestry job where the application windows had closed. Three false closures,
caught before publishing. The parser now reads the leading verdict.

Sorting by pay compared raw integers across currencies, which ranked a
Vietnamese teaching job paying ₫30,000,000/mo above an $80,000 scholarship.

Deduplicating by name prefix merged "Fulbright U.S. Student Program" into
"Fulbright U.S. Student Program - English Teaching Assistant Awards." Those
are different programs. It's exact-match only now.

What's still weak: 225 of the rows come from a bulk import and haven't been
checked by a person. The fellowships have been, because that's what people
check first. Only 28 programs have a dated deadline, the rest are rolling.

Next.js, SQLite on Turso, deployed on Vercel. There's an .ics feed at
/api/calendar.ics if you want the deadlines in your own calendar.

Happy to answer anything about the data or the methodology.
```

## Prepared answers

HN will ask these. Have them ready, keep them short, and never get defensive.

**"How is this different from [existing directory]?"**
```
Mostly that this one has no revenue model attached to the listings. The
practical difference is the closure data. GoOverseas and similar can't tell
you an operator dissolved, because the operator is a customer. Frontier's UK
parent was dissolved in September 2023 and it's still listed in several
directories.
```

**"How do you make money?"**
```
I don't. There's no revenue and no plan for commissions, because commissions
are what breaks the thing that makes it useful. If it ever needs to pay for
itself it'll be through institutions paying for their own students' outcomes,
never through operators paying for placement.
```

**"How do you keep it current?"**
```
A nightly job refetches each program's own page and flags language suggesting
a pause or closure. Nothing publishes automatically. A person confirms every
status change, because a wrong closure does more damage than a missed one.
```

**"Isn't 225 unverified rows a lot?"**
```
Yes. It's the weakest part and I'd rather say so than have someone find it.
They're labelled in the data as bulk imports. The fellowships and the paying
programs are hand-checked because that's what people actually look at.
```

**"Why should I trust your closure data?"**
```
Don't, check it. Every entry cites the source it came from. Frontier is UK
Companies House, company 02374609, dissolved 26 September 2023. Thinking
Beyond Borders is their last Form 990, fiscal year ending August 2017, plus a
dead website. Mitchell is the pause notice still on the US-Ireland Alliance's
own page.
```

**"This is US-centric."**
```
It is. The eligibility data is written for US citizens, including 10 working
holiday visa schemes that are running fine but that Americans can't use, which
blog posts routinely get wrong. Broadening it is possible but I'd rather have
one accurate country than five vague ones.
```

## While the thread is live

Answer every comment for the first four hours. Short replies. Never argue with
downvotes, never edit the post to respond to a critic, and if someone finds a
factual error, fix it that hour and reply saying it's fixed. That reply is
usually the most upvoted comment in the thread.
