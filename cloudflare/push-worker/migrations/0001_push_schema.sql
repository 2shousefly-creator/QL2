CREATE TABLE push_devices (
  device_id TEXT PRIMARY KEY,
  device_secret_hash TEXT NOT NULL,
  endpoint_hash TEXT NOT NULL UNIQUE,
  subscription_json TEXT NOT NULL,
  vapid_fingerprint TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  invalidated_at INTEGER,
  last_seen_at INTEGER,
  last_test_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE push_intents (
  device_id TEXT NOT NULL REFERENCES push_devices(device_id) ON DELETE CASCADE,
  intent_key TEXT NOT NULL,
  type TEXT NOT NULL,
  event_generation TEXT NOT NULL,
  due_at INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  sent_at INTEGER,
  last_attempt_at INTEGER,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  lease_token TEXT,
  lease_until INTEGER,
  retry_at INTEGER NOT NULL,
  PRIMARY KEY(device_id, intent_key)
);
CREATE INDEX push_intents_due ON push_intents(status, due_at);
CREATE INDEX push_intents_retry ON push_intents(status, retry_at);
CREATE INDEX push_intents_lease ON push_intents(status, lease_until);
CREATE INDEX push_intents_device ON push_intents(device_id);
CREATE INDEX push_intents_cleanup ON push_intents(status, updated_at);
