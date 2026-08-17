# Stipend Clock

Phase 1 of a four-phase gap-year platform: a free, ad-free directory and
deadline tracker for gap-year and post-grad programs that **pay the
participant** — stipends, living allowances, education awards, or wages.
Never a program the participant pays to join, never a commission on a
placement.

Two cohorts, one non-overlapping split (`degree_required`):

- **Pre-college deferral / no degree required** — 18-year-olds with a
  deposited, deferred college seat, or any recent high school grad.
- **Post-grad / degree required** — college grads (or soon-to-be) figuring
  out what's next.

See the full four-phase spec for the product thesis and phase gates. This
repo is phase 1 only: no accounts, no payments, no plan builder.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| DB | Turso / libSQL (`@libsql/client`) — a local `file:./local.db` in dev |
| Hosting | Vercel |
| Scheduled jobs | Vercel Cron (`vercel.json`) |
| Email | Resend |
| Extraction | Anthropic API (`claude-sonnet-4-6` by default, override via `ANTHROPIC_EXTRACTION_MODEL`) |

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything degrades gracefully when unset
npm run db:migrate           # creates all tables in local.db (or your Turso DB if configured)
npm run db:seed              # seeds 46 hand-verified programs
npm run dev
```

Without `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` set, the app uses a local
SQLite file (`local.db`) — nothing else to install. Point those two env vars
at a real Turso database for anything beyond local dev.

Without `RESEND_API_KEY`, outgoing email is logged to the console instead of
sent — the watch flow and reminder cron both still work end-to-end.

Without `ANTHROPIC_API_KEY`, the verification cron (`/api/cron/verify`) is a
no-op per program (logs and moves on) rather than failing.

## Routes

| Route | Purpose |
|---|---|
| `/` | Value prop, next deadlines, quiz entry |
| `/start` | Four-question eligibility quiz, querystring-driven, no account |
| `/programs` | Filtered directory |
| `/programs/[slug]` | Full program detail: pay, eligibility, deadlines, funding banner, fallbacks, watch button |
| `/deadlines` | All upcoming deadlines, sorted soonest first |
| `/admin/review` | Basic-auth-gated review queue for the verification cron's staged changes |
| `/api/watch` | POST — email capture, creates `people` + `plans` + `plan_items(kind='watch')` |
| `/api/unsubscribe?token=` | Removes a person's watch items |
| `/api/cron/verify` | Nightly: fetch each stale program's `source_url`, extract with Claude, diff, stage in `review_queue` |
| `/api/cron/remind` | Daily: email watchers at T-30/T-7/T-1 before each deadline |

## The one rule that matters: never auto-publish a deadline or pay change

The verification cron only ever *stages* changes in `review_queue`. A human
reviews the diff at `/admin/review`, enters their initials, and approves or
rejects — only then does it touch `programs` or `deadlines`, and the
`deadlines.confirmed_by` column records who. The one exception: if the cron
detects language suggesting a program is paused/suspended/cancelled, it
immediately flips `funding_status` to `at_risk` (erring toward caution, not
toward publishing an unconfirmed fact) and — if `ADMIN_EMAIL` is set — emails
an alert.

## Admin access

`/admin/review` is protected by HTTP Basic Auth via `ADMIN_USER` /
`ADMIN_PASSWORD` (see `src/middleware.ts`). Unset either and the route
returns 503 rather than silently opening up.

## Deploying

1. Create a Turso database, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel's project env vars.
2. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_BASE_URL`, and optionally `ADMIN_EMAIL`.
3. Run `npm run db:migrate` and `npm run db:seed` once against the production DB (e.g. locally with prod env vars, or a one-off script).
4. Deploy. `vercel.json` wires up the two crons; Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when `CRON_SECRET` is set.
5. Buy the domain. (Not done yet — see naming note below.)

## Naming

Working name is **Stipend Clock**, chosen to lead with the money and the
deadline rather than the phrase "gap year" — which reads as failure to the
post-grad cohort and as an admissions deferral to institutions. The exact-match
`.com` has not been secured; do that before any real distribution push.

## Data integrity notes for whoever seeds/expands the catalog next

- The catalog currently has 46 programs, hand-verified via live web research
  as of 2026-08-16, short of the phase-1 target of ~60. The remaining gap is
  mostly individual state/regional conservation corps not yet researched —
  expanding further should follow the same pattern: add to
  `scripts/seed-data.ts` or a new `seed-data-N.ts` file wired into
  `scripts/seed.ts`, then re-run `npm run db:seed` (idempotent, upserts by
  slug). Several entries have `pay_low`/`pay_high` left `null` with an
  explanatory `pay_note` where a current org-wide figure couldn't be
  confirmed — worth another verification pass before heavy distribution.
- `pay_low`/`pay_high` are integer minor-units: cents for USD/EUR, whole
  units for zero-decimal currencies like JPY (set `pay_currency`
  accordingly — see `src/lib/format.ts`).
- Every deadline in the seed data came from a specific source page fetched
  during research, but several important dates (Fulbright campus deadlines,
  JET's 2027 window, TAPIF's 2027-28 window) were **not yet published** at
  seed time and are marked `note`-only with no `due_at`. Don't backfill a
  guessed date — leave it null until confirmed.
- Princeton Bridge Year and Tufts 1+4 were deliberately excluded from the
  seed despite being named in the original spec: Princeton's is need-based
  cost coverage with no flat stipend (conflicts with "must pay the
  participant"), and Tufts has been on hiatus since COVID with no announced
  restart. Re-add if either changes.

## Phase gate — read before writing phase 2 code

Per the spec, phase 2 (parent tier, $25/mo) only starts once:

- [ ] Watcher conversion (signups / unique visitors) is above 15%
- [ ] At least 3 fellowship advisers have forwarded or linked the tool
- [ ] Watchers tracking 2+ programs is above 30% (routing signal, not one-off lookup)

**Kill criterion:** watcher conversion under 5% means deadline tracking isn't
the pain point — keep the directory as a content asset and stop before
building phase 2.

None of this is instrumented yet (no analytics wired up in phase 1 beyond
what's inferable from `plan_events`). Add lightweight, privacy-respecting
pageview/conversion tracking before trying to read these numbers.
