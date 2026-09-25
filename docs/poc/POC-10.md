# POC-10 — Resend Email

## Status

**IN PROGRESS — outbound, inbound and attachment retrieval observed; signed webhook delivery still pending.**

## Goal

Validate Resend as an email provider for the SaaS without coupling the proof of concept to a final product name or application framework.

The PoC must prove:

- controlled transactional sending;
- inbound email using a Resend-managed receiving address;
- retrieval of received email content;
- attachment discovery/retrieval;
- webhook delivery to a public HTTPS endpoint;
- webhook signature verification from the exact raw body;
- replay-window and duplicate-delivery handling;
- a strict sender allowlist for inbound processing;
- no API keys or webhook secrets in repository content, normal logs or evidence artifacts.

## Repository basis

This branch is based on **POC-04 — Monorepo Foundation**.

The experimental integration lives under:

`packages/resend-poc/`

This follows the existing PoC convention of isolating provider experiments under `packages/*-poc` without promoting them to production packages.

No framework-specific application scaffold is introduced by this PoC.

## Naming rule

The final SaaS product name is intentionally undecided.

New POC-10 files use neutral terms such as **SaaS**, **platform**, **application** and **product**. Existing historical package names from earlier PoCs are not rewritten here.

## Provider-side evidence observed on 2026-09-25

Using the connected Resend test account:

- outbound email capability is available;
- a controlled inbound message reached the Resend-managed receiving address;
- the received message was visible through the receiving API;
- the receiving API reported **2 attachments**;
- both attachments exposed provider metadata and retrieval URLs.

No custom sending/receiving domain was required for this initial inbound validation.

## Webhook status

**Pending.**

The PoC is not PASS until a real Resend webhook is delivered to a public HTTPS endpoint owned by this new SaaS project and the following are demonstrated:

1. valid signed event accepted;
2. modified body rejected;
3. stale/replayed timestamp rejected;
4. duplicate message id does not execute processing twice;
5. `email.received` event can be correlated to provider-side received email metadata.

## Security contract

Inbound email is untrusted input.

For the PoC:

- process only explicitly allowlisted sender addresses;
- do not trust From headers as application authorization;
- do not execute instructions or code from email content;
- verify webhook authenticity before parsing business intent;
- keep the exact raw body available for signature verification;
- reject webhook timestamps outside the Standard Webhooks 5-minute replay window;
- deduplicate using the webhook message id;
- redact Authorization values from evidence;
- store no API key or webhook signing secret in Git.

## Local contract

`packages/resend-poc` validates:

- Resend REST request construction;
- received-email and attachment endpoints;
- evidence redaction;
- Standard Webhooks HMAC verification semantics;
- exact-body tamper rejection;
- replay rejection;
- compatibility with standard and legacy Svix header aliases;
- duplicate id handling;
- strict inbound sender allowlist.

The production implementation should prefer the official Resend SDK verification helper rather than maintaining custom cryptography.

## External acceptance criteria

| Criterion | Status |
| --- | --- |
| Controlled outbound email | OBSERVED |
| Inbound email to Resend-managed address | PASS |
| Received email visible via API | PASS |
| Attachment metadata/retrieval available | PASS |
| Public HTTPS webhook endpoint | PENDING |
| Real signed `email.received` webhook | PENDING |
| Signature failure path | LOCAL ONLY |
| Replay failure path | LOCAL ONLY |
| Duplicate event path | LOCAL ONLY |
| Secrets absent from repository/evidence | REQUIRED |

## Decision gate

No ADR is created while the webhook portion remains pending.

If all acceptance criteria pass, the next step is to create an ADR describing Resend's approved scope and production guardrails.

If webhook validation fails, this PoC remains open or is rejected without promoting the provider into the architecture.
