# POC-06 — Supabase Realtime Broadcast

## Status

IN PROGRESS.

## Goal

Validate Supabase Realtime Broadcast for CrewCommand's realtime UX while preserving PostgreSQL as the source of truth.

## Target project

- Project: `obpncbnzwrocvgngtodg`
- Region: `us-east-1`
- PostgreSQL: `17.6`
- supabase-js: `2.117.1`

## Test design

The PoC creates temporary, tightly-scoped resources during CI and removes them in an `always()` cleanup step:

- `public.poc06_events` — temporary persistence table with RLS enabled;
- `realtime.messages` SELECT/INSERT policies scoped only to topic `poc06:authorized` and Broadcast messages.

The test validates:

1. a private authorized subscriber can join;
2. a private authorized publisher can join;
3. Broadcast reaches the authorized subscriber;
4. a different private topic is denied by Realtime Authorization;
5. disconnecting the subscriber causes it to miss the next ephemeral broadcast;
6. both corresponding events remain persisted in PostgreSQL;
7. the missed event can be recovered from PostgreSQL.

## Architecture hypothesis

Realtime is a delivery/UX layer. PostgreSQL remains authoritative and clients must be able to refetch/recover state after disconnects or missed broadcasts.

## Security

- Database URL remains a GitHub Actions Secret.
- The Supabase publishable key is intentionally public/client-safe.
- No service-role key is stored in the repository.
- Temporary public-schema table has RLS enabled.
- Policies are topic- and extension-scoped rather than broadly granting Realtime access.
