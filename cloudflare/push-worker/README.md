# QL2 background Web Push

Firebase Hosting remains static. The browser derives up to 16 notification intents
from local canonical XP/farm helpers. This Worker stores only device credentials
(SHA-256 secret hash), PushSubscription, event identity, timestamps and delivery
state in D1. It does not receive saves or run game engines. Standard Web Push
uses the official `webpush.sendNotification` API with the existing VAPID pair
and Workers Node compatibility (no custom fetch transport).

## Current provisioning state

Provisioned on 2026-09-10 in the authenticated Cloudflare account:

- Worker: `ql2-push-api`, URL `https://ql2-push-api.quanlo-ql2.workers.dev`.
- D1: `ql2-push`, remote migration `0001_push_schema.sql` applied.
- `VAPID_PRIVATE_KEY` stored as a Worker Secret; only the public key is in config.
- `PUSH_ENABLED=true`; Cron Trigger runs every minute.
- Health and VAPID endpoints returned HTTP 200 with the production CORS origin;
  health reported enabled/online and the public key/fingerprint matched config.
- Production client points to this live Worker. Firebase remains static Hosting.

No test push, browser check or gameplay simulation was performed. Actual device
notification delivery remains subject to subscription, permission and OS support.

## Provision and resume

Run commands from the QL2 repository root. Reuse existing resources when resuming.

1. `npx wrangler whoami` — inspect account access without printing tokens.
2. List databases with `npx wrangler d1 list`; create `ql2-push` only if missing:
   `npx wrangler d1 create ql2-push`.
3. Put the returned database ID in `cloudflare/push-worker/wrangler.jsonc`.
   If multiple accounts are available, use the intended account explicitly.
4. `npm run push:d1:migrate` applies the remote migration. Binding name is `DB`.
5. Generate a VAPID pair with the existing `web-push` library into private files
   **outside the checkout**, with directory mode 0700 and file mode 0600. Never
   print the pair, put the private key in a shell argument, or commit it.
   Reuse the existing pair on retries. Store the private key with stdin:
   `npx wrangler secret put VAPID_PRIVATE_KEY --config cloudflare/push-worker/wrangler.jsonc < /absolute/private/location/vapid-private-key`.
   Wrangler may create the Worker before its first deployment; follow that setup.
6. Set public `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT=https://quanloweb.web.app` and
   `PUSH_ENABLED=true` in the Worker config. Deploy with `npm run push:deploy`.
7. Capture the actual workers.dev URL. Read `/api/v2/push/health` and
   `/api/v2/push/vapid-public-key`; confirm database connectivity, enabled state
   and the expected public key before setting `PUSH_API_BASE_URL` in
   `src/game/webDeployment.ts`. Do not infer an account subdomain.
8. Run **only** `npm run build:web`, commit/push `main`, and confirm the existing
   Firebase Hosting GitHub Action succeeds. Do not run firebase deploy or alter
   the Firebase workflow. Mark provisioning state above once completed.

The required private secret is `VAPID_PRIVATE_KEY`. The account credential used
by Wrangler is local tooling only, never a Worker var or frontend configuration.
No Cloud Run, Firestore, Cloud Tasks, Functions or Google billing is needed.

## API and security

All routes start with `/api/v2/push`:

- `GET /health`, `GET /vapid-public-key`: public, no-store.
- `POST /register`: subscription + public-key fingerprint.
- `PUT /intents`: authoritative snapshotGeneration UUID and an intents array.
- `POST /disable`, `POST /test`, `GET /status`: device authenticated.

Authenticated requests carry `X-QL-Device-Id` and `X-QL-Device-Secret`. Only
`quanloweb.web.app` and localhost ports 5173/3000 are accepted browser origins.
Subscription endpoints are restricted to known browser push providers to avoid
arbitrary outbound requests. Supporting another provider requires adding its
verified HTTPS hostname, never a blanket host wildcard. A conflicting endpoint
returns 409: the client rotates its subscription instead of taking ownership
using endpoint knowledge alone. A conflicting identity returns 401; the client
replaces the local identity and subscription, with one retry. No request bodies,
subscription endpoints, provider errors or plaintext device secrets are logged.

Intent types are `xp_ready`, `crop_ready`, `feed_empty`; the server builds all
notification text, tags and destinations. Metadata is bounded and discarded;
XP uses generic copy. Past timestamps allow one day of client/network lag and
future timestamps allow up to 100 years for long rank progression. These are
reminders based on the most recent client projection, not gameplay guarantees.

## Scheduled closed-app diagnostic

Profile retains the immediate server test and adds **Test nền sau 1 phút**.
`POST /api/v2/push/test/schedule` authenticates the current device and accepts
only an empty object, with no query parameters. The server owns the UUID, fixed
payload, and due time (`Date.now() + 60_000`). It only writes D1; it never calls
the push provider from the schedule request. The UI confirms scheduling, not
delivery, and explains the expected 1–2 minute Cron window.

The existing `push_intents` table holds one `diagnostic-test` row per device,
with type `test`. No schema migration or key rotation is required. An atomic D1
batch conditionally replaces the row and updates the existing shared test
cooldown (30 seconds/device, including the immediate test). Replacement resets
attempts and revokes the old lease. Gameplay snapshots still accept only
xp_ready/crop_ready/feed_empty and cancel only those types; they cannot cancel
or create the diagnostic. Master disable and endpoint invalidation still cancel
all pending delivery, including diagnostics.

