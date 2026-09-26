# ADR-022 — Acesso ao Client Portal por magic link

- **Status:** Accepted
- **Data:** 2026-09-25

## Context

O App Flow v1.0 e o PRD v1.0 exigiam e-mail e senha para o cliente entrar no portal. O Domain
Model v1.0, por sua vez, **não tinha nenhuma entidade de portal** — nove telas e um Epic
inteiro sem tabela.

Exigir que um dono de imóvel crie conta para assinar um orçamento de telhado é atrito no ponto
exato da conversão, que é onde a venda se perde.

## Options Considered

| Opção | Avaliação |
|---|---|
| **Magic link para aprovar, senha opcional** | Remove o atrito na assinatura; senha só para quem quer acompanhar |
| E-mail e senha, como documentado | Um caminho único e auditoria simples; mantém o atrito na conversão |
| Magic link para tudo, sem senha | Menos código; acesso recorrente sempre dependente da caixa de entrada |

## Decision

`PortalGrant`: token aleatório de alta entropia, guardado **apenas como hash**, com
finalidade, entidade alvo, validade e **uso único**.

Ao consumir: valida hash, validade e finalidade, cria `PortalSession` restrita ao próprio
cliente e registra o IP. `EstimateSignature` e `ChangeOrderSignature` referenciam o
`portal_grant_id` que as originou.

Definir senha é **opcional** e leva ao mesmo escopo.

## Evidence

Nenhuma. Decisão de produto e segurança tomada em 2026-09-25; a validação prática ocorre no
Epic 10, com os testes negativos exigidos pelo Implementation Plan.

## Consequences

**Positivas:** o cliente aprova em dois toques a partir do e-mail; menos código do que um
sistema completo de senha com política e recuperação; cada assinatura fica ligada ao link
exato que a produziu, o que é uma trilha de auditoria melhor que a de sessão por senha.

**Trade-offs:** o acesso depende da entregabilidade do e-mail; link encaminhado pelo cliente
a terceiro concede o acesso daquele grant — mitigado por validade curta e uso único; sem
senha, não há segundo fator.

## Guardrails

- Token **nunca** persistido nem registrado em claro — apenas hash.
- Uso único e validade curta; expirado oferece reenvio **sem revelar dado do documento**.
- Grant é vinculado a finalidade e entidade; não serve para outra operação.
- Um grant **jamais** alcança dado de outro cliente, mesmo com ID válido na URL.
- Emissão e consumo têm rate limit.
- Conteúdo não marcado como customer-visible nunca é servido, em nenhuma resposta.
- `PortalAccess` **não é** `Membership` e nunca concede permissão interna.

## Revisit Trigger

Reavaliar se ocorrer **qualquer** um destes:

1. sinal de abuso, como consumo de grant a partir de origem inesperada em volume;
2. cliente corporativo exigir SSO ou segundo fator no portal;
3. a taxa de conclusão de aprovação ficar baixa por falha de entrega do link, medida após os
   primeiros clientes.
