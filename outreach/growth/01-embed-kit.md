# 1. Embed kit

## The snippet

Replace `YOURCODE` with the school's ref code from `institutions.csv`.

```html
<iframe
  src="https://gyp-psi.vercel.app/embed/map?ref=YOURCODE"
  title="Where you can do a gap year"
  width="100%"
  height="900"
  style="border:0; max-width:1200px;"
  loading="lazy">
</iframe>
```

What they get: the live map with no header or footer from this site. Clicking a country shows its
gap years. Program links open in a new tab, so students never leave the
school's page by accident.

## The email

**Subject:** `A gap year map for your [gap year / service year] page`

```
Hi {{first_name}},

I run a free, non-commercial index of gap year and service year programs, and
I saw your [page name] page lists [two programs from their page].

I built a map that might sit well on that page. Students click a country and
see every gap year they can do there, with what each one pays or costs.
There are 55 countries on it. Nothing on it is sponsored, and closed
programs are removed as they close, so it won't send a student to something
that ended.

If you want it, this is the whole thing:

<iframe src="https://gyp-psi.vercel.app/embed/map?ref={{ref}}" title="Where you can do a gap year" width="100%" height="900" style="border:0;max-width:1200px" loading="lazy"></iframe>

You can see it working here first:
https://gyp-psi.vercel.app/embed/map?ref={{ref}}

No reply needed if it isn't a fit.

Gautam
```

## If they say yes

**WordPress:** add a Custom HTML block, paste the snippet, update the page.

**Squarespace:** add an Embed block, choose Code, paste the snippet.

**Drupal / campus CMS:** most campus systems strip iframes from the normal
editor. Ask them to send it to whoever manages the site. It's one iframe and
loads nothing from third parties except this site.

**If their CMS blocks iframes entirely:** send a plain link instead,
`https://gyp-psi.vercel.app/map?ref={{ref}}`. The share preview shows the map image.

## Check it's live

A week after they say yes, open their page, view source and search for
`embed/map`. Then check the referrer query for their code.
