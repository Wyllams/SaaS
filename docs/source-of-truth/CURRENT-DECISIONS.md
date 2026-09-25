# Decisões vigentes que sobrepõem trechos históricos

Este arquivo não altera os documentos originais. Ele registra decisões posteriores que devem ser aplicadas ao consultá-los.

## Nome do produto

**CrewCommand é nome histórico/provisório.** A marca final ainda não foi definida. Não propagar o nome automaticamente para novos packages, namespaces, domínios ou documentação.

## SMS / Twilio

**SMS/Twilio está fora do escopo atual por decisão do proprietário em 2026-09-25.**

Consequências:

- não implementar envio ou recebimento SMS;
- não introduzir Twilio no runtime atual;
- não tratar A2P/10DLC, sender pool, delivery callbacks ou webhooks Twilio como requisito atual;
- referências a SMS/Twilio dentro de PRD, App Flow, Domain Model, UI/UX, TRD ou Technical Validation Plan são **históricas e superseded**;
- a branch `poc/09-twilio-messaging` permanece somente como evidência histórica.

SMS só retorna com nova decisão explícita e nova validação.

## Resend webhook

A validação de webhook HTTPS público real do Resend foi **deferida e não bloqueia** a continuação do planejamento documental. As demais evidências do POC-10 permanecem válidas dentro dos limites registrados.

## PoCs

O ciclo técnico 01–12 foi executado no repositório `Wyllams/SaaS`, com POC-09 cancelado pelo escopo atual. Resultados e ADRs nas branches de PoC devem ser usados para atualizar decisões técnicas originalmente marcadas como pendentes no TRD.

A visão consolidada pós-PoCs está em:

`docs/architecture/TECHNICAL-ARCHITECTURE.md`

## Implementation Plan

O arquivo antigo `PLAN-20260917-005 - Plano mestre de implementação do CrewCommand.md` pertence a uma linha de implementação anterior e **não substitui** o `Implementation Plan v1.0` previsto pelo TRD e pelo Technical Validation & PoC Plan.

O Implementation Plan v1.0 foi criado a partir das fontes oficiais e dos resultados dos PoCs, aprovado pelo proprietário em 2026-09-25 e mergeado na `main` pela PR #13.

A implementação foi autorizada a iniciar pelo **Epic 0 — Foundation**. Nenhum Epic posterior é autorizado a pular os gates definidos no próprio Implementation Plan.
