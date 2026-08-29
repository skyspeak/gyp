# Deployment checklist

Live: https://gyp-psi.vercel.app · DB: Turso `gap-year-platform` (aws-us-east-2)

## 0. What is already done

Verified against the live site on 26 Aug 2026 — do not redo these.

| | Status |
|---|---|
| All 7 public routes (`/`, `/programs`, `/deadlines`, `/gallery`, `/changes`, `/connect`, `/design`) | ✅ 200 |
| `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` in Vercel | ✅ set |
| Production DB migrated + seeded | ✅ 381 programs |
| `CRON_SECRET` in Vercel | ✅ set (`/api/cron/*` returns 401 unauthenticated) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | ❌ **not set** — `/admin/review` returns 503 |
| `RESEND_API_KEY` | ⚠️ unknown from outside; without it the reminder cron no-ops |
| `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` | ⚠️ unknown; without either the verify cron logs and no-ops |

The three ⚠️/❌ rows are the only outstanding config. None of them break the
public site — they disable the review queue, reminder emails, and nightly
re-verification respectively.

## 1. First-time deploy (fresh clone → live)

1. **Create the database.**
   ```bash
   turso db create gap-year-platform
   ```
2. **Get its URL and a token.**
   ```bash
   turso db show gap-year-platform --url
   turso db tokens create gap-year-platform
   ```
3. **Import to Vercel.** New Project → import the GitHub repo. Framework
   auto-detects as Next.js; leave build settings alone.
