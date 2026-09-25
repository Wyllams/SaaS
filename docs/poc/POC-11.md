# POC-11 — Expo Mobile

## Status

**IN PROGRESS — repository scaffold prepared; dependency lock and CI bundle validation pending.**

## Goal

Validate the mobile foundation for the SaaS using React Native with Expo while keeping the proof of concept independent from the final product name.

The PoC must prove:

- the existing `apps/mobile` workspace can host a real Expo application inside the approved pnpm + Turborepo monorepo;
- file-based navigation works with Expo Router;
- a camera screen can request permission and capture a photo;
- a captured file can enter a controlled HTTPS upload flow;
- a custom URL scheme can resolve to a parameterized route;
- TypeScript and contract tests run in CI;
- Android and iOS JavaScript bundles can be generated without requiring store credentials.

## Repository basis

This branch is based on **POC-04 — Monorepo Foundation**.

POC-04 explicitly reserved `apps/mobile` for React Native + Expo and deferred framework-specific scaffolding to a later PoC. POC-11 is that framework-validation step.

The historical workspace identifier inherited from POC-04 remains unchanged only to preserve that validated monorepo contract. No new product-name decision is made by this PoC.

## Version decision

Use **Expo SDK 57 stable**, not SDK 58 beta.

The dependency bootstrap uses `expo install --fix` so the branch receives compatible SDK 57 package versions and commits the resulting pnpm lockfile.

## Functional proof

The PoC contains:

- `app/_layout.tsx` — Expo Router stack;
- `app/index.tsx` — entry/navigation screen;
- `app/camera.tsx` — camera permission + capture;
- `app/upload.tsx` — captured-file upload trigger;
- `app/jobs/[jobId].tsx` — parameterized deep-link target;
- `src/upload.ts` — device file upload using Expo FileSystem + Expo fetch;
- pure contract helpers and Node tests for deep links/upload validation.

## Deep-link contract

Temporary PoC scheme:

`saaspoc11://jobs/<job-id>`

This scheme is test-only and does not reserve the future product brand, production domain, iOS Universal Link or Android App Link.

## Upload contract

The PoC demonstrates device-file upload capability only.

Guardrails:

- upload target must use HTTPS;
- `EXPO_PUBLIC_*` variables must never contain secrets;
- no permanent production storage provider is selected by this PoC;
- authorization/signing for production uploads remains backend-owned;
- a disposable test endpoint may be used when exercising a real device upload.

## Camera contract

The camera proof uses `expo-camera`.

The app must:

1. request camera permission explicitly;
2. render the camera only after permission is granted;
3. capture a photo to the application cache;
4. pass the resulting local URI into the upload flow.

No microphone permission is requested because video/audio recording is outside this PoC.

## CI acceptance criteria

| Criterion | Status |
| --- | --- |
| POC-04 monorepo structure remains valid | PENDING |
| Expo SDK dependency compatibility check | PENDING |
| TypeScript strict check | PENDING |
| Deep-link/upload contract tests | PENDING |
| Android bundle export | PENDING |
| iOS bundle export | PENDING |
| Camera module resolves during native bundle | PENDING |
| No product/store credentials required | EXPECTED |

## Device / store boundary

A real phone or emulator test can be added after CI bundle validation.

The following are **not required to validate the repository-level PoC**:

- Apple Developer account;
- Google Play Console account;
- production bundle identifiers;
- App Store / Play Store submission;
- production signing credentials.

Those belong to the later build/distribution stage.

## Decision gate

No ADR is created until the Expo dependency graph, tests and Android/iOS bundle exports pass.

If the repository-level validation passes, device testing can be recorded as additional evidence without blocking the architecture decision.
