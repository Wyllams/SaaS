# Secrets Policy

- **Date:** 2026-09-25
- **Status:** current baseline
- **Authority:** ADR-016

## Rules

1. No secret is committed to Git.
2. No secret is placed in `NEXT_PUBLIC_*`.
3. Development, Staging and Production use different credentials.
4. Provider/Supabase secret stores and GitHub Actions secrets hold hosted credentials.
5. Logs/traces/screenshots/test evidence must not expose secrets.
6. Rotate/revoke leaked credentials rather than relying on history edits.

## Browser-safe configuration

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These are configuration/public publishable values, not server secrets.

## Server-only Supabase runtime

Hosted Edge Functions receive server runtime variables including:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`

Do not mirror `SUPABASE_DB_URL` or service/secret keys into browser/mobile configuration.

## Future provider secrets

Stripe, QuickBooks, Resend, Sentry and future provider secrets are introduced only by their owning Epic and stored in the appropriate environment secret store.

The former `DATABASE_URL`/Render and `REDIS_URL`/Valkey contracts are not part of the current runtime.
