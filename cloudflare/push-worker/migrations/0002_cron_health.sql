CREATE TABLE IF NOT EXISTS push_cron_health (
  id INTEGER PRIMARY KEY CHECK(id=1),
  run_token TEXT,
  last_started_at INTEGER,
  last_completed_at INTEGER,
  last_error_code TEXT,
  last_candidate_count INTEGER NOT NULL DEFAULT 0,
  last_claimed_count INTEGER NOT NULL DEFAULT 0,
  last_success_count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO push_cron_health(id, updated_at) VALUES(1, 0);
