# 6. Paying programs share kit

The ground rule, stated before anything else: **no money changes hands, and
agreeing to share makes no difference to placement.** The listing and its
order stay the same whether they share it or not. That's the only reason
the listing is worth sharing.

Start with conservation (40 programs pay), then service (34), then teaching
abroad (29). Find the program's recruitment or outreach contact on its own
site.

## The email

**Subject:** `{{program}} is listed as a gap year that pays`

```
Hi,

I run a free, non-commercial index of gap year and service year programs
that separates the ones that pay participants from the ones that charge
them. {{program}} is listed as one that pays:

https://gyp-psi.vercel.app/programs/{{slug}}?ref=listed-{{slug}}

Two things, neither of which needs a reply:

1. If anything on that page is wrong or out of date (pay, dates, locations),
   send me the correction and a source and I'll fix it the same day.

2. If it's useful for recruiting, you're welcome to link to it. Some
   applicants trust a page that isn't the program's own. There's a small
   badge below if you want one.

To be clear: I don't take placement fees, sponsorship or referral payments
from anyone, and linking to the page changes nothing about how the program is
listed.

Gautam
```

## The badge

```html
<a href="https://gyp-psi.vercel.app/programs/SLUG?ref=listed-SLUG"
   style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid #dfe4e1;border-radius:10px;font:500 14px/1.2 -apple-system,Helvetica,Arial,sans-serif;color:#14181c;text-decoration:none;background:#fff">
  <span style="display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;background:#1b5a43;color:#fff;font-size:10px;font-weight:700">GY</span>
  Listed on Gap Year Platform as a program that pays
</a>
```

Replace `SLUG` twice. It has no image files and no scripts, so it works on
any site.

## If they offer money or ask for better placement

```
Thanks, and I appreciate the offer, but I can't accept anything. The index
only works because no program pays to be on it or to be ranked higher, and
the day that changes it stops being useful to applicants, including yours.
The listing will stay accurate; send corrections any time.
```

## If they send a correction

Fix it the same day and reply saying it's done. That exchange is worth more
than the badge.
