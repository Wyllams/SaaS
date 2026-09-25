# POC-03 — Design System in Code

## Status

IN PROGRESS.

## Goal

Validate that CrewCommand's approved visual foundations can be represented as semantic, reusable design tokens and accessible React components without coupling product behavior to arbitrary per-screen CSS.

## Candidate direction

- Semantic CSS variables as the source of visual tokens.
- TypeScript token exports for non-CSS consumers.
- Tailwind CSS 4 utilities mapped to semantic tokens for Web composition.
- React components for reusable behavior/semantics.
- Mobile reuses tokens/contracts, not necessarily Web components.

## Required evidence

1. approved CrewCommand palette/status/radius/spacing tokens exist centrally;
2. Tailwind 4 compiles semantic token utilities successfully;
3. Button variants and sizes compile with the approved touch target rules;
4. Input has explicit label/error accessibility semantics;
5. Status badges contain text in addition to color;
6. long PT-BR labels do not rely on fixed-width controls;
7. components contain no direct approved brand/status hex values;
8. strict TypeScript and component tests pass.

## Decision boundary

The PoC validates **Tailwind CSS 4 + semantic CSS variables** as the default Web styling strategy. CSS Modules remain permissible for exceptional isolated cases that are materially clearer outside utility composition, but are not the primary design-system mechanism.
