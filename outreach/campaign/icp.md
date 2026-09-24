# Who we are actually writing to

Five groups worth a personal email, plus two partner types that are worth a
different kind of ask. Everything else is noise.

The test each one has to pass: **this person already has the problem this
week, and something on the site removes work from their desk today.** A group
that only benefits in the abstract is not an ICP, it is an audience, and
audiences come from channels, not from outreach.

Ranked by how cheaply they convert attention into reach.

---

## ICP 1 — University fellowships adviser

**Who.** The person in a campus office called National Scholarships, Fellowships
Advising, Prestigious Awards, or Global Fellowships. Usually one to three
people for the whole institution. Members of NAFA. They own the web pages that
tell students which national awards exist and when they close.

**How many, and where the list comes from.** `outreach/institutions.csv` has
117 rows. Six are tier 1: pages checked by hand that are wrong right now.
Ninety-six are tier 4: Fulbright top-producing institutions whose pages have
not been opened yet. NAFA's own membership directory is the superset.

**Why now.** Their busiest four weeks of the year are happening. Eight
Fulbright deadlines land on 6 October, Rhodes on the 7th, Gates Cambridge on
the 14th, Soros on the 29th, Churchill on 2 November. They are editing these
pages this month whether or not we write.

**The pain.** Three of the awards their pages list are not running. Payne was
terminated in February 2025, Pickering and Rangel postponed their 2026 cycles,
Mitchell has been paused since March 2024. Students prepare applications for
deadlines that do not exist, and the office finds out from the student.

**What lands.** A specific correction with the official source, not a pitch.
`outreach/dead-link-emails.md` sections 1 to 3 are written and addressed.

**What we ask for.** Nothing on the first email. A link to the catalog goes at
the bottom and is optional to click. The ask, if they reply, is that they add
the status feed to how they check awards.

**Do not contact.** Offices whose pages are already correct. Georgetown and
Boston University came up in search and had both fixed theirs. Sending a
correction to someone who already corrected it is the fastest way to be
ignored the second time.

**Assumption to test.** A sourced correction to a page that is wrong gets a
reply rate above 30 percent, far above a cold pitch. If ten sends produce
fewer than two replies, the email is wrong, not the list.

---

## ICP 2 — High school college counselor, public school

**Who.** One counselor to 300 or 500 students, no gap year specialism, and a
parent night to run in the winter. Reached through state ASCA chapters, the 23
NACAC regional affiliates, district counselor listservs, and the counselor who
already replied to an earlier email.

**Why now.** Nothing in September. Their moment is the week early decision
results land in mid-December, and again after regular decisions in late March.
Writing to them in October buys a reply in December if the first email gave
them something to file.

**The pain.** A family asks "is a gap year worth it" and the counselor has
either nothing, or a brochure from a company that charges $43,750. They cannot
recommend a vendor. They can hand over a neutral list.

**What lands.** The one page price card (`growth/08-price-card.html`), the
deferral letter template, and the deadline calendar feed. Three things they
can put in a newsletter without endorsing anyone.

**What we ask for.** One line in the counseling newsletter, or the handout on
the resources page. `growth/05-counselor-newsletter-block.md` is written to be
pasted without editing.

**Do not contact.** Whole districts at once. This is a personal email from one
person, twenty a day at most, or it reads as vendor mail and gets filtered
with the vendor mail.

---

## ICP 3 — Independent educational consultant

**Who.** Paid directly by families, usually solo or a two-person practice,
IECA or HECA member. Their whole product is being current and independent.

**Why now.** They are building program lists for the families they signed in
August and September.

**The pain.** Recommending a program that has closed is a reputational event
for them in a way it is not for a school counselor. Winterline and Thinking
Beyond Borders both still appear on curated lists, and both are gone.

**What lands.** The closure data, framed as insurance: `/deadlinks`, the alert
signup, and the CSV export. This group is the most likely to pay attention to
the "we checked, it is gone" story because it protects their fee.

**What we ask for.** Nothing but a bookmark, plus a reply telling us where our
data is wrong. They know operators we do not.

**Watch out.** Some IECs take referral fees from gap year operators. Ours takes
none, which is the differentiator, but do not accuse anyone of taking them.
State our own position and stop.

---

## ICP 4 — Parent of a high school junior or senior

**Who.** Household planning for college costs, already quoted a number they
did not expect. Found in Facebook groups (Paying for College 101, Grown and
Flown), in local parent listservs, on Pinterest when they are planning, and in
the comments under any article about gap years.

**Why now.** September through November is research season. December is
decision shock. April is the bill.

**The pain.** They have been shown the priced end of the market first, because
that end advertises. They do not know that 232 programs pay and 93 charge, or
that the split runs by category: outdoor charges 15 to 4, travel and study
charges 47 to 32, conservation pays 40 to 8.

**What lands.** The price card, the five worked years on /design, and the map.
Short, visual, no jargon.

**Channel, not outreach.** Do not email parents. Answer them where they are
already asking, using `growth/08-parent-groups.md`, and let Pinterest and
search do the rest.

**Do not.** Post a link into a group as the first thing you ever do there.
Answer three questions properly first. Most of these groups ban links from new
members on sight, and they are right to.

---

## ICP 5 — Student, 17 to 22

**Who.** Two sub-groups with different triggers. Before college: deferred,
waitlisted, admitted and not ready. After college: graduated into no job, or
looking for the year that pays while they apply to graduate school.

**Why now.** The pre-college wave runs mid-December to early May. The
post-grad wave runs May through August, and it is the group most likely to
care that Teach For America pays $32,000 to $72,000 and NIH postbac pays
$46,100 to $59,300.

**The pain.** Every list they find is either a marketing page for a paid
program or a Reddit thread from 2019.

**What lands.** r/ApplyingToCollege and r/gapyear answers that contain the
answer in the comment, not a link. Short video: "a gap year can cost $75,000,
or pay you $32,000". The map, because it is the one thing people share.

**Do not.** Post a link-only comment anywhere. Both subreddits remove them,
and a removal on a new account is expensive to undo.

---

## Partner type A — Directory editors and list owners

Go Overseas, Volunteer Forever, Volunteer World, One World 365, college-prep
blogs, and the school counseling PDFs that circulate for years.

They are not customers. They are the pages students already find. Fifteen of
them currently present a closed program as open, which is both the reason to
write and the reason they will answer: a stale listing takes enquiries for a
company that cannot answer them. `outreach/dead-link-emails.md` sections 4 to
6 are addressed to them.

The second ask, only after a correction lands, is the embed
(`growth/01-embed-kit.md`) or a link to the map.

## Partner type B — Alumni networks and program operators

JETAA has 19 US chapters. The National Peace Corps Association lists more than
145 affiliate groups. AmeriCorps programs each run their own recruiting.

These people get asked "how did you get that" constantly and have nowhere
neutral to point. They also correct our data for free, which is worth more
than the traffic. `growth/16-alumni-networks.md` is the email.

---

## Who we are not writing to

- **Gap year operators that charge.** We compare their prices. An email from
  us looks like a sales call or a threat, and either way it makes the next
  data correction harder to get.
- **Journalists with no education or money beat.** The closure story is
  specific. A general assignment reporter will not carry it.
- **Anyone we would have to buy a list to reach.** Every list above is
  public, and a bought list would put the first paid transaction in a project
  whose entire pitch is that no money changes hands.
