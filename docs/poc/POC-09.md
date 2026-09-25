# POC-09 — Twilio SMS / A2P 10DLC

## Status

**PARTIAL PASS — local/CI integration contract validated; real US A2P 10DLC registration requires a paid Twilio account, US 10DLC number and carrier approval.**

## Goal

Validate CrewCommand's V1 SMS architecture:

- Twilio Programmable Messaging;
- CrewCommand treated as a Twilio ISV;
- one Twilio subaccount mapped to each customer Workspace as the preferred long-term isolation model;
- one or more Messaging Services inside that subaccount, separated by messaging Campaign/use case;
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

## ISV topology decision under validation

Current Twilio guidance classifies CrewCommand as an ISV because the platform sends messages on behalf of customer businesses.

The preferred long-term topology is **ISV architecture #1**:

- one Twilio subaccount per CrewCommand customer Workspace;
- Secondary Customer Profile / Brand registration for the customer's business;
- Campaigns per applicable messaging use case;
- one Messaging Service per Campaign/use case inside that customer's subaccount.

This is safer than placing unrelated customers in one shared Twilio account/Messaging Service because a compliance problem from one customer is less likely to impact all other customers.

A Workspace can therefore have more than one Messaging Service. For example, transactional operational messages and marketing messages may require different Campaign/use-case treatment.

Location-specific sender behavior remains a future capability, but it must sit inside the Workspace/customer compliance boundary rather than creating cross-customer sender sharing.

## Local/CI scope

The POC validates:

1. ISV topology: dedicated Twilio subaccount per Workspace and Messaging Services per use case;
2. Messaging Service based outbound payload;
3. E.164 recipient validation;
4. consent required before send;
5. opted-out recipient blocking;
6. US 10DLC blocked unless campaign is `VERIFIED`;
7. inbound SMS mapping;
8. Advanced Opt-Out STOP/START/HELP handling;
9. no duplicate application reply when Twilio already handled opt-out/help;
10. SDK-based webhook signature validation;
11. unknown/new webhook parameters preserved for validation;
12. tampered payload rejected;
13. out-of-order status callback regression protection;
14. conflicting terminal callbacks cause provider re-fetch;
15. usage metering by actual provider segment count.

## External validation still required

A full PASS requires a paid Twilio account, SMS-capable US 10DLC number, Messaging Service, signed real inbound/status webhooks, Advanced Opt-Out verification, registered Brand/Campaign, campaign `VERIFIED`, and a real US A2P message after approval.

No final ADR is accepted until enough external evidence exists to confirm the production path.
