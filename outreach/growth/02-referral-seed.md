# 2. Seed the share-my-link loop

Anyone who signs up now sees "Know someone else deciding what to do next
year? Send them your link." with a personal link. You don't need to do
anything for that part.

This is the one-time note to people who signed up **before** that existed.
Send it once, from your own address, plain text.

## Where to get the list

```bash
turso db shell gap-year-platform "SELECT email, created_at FROM people WHERE email NOT LIKE '%example.com' ORDER BY created_at"
```

## The note

**Subject:** `One small favor`

```
Hi,

You signed up for gap year deadline and closure alerts a little while ago.
Thanks for that.

One ask, and I won't send another like it: if you know one person who's
deciding what to do next year, a senior, a sibling, a friend finishing
college, send them this:

https://gyp-psi.vercel.app/?ref=seed

It's free, nothing on it is sponsored, and it separates the 230 gap years that
pay you from the 89 that charge you.

That's it. Thanks.

Gautam
```

## Why only once

The first ask reads as a favor from a person. A second one reads as a
marketing sequence, and it's the kind of email that makes people unsubscribe
from the alerts they actually wanted.
