# POC-06 — Supabase Realtime Broadcast

## Status

**PASS — Supabase Realtime Broadcast accepted as CrewCommand's realtime delivery layer.**

## Goal

Validate Supabase Realtime Broadcast for CrewCommand's realtime UX while preserving PostgreSQL as the authoritative state store.

## Target environment

- Supabase project: `obpncbnzwrocvgngtodg`
- Region: `us-east-1`
- PostgreSQL: `17.6`
- supabase-js: `2.117.1`

## Functional evidence

GitHub Actions run `36086788945` completed successfully against the real Supabase project.

Validated:

1. private authorized channel subscription: **PASS**;
2. private authorized Broadcast send/receive: **PASS**;
3. forbidden private topic authorization: **PASS**, observed `CHANNEL_ERROR`;
4. disconnected subscriber did not receive the next ephemeral Broadcast: **PASS**;
5. both corresponding state records remained persisted in PostgreSQL: **PASS**, 2 rows;
6. the event missed while disconnected was recoverable from PostgreSQL: **PASS**;
7. strict TypeScript check: **PASS**;
8. temporary Realtime policies and persistence table were removed successfully.

Runtime result:

```json
{
  "poc": "POC-06",
  "supabaseJs": "2.117.1",
  "privateAuthorizedSubscribe": "PASS",
  "privateAuthorizedBroadcast": "PASS",
  "forbiddenTopicAuthorization": {
    "status": "PASS",
    "observedStatus": "CHANNEL_ERROR"
  },
  "disconnectedClientMissesEphemeralBroadcast": "PASS",
  "postgresRecoveryOfMissedState": "PASS",
  "persistedRows": 2
}
```

## Authorization test design

The PoC used tightly-scoped temporary RLS policies on `realtime.messages`:

- only Broadcast extension;
- only one exact validation topic;
- a second topic was intentionally unauthorized;
- policies were removed during cleanup.

The PoC used the client-safe publishable key and the `anon` role only to validate the topic-level Realtime RLS mechanism without creating permanent test users.

**Production CrewCommand will not use broad anon Realtime access.** Production private-channel policies will target authenticated identities and evaluate CrewCommand Workspace/resource access using trusted authorization data.

## Decision

Use **Supabase Realtime Broadcast with private channels** for CrewCommand realtime UX.

Primary V1 use cases:

- chat/message delivery;
- user notifications;
- approval/status changes;
- relevant Job/Service updates;
- integration state while the user is actively waiting.

Do not subscribe the entire application to raw database changes.

## Core rule

> Realtime is a delivery signal, not the source of truth.

Business state is committed to PostgreSQL first. Realtime tells connected clients that something changed. Clients must be able to recover after reconnect by refetching authoritative state.

## Topic strategy

Production topics will be resource/tenant scoped, for example:

- `workspace:{workspaceId}:notifications`
- `user:{userId}:notifications`
- `job:{jobId}:chat`

Topic access is authorized by RLS on `realtime.messages`.

## Guardrails

1. Use private channels for production business data.
2. RLS must be resource-aware; `TO authenticated USING (true)` is not sufficient authorization.
3. Never base authorization on user-editable `user_metadata`.
4. Use trusted membership/permission data and/or `app_metadata` only where freshness semantics are acceptable.
5. Persist chat messages and business changes before/beside broadcasting them.
6. A missed Broadcast is repaired by API/database refetch.
7. Reconnect flows must refresh authoritative state rather than assuming all Broadcasts were received.
8. Presence is reserved for low-frequency ephemeral state such as online/typing indicators.
9. Postgres Changes are not the default V1 realtime strategy; Broadcast is preferred for scalability and authorization.
10. Clean up channel subscriptions when screens/components are disposed.
11. Realtime authorization is evaluated on subscription/token refresh and may be cached for the active connection; permission changes must account for this lifecycle.

## Temporary resources

The CI creates and removes:

- `public.poc06_validation_events`
- `poc06_validation_receive_authorized_topic`
- `poc06_validation_send_authorized_topic`

No PoC business table or policy remains after a successful run.

## ADR

Decision recorded in `docs/adr/ADR-006-supabase-realtime-broadcast.md`.
