# Epic 1 — Identity / Workspace / Membership / Permissions — QA

> **ATUALIZAÇÃO VIGENTE — 2026-09-25:** a topologia Render/NestJS/BullMQ/Valkey descrita abaixo é histórica e foi **superseded por ADR-016**. O backend vigente usa Supabase Edge Functions + Supabase Queues (PGMQ) + Supabase Cron, com PostgreSQL/Auth/Storage/Realtime no próprio Supabase. Referências antigas ao Render permanecem apenas como evidência do estado/testes anteriores e não orientam novas implementações.


- **Date:** 2026-09-25
- **State:** local, remote schema/RLS, Production Web error-path and Render API health evidence recorded. Successful authenticated reconciliation remains pending a controlled account and approved server-side identity/database configuration.
- **Scope recorded:** `EPIC-01-SLICE-01 — Authentication and server-side identity boundary`

## QA rule

This file distinguishes planned acceptance evidence from executed evidence. A plan is not a PASS result.

## Runtime blocker — resolved

- **Initial attempt:** the configured pnpm 12.6 wrapper failed before the test runner started.
- **Resolution:** isolated Node 24.21.0 plus Corepack pnpm 12.6.0; dependencies restored with frozen lockfile.

## Executed local evidence

| Check | Command | Result |
|---|---|---|
| TDD RED | `pnpm@12.6.0 --filter @saas/api test` before implementation | PASS as RED: module `identity-reconciliation.ts` was absent, so the test failed for the expected reason. |
| Identity and authentication-boundary tests | `pnpm@12.6.0 --filter @saas/api test` | PASS: 12 tests passed; verified identity, first/repeat/concurrent reconciliation, absent/invalid and empty token rejection, untrusted browser fields ignored, Bearer parsing and the 401/503/200 identity-transport contract. |
| Compiled API HTTP boundary | built NestJS API on `127.0.0.1:4010`; `GET /health` and `GET /identity/me` without credentials | PASS: `/health` returned 200; `/identity/me` returned 401 with only `UNAUTHENTICATED`. No token, identity or database data was logged. |
| API typecheck | `pnpm@12.6.0 --filter @saas/api check` | PASS: `tsc --noEmit -p tsconfig.json` completed successfully. |
| API build | `pnpm@12.6.0 --filter @saas/api build` | PASS: `tsc -p tsconfig.build.json` completed successfully. |
| Database schema and local migration | `pnpm@12.6.0 --filter @saas/db check` and `db:generate` with a non-routable local placeholder URL | PASS: typecheck completed; reviewed migration creates `users` and `user_supabase_identities` with status check, subject primary key, restrictive FK, and RLS enabled with no public policies. Remote execution is recorded separately below. |
| Remote migration and RLS | Supabase SQL Editor on project `obpncbnzwrocvgngtodg`; catalog queries | PASS: migration executed atomically. Both tables exist; `users_pkey`, `users_status_check`, mapping PK and restrictive FK exist. Both tables have RLS enabled and zero public policies. |
| Web typecheck and optimized build | `pnpm@12.6.0 --filter @saas/web check` and `pnpm@12.6.0 --filter @saas/web build` | PASS: TypeScript completed and Next.js built `/login` successfully. |
| Browser — safe unavailable-configuration state | `http://localhost:3000/login` at 320×640, 375×812, 768×900, 1024×900 and 1440×1000 | PASS: SCR-AUTH-001 renders labels, fields, unavailable-configuration feedback and disabled submit with no horizontal overflow. Console captured zero warnings/errors. |
| Production Web — configured error path | `https://saas-pi-one-31.vercel.app/login` | PASS: published form had enabled submit and returned the approved generic invalid-credentials message for one controlled non-existent account. Console captured zero warnings/errors. |
| Production Web — responsive | Production `/login` at 320×640, 375×812, 768×900, 1024×900 and 1440×1000 | PASS: no horizontal overflow at any required viewport. |
| Render API — deployment | Render `saas-api`, Virginia (US East), Free; deployment `dep-darek8gjo6nc73flk0eg` | PASS: Render reports `Deploy succeeded | Live`; Node 24.21.0 listened on Render `PORT=10000`. No paid plan was selected. |
| Render API — public health | `GET https://saas-api-0jkv.onrender.com/health` | PASS: HTTP 200 with `{"status":"ok","service":"api"}`. |
| Render API — negative readiness | `GET https://saas-api-0jkv.onrender.com/ready` | PASS: HTTP 503 with explicit `database: missing` and `queue: missing`; no false-ready result with dependencies absent. |
| Render API — unauthenticated identity | `GET https://saas-api-0jkv.onrender.com/identity/me` without Authorization | PASS: HTTP 401 `UNAUTHENTICATED`; no identity or database reconciliation occurred. |
| Render API — exact-origin CORS | Production preflight for `/identity/me` with `Origin: https://saas-pi-one-31.vercel.app`, `Access-Control-Request-Method: GET` and `Access-Control-Request-Headers: authorization` | PASS: HTTP 204; allowed origin matched Production exactly, allowed headers included `authorization`, and allowed methods were limited to `GET`. A preflight from an external origin did not receive a matching `Access-Control-Allow-Origin` value, so the browser will reject it. |
| Authenticated handoff deployment | Commit `4f912b1`; Render deployment `dep-darfav142hec73agseng` | PASS: Render reports `Deploy succeeded | Live` for the commit containing the Web handoff and API CORS changes. |
| Full local gates | `verify:structure`, `verify:secrets`, `lint`, `test`, `check`, `build` | PASS: all executable gates passed. Lint warnings remaining are confined to the historical wireframe archive, which is intentionally preserved unchanged. |

