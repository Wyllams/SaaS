# Base documental oficial do SaaS

Este diretório concentra os documentos de produto e arquitetura que devem ser consultados antes de qualquer nova decisão ou implementação.

## Regra de autoridade

1. Os documentos em `canonical/` preservam as decisões aprovadas durante a descoberta original.
2. `CURRENT-DECISIONS.md` registra decisões posteriores que **substituem pontos específicos** dos documentos históricos sem reescrevê-los.
3. `../architecture/TECHNICAL-ARCHITECTURE.md` consolida os resultados técnicos dos PoCs realizados depois do TRD.
4. Branches `poc/*` preservam a evidência experimental.
5. Um documento antigo não deve ser usado isoladamente quando houver uma decisão posterior explicitamente registrada.

## Os 6 documentos-base

| # | Documento | Estado | Arquivo |
|---|---|---|---|
| 1 | PRD | CONCLUÍDO | `canonical/01-PRD.md` |
| 2 | TRD | CONCLUÍDO / APROVADO | `canonical/02-TRD-OFICIAL.md` |
| 3 | Fluxo do App | CONCLUÍDO / OFICIAL | `canonical/03-APP-FLOW-OFICIAL.md` |
| 4 | UI/UX Design | CONCLUÍDO / APROVADO | `canonical/04-UI-UX-DESIGN.md` |
| 5 | Esquema Backend / Domain Model | CONCLUÍDO / OFICIAL | `canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md` |
| 6 | Implementation Plan v1.0 | **PENDENTE** | ainda não criado |

## Material de apoio

- `supporting/TECHNICAL-VALIDATION-POC-PLAN.md`: plano que definiu os 12 PoCs e o handoff para o Implementation Plan.
- `discovery/APP-FLOW-QUESTIONARIO-BLOCOS-6-A-10.md`: questionário de descoberta; não substitui o App Flow Oficial.
- `PROVENANCE.md`: origem e hashes dos arquivos fornecidos.
- `CURRENT-DECISIONS.md`: decisões posteriores que prevalecem sobre trechos históricos.

## Naming

Os documentos originais usam o nome **CrewCommand** porque esse era o nome de trabalho no momento da descoberta. A marca final do SaaS ainda não está definida. Novos namespaces, pacotes, domínios e documentos não devem assumir esse nome como definitivo sem decisão explícita.
