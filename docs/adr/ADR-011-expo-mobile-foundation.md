# ADR-011 — Expo Mobile Foundation

- **Status:** **Superseded by ADR-018** (PWA) no escopo da V1, em 2026-09-25
- **Status original:** Accepted
- **Date:** 2026-09-25
- **Validated by:** POC-11

## Context

The SaaS requires a mobile application capable of field workflows while remaining inside the approved pnpm + Turborepo repository.

The mobile foundation needs:

- Android and iOS support from one TypeScript/React codebase;
- navigation and deep linking;
- device camera access;
- local-file upload capability;
- compatibility with shared workspace packages where appropriate;
- independent mobile build/distribution lifecycle;
- no dependency on the final product brand during architecture validation.

## Decision

Use **React Native with Expo** as the mobile application foundation.

For the initial architecture:

1. use the stable Expo SDK line validated by the PoC;
2. use Expo Router for file-based navigation;
3. use Expo SDK modules for supported native capabilities such as camera and file access;
4. keep the application under `apps/mobile`;
5. keep pnpm as the only repository package manager;
6. use generated native projects rather than committing `ios/` and `android/` by default;
7. treat EAS/App Store/Play Store setup as a later distribution concern.

## Evidence

POC-11 demonstrated in GitHub Actions:

- Expo dependency resolution inside the existing pnpm workspace;
- compatibility with the monorepo structure verifier;
- strict TypeScript validation;
- automated deep-link/upload contract tests;
- Android JavaScript bundle export;
- iOS JavaScript bundle export;
- `expo-camera` resolution in both platform bundles;
- committed frozen pnpm dependency lock.

Bootstrap evidence run:

`36137945776`

## Navigation

Use Expo Router for application routing.

Benefits validated or preserved by this choice:

- routes are colocated with screen files;
- parameterized routes map naturally to deep links;
- navigation can be validated without a custom navigation framework layer;
- a future production URL scheme/domain can replace the temporary PoC scheme without changing the fundamental routing model.

Do not treat the temporary PoC scheme as a brand or production URL decision.

## Camera

Use `expo-camera` when camera capture is required.

Application behavior must:

- request permission explicitly;
- handle denial without blocking unrelated app functionality;
- avoid requesting microphone permission unless audio/video recording is actually required;
- treat captured media as untrusted user/device input;
- release/disable camera usage when the screen is not active where necessary.

## File uploads

Use Expo's current file APIs and fetch support for device-file transport.

Production requirements:

- HTTPS only;
- no secrets in `EXPO_PUBLIC_*` variables;
- prefer backend-issued authorization or signed upload URLs;
- enforce file type/size rules server-side;
- do not trust client MIME type or filename as security boundaries;
- make retries/idempotency explicit for business-critical uploads.

This ADR does not select the permanent storage provider.

## Native projects

Do not commit generated `ios/` and `android/` directories by default.

Use Expo Continuous Native Generation / prebuild when native projects are needed for builds.

A future ADR may change this if custom native code, complex native build customization or another concrete requirement makes committed native projects materially safer.

## Distribution boundary

Architecture validation does not require:

- Apple Developer credentials;
- Google Play credentials;
- production bundle identifiers;
- store submissions;
- production signing credentials.

Those are required when the product reaches device distribution and store release work.

## Consequences

### Positive

- one TypeScript/React mobile codebase for Android and iOS;
- Expo SDK provides maintained native capability integrations;
- Expo Router gives a direct navigation/deep-link model;
- mobile remains an independently deployable application in the monorepo;
- store credentials are not coupled to repository architecture work.

### Trade-offs

- Expo SDK compatibility must be respected when upgrading React Native;
- native-module requirements must be checked against the selected Expo SDK;
- physical-device behavior cannot be proven by bundle-only CI;
- EAS/store workflows add a separate operational surface later.

## Guardrails

1. Prefer stable Expo SDK releases for production baselines.
2. Do not adopt beta/canary SDKs without an explicit reason and separate validation.
3. Run Expo dependency compatibility checks during SDK upgrades.
4. Keep secrets out of public Expo environment variables.
5. Camera and media permissions must be purpose-specific.
6. Server-side validation remains authoritative for uploaded files.
7. Mobile and Web may share contracts/tokens, but UI implementation is not forced to be shared.
8. Store/build credentials remain outside source control.
9. Product branding, bundle identifiers and production URL schemes require their own explicit decision.
