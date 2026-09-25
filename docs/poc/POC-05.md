# POC-05 — BullMQ + Valkey

## Status

IN PROGRESS.

## Goal

Validate BullMQ with a Redis-compatible Valkey 8 runtime for CrewCommand background jobs.

## Versions

- BullMQ 6.3.4
- Valkey 8.1.10
- ioredis 6.0.0

## Required evidence

1. transient retry with fixed backoff reaches success;
2. application-level idempotency prevents duplicate side effects;
3. delayed jobs execute after the configured delay;
4. worker concurrency is respected;
5. jobs queued while no worker is active are later recovered;
6. permanently failing jobs remain inspectable in failed state;
7. strict TypeScript compilation succeeds.

The PoC uses Valkey in GitHub Actions to validate protocol/runtime compatibility without requiring a paid Render Key Value instance.
