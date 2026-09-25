# CrewCommand

CrewCommand is a multi-tenant SaaS for field-service businesses.

This branch contains **POC-04 — Monorepo Foundation**, validating the approved `pnpm + Turborepo` repository shape before product implementation starts.

## Approved repository shape

```text
apps/
  web/       # Next.js (later PoC / implementation)
  api/       # NestJS + Fastify
  worker/    # BullMQ workers
  mobile/    # React Native + Expo
packages/
  api-client/
  design-tokens/
  types/
  validation/
  config/
```

## PoC commands

```bash
corepack enable
corepack prepare pnpm@12.6.0 --activate
pnpm install
pnpm run verify:structure
pnpm run build
pnpm run check
pnpm run verify:artifacts
```

The applications are intentionally lightweight placeholders in this PoC. Framework-specific scaffolding is introduced only in the PoCs that validate those frameworks.
