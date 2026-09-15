# 19. Correcting travel posts about visas Americans can't use

Travel posts regularly tell Americans they can do a working holiday in
countries that have no agreement with the United States. A polite, sourced
correction is useful to the writer and sometimes earns a link.

## Read this before sending anything

**The catalog was wrong once already.** It marked Canada's program closed to
Americans. It isn't: Canada's own list of Recognized Organizations gives SWAP
Working Holidays' eligibility as "Citizens of IEC countries or territories and
the United States". The importer is fixed, and the live site shows it once
`migrations/2026-09-15-canada-iec-open-to-americans.sql` has been run. A post
telling Americans they can work in Canada through SWAP is **correct**. Don't
correct it.

A wrong correction is worse than no email. Only use the rows marked
**verified**, and re-open the official page the day you send.

## What's verified

| Country | Open to Americans? | Status | Official source |
|---|---|---|---|
| Hong Kong | No. The US is not on the list of countries with a Working Holiday Scheme agreement | **Verified 15 Sep 2026** | https://www.immd.gov.hk/eng/services/visas/working_holiday_scheme.html |
| Taiwan | No. The US is not among Taiwan's working holiday partners | **Verified 15 Sep 2026** (government partner list) | https://www.youthtaiwan.net/workingholidayen/cp.aspx?n=6426 |
| Canada | **Yes**, through SWAP Working Holidays only | **Verified 15 Sep 2026** | https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/recognized-organizations.html |
| Japan | No, per the catalog | Confirm by hand. The official page blocked automated checks | https://www.mofa.go.jp/j_info/visit/w_holiday/index.html |
| Australia | The 417 visa is not for Americans; Americans use the **462** (Work and Holiday) instead | Confirm by hand. The official page blocked automated checks | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462 |
| Estonia, Netherlands, Argentina | Marked no in the catalog | **Don't use.** The catalog's sources for these don't establish it | none |

The Australia row is the easiest to get wrong. A post saying "Americans can do
a working holiday in Australia" is right, through the 462. Only correct a post
that tells Americans to apply for the **417**.

## Finding posts

```
"working holiday visa" "Americans" Hong Kong
"working holiday visa" "US citizens" Taiwan
"417" "working holiday" "Americans"
"working holiday visa countries" "US citizens"
```

## The email

**Subject:** `A small correction on your {{country}} working holiday post`

```
Hi {{name}},

I read your post "{{post title}}". It's genuinely helpful. One detail that
might trip up American readers: {{country}}'s working holiday scheme isn't
open to US citizens. {{The official list of partner countries doesn't
include the United States / For Australia: Americans are eligible, but for
the subclass 462 Work and Holiday visa rather than the 417.}}

Official source: {{official URL}}

I maintain a free, non-commercial list of which working holiday and gap year
programs Americans can actually use, in case it's useful for readers:
https://gyp-psi.vercel.app/map?ref=visa-fix

Thanks for writing it.

Gautam
```

The resource link is optional. If the post is otherwise excellent, send only
the correction. That tends to earn goodwill, and sometimes a link on its own.
