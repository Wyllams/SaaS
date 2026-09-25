# POC-03 — Design System in Code

## Status

**PASS — Tailwind CSS 4 + semantic CSS variables accepted for Web styling.**

## Goal

Validate that CrewCommand's approved visual foundations can be represented as semantic, reusable design tokens and accessible React components without coupling product behavior to arbitrary per-screen CSS.

## Validated stack

- Tailwind CSS 4.3.3
- React 19.3.0
- Vitest 5.0.1
- semantic CSS custom properties
- shared TypeScript design tokens

## Evidence

GitHub Actions run `36083059041` completed successfully.

Validated:

1. approved Command Blue / Midnight Navy / status / spacing / radius tokens are centralized;
2. Tailwind 4 compiled the semantic-token stylesheet successfully;
3. Button variants and the approved 32/40/48px control scale compiled;
4. Input label, invalid state and error relationship are present in rendered markup;
5. Status badge exposes readable text in addition to color;
6. long PT-BR labels do not depend on a fixed-width button contract;
7. component source contains no direct approved brand/status hex values;
8. strict TypeScript passed;
9. Vitest component suite: **4/4 passed**;
10. compiled CSS artifact was uploaded as PoC evidence.

## Decision

Use **semantic CSS variables as the token source + Tailwind CSS 4 as the default Web composition/styling layer**.

React components own reusable behavior and accessibility semantics.

CSS Modules remain allowed for isolated exceptional cases where they are materially clearer, but they are not the primary design-system mechanism.

Mobile reuses tokens/concepts but does not need to reuse Web React components.

## Guardrails

- Product components consume semantic tokens, not hard-coded approved palette values.
- Status meaning must never depend on color alone.
- Design tokens live independently from product screens.
- Tailwind utilities do not replace reusable components for behavior/semantics.
- Dark mode remains future-ready through semantic token indirection, not implemented in V1.
- Accessibility checks remain part of component acceptance.

## ADR

Decision recorded in `docs/adr/ADR-003-tailwind-semantic-design-system.md`.
