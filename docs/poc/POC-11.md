# POC-11 — Expo Mobile

## Status

**PASS — repository-level Expo mobile hypothesis validated. Device/store runtime evidence is intentionally deferred.**

## Goal

Validate the mobile foundation for the SaaS using React Native with Expo while keeping the proof of concept independent from the final product name.

The PoC proves:

- the existing `apps/mobile` workspace can host a real Expo application inside the approved pnpm + Turborepo monorepo;
- file-based navigation works with Expo Router;
- a camera screen can request permission and compile with photo capture support;
- a captured file can enter a controlled HTTPS upload flow;
- a custom URL scheme maps to a parameterized route;
- TypeScript and contract tests run in CI;
- Android and iOS JavaScript bundles can be generated without store credentials.

## Repository basis

This branch is based on **POC-04 — Monorepo Foundation**.

POC-04 explicitly reserved `apps/mobile` for React Native + Expo and deferred framework-specific scaffolding to a later PoC. POC-11 is that framework-validation step.

The historical workspace identifier inherited from POC-04 remains unchanged only to preserve that validated monorepo contract. No new product-name decision is made by this PoC.

## Validated stack

- Expo SDK 57 stable line;
- React 19.2.3;
- React Native 0.86.3;
- Expo Router 57;
- Expo Camera 57;
- Expo FileSystem 57;
- Expo Linking 57;
- pnpm workspace + Turborepo foundation inherited from POC-04.

SDK 58 was intentionally not selected because it is still in beta during this PoC.

## Functional proof

The PoC contains:

- `app/_layout.tsx` — Expo Router stack;
- `app/index.tsx` — entry/navigation screen;
- `app/camera.tsx` — camera permission + photo capture;
- `app/upload.tsx` — captured-file upload trigger;
- `app/jobs/[jobId].tsx` — parameterized deep-link target;
- `src/upload.ts` — device file upload using Expo FileSystem + Expo fetch;
- contract helpers/tests for deep links, HTTPS upload rules and route/config wiring.

## Deep-link contract

Temporary PoC scheme:

`saaspoc11://jobs/<job-id>`

This scheme is test-only and does not reserve a future product brand, production domain, iOS Universal Link or Android App Link.

## Upload contract

The PoC validates the client capability to upload a device file.

Guardrails:

- upload target must use HTTPS;
- `EXPO_PUBLIC_*` variables must never contain secrets;
- no permanent production storage provider is selected by this PoC;
- production upload authorization/signing remains backend-owned;
- a disposable endpoint may be used for later physical-device evidence.

## Camera contract

The camera proof uses `expo-camera`.

Validated at repository/bundle level:

1. explicit camera permission flow;
2. camera renders only after permission;
3. photo capture calls the Expo camera API;
4. captured URI is passed into the upload route;
5. camera dependency resolves in Android and iOS bundle exports.

No microphone permission is requested because audio/video recording is outside this PoC.

## CI evidence

Bootstrap and external dependency-resolution run:

- GitHub Actions run: `36137945776`;
- conclusion: **success**;
- SDK dependency bootstrap: PASS;
- monorepo structure: PASS;
- Expo dependency alignment: PASS;
- strict TypeScript + contract tests: PASS;
- monorepo build-artifact contract: PASS;
- Android bundle export: PASS;
- iOS bundle export: PASS;
- resolved dependency lock committed by GitHub Actions bot: `f26f62584fbf579c8393032267cf3036a455698d`.

The permanent workflow uses the committed lockfile with `pnpm install --frozen-lockfile` and read-only repository permissions.

## Acceptance criteria

| Criterion | Result |
| --- | --- |
| POC-04 monorepo structure remains valid | PASS |
| Expo SDK dependency compatibility | PASS |
| TypeScript strict check | PASS |
| Deep-link/upload contract tests | PASS |
| Android bundle export | PASS |
| iOS bundle export | PASS |
| Camera module resolves during native bundle | PASS |
| No product/store credentials required | PASS |

## Device / store boundary

A real phone/emulator test is useful additional evidence, but it is not required to validate the repository-level architecture.

Deferred to the later build/distribution stage:

- Apple Developer account;
- Google Play Console account;
- production bundle identifiers;
- EAS production builds;
- App Store / Play Store submission;
- production signing credentials;
- production Universal Links / Android App Links;
- real camera permission behavior on a physical device;
- real network upload from a physical device.

## Decision

Use **React Native with Expo** for the mobile application foundation.

Use Expo Router for file-based navigation and deep-link-compatible routing.

Keep native platform projects generated rather than hand-maintained until a future requirement proves that committed native projects are necessary.

## ADR

Decision recorded in:

`docs/adr/ADR-011-expo-mobile-foundation.md`
