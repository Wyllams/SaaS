# SaaS

Canonical repository for the new SaaS.

## Canonical branch

**`main` is the single source branch for current product work.**

It contains:

- the approved product/source-of-truth documents;
- consolidated technical architecture;
- accepted ADRs;
- Epic 0 foundation code;
- ChatGPT/Codex operating rules;
- implementation, environment and QA documentation.

Historical PoC and validation branches are intentionally retained as audit evidence. Their experimental code is not production code and must not override `main`.

## Repository map

- `AGENTS.md` — mandatory rules for Codex/code agents.
- `apps/` — Web, API, Worker and Mobile applications.
- `packages/` — shared packages.
- `docs/source-of-truth/` — canonical product documents.
- `docs/architecture/` — consolidated architecture.
- `docs/adr/` — accepted architecture decisions.
- `docs/implementation/` — execution plans, status, QA and bootstrap guides.
- `docs/poc/` — PoC status index and historical pointers.
- `docs/repository/` — repository organization and branch inventory.

See `docs/README.md` for the documentation map.

## Clone to your computer

With GitHub CLI:

```bash
gh repo clone Wyllams/SaaS
```

This creates a local `SaaS` folder with the `main` working tree and the repository's Git history. Historical remote branches remain available through Git.

After cloning:

```bash
cd SaaS
git branch -a
```
