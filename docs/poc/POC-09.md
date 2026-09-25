# POC-09 — Twilio SMS / A2P 10DLC

## Status

**IN PROGRESS — local/CI integration contract can be validated now; real US A2P 10DLC registration requires a paid Twilio account, US 10DLC number and carrier approval.**

## Goal

Validate CrewCommand's V1 SMS architecture:

- Twilio Programmable Messaging;
- one Messaging Service per Workspace by default, with future Location override support;
- bidirectional SMS;
- status callbacks;
- secure webhook signature verification;
- explicit consent/opt-out handling;
- Advanced Opt-Out awareness;
- SMS usage metering by actual message segments;
- US A2P 10DLC compliance gate;
- no US 10DLC production traffic until the relevant campaign is approved.

## Current external constraint

Twilio's current A2P 10DLC flow requires a paid account, US 10DLC number, compliance profile, A2P Brand, A2P Campaign, Messaging Service, and sender association. Twilio Trial accounts cannot register for A2P 10DLC.

## Why test credentials are not enough

Twilio test credentials can simulate the Messages API without real delivery, but they do not support `MessagingServiceSid`, do not trigger status callbacks, and do not prove Brand/Campaign/sender registration or carrier delivery.

## Local/CI scope

The POC validates:

1. Messaging Service based outbound payload;
2. E.164 recipient validation;
3. consent required before send;
4. opted-out recipient blocking;
5. US 10DLC blocked unless campaign is `VERIFIED`;
6. inbound SMS mapping;
7. Advanced Opt-Out STOP/START/HELP handling;
8. no duplicate application reply when Twilio already handled opt-out/help;
9. SDK-based webhook signature validation;
10. unknown/new webhook parameters preserved for validation;
11. tampered payload rejected;
12. out-of-order status callback regression protection;
13. conflicting terminal callbacks cause provider re-fetch;
14. usage metering by actual provider segment count.

## External validation still required

A full PASS requires a paid Twilio account, SMS-capable US 10DLC number, Messaging Service, signed real inbound/status webhooks, Advanced Opt-Out verification, registered Brand/Campaign, campaign `VERIFIED`, and a real US A2P message after approval.

No final ADR is accepted until enough external evidence exists to confirm the production path.
