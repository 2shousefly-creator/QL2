# QL2 background Web Push

Firebase Hosting remains static. The browser derives up to 16 notification intents
from local canonical XP/farm helpers. This Worker stores only device credentials
(SHA-256 secret hash), PushSubscription, event identity, timestamps and delivery
state in D1. It does not receive saves or run game engines. Standard Web Push
uses `web-push` encryption/VAPID and Workers `fetch` transport.

## Current provisioning state

Source is ready behind a disabled gate. `wrangler whoami` reported no authenticated
account during implementation. No Worker, D1 database or VAPID secret has been
provisioned by this change. The client URL is intentionally empty. No placeholder
is sent to production. Continue the following steps after `npx wrangler login`.

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

## Cron and delivery

The cron is `* * * * *`. Indexed pending/lease queries acquire at most 8 due
intents atomically with a unique lease token. Crops for one device in that batch
are grouped into one notification. Other event types are sent separately.
Leases expire after 15 minutes, exceeding the bounded 8 x 15-second transport
budget. Provider 404/410 invalidates the device and cancels its pending intents.
Other errors use bounded exponential retry (six attempts). An authoritative new
generation resets delivery; the same sent generation cannot be resurrected.
Daily cleanup removes canceled intents older than 30 days. Sent tombstones are
retained so old rank generations remain deduplicated; active subscriptions are
never removed by cleanup.

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
once. Notification delivery when the app is closed remains unavailable until
provisioning and the client gate are completed.

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
