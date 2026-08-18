-- Gap Year Platform schema
-- Phase 1 writes to: programs, deadlines, listings, fallbacks, people, plans,
--   plan_items (kind='watch' only), plan_events, plan_grants (written, not yet enforced)
-- institutions exists from day one but is unused until phase 3.

CREATE TABLE IF NOT EXISTS institutions (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  ipeds_id     TEXT,
  domain       TEXT,
  tier         TEXT NOT NULL DEFAULT 'none',  -- none | pilot | paid
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
  id                TEXT PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  operator          TEXT NOT NULL,          -- 'AmeriCorps', 'IIE', 'CLAIR'
  category          TEXT NOT NULL,          -- service | conservation | teaching_abroad | research | health | trades | outdoor | travel_study | work
  summary           TEXT NOT NULL,          -- 2 sentences max
  source_url        TEXT NOT NULL,
  -- cohort splits. these two are the primary filters and are never tags.
  degree_required   INTEGER NOT NULL,       -- 0 | 1  <-- primary cohort split
  -- Which way the money flows. The product routes only toward participant_earns;
  -- participant_pays rows exist so a student can compare a $17,950 fee against
  -- an option that pays them, and are never recommended or sold. We take no
  -- commission on any row here, in either direction.
  money_direction   TEXT NOT NULL DEFAULT 'participant_earns',
                                            -- participant_earns | net_neutral | participant_pays
  stage             TEXT,                   -- post_hs | post_undergrad | both
  -- eligibility
  min_age           INTEGER,
  max_age           INTEGER,
  citizenship       TEXT,                   -- us_citizen | us_citizen_or_lpr | any
  us_eligible       INTEGER NOT NULL DEFAULT 1,  -- 0 for schemes Americans cannot use (kept, and labelled, on purpose)
  other_eligibility TEXT,                   -- freeform, rendered verbatim
  selectivity       TEXT,                   -- open | moderate | selective | highly_competitive | quota_limited
  -- compensation. cents integers only. never floats, never strings
  pay_type          TEXT NOT NULL,          -- hourly | weekly | monthly | annual | stipend_total | none
  pay_low           INTEGER,
  pay_high          INTEGER,
  pay_currency      TEXT NOT NULL DEFAULT 'USD',
  pay_note          TEXT,                   -- 'plus $650 travel stipend'
  -- what the participant pays out of pocket. mirror of pay_*, same cents rule.
  cost_low          INTEGER,
  cost_high         INTEGER,
  cost_note         TEXT,                   -- must state what the headline fee EXCLUDES (airfare, insurance, deposit)
  housing_provided  INTEGER NOT NULL DEFAULT 0,
  meals_provided    INTEGER NOT NULL DEFAULT 0,
  airfare_covered   INTEGER NOT NULL DEFAULT 0,
  education_award   INTEGER,                -- cents
  term_min_weeks    INTEGER,
  term_max_weeks    INTEGER,
  -- Earning college credit can forfeit incoming-freshman aid and merit awards,
  -- and can convert a deferred admit into a transfer applicant. Captured in
  -- phase 1 because it is the phase 2 headline feature.
  college_credit_note TEXT,
  caveat_note       TEXT,                   -- freeform, rendered verbatim: visa/legal reality, operator finances, marketing-vs-reality
  -- integrity
  funding_status    TEXT NOT NULL DEFAULT 'active',  -- active | at_risk | paused | defunded
  funding_note      TEXT,
  last_verified_at  TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deadlines (
  id            TEXT PRIMARY KEY,
  program_id    TEXT NOT NULL REFERENCES programs(id),
  cycle_label   TEXT NOT NULL,     -- '2027-28'
  kind          TEXT NOT NULL,     -- national | campus | intent_to_apply | opens | rolling
  due_at        TEXT,              -- ISO8601 with offset. NULL when kind='rolling'
  source_tz     TEXT,              -- 'America/New_York'. Render local, label source
  note          TEXT,
  source_url    TEXT NOT NULL,
  confirmed_at  TEXT NOT NULL,
  confirmed_by  TEXT NOT NULL      -- human initials. never 'cron'
);

CREATE TABLE IF NOT EXISTS listings (
  id            TEXT PRIMARY KEY,
  program_id    TEXT NOT NULL REFERENCES programs(id),
  title         TEXT NOT NULL,
  location      TEXT,
  state         TEXT,
  starts_on     TEXT,
  closes_on     TEXT,
  pay_note      TEXT,
  apply_url     TEXT NOT NULL,
  seen_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fallbacks (
  program_id    TEXT NOT NULL REFERENCES programs(id),
  substitute_id TEXT NOT NULL REFERENCES programs(id),
  rationale     TEXT NOT NULL,
  PRIMARY KEY (program_id, substitute_id)
);

CREATE TABLE IF NOT EXISTS people (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  display_name   TEXT,
  role           TEXT NOT NULL,          -- student | parent | reviewer
  institution_id TEXT REFERENCES institutions(id),   -- null until phase 3
  created_at     TEXT NOT NULL,
  unsub_token    TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS plans (
  id             TEXT PRIMARY KEY,
  student_id     TEXT NOT NULL REFERENCES people(id),
  cohort         TEXT NOT NULL,          -- pre_college | post_grad
  cycle_label    TEXT,                   -- '2027-28'
  status         TEXT NOT NULL DEFAULT 'draft',
                                         -- draft | submitted | approved | active | complete | abandoned
  institution_id TEXT REFERENCES institutions(id),
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- phase 1 writes only kind='watch'. later phases add more kinds.
CREATE TABLE IF NOT EXISTS plan_items (
  id           TEXT PRIMARY KEY,
  plan_id      TEXT NOT NULL REFERENCES plans(id),
  program_id   TEXT REFERENCES programs(id),
  kind         TEXT NOT NULL,      -- watch | intent | applied | accepted | enrolled | completed | withdrawn
  starts_on    TEXT,
  ends_on      TEXT,
  note         TEXT,
  created_at   TEXT NOT NULL
);

-- append only. never UPDATE, never DELETE. phase 4 depends on this.
CREATE TABLE IF NOT EXISTS plan_events (
  id          TEXT PRIMARY KEY,
  plan_id     TEXT NOT NULL REFERENCES plans(id),
  actor_id    TEXT REFERENCES people(id),
  event_type  TEXT NOT NULL,
  payload     TEXT NOT NULL,      -- JSON
  occurred_at TEXT NOT NULL
);

-- per-field visibility. written in phase 1, enforced from phase 2.
CREATE TABLE IF NOT EXISTS plan_grants (
  plan_id    TEXT NOT NULL REFERENCES plans(id),
  grantee_id TEXT NOT NULL REFERENCES people(id),
  scope      TEXT NOT NULL,       -- summary | items | events | full
  granted_at TEXT NOT NULL,
  revoked_at TEXT,
  PRIMARY KEY (plan_id, grantee_id, scope)
);

-- phase 1 addition: staged edits from the verification cron. Never auto-published.
CREATE TABLE IF NOT EXISTS review_queue (
  id            TEXT PRIMARY KEY,
  program_id    TEXT NOT NULL REFERENCES programs(id),
  field_diffs   TEXT NOT NULL,     -- JSON: [{field, old_value, new_value}]
  raw_extract   TEXT NOT NULL,     -- JSON, full model output for audit
  suspicion     TEXT,              -- suspension/pause/cancellation language, if any
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  created_at    TEXT NOT NULL,
  resolved_at   TEXT,
  resolved_by   TEXT
);

-- @indexes -- scripts/migrate.ts splits the file here and runs everything below
-- AFTER its additive ALTER TABLE pass, so an index can reference a column that
-- was added to an already-existing table.

CREATE INDEX IF NOT EXISTS idx_programs_cohort   ON programs(degree_required, funding_status);
-- money_direction is a primary filter, not a tag: the directory defaults to
-- participant_earns and only shows the rest behind an explicit comparison toggle.
CREATE INDEX IF NOT EXISTS idx_programs_money    ON programs(money_direction, degree_required);
CREATE INDEX IF NOT EXISTS idx_deadlines_due     ON deadlines(due_at);
CREATE INDEX IF NOT EXISTS idx_deadlines_program ON deadlines(program_id);
CREATE INDEX IF NOT EXISTS idx_listings_program  ON listings(program_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_plan   ON plan_items(plan_id, kind);
CREATE INDEX IF NOT EXISTS idx_plan_items_program ON plan_items(program_id);
CREATE INDEX IF NOT EXISTS idx_plan_events_plan  ON plan_events(plan_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
