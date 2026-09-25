# ADR-006 — Supabase Realtime Broadcast for Realtime Delivery

- **Status:** Accepted
- **Date:** 2026-09-24
- **Validated by:** POC-06

## Context

CrewCommand requires realtime UX for chat, notifications, approvals and selected operational updates. The TRD also requires PostgreSQL to remain the source of truth and explicitly rejects a design where every database table is streamed indiscriminately.

Supabase currently recommends Broadcast over Postgres Changes for most production use cases due to scalability and security characteristics. Private Broadcast channels can be authorized through RLS policies on `realtime.messages`.

## Decision

Use **Supabase Realtime Broadcast with private channels and Realtime Authorization** for V1 realtime delivery.

PostgreSQL remains authoritative. Broadcast is used to notify connected clients that persisted state changed or that an ephemeral UX event occurred.

## Evidence

POC-06 ran against the real CrewCommand Supabase project.

Successful functional run: `36086788945`.

The PoC proved:

- an authorized private topic could be joined;
- Broadcast was received by an authorized subscriber;
- a non-authorized private topic was rejected with `CHANNEL_ERROR`;
- a disconnected subscriber missed an ephemeral Broadcast;
- the corresponding state remained persisted in PostgreSQL;
- the missed state could be recovered from PostgreSQL;
- temporary RLS/table resources were cleaned after the run.

## Production authorization model

The PoC used a narrowly scoped temporary `anon` policy only to validate the Realtime authorization mechanism without creating permanent test identities.

Production CrewCommand uses:

- authenticated identities;
- Workspace membership;
- resource-specific access;
- Role/Permission/Scope rules;
- topic-scoped RLS.

A channel is never considered authorized solely because a user knows its topic name.

Example topic classes:

- `workspace:{workspaceId}:notifications`
- `user:{userId}:notifications`
- `job:{jobId}:chat`

## State model

### Persisted events

Chat messages, approvals, Job/Service state, financial state and other business records are persisted before realtime delivery is considered complete.

### Ephemeral events

Typing indicators and similar low-value transient UX signals can exist only in Realtime.

### Reconnect behavior

After reconnect or suspected missed events, clients refetch authoritative state through the normal API. Realtime does not provide the recovery log.

## Why Broadcast instead of broad Postgres Changes

- explicit event/topic design;
- private channel authorization;
- reduced coupling between table schemas and client subscriptions;
- better fit for domain events and selected UI updates;
- clearer control over payload contents;
- current Supabase recommendation for scalable realtime usage.

Postgres Changes can still be used selectively for a proven low-volume use case, but it is not the default architecture.

## Consequences

### Positive

- low-latency user experience;
- topic-level access control;
- clean fit with domain events/outbox architecture;
- missed realtime delivery does not corrupt business state;
- Web and Mobile can use the same realtime model.

### Trade-offs

- clients need reconnect/refetch logic;
- Realtime RLS policies add authorization complexity;
- connection/JWT lifecycle matters when permissions change;
- broadcasts are ephemeral and cannot replace durable queues or database state.

## Guardrails

1. Private channels for business data.
2. No blanket authenticated access policy without resource authorization.
3. PostgreSQL first for durable business state.
4. Broadcast payloads contain only information appropriate for recipients.
5. Realtime consumers remain idempotent where duplicate UI signals are possible.
6. Channel subscriptions are cleaned up explicitly.
7. Permission revocation behavior considers Realtime authorization caching and JWT refresh.
8. Presence is low-frequency only.
9. Realtime does not replace BullMQ, domain events, webhooks, or the audit log.

## Evidence reference

- POC document: `docs/poc/POC-06.md`
- Functional run: `36086788945`
- Supabase project: `obpncbnzwrocvgngtodg`
