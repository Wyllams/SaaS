# ADR-003 — Tailwind CSS 4 + Semantic Tokens for Web Design System

- **Status:** Accepted
- **Date:** 2026-09-24
- **Validated by:** POC-03

## Context

CrewCommand's UI/UX specification defines a shared visual system across a dense administrative Web app, responsive PWA, Client Portal and mobile experiences.

The implementation needs:
- centralized semantic design tokens;
- strong consistency across many modules;
- responsive composition;
- accessible reusable components;
- support for longer English/Spanish/PT-BR labels;
- future Dark Mode readiness without implementing Dark Mode in V1.

## Decision

For Web:
1. CSS custom properties are the semantic design-token source.
2. TypeScript exports expose matching token concepts to non-CSS consumers.
3. Tailwind CSS 4 is the default composition/styling layer mapped to those semantic tokens.
4. React components encapsulate reusable behavior and accessibility.
5. CSS Modules are permitted only for isolated exceptions, not as the default system.

## Rationale

POC-03 demonstrated that the approved CrewCommand palette, spacing, radius and status system can be expressed once and consumed through Tailwind utilities without leaking raw brand/status values into components. The component tests also validated the intended accessibility semantics and long-label behavior.

## Consequences

### Positive
- semantic tokens make visual changes centralized;
- Tailwind supports rapid composition of dense SaaS screens;
- token indirection prepares future themes;
- component source remains readable and testable;
- Web and Mobile can share token concepts without forcing shared UI implementations.

### Trade-offs
- utility discipline is required to prevent arbitrary one-off styling;
- Tailwind class composition must not become a replacement for component architecture;
- CSS Modules may still be appropriate for rare complex isolated styling.

## Evidence

- GitHub Actions run `36083059041`;
- Tailwind 4.3.3 compiled successfully;
- Vitest: 4/4 component tests passed;
- token hard-code enforcement passed;
- compiled CSS evidence artifact produced.