4. **Set environment variables** in Vercel → Settings → Environment Variables,
   for **Production, Preview, and Development**. Required:
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — from step 2
   - `CRON_SECRET` — any long random string (`openssl rand -hex 32`)
   - `NEXT_PUBLIC_BASE_URL` — e.g. `https://gyp-psi.vercel.app`

   Optional, each enabling one feature:
   - `ADMIN_USER` + `ADMIN_PASSWORD` — unlocks `/admin/review`
   - `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — deadline reminder emails
   - `GEMINI_API_KEY` **or** `ANTHROPIC_API_KEY` — nightly verification cron
     (Gemini wins if both are set)
   - `ADMIN_EMAIL` — where funding-risk alerts go
5. **Migrate and seed** from your machine (see §3 — Vercel never does this).
6. **Deploy.** Push to `main`, or hit Redeploy.
7. **Verify** (see §4).

Cron jobs come from `vercel.json` and register automatically on deploy. On the
Hobby plan Vercel runs crons **once a day** regardless of the schedule string.

## 2. Every deploy after

Every command in this file runs from the project directory, not the repo root
and not `~/Documents`:

```bash
cd /Users/gliu/Documents/Claude/Calude_Code_game_ai/gap-year-platform
```

```bash
npm run lint && npm run build
```

Both must pass locally — a broken build on `main` takes the site down. Then:

```bash
git push origin main
```

Vercel builds and promotes automatically. No DB step unless the catalog or
schema changed.

## 3. After changing catalog data or schema

Vercel does **not** run migrations or seeds. Do it from your machine, against
production, explicitly:

```bash
cd /Users/gliu/Documents/Claude/Calude_Code_game_ai/gap-year-platform
turso auth whoami || turso auth login
export TURSO_DATABASE_URL="$(turso db show gap-year-platform --url)"
export TURSO_AUTH_TOKEN="$(turso db tokens create gap-year-platform)"
[ ${#TURSO_AUTH_TOKEN} -gt 120 ] || { echo "BAD TOKEN — run: turso auth login"; }
npm run db:migrate && npm run db:seed
```

The `whoami` and length checks are not decoration. When the Turso CLI session
expires, `turso db tokens create` prints *"You are not logged in"* to stdout
and `$( )` captures that sentence **as the token** — the export succeeds, the
script still prints `→ target: REMOTE`, and the run dies on an opaque
`SERVER_ERROR: HTTP status 400`. A real token is ~200 characters.

Both scripts print their target first:

```
→ target: REMOTE gap-year-platform-skyspeak.aws-us-east-2.turso.io
```

**If that line says `LOCAL FILE`, the export did not take and production was
not touched** — see §5. `db:migrate` is additive (it adds missing columns, it
never drops), and `db:seed` upserts by slug, so both are safe to re-run.

### Without the CLI, from the browser

If the Turso CLI is not logged in and you would rather not deal with it, the
dashboard has a SQL runner:

1. Go to **https://app.turso.tech** and sign in.
2. Open the **gap-year-platform** database.
3. Open the **SQL runner** (also labelled "Shell" or "Query" in some views).
4. Paste the contents of `migrations/2026-08-28-status-and-alerts.sql` and run.

Every statement is guarded, and the backfill skips programs that already have
a baseline row, so running it twice is harmless. Confirm with:

```sql
SELECT COUNT(*) FROM status_history;   -- expect 381
SELECT COUNT(*) FROM program_alerts;   -- expect 0 until someone subscribes
```

This route only works for SQL. Reseeding the catalog (`db:seed`) still needs
the CLI, because it reads local files.

## 4. Verify it worked

```bash
for p in / /programs /deadlines /gallery /changes /connect /design; do \
  printf "%-14s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://gyp-psi.vercel.app$p)"; done
```

All seven should be 200. Then confirm the crons are actually protected:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://gyp-psi.vercel.app/api/cron/verify
```

**401 is correct.** A 200 here means `CRON_SECRET` is unset in production —
`isAuthorizedCronRequest` returns `true` when there is no secret to check, so
an open endpoint looks like a working one. To run a cron by hand:

```bash
curl "https://gyp-psi.vercel.app/api/cron/verify?token=$CRON_SECRET"
```

## 5. Gotchas that have actually bitten

- **An empty env var silently seeds the wrong database.** `.env.local` in this
  repo has `TURSO_DATABASE_URL=` *present but empty*, so `. ./.env.local`
  succeeds, `db()` falls back to `file:./local.db`, and the seed prints
  `Seeded 381 programs` — identical to a successful production run. This is why
  both scripts now print `→ target:` first. Read that line every time.
- **Nothing may query the DB at build time.** `/` once did, and the build
  crashed with `no such table: deadlines` because there is no database during
  a Vercel build. Every DB-backed page carries
  `export const dynamic = "force-dynamic"`. Keep it that way.
- **`db()` throws rather than falling back when `process.env.VERCEL` is set.**
  Deliberate: an empty `local.db` on a server produces `no such table` errors
  far from the real cause.
- **An expired CLI session becomes a corrupt token.** `turso db tokens create`
  writes its "not logged in" error to stdout, so command substitution captures
  the error text as the token and every query fails with a bare HTTP 400. Run
  `turso auth whoami` first — see §3.
- **Turso tokens are shown once.** `turso db tokens create` mints a new one
  each time; you cannot read an existing token back.
- **`ADMIN_EMAIL` and the extraction keys are optional by design.** Missing
  keys make the crons no-op with a log line instead of failing the request, so
  a silent cron is the expected symptom of an unset key — not an error.

## 6. Analytics

Cloudflare Web Analytics runs on every page (`src/app/layout.tsx`) — cookieless
and with no personal data. It is skipped when `NODE_ENV === "development"` so
local runs do not inflate the numbers, and deliberately **not** gated on
`VERCEL_ENV`: a gate that silently failed to fire in production would recreate
the exact gap it was added to close.

The beacon token is a public identifier meant to appear in page source. It is
not a secret and grants no access, which is why it lives in the file rather
than in an env var.

Confirm it is actually serving after a deploy:

```bash
curl -s https://gyp-psi.vercel.app | grep -c cloudflareinsights
```

Anything other than `0` means the tag is on the page. Note that ad blockers
suppress the beacon for some visitors, so real traffic is undercounted.
