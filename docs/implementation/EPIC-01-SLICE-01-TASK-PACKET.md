# Codex Task Packet — EPIC-01-SLICE-01

- **Status:** APPROVED — Product Owner approved on 2026-09-25
- **Epic:** Epic 1 — Identity / Workspace / Membership / Permissions
- **Slice:** Authentication and server-side identity boundary

## Objective

Deliver `SCR-AUTH-001` as an email/password sign-in surface connected to Supabase Auth, with server-verified session handling and reconciliation into an internal business User through the approved dedicated external-identity mapping.

## Required sources

- `AGENTS.md`
- `docs/source-of-truth/README.md`
- `docs/source-of-truth/CURRENT-DECISIONS.md`
- `docs/source-of-truth/canonical/02-TRD-OFICIAL.md`, section 6
- `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md`, sections 2 and 4.2; `SCR-AUTH-001`
- `docs/source-of-truth/canonical/04-UI-UX-DESIGN.md`, sections 2, 3 and 10
- `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md`, sections 2 and A
- `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN-v1.0.md`, Epic 1
- `docs/architecture/TECHNICAL-ARCHITECTURE.md`, database, security and application-boundary sections
- `docs/adr/ADR-002-supabase-connection-pooling.md`
- `docs/adr/ADR-003-tailwind-semantic-design-system.md`
- `docs/adr/ADR-013-web-framework.md`
- `docs/adr/ADR-014-api-framework.md`
- `docs/adr/ADR-015-deployment-topology.md`
- `docs/implementation/EPIC-01-STATUS.md`
- `docs/implementation/EPIC-01-QA.md`

## Scope authorized after Product Owner approval

1. Add only the Supabase client libraries necessary for the documented Next.js SSR session boundary and NestJS server verification. Use current compatible releases resolved by the committed lockfile; do not add Auth Helpers, Clerk, another identity provider, or a generic authentication framework.
2. Add environment-variable validation/contract for the Supabase URL and publishable key. Do not read, commit, print, or alter real secret values.
3. Add an identity-domain migration, local/Git only, with:
   - a global internal User record using the logical User fields supported by the Domain Model;
   - a dedicated mapping from that User to the Supabase Auth subject;
   - uniqueness that prevents one external subject from resolving to multiple internal Users;
   - foreign-key and timestamp constraints required for reconciliation integrity.
4. Implement a server-side identity reconciliation use case:
   - accept only a Supabase Auth identity verified server-side;
   - find the mapping transactionally;
   - create the internal User and mapping only when no mapping exists;
   - never treat browser metadata, a browser-supplied User ID, Workspace ID, Role, Permission, or claim as business authorization;
   - return the internal User identity only; do not create Membership, Workspace or authorization context.
5. Implement `SCR-AUTH-001` for email/password sign-in only, using the approved semantic design tokens and accessible error/loading/disabled states.
6. Implement a server/API session boundary that validates the incoming Supabase user access token before reconciliation or any protected action. Session presence in browser state is insufficient.
7. Add focused unit/integration tests and update `EPIC-01-STATUS.md` and `EPIC-01-QA.md` with actual results.

## Explicitly out of scope

- Google OAuth, any other OAuth provider, callback/PKCE flow, account linking, SSO, MFA;
- sign-up, e-mail verification, password recovery/reset, trial/plan selection, billing or payment;
- Workspace, Location, Membership, Role, Permission, scope, RLS, portal access, onboarding, consent and invitations;
- authorization for tenant-owned business data;
- remote Supabase Auth configuration, Vercel/Render configuration, deployment, push, PR, merge or other Production changes;
- reuse of code, migrations, test data or assumptions from a historical checkout.

## Data contract and integrity

- The internal User is distinct from the Supabase Auth subject, as approved by the Product Owner on 2026-09-25.
- The external-identity mapping is owned by the identity domain and records the immutable Supabase Auth subject needed to resolve the User.
- The User has no `workspace_id`; Workspace association begins only through a later Membership slice.
- **Approved physical User contract (2026-09-25):** `id` is application-generated UUIDv7; `email` is required; `name` and `photo` are optional; global `status` permits only `active` and `suspended` and defaults to `active`. Provider identity belongs to the dedicated Supabase mapping, not the User record.
- The exact physical table/column names must be neutral and follow repository conventions. The Codex must not add optional business fields, roles, scopes, Workspace data or provider credentials.
- The migration must use the project-approved internal ID direction. If its implementation would require an unapproved extension or dependency, stop and report the blocker rather than substituting a different identifier strategy.
- The reconciliation transaction must be concurrency-safe and leave one resolved internal User per Supabase subject.

