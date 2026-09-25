# Epic 0 — Foundation — Status de Continuidade

- **Data:** 2026-09-25
- **Branch:** `epic/00-foundation`
- **Implementation Plan:** `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN-v1.0.md`
- **Estado:** em execução
- **Feature implementation:** ainda não iniciada

## Autoridade documental obrigatória

Antes de qualquer decisão ou código deste Epic, consultar:

1. `docs/source-of-truth/README.md`
2. `docs/source-of-truth/CURRENT-DECISIONS.md`
3. `docs/source-of-truth/canonical/01-PRD.md`
4. `docs/source-of-truth/canonical/02-TRD-OFICIAL.md`
5. `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md`
6. `docs/source-of-truth/canonical/04-UI-UX-DESIGN.md`
7. `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md`
8. `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN-v1.0.md`
9. `docs/architecture/TECHNICAL-ARCHITECTURE.md`
10. `docs/adr/README.md` + ADRs aplicáveis

## Decisões vigentes importantes

- marca final do produto ainda não definida; novos nomes devem ser neutros;
- SMS/Twilio fora do escopo atual;
- webhook público real do Resend está deferido e não bloqueia o Epic 0;
- código de PoC é evidência, não código de produção;
- nenhuma feature de negócio começa antes do gate de saída do Epic 0.

## Sequência do Epic 0

- [x] Implementation Plan v1.0 aprovado e mergeado na `main`.
- [x] Branch `epic/00-foundation` criada a partir da `main` aprovada.
- [x] G0.1 — reconciliar e fechar autoridade do framework Web — **Next.js 16 App Router / ADR-013 Accepted**.
- [x] G0.2 — criar/fechar ADR do framework da API — **NestJS 12 + FastifyAdapter / ADR-014 Accepted**.
- [ ] G0.3 — documentar topologia definitiva de deploy antes de Staging.
- [ ] Criar estrutura definitiva `apps/web`, `apps/api`, `apps/worker`, `apps/mobile`.
- [ ] Criar packages compartilhados aprovados.
- [ ] Fixar runtime/package manager/versões validadas.
- [ ] Configurar CI baseline.
- [ ] Configurar contrato de ambientes Development/Staging/Production.
- [ ] Configurar política de secrets.
- [ ] Instalar baseline de observabilidade.
- [ ] Criar health/readiness contracts de API/Worker.
- [ ] Documentar bootstrap local e Staging.
- [ ] Executar gates finais do Epic 0.

## Evidência já disponível

- POCs 01–12 preservados nas branches `poc/*`;
- ADRs aceitos 001–008, 011 e 012 na `main`;
- validação Web de Next.js disponível em `validation/web-nextjs`;
- arquitetura pós-PoCs em `docs/architecture/TECHNICAL-ARCHITECTURE.md`.

## Última ação executada

G0.2 fechado: ADR-014 aceita após duas execuções verdes em `validation/api-nest-fastify`, incluindo instalação com `--frozen-lockfile`, build e smoke HTTP real.

## Próxima ação

Resolver G0.3: reconciliar e documentar a topologia definitiva de deploy/ambientes antes de criar Staging.
