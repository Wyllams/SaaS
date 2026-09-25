# Epic 1 — Identity / Workspace / Membership / Permissions — QA

- **Date:** 2026-09-25
- **State:** local, remote schema/RLS and Production Web error-path evidence recorded. Successful authenticated reconciliation remains pending a controlled account and deployed NestJS API.
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
| Identity and authentication-boundary tests | `pnpm@12.6.0 --filter @saas/api test` | PASS: 7 tests passed; verified identity, first/repeat/concurrent reconciliation, absent/invalid and empty token rejection, and browser-supplied User/Workspace/Role/Permission fields ignored. |
| API typecheck | `pnpm@12.6.0 --filter @saas/api check` | PASS: `tsc --noEmit -p tsconfig.json` completed successfully. |
| API build | `pnpm@12.6.0 --filter @saas/api build` | PASS: `tsc -p tsconfig.build.json` completed successfully. |
| Database schema and local migration | `pnpm@12.6.0 --filter @saas/db check` and `db:generate` with a non-routable local placeholder URL | PASS: typecheck completed; reviewed migration creates `users` and `user_supabase_identities` with status check, subject primary key, restrictive FK, and RLS enabled with no public policies. Remote execution is recorded separately below. |
| Remote migration and RLS | Supabase SQL Editor on project `obpncbnzwrocvgngtodg`; catalog queries | PASS: migration executed atomically. Both tables exist; `users_pkey`, `users_status_check`, mapping PK and restrictive FK exist. Both tables have RLS enabled and zero public policies. |
| Web typecheck and optimized build | `pnpm@12.6.0 --filter @saas/web check` and `pnpm@12.6.0 --filter @saas/web build` | PASS: TypeScript completed and Next.js built `/login` successfully. |
| Browser — safe unavailable-configuration state | `http://localhost:3000/login` at 320×640, 375×812, 768×900, 1024×900 and 1440×1000 | PASS: SCR-AUTH-001 renders labels, fields, unavailable-configuration feedback and disabled submit with no horizontal overflow. Console captured zero warnings/errors. |
| Production Web — configured error path | `https://saas-pi-one-31.vercel.app/login` | PASS: published form had enabled submit and returned the approved generic invalid-credentials message for one controlled non-existent account. Console captured zero warnings/errors. |
| Production Web — responsive | Production `/login` at 320×640, 375×812, 768×900, 1024×900 and 1440×1000 | PASS: no horizontal overflow at any required viewport. |
| Full local gates | `verify:structure`, `verify:secrets`, `lint`, `test`, `check`, `build` | PASS: all executable gates passed. Lint warnings remaining are confined to the historical wireframe archive, which is intentionally preserved unchanged. |

## Slice 01 — planned acceptance evidence

| Check | Required evidence | Current result |
|---|---|---|
| `SCR-AUTH-001` is real | Login does not use fixtures or simulated persistence | PARTIAL PASS — route and client call are implemented against Supabase Auth; a configured Development environment is required for a real sign-in proof. |
| Email/password sign-in | Successful authenticated session through the approved Supabase Auth contract | PARTIAL PASS — real Production invalid-credential response verified; successful account flow requires a controlled account. |
| Server-side session boundary | Protected server/API boundary revalidates session; client state alone is insufficient | PARTIAL PASS — boundary unit tests pass; Web is published but NestJS belongs to a separately deployed Render service that has not been provisioned/identified. |
| Global identity boundary | External identity is reconciled to the business User boundary without treating auth-provider identifiers as business authorization | PARTIAL PASS — unit boundary and database repository/migration are implemented; live verified-token-to-database proof requires a controlled account and deployed NestJS API. |
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
- deployment, staging or production validation.

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

- `BLOCKED — SUCCESSFUL AUTHENTICATION EVIDENCE REQUIRED`: no approved controlled account exists for a success-path test. The production error path was verified with an intentionally invalid account; no Auth configuration was changed.
- `BLOCKED — BACKEND DEPLOYMENT BOUNDARY REQUIRED`: NestJS is architecturally assigned to Render. No Render service/URL is available for production reconciliation proof.
