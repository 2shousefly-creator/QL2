# AGENTS.md — QL2 Production Workflow

This file defines the default operating rules for Codex and other coding agents working in this repository.

## Repository and production target

- Repository: `2shousefly-creator/QL2`
- Production branch: `main`
- Production site: `https://quanloweb.web.app`
- Hosting: Firebase Hosting (static hosting)
- Firebase project: `quanloweb`
- Production build output: `dist-web/client`
- Production build command: `npm run build:web`
- Production deployment is handled automatically by GitHub Actions when `main` changes.

## Default release rule

Unless the user explicitly says otherwise, Codex is authorized to complete requested QL2 changes all the way to production without waiting for manual review.

Preferred workflow:

1. Start from the latest `main`.
2. Implement only the requested change and any necessary supporting changes.
3. Preserve unrelated gameplay, saves, assets, balancing, configuration, and production behavior.
4. Run `npm run build:web` before publishing changes.
5. Default validation is ONLY `npm run build:web`. Do not run tests, QA, simulations, browser checks, verification scripts, lint/typecheck, or benchmarks unless the user explicitly asks for a specific one in a newer instruction. Do not write new tests or modify existing tests just to validate a task. This includes unit/integration/E2E/smoke/manual/responsive checks, gameplay/balance simulations, `npm test`, `npm run test:*`, and `npm run verify:*`.
6. If the required build fails, fix compile/bundle errors and rerun only `npm run build:web` before publishing.
7. Commit the completed change directly to `main` and push it to `origin/main`.
8. Do not run `firebase deploy` manually. The GitHub Actions workflow deploys Firebase Hosting automatically after the push to `main`.
9. Confirm that the GitHub Actions deployment for the pushed commit succeeds. If it fails, diagnose and fix the deployment issue, then push the corrective commit to `main`.

## If direct push to main is blocked

If GitHub repository rules, branch protection, or another technical restriction prevents a direct push to `main`:

1. Create a short-lived branch.
2. Commit and push the completed change.
3. Create a pull request targeting `main`.
4. Merge the pull request automatically as soon as all required checks pass, without waiting for human review, unless GitHub explicitly requires a human approval.
5. If human approval is technically required by repository rules, stop and tell the user exactly what approval is required.

## Hosting and infrastructure rules

- QL2 production must remain a static Firebase Hosting deployment unless the user explicitly requests an architecture change.
- Do not reintroduce Cloud Run into the production request path.
- Do not enable or reconnect paid Google Cloud billing for `quanloweb` unless the user explicitly requests it.
- Do not add server-side infrastructure, paid services, databases, queues, AI APIs, or other billable dependencies without explicit user approval.
- Keep `firebase.json` configured to serve `dist-web/client` directly.
- Keep Firebase Hosting on the free/static architecture whenever possible.

## GitHub Actions rules

- The production workflow is `.github/workflows/firebase-hosting-merge.yml`.
- A push to `main` is considered a production release.
- Do not disable, delete, or materially alter the production deployment workflow unless the user explicitly requests it.
- Do not expose, print, commit, rotate, or replace GitHub/Firebase secrets unless explicitly required and authorized.

## Source-control safety

- Always sync with the latest `origin/main` before starting a release.
- Never force-push `main`.
- Never rewrite published history on `main`.
- Do not delete user work or unrelated files to resolve merge conflicts.
- If `main` changed while working, integrate the latest changes safely before pushing.
- Keep commits focused and use a concise descriptive commit message.

## Save-data safety

QL2 contains persistent player progress and save-related logic. Treat save compatibility as production-critical.

- Do not intentionally reset, invalidate, rename, or discard existing player save data unless the user explicitly requests a migration/reset.
- Preserve existing localStorage/IndexedDB compatibility where applicable.
- Any required save migration must be backward-safe and narrowly scoped.

## User shorthand

When the user says any equivalent of:

- `release theo workflow QL2`
- `update game lên production`
- `cập nhật game luôn`
- `triển khai luôn`

interpret it as authorization to follow this file's production workflow through push/merge to `main` and automatic Firebase Hosting deployment, without waiting for a separate review step.

If the user explicitly says not to deploy, not to merge, only prepare code, or only create a PR, follow that newer instruction instead.
