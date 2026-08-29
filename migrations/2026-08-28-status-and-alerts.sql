-- Run this in the Turso dashboard SQL runner when the CLI is not available.
-- Safe to run more than once: every statement is guarded, and the backfill
-- skips programs that already have a baseline row.

CREATE TABLE IF NOT EXISTS status_history (
  id          TEXT PRIMARY KEY,
  program_id  TEXT NOT NULL REFERENCES programs(id),
  from_status TEXT,
  to_status   TEXT NOT NULL,
  note        TEXT,
  detected_by TEXT NOT NULL,
  source_url  TEXT,
  changed_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS program_alerts (
  id         TEXT PRIMARY KEY,
  person_id  TEXT NOT NULL REFERENCES people(id),
  program_id TEXT REFERENCES programs(id),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_history_program ON status_history(program_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_changed ON status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_program_alerts_program ON program_alerts(program_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_program_alerts_unique ON program_alerts(person_id, program_id);

-- One baseline row per program, so the status page can say "unchanged since"
-- and alerts have a prior value to compare against. detected_by='seed' marks
-- these as observations rather than real transitions, so nobody is emailed.
INSERT INTO status_history (id, program_id, from_status, to_status, note, detected_by, source_url, changed_at)
SELECT 'sh_' || lower(hex(randomblob(16))),
       p.id, NULL, p.funding_status, 'Baseline observation.', 'seed', NULL,
       COALESCE(p.last_verified_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
FROM programs p
WHERE NOT EXISTS (SELECT 1 FROM status_history h WHERE h.program_id = p.id);
