# Secrets Policy

- **Date:** 2026-09-25
- **Status:** approved Epic 0 baseline

## Rules

1. No secret is committed to Git.
2. No secret is placed in `NEXT_PUBLIC_*` or another client-exposed variable.
3. Development, Staging and Production use different credentials.
4. Provider dashboards/secret stores and GitHub Actions secrets are the storage surfaces for hosted credentials.
5. Logs, traces, screenshots and test evidence must not expose secrets.
6. PoC/Sandbox credentials are never promoted to Production.
7. Rotation/revocation is preferred over editing a leaked secret in history.

## Current server-only secrets

- `DATABASE_URL`
- `REDIS_URL`
- `SENTRY_DSN` when configured server-side

Future provider secrets (Stripe, QuickBooks, Resend and others) are added only when their owning Epic is implemented.

## Public configuration

`NEXT_PUBLIC_API_BASE_URL` is intentionally browser-visible and must contain no credential.

## Repository enforcement

The Foundation CI:

- rejects tracked `.env*` files except `.env.example`;
- scans implementation/configuration files for selected high-risk secret patterns;
- uses a committed lockfile;
- runs with read-only repository permissions after bootstrap.

This is a baseline, not a replacement for provider/GitHub secret scanning or later security hardening.