## Slice 01 — planned acceptance evidence

| Check | Required evidence | Current result |
|---|---|---|
| `SCR-AUTH-001` is real | Login does not use fixtures or simulated persistence | PARTIAL PASS — route and client call are implemented against Supabase Auth; a configured Development environment is required for a real sign-in proof. |
| Email/password sign-in | Successful authenticated session through the approved Supabase Auth contract | PARTIAL PASS — real Production invalid-credential response and deployed handoff are verified; the controlled account still needs one successful post-deploy submit. |
| Server-side session boundary | Protected server/API boundary revalidates session; client state alone is insufficient | PARTIAL PASS — `GET /identity/me` is Live, rejects an absent Bearer token with 401, and Production exact-origin CORS is verified; the successful verified-token request awaits the controlled post-deploy submit. |
| Global identity boundary | External identity is reconciled to the business User boundary without treating auth-provider identifiers as business authorization | PARTIAL PASS — unit boundary and database repository/migration are implemented; live verified-token-to-database proof awaits the controlled post-deploy submit. |
| Unauthenticated negative case | Protected behavior rejects an absent/invalid session safely | PARTIAL PASS — unit tests reject absent, invalid and empty token inputs before reconciliation; live expired/malformed token proof awaits Development configuration. |
| Error safety | Authentication failure does not expose secrets, stack traces, or account-existence details beyond the approved contract | PARTIAL PASS — implemented browser message is generic and no console errors occurred in unavailable configuration; live invalid-credentials response awaits Development configuration. |
| UI states | Loading, invalid credentials/error, disabled/submitting and accessible feedback are verified for the implemented screen | PARTIAL PASS — unavailable and disabled state verified; submit/success/error require Development Auth configuration. |
| Responsive browser QA | Desktop, tablet and mobile verification against the approved UI/UX requirements | PARTIAL PASS — unavailable-configuration state observed at all five required viewports; sign-in success/error states require Development Auth configuration. |
| Console and network | No unexpected client errors; relevant request/response behavior reviewed without logging secrets | PARTIAL PASS — no browser console warnings/errors in the unavailable-configuration state; sign-in request/response requires Development Auth configuration. |

## Explicit exclusions from Slice 01 QA

The following are not Slice 01 PASS criteria and must not be represented as tested by this slice:

- Google OAuth;
- password recovery;
- Workspace/Membership/Location selection or switching;
- Role/Permission/scope authorization;
- tenant RLS;
- onboarding/consent/invitation lifecycle;
- billing/trial states;
- remote Supabase Auth configuration;
- Supabase Auth configuration and full authenticated production validation.

## Epic-level negative-test ledger

| Mandatory Epic 1 case | Owning slice | Current result |
|---|---|---|
| Authenticated user without Membership | Later Workspace/Membership slice | NOT RUN |
| One / multiple Workspace contexts | Later Workspace selection slice | NOT RUN |
| Suspended Membership | Later Membership lifecycle slice | NOT RUN |
| Cross-Workspace direct-ID attempt | Later authorization/RLS slice | NOT RUN |
| Location scope violation | Later Location scope slice | NOT RUN |
| Self-elevation attempt | Later Role/Permission slice | NOT RUN |
| Invite replay or expiry | Later Invite slice | NOT RUN |
| Primary Owner transfer invariant | Later ownership slice | NOT RUN |
| Permission changed during active session | Later authorization/session slice | NOT RUN |

## QA evidence policy

- No test result may be marked PASS until its command, environment and observable result are recorded.
- Build success alone does not validate authentication or authorization.
- Remote Supabase, Vercel, GitHub, Staging and Production changes require separate explicit authorization.
- Future QA must not reuse evidence from historical repositories/checkouts as proof for this repository.

## Current blockers

- `BLOCKED — SUCCESSFUL AUTHENTICATION EVIDENCE REQUIRED`: the controlled account and server-side configuration now exist, but the Product Owner must submit the controlled credentials once in Production after the `4f912b1` deployment. The Codex does not request, receive or store the password. Afterwards, request/log/database mapping evidence can be recorded.
