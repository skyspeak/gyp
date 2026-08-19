# Gap Year Platform

Phase 1 of a four-phase gap-year platform: a free, ad-free directory and
deadline tracker for gap-year and post-grad paths, built around a single
question the rest of the industry avoids — **which way does the money flow?**

The directory routes toward paths that **pay the participant** (stipends,
living allowances, education awards, wages). It *also* indexes the ones that
charge the participant, behind an explicit comparison toggle, with their full
cost rendered as prominently as anyone else's pay.

**We never take a commission or referral fee on anything listed, in either
direction.** That is what makes the comparison credible: a router with a rake
cannot tell you a $17,950 semester costs more than nine months of VISTA pays.
Indexing something in order to price it honestly is the opposite of selling it.

## The two primary splits

Both are first-class indexed columns, never tags, because both partition the
catalog into non-overlapping sets that a given student only ever wants one of.

**`degree_required`** — the cohort split:
- **No degree required** — 18-year-olds with a deposited, deferred college
  seat, or any recent high school grad.
- **Degree required** — college grads (or soon-to-be) figuring out what's next.

**`money_direction`** — the money split:
- **`participant_earns`** — pays a stipend, allowance, award, or wage. The
  default view; the only thing the product routes toward.
- **`net_neutral`** — roughly breaks even (costs are covered, but nothing is
  banked). Princeton Bridge Year, WWOOF, Workaway.
- **`participant_pays`** — the participant pays. Indexed for comparison only,
  never recommended, always shown with `cost_low`/`cost_high`/`cost_note`.

A third flag, **`us_eligible`**, marks schemes Americans cannot use (European
Solidarity Corps, Germany's weltwärts). These are hidden by default but kept
deliberately — "why can't I do the EU one" is one of the most common false
leads given to American students, and silence is a worse answer than a labelled
row.

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
npm run db:seed              # seeds 156 programs across all three money directions
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
`ADMIN_PASSWORD` (see `src/proxy.ts`). Unset either and the route
returns 503 rather than silently opening up.

## Deploying

1. Create a Turso database, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel's project env vars.
2. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_BASE_URL`, and optionally `ADMIN_EMAIL`.
3. Run `npm run db:migrate` and `npm run db:seed` once against the production DB (e.g. locally with prod env vars, or a one-off script).
4. Deploy. `vercel.json` wires up the two crons; Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when `CRON_SECRET` is set.
5. Buy the domain. (Not done yet — see naming note below.)

## Naming

Working name is **Gap Year Platform**.

Recorded so it stays a deliberate choice: this runs against the original
spec, which said *"Do not name it after gap years — the phrase reads as
failure to the post-grad cohort and as admissions deferrals to
institutions,"* and recommended naming it after the money or the deadline
instead. Roughly a third of the catalog is post-undergrad (Fulbright,
Rhodes, JET, NIH) where "gap year" is the wrong frame, and phase 3 sells to
admissions offices, for whom the phrase means deferrals specifically.

Worth revisiting before the domain is bought and any SEO work starts, since
the name is cheap to change now and expensive later. The exact-match `.com`
has not been secured.

## Data integrity notes for whoever seeds/expands the catalog next

- The catalog currently has **156 programs** from two kinds of source.
  - **Hand-written TypeScript** (`seed-data.ts`, `-2`, `-3`) — edit directly.
  - **Research-agent JSON** in `scratch/research-*.json`, loaded mechanically
    by `scripts/load-research.ts`. Do NOT transcribe these into `.ts` by hand;
    transcription is how a wrong pay figure gets introduced. Add a new file to
    `RESEARCH_FILES` in `scripts/seed.ts` and it gets picked up. Missing files
    are skipped, so a partial research run still seeds.
  - Entries with an `exclude_reason` are dropped at load time but kept in the
    JSON, so a rejected program stays auditable instead of vanishing. Used for
    programs that are fee-only, defunct, duplicated, or aimed at currently
    enrolled students rather than people taking a year off.
  - Anything the researcher marked `confidence: "low"` gets an automatic
    warning prepended to its `caveat_note`, so unverified figures are visible
    on the page rather than buried in a scratch file.
  - `seed-data.ts` (26) and `seed-data-2.ts` (20) were verified against
    operator sites via live research on 2026-08-16.
  - **`seed-data-3.ts` (28) came from the owner's own comparison table and has
    NOT been source-verified.** Every row carries a `caveat_note` saying so,
    and all deadlines are deliberately empty rather than guessed. Clear that
    backlog before any real distribution push — these rows are currently the
    weakest link in the catalog's credibility.
- Several entries have `pay_low`/`pay_high` left `null` with an explanatory
  `pay_note` where a current org-wide figure couldn't be confirmed. That is
  the correct behaviour — never backfill a guess.
- `pay_low`/`pay_high` are integer minor-units: cents for USD/EUR, whole
  units for zero-decimal currencies like JPY (set `pay_currency`
  accordingly — see `src/lib/format.ts`).
- Every deadline in the seed data came from a specific source page fetched
  during research, but several important dates (Fulbright campus deadlines,
  JET's 2027 window, TAPIF's 2027-28 window) were **not yet published** at
  seed time and are marked `note`-only with no `due_at`. Don't backfill a
  guessed date — leave it null until confirmed.
- **Cost is integer cents too** (`cost_low`/`cost_high`), same rule as pay.
  `cost_note` must state what the headline fee *excludes* — a $13,900 course
  that excludes $1,500 of airfare is really $15,400, and saying so is most of
  the value this directory adds over an operator's own page.
- Princeton Bridge Year was originally excluded for paying no stipend, then
  re-added as `net_neutral` once `money_direction` could express "costs
  nothing, pays nothing." Tufts 1+4 remains excluded: confirmed on hiatus
  since COVID with no announced restart.
- `pay_type: "hourly"` exists for wage work. For those rows the useful fields
  are `pay_note` and `cost_note` describing **deductions** — a $22/hr resort
  job with $600/mo housing deducted nets less than an $18/hr job with free
  housing, and the headline rate hides that.

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