## UI/UX requirements

- **Screen ID:** `SCR-AUTH-001` only.
- Use the approved Tailwind semantic-token and shared Web UI boundaries; no historical product branding.
- Include accessible labels, keyboard operation, visible focus and non-color-only error feedback.
- Implement only states directly relevant to this slice: initial, submitting, invalid/error, unavailable configuration, and authenticated success handoff.
- Validate responsive behavior at 320, 375, 768, 1024 and 1440 px. Do not create Workspace selection or authenticated shell behavior in this task.

## Security requirements

- Server-side verification must use the verified Supabase Auth user/token boundary, never unverified `getSession()` browser data or untrusted claims alone.
- Validate token issuer, audience, expiry and signature through the approved Supabase verification path; do not accept a token merely because it decodes.
- Do not expose passwords, access/refresh tokens, Authorization, cookies, API keys, database URLs or stack traces in UI, logs, telemetry or tests.
- Use only the Supabase publishable key in the Web client. A Supabase secret/service key is prohibited in the Web bundle and unnecessary for this slice.
- Do not add a route or API operation that authorizes business data based on this login alone.

## Acceptance criteria

1. A configured Development email/password account can sign in through `SCR-AUTH-001` without fixture authentication.
2. The server/API independently verifies the authenticated Supabase user before identity reconciliation.
3. First successful reconciliation yields one internal User and one external-identity mapping; repeated/concurrent reconciliation does not duplicate either.
4. An absent, expired, malformed or invalid token is safely rejected and cannot create or resolve an internal User.
5. The screen has the required accessible, loading, error and responsive behavior without leaking sensitive detail.
6. No Workspace, Membership, Role, Permission, RLS, OAuth, recovery, remote configuration or deployment behavior is added.

## Mandatory tests

- **Unit:** mapping/reconciliation state transitions and duplicate handling.
- **Integration:** verified external identity to internal User reconciliation, including transaction/uniqueness failure behavior.
- **Authorization negatives:** absent/invalid/expired token; browser-supplied internal User ID ignored; browser-supplied Workspace/Role/Permission ignored.
- **Web:** component/route states for submit, generic auth error, unavailable configuration and success handoff.
- **Browser QA:** desktop, tablet and mobile viewport evidence; console/network review when a configured Development Auth environment is available.

If no configured Development Supabase Auth environment is available, execute all non-network tests and record browser/live-auth QA as blocked; do not configure a remote environment without separate authorization.

## Expected boundaries

- `apps/web` — `SCR-AUTH-001` and SSR session presentation only.
- `apps/api` — token verification transport guard and identity application boundary only.
- `packages/db` — identity-domain schema and migration only.
- `packages/validation` and/or `packages/domain-types` — only if an existing approved shared boundary is necessary.

Exact file names are implementation details and must follow the current repository structure.

## Database / migration

- [x] Local/Git migration authorized.
- [x] Remote migration authorized by the Product Owner on 2026-09-25 for this reviewed migration only. The two identity tables must be created with RLS enabled and no public policies (default deny). No Auth configuration, data seeding, deployment, commit, push, PR or merge is authorized.

The migration must be versioned, reproducible and reviewed in Git. Its one-time remote execution was separately approved by the Product Owner, completed, and recorded in `EPIC-01-STATUS.md` and `EPIC-01-QA.md`.

## Git and external actions

- [x] edit files
- [x] execute tests
- [x] generate migration
- [ ] commit
- [ ] push
- [ ] create PR
- [ ] merge
- [ ] deploy
- [x] remote migration — reviewed identity migration only; execute once, verify tables/RLS, then stop

## Conditions that require Codex to stop

- required documents conflict or are absent;
- adding a dependency/provider, UUID strategy, schema object or Auth configuration beyond this packet becomes necessary;
- a Development Supabase project is unavailable and live validation would require remote configuration;
- a test requires disabling security controls, weakening constraints or using a secret in the client;
- any Workspace/Membership/RBAC/RLS/onboarding/invite requirement appears necessary to make the screen seem complete.

## Documentation to update after implementation

- `docs/implementation/EPIC-01-STATUS.md`
- `docs/implementation/EPIC-01-QA.md`

## Required completion report

- Implemented
- Not implemented
- Files changed
- Tests run and results
- Documentation consulted
- Documentation updated
- Known issues/blockers
- Next authorized step
