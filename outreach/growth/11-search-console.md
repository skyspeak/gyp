# 11. Google Search Console

## Set it up (about 20 minutes, once)

1. Go to https://search.google.com/search-console and sign in.
2. Add property → **URL prefix** → `https://gyp-psi.vercel.app/`
3. Verify with the **HTML tag** method. Google gives you a
   `<meta name="google-site-verification" content="...">` tag. Send me the
   `content` value and I'll add it to the site, or add it to `metadata` in
   `src/app/layout.tsx` as `verification: { google: "..." }`.
4. Once verified: Sitemaps → enter `sitemap.xml` → Submit.

If you later move to your own domain, add a **Domain** property instead,
verified through DNS.

## Request indexing for these first

URL Inspection → paste each URL → Request indexing. These are the pages that
answer a question with no good answer elsewhere:

```
https://gyp-psi.vercel.app/programs/payne-fellowship
https://gyp-psi.vercel.app/programs/mitchell-scholarship
https://gyp-psi.vercel.app/programs/pickering-fellowship
https://gyp-psi.vercel.app/programs/rangel-fellowship
https://gyp-psi.vercel.app/programs/american-climate-corps
https://gyp-psi.vercel.app/programs/frontier-gap-year
https://gyp-psi.vercel.app/programs/thinking-beyond-borders
https://gyp-psi.vercel.app/programs/winterline-global-skills
https://gyp-psi.vercel.app/map
https://gyp-psi.vercel.app/deferral-letter
```

Open each one in a browser before submitting. If a slug doesn't load, find
the page from the catalog search and use that URL. Google limits indexing
requests per day, so spread them over a few days if it asks you to.

## What to check monthly

Performance → Search results → Queries. Filter queries containing:

- `still running`, `discontinued`, `cancelled`, `paused`
- `2027`
- `deferral letter`
- `paid gap year`

Pages with impressions but few clicks need a better title or description.
Pages with no impressions after two months may not be indexed; check them
with URL Inspection.
