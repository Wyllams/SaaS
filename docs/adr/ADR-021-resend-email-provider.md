# ADR-021 — Resend como provider único de e-mail

- **Status:** Accepted
- **Data:** 2026-09-25
- **Fecha:** ADR-010, que permanecia não aceito por validação parcial

## Context

O POC-10 comprovou envio, resposta e anexos com o Resend, mas a prova do webhook público real
de inbound foi deferida. Com isso o ADR-010 nunca foi aceito, e o e-mail — por onde saem
Estimate, Invoice e notificação — ficou sem decisão firme.

A V1 precisa enviar. Não precisa receber: sem inbound não há conversa bidirecional, e o
módulo de Inbox saiu do escopo.

## Options Considered

| Opção | Avaliação |
|---|---|
| **Resend para tudo, outbound apenas** | Aproveita a evidência do POC-10; um domínio e uma reputação; inbound fica para V2 |
| Resend completo com inbound | Entrega o Inbox unificado; depende do gate de webhook pendente e traz alias, anexos e idempotência junto |
| Supabase Auth padrão + Resend no produto | Menos configuração; e-mail de auth sai de remetente que não é o domínio próprio, com limite baixo |
| Postmark | Inbound maduro e boa reputação; descarta a evidência do POC-10 e exige novo PoC |

## Decision

**Resend como provider único**, inclusive configurado como SMTP do Supabase Auth. Confirmação
de conta, recuperação de senha, Estimate, Invoice e notificação saem todos do mesmo domínio.

Contrato `EmailProvider`. **Outbound apenas na V1.**

Todo envio é assíncrono, pela fila `notifications`. Eventos de entrega chegam por webhook e
alimentam `MessageDeliveryEvent`.

## Evidence

POC-10: outbound, resposta e anexos comprovados. O gate de inbound permanece pendente e
**não bloqueia** esta decisão, porque inbound saiu do escopo da V1.

## Consequences

**Positivas:** um domínio, uma reputação, um lugar para depurar entregabilidade; e-mail de
autenticação com a identidade do produto desde o início.

**Trade-offs:** concentração em um provider para autenticação e produto — indisponibilidade
impede login por recuperação de senha e envio de documento ao mesmo tempo; inbound continuará
exigindo prova antes de entrar.

## Guardrails

- Envio **sempre** pela fila, nunca dentro do request.
- Evento de entrega é idempotente por `provider_event_id`.
- Domínio só envia após verificação; nenhum Workspace falsifica remetente não verificado.
- **Consentimento é verificado antes do envio**; opt-out bloqueia.
- Nenhum PII não aprovada em log de envio.
- Template tem um registro por idioma; não se monta texto traduzível por concatenação.

## Revisit Trigger

Reavaliar se ocorrer **qualquer** um destes:

1. taxa de entrega ou de bounce sair do aceitável em volume real, após domínio verificado e
   autenticação de e-mail configurada;
2. inbound entrar no escopo e o gate de webhook público continuar sem prova;
3. limite de envio do plano restringir operação normal de um cliente.
