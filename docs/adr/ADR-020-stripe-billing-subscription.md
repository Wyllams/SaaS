# ADR-020 — Stripe Billing para a assinatura da plataforma

- **Status:** Accepted
- **Data:** 2026-09-25

## Context

A cobrança da própria assinatura **não tinha provider, entidade nem ADR**, apesar de o App
Flow exigir Trial de 14 dias com cartão e o ciclo Grace, Read-only e Suspended.

O ADR-007 cobre Stripe Connect, que serve aos pagamentos dos clientes do contractor — é outro
problema. Sem esta decisão, a plataforma não consegue cobrar o primeiro cliente.

## Options Considered

| Opção | Avaliação |
|---|---|
| **Stripe Billing** | Mesmo fornecedor já em uso; Trial, ciclo e dunning prontos; webhooks maduros |
| Onboarding e cobrança manuais | Zero código; não escala e impede autoatendimento |
| Paddle ou LemonSqueezy | Merchant of record resolve imposto sobre a assinatura; fornecedor a mais e menos controle |

## Decision

**Stripe Billing**, com adapter próprio sob o contrato `BillingProvider`, **separado** do
`PaymentProvider` que atende o Connect.

Entidades: `BillingCustomer`, `BillingPaymentMethod`, `SubscriptionInvoice`, além de `Plan`,
`PlanLimit`, `Subscription` e `Entitlement`.

O ciclo `Past Due → Grace (3 dias) → Read-only → Suspended → Active` é dirigido por webhook,
não por polling.

## Evidence

Nenhuma. Não houve PoC — o POC-07 validou Connect, que é integração distinta. A validação
prática ocorre no Epic 4.

## Consequences

**Positivas:** cadastro com autoatendimento desde o lançamento; dunning e recuperação de
cartão prontos; portal de cobrança hospedado reduz telas a construir.

**Trade-offs:** duas integrações Stripe no mesmo código-base, com risco real de confusão;
dois conjuntos de webhook; a plataforma não é merchant of record, então imposto sobre a
assinatura é responsabilidade própria.

## Guardrails

- `BillingProvider` e `PaymentProvider` **nunca compartilham código de domínio**. Misturar os
  dois é erro de arquitetura, não detalhe de implementação.
- Nenhum dado sensível de cartão é persistido — apenas bandeira, últimos quatro e validade.
- **Read-only é aplicado no servidor**, não apenas na interface; chamada direta à rota também
  é negada.
- **Dados nunca são apagados** por falta de pagamento.
- Transição de estado é idempotente por `provider_event_id`.
- Limite de plano é dado em `Entitlement`, nunca condicional de nome de plano no código.

## Revisit Trigger

Reavaliar se ocorrer **qualquer** um destes:

1. venda internacional tornar o recolhimento de imposto sobre a assinatura oneroso a ponto de
   justificar um merchant of record;
2. exigência de faturamento por contrato, ordem de compra ou pagamento fora do cartão para
   clientes maiores;
3. a taxa de falha involuntária de cobrança ultrapassar o aceitável após o dunning padrão.