Cron sends this row through the same claim, VAPID, retry, invalidation and sent
marking path. Its fixed tag is `quan-lo-push-scheduled-test`; the SW allows this
specific test tag while retaining the immediate test tag. Background delivery
uses an OS notification, and visible clients retain the existing in-app handoff.
The authenticated status response prioritizes the diagnostic row so old gameplay
tombstones cannot hide its scheduled/sent state. Refresh diagnostics to read the
latest delivery state. No diagnostic was scheduled or sent during this change's
release validation; validation remains only `npm run build:web`.

## Cron and delivery

The cron is `* * * * *`. Select at most 8 scheduled intents ordered by retry/due
time, then claim each by device/key/generation with a conditional UPDATE. Only
`meta.changes > 0` owns the lease; discovery/claim uses neither rowid nor RETURNING.
Re-read owned rows before grouping to retain current delivery fields and attempts.
Crops for one device in that batch
are grouped into one notification. Other event types are sent separately.
Leases expire after 15 minutes, exceeding the bounded 8 x 15-second transport
budget. Provider 404/410 invalidates the device and cancels its pending intents.
Other errors use bounded exponential retry (six attempts). An authoritative new
generation resets delivery; the same sent generation cannot be resurrected.
Daily cleanup removes canceled intents older than 30 days. Sent tombstones are
retained so old rank generations remain deduplicated; active subscriptions are
never removed by cleanup.

Migration `0002_cron_health.sql` adds a singleton operational heartbeat. Cron
records the scheduled epoch milliseconds, candidate/claim counts, completion,
provider-accepted notification count (a crop group counts once), and allowlisted
stage errors. Due/retry checks use current epoch milliseconds. A run token keeps
older overlapping cycles from overwriting the latest started cycle's counters.
The last completion and error remain visible until a normal cycle completes;
delivery failures still follow the per-intent retry policy. Authenticated status
and Profile's CRON NỀN panel expose health without subscription data or secrets.
Deploy this migration before the Worker; no existing database, keys or triggers
need replacement. Heartbeat/claim behavior was not exercised during release:
the only validation command is `npm run build:web`.

D1 batch transactions serialize authoritative snapshots. There is no transaction
spanning D1 and an external push provider: a crash after provider acceptance but
before recording success can retry once the lease expires. Stable OS tags reduce
visible duplicates; exactly-once external delivery cannot be guaranteed. A send
already accepted by a provider cannot be recalled by a later disable/harvest.
Cron has minute-level latency, plus browser/OS delivery constraints. Free-tier
usage depends on actual traffic; batches and device test cooldown (30 seconds)
bound normal use for a small installation.

## Client and saves

`quan-lo-push-device-v2` contains a random UUID and 32-byte secret locally; neither
is part of game export. `quan-lo-push-backend-v2` is written only after successful
registration. On first v2 registration or VAPID rotation the browser replaces
its legacy subscription, without changing notification permission.

Settings add optional xpReady/cropReady/feedEmpty preferences, defaulting true.
The master toggle preserves them. Optional `farm.pushFeedCycle` changes only on
a successful refill; old farms use a stable `legacy` generation until refill.
There is no schema bump or change to game/save-transfer economics or semantics.
Syncs serialize and coalesce pending state, compare successful snapshots with a
30-second ETA tolerance, retry on reconnect/foreground and heartbeat, and send
best-effort keepalive on exit. Actions sync immediately. Settlement projection
runs at most every 30 seconds, not on every XP tick. Visible heartbeat is five
minutes. The backend never becomes authoritative for XP, crops or animals.

SW preserves cache/update handling and only accepts the four known payload types
(including test). Ready visible clients acknowledge and render a toast; background clients get an OS
notification (also the fallback when a visible app cannot acknowledge). This short
handoff timeout never schedules a future gameplay notification. Clicks use fixed local destinations; startup consumes the query
once. Background delivery is enabled for devices that register and grant
notification permission.

## Operations

- Emergency stop: set Worker `PUSH_ENABLED=false` and redeploy. This stops cron
  sends and returns 503 for registration/sync. Then clear the client base URL if
  the outage is persistent. Device master-off calls `/disable` when reachable.
- Rotation: stop sends, store a new private secret, update the public key and
  deploy together, then resume. Existing clients migrate on next registration;
  clients that have not reopened cannot receive through the new key until then.
- Do not put secrets in README, logs, GitHub Actions, frontend vars, or git.
- Legacy Express push modules remain isolated for existing dev/server users;
  the React client has no legacy Cloud Run request path.

References: [Workers Node compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
and [D1 batch transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/).

## Safe provider diagnostics

Delivery uses `webpush.sendNotification` as in the
[Cloudflare push example](https://developers.cloudflare.com/agents/communication-channels/webhooks/push-notifications/).
`WebPushError.statusCode` is reduced to `PUSH_PROVIDER_403`,
`PUSH_PROVIDER_404`, `PUSH_PROVIDER_410`, other 3xx/4xx codes, or
`PUSH_PROVIDER_5XX`. Other exceptions become `PUSH_SEND_EXCEPTION`.
No raw exception, provider body, headers, endpoint, subscription keys or private
VAPID key is logged or returned. Immediate test returns only success,
providerStatus (number/null) and errorCode; the UI renders allowlisted codes.
Cron retains attempt_count, last_attempt_at, last_error and retry_at in D1 and
exposes those fields through authenticated diagnostics for every intent type.
404/410 causes are saved on the attempted rows before subscription invalidation.
Cooldown, retry policy, scheduling and keys are unchanged; no migration needed.
