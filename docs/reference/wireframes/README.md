# Wireframes reference index

This directory stores visual reference artifacts that support screen, modal, drawer and
responsive-state work.

No item in this directory overrides the official sources. Before implementing a visual
surface, consult `docs/source-of-truth/CURRENT-DECISIONS.md`, the approved Implementation
Plan, the App Flow, the UI/UX document, the applicable ADRs, and the Task Packet.

## `historical/2026-09-25/` — low-fidelity catalog

An imported low-fidelity catalog from the Product Owner, covering **116 screens**.

**Status changed on 2026-09-26.** By Product Owner decision, this catalog is now the
accepted low-fidelity basis for high-fidelity design. It satisfies the low-fi stage
required by UI/UX §8.1.

Verified coverage, by Screen ID count against App Flow §16:

| | Count |
|---|---|
| V1 screens covered | **91 of 91 (100%)** |
| Deferred screens also drawn — must be ignored | 25 |

It remains **non-authoritative as a specification**. It is a starting point, not a
contract. Every screen must be reconciled before use:

- **Skip the 25 deferred screens** listed in App Flow §16.2 — `SCR-INB-001` to `004`,
  `SCR-TASK-001` to `003`, `SCR-AUT-001` to `004`, `SCR-DASH-002` to `005`, `SCR-SA-003`
  to `007`, `SCR-SET-008`, `SCR-SET-013`, `SCR-FIN-008`, `SCR-JOB-011`, `SCR-REP-002`.
- **Discard revoked material.** The catalog still contains SMS/Twilio (15 references),
  internal Chat (14), Automations (4) and Financing (7). All are out of the V1.
- **Reconcile against App Flow v2.0** and the current Epic. The catalog predates v2.0, so
  role names, dashboard structure and portal access may differ.
- The **CrewCommand brand is no longer a reason to distrust it** — CrewCommand is the
  current provisional brand as of 2026-09-26.

## Files

| File | Content |
|---|---|
| `CrewCommand Telas Completas.dc.html` | The 116-screen catalog |
| `CrewCommand Wireframes.dc.html` | Flow variants and decision options |
| `support.js` | Viewer script for the two HTML files |
