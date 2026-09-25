# Codex Task Packet — Template obrigatório

> Não iniciar implementação sem preencher este documento/prompt.

## Task ID

`EPIC-XX-SLICE-YY`

## Epic

Nome e número do Epic.

## Objetivo

Uma frase objetiva descrevendo o resultado esperado.

## Fontes obrigatórias

Liste arquivos/sections que o Codex deve ler antes de editar código.

Exemplo:

- `AGENTS.md`
- `docs/source-of-truth/CURRENT-DECISIONS.md`
- `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN-v1.0.md`
- App Flow — Screen IDs relevantes
- UI/UX — seção relevante
- Backend Domain Model — entidades relevantes
- ADRs aplicáveis
- `docs/implementation/EPIC-XX-STATUS.md`

## Escopo autorizado

Liste somente o que deve ser implementado.

## Fora de escopo

Liste explicitamente o que não pode ser implementado nesta tarefa.

## Requisitos funcionais

Transcreva/resuma apenas requisitos sustentados pelas fontes.

## Requisitos de backend/domínio

Entidades, invariantes, permissions, tenancy, transações e eventos aplicáveis.

## Requisitos UI/UX

- Screen IDs:
- layouts/padrões:
- estados:
- breakpoints:
- accessibility:

## Banco / migration

- [ ] nenhuma mudança de schema
- [ ] migration local/Git autorizada
- [ ] execução remota **não autorizada**, salvo instrução explícita

Descrever exatamente o schema autorizado.

## Segurança

Liste negative tests e boundaries obrigatórias.

## Critérios de aceite

1.
2.
3.

Critérios devem ser verificáveis.

## Testes obrigatórios

- unit:
- integration:
- DB:
- Web E2E:
- Mobile:
- authorization negatives:
- outros:

Use apenas os aplicáveis.

## Arquivos/boundaries esperados

Indique áreas prováveis. Não obrigue estrutura que contradiga o repositório.

## Ações Git autorizadas

Marcar explicitamente:

- [ ] editar arquivos
- [ ] executar testes
- [ ] gerar migration
- [ ] commit na branch
- [ ] push
- [ ] criar PR
- [ ] merge
- [ ] deploy
- [ ] migration remota

Tudo que não estiver marcado é proibido.

## Condições de bloqueio

O Codex deve parar se:

- documento necessário estiver ausente;
- houver conflito entre fontes;
- decisão de produto/arquitetura não estiver aprovada;
- for necessário sair do escopo;
- teste exigir enfraquecer segurança/integridade;
- for necessária ação externa não autorizada.

## Documentação a atualizar

- `EPIC-XX-STATUS.md`
- `EPIC-XX-QA.md`
- ADR, somente se previamente autorizado

## Relatório de conclusão obrigatório

- Implemented:
- Not implemented:
- Files changed:
- Tests:
- Documents consulted:
- Documents updated:
- Blockers:
- Next authorized step:
