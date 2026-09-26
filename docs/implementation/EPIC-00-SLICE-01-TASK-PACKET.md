# Codex Task Packet — EPIC-00-SLICE-01

- **Emitido em:** 2026-09-26
- **Status:** aguardando aprovação do Product Owner
- **Aprovado por:** _(preencher antes de iniciar)_

## Task ID

`EPIC-00-SLICE-01`

## Epic

**Epic 0 — Fundação e migração**, item 1 do Implementation Plan v2.0.

## Objetivo

Servir o contrato de identidade do Slice 01 por um **Route Handler** em `apps/web`, com paridade
comprovada por teste contra o contrato hoje servido pela Edge Function `identity-me`.

## Fontes obrigatórias

Ler antes de editar qualquer arquivo:

1. `AGENTS.md`
2. `docs/source-of-truth/README.md`
3. `docs/source-of-truth/CURRENT-DECISIONS.md`
4. `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md` — Epic 0
5. `docs/architecture/TECHNICAL-ARCHITECTURE.md`
6. `docs/adr/README.md`
7. **ADR-017** — camada de aplicação em Next.js (por que Route Handler, e o que ele pode e não pode fazer)
8. **ADR-016** — runtime de backend no Supabase
9. **ADR-001** — Drizzle como camada de query e migration
10. **ADR-002 com a emenda de 2026-09-26** — o ramo operativo é "Short-lived / serverless"
11. `docs/source-of-truth/canonical/02-TRD-OFICIAL.md` — §3.1 (o que cada camada pode fazer)
12. `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md` — §A, entidade `User` e identidade externa
13. `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md` — §3.3, `SCR-AUTH-001`
14. `docs/implementation/EPIC-00-STATUS.md`
15. `docs/implementation/EPIC-01-STATUS.md` — §3 e §13, por que a prova autenticada é critério de aceite daqui
16. `docs/implementation/EPIC-01-SLICE-01-TASK-PACKET.md` — o contrato original

**Código a ler antes de escrever:**

- `supabase/functions/identity-me/index.ts` — contrato vigente, a ser replicado
- `packages/db/src/identity-repository.ts` — a lógica de reconciliação **já existe e deve ser reusada**
- `packages/db/src/database.ts` e `packages/db/src/schema.ts`
- `apps/web/src/lib/supabase/browser.ts` e `apps/web/src/app/login/page.tsx`
- `scripts/verify-structure.mjs` e `.github/workflows/ci.yml`

## Escopo autorizado

1. **Criar o Route Handler** que serve o contrato de identidade em `apps/web`.
2. **Reusar `createIdentityRepository` de `@saas/db`.** A lógica de reconciliação, incluindo o
   tratamento de corrida, já existe e está correta. **Não reimplementar em SQL cru.** A Edge
   Function só duplicou em `postgres.js` porque Deno não importa workspace package.
3. Adicionar as dependências que faltam em `apps/web`: `@saas/db` e a dependência de UUIDv7.
4. **Recriar a cobertura de teste do contrato** — ver "Situação dos testes" abaixo.
5. Ajustar a criação de conexão para o perfil serverless, conforme o ADR-002 emendado.
6. Apontar `SCR-AUTH-001` para o Route Handler no lugar da invocação da Edge Function.
7. Adicionar script `test` em `apps/web` e/ou `packages/db` se necessário para os testes rodarem na CI.

## Fora de escopo

Nada abaixo pode ser feito nesta tarefa:

- **Remover ou desativar a Edge Function `identity-me`** — é o item 2 do Epic 0, e depende desta paridade estar provada. A Edge Function fica no ar e versionada.
- Alterar `scripts/verify-structure.mjs` ou `.github/workflows/ci.yml` na parte que exige `supabase/functions/identity-me/index.ts` — pelo mesmo motivo.
- Worker de fila por Vercel Cron (item 3).
- Remover `pg_net` (item 4).
- Criar `packages/domain` ou `packages/i18n` (item 5).
- Remover `packages/api-client` ou `packages/domain-types` (item 6).
- Observabilidade, `request_id`, Sentry, OpenTelemetry (item 10).
- Rota de health e readiness (item 11).
- Qualquer mudança de schema.
- Qualquer coisa de Workspace, Membership, Role, Permission ou RLS de tenant — é Epic 1.
- Google OAuth, recuperação de senha, billing.

## Situação dos testes — leia antes de estimar

O `EPIC-01-STATUS.md` registra "12/12 PASS" para os testes do Slice 01. **Esses testes não existem
mais.** Viviam em `apps/api`, removido pelo ADR-016. Verificado em 2026-09-26:

```
packages/config          node --test tests/*.test.mjs     3 testes
packages/observability   node --test tests/*.test.mjs     1 teste
todo o resto             sem script de test
```

O repositório inteiro roda **4 testes**. `packages/db` tem **zero**, apesar de conter a
reconciliação de identidade com um caminho de corrida.

Portanto "paridade comprovada por teste" **não é comparar contra uma suíte existente** — é
reconstruir a cobertura. Isso é escopo desta tarefa, não trabalho extra.

## Requisitos funcionais — o contrato a preservar

Transcrito de `supabase/functions/identity-me/index.ts`. O Route Handler deve reproduzir
exatamente este comportamento observável.

| Condição | Status | Corpo |
|---|---|---|
| Método diferente de GET | `405` | `{"code":"METHOD_NOT_ALLOWED","message":"Method not allowed."}` |
| Sem header `Authorization` | `401` | `{"code":"UNAUTHENTICATED","message":"Authentication required."}` |
| `Authorization` que não casa `^Bearer ([^\s]+)$`, sem distinguir maiúsculas | `401` | idem |
| Serviço sem configuração (env ausente) | `503` | `{"code":"IDENTITY_SERVICE_UNAVAILABLE","message":"Identity service is not configured."}` |
| Token inválido, ou usuário sem e-mail | `401` | `{"code":"UNAUTHENTICATED","message":"Authentication required."}` |
| Falha na reconciliação | `503` | `{"code":"IDENTITY_SERVICE_UNAVAILABLE","message":"Identity service is temporarily unavailable."}` |
| Sucesso | `200` | `{"user":{"id":"<uuid>","email":"<email>"}}` |

Todas as respostas levam `Content-Type: application/json` e **`Cache-Control: no-store`**.

### Diferenças autorizadas — e só estas

1. **CORS sai.** A Edge Function responde `Access-Control-Allow-Origin: *` porque era
   cross-origin. O Route Handler é **same-origin** com o `SCR-AUTH-001`. Manter o wildcard seria
   degradar a segurança sem necessidade. Remover os headers de CORS e o ramo `OPTIONS` é
   **autorizado e esperado**. Registrar a diferença no STATUS.
2. **O corpo do sucesso não muda**, mesmo que o `User` do Domain Model tenha `name`, `photo` e
   `status`. O contrato do Slice 01 devolve o mínimo. Ampliar é fora de escopo.

## Requisitos de backend e domínio

- **Entidades:** `users` e `user_supabase_identities`, já existentes. Nenhuma outra.
- **Invariante:** o `User` interno é distinto do UUID do Supabase Auth. Relações de negócio usam
  `user.id`, nunca o `subject` do provedor.
- **Transação:** a reconciliação roda em uma transação. Conflito de concorrência é resolvido pela
  chave única de `subject`, não por leitura otimista.
- **Geração de ID:** UUIDv7 na aplicação, por dependência revisada. Sem extensão no PostgreSQL —
  decisão do Product Owner em 2026-09-25, o PG 17.6 não tem `uuidv7()` nativo.
- **Verificação de token:** server-side, por `auth.getUser(token)`. A rota entrega ao caso de uso
  somente `subject` e `email` extraídos do token verificado. **Nada vindo do corpo da requisição
  ou de header não verificado pode alimentar a reconciliação.**
- **Runtime da rota:** Node.js. Não usar `runtime = "edge"` — o ADR-017 põe a execução em funções
  Vercel padrão, e o driver `pg` de `@saas/db` exige Node.
- **Conexão:** pooler em modo **transaction** para runtime, conforme ADR-002 emendado. Revisar o
  `max` do `Pool` em `packages/db/src/database.ts`: o valor atual foi escolhido para um processo
  persistente, e em serverless cada instância abre o seu. Se a mudança sair do escopo desta
  tarefa, **registrar como achado no STATUS** em vez de alterar por conta própria.
- **Autenticação não é autorização.** Esta rota não decide nada de Workspace, papel ou escopo.

## Requisitos UI/UX

- **Screen ID:** `SCR-AUTH-001`, já implementado em `apps/web/src/app/login/page.tsx`.
- **Layout, estados e breakpoints:** sem alteração. A tela já tem loading, erro genérico e estado
  de configuração indisponível, todos validados em QA de navegador de 320 a 1440 px.
- **Única mudança de UI permitida:** o alvo da chamada, que passa da invocação da Edge Function
  pelo cliente Supabase para o Route Handler.
- **Mensagem de erro:** continua genérica. Não revelar se o e-mail existe.
- **Acessibilidade:** manter o que existe; nenhum controle novo.

## Banco / migration

- [x] **nenhuma mudança de schema**
- [ ] migration local/Git autorizada
- [ ] execução remota **não autorizada**

O schema de identidade já está aplicado em remoto desde 2026-09-25, com RLS default-deny e zero
policies. **Nenhuma migration nesta tarefa.** Se o Codex concluir que precisa de uma, é sinal de
que saiu do escopo: parar e reportar.

## Segurança

Boundaries obrigatórias:

- token ausente, malformado ou inválido é rejeitado **antes** de qualquer acesso ao banco;
- o `subject` usado na reconciliação vem **somente** do token verificado;
- nenhum log de token, `Authorization`, senha ou e-mail completo;
- erro de infraestrutura não vaza mensagem de driver, SQL ou stack para o cliente — o corpo é o
  `503` padronizado da tabela;
- `Cache-Control: no-store` em toda resposta, inclusive nos erros;
- variáveis server-only nunca com prefixo `NEXT_PUBLIC_`.

Negative tests obrigatórios estão listados abaixo.

## Critérios de aceite

1. Uma requisição `GET` ao Route Handler com Bearer válido devolve `200` e
   `{"user":{"id","email"}}`, e o par `subject → user` está persistido.
2. Cada linha da tabela de contrato é reproduzida pelo Route Handler, com status **e** corpo
   idênticos, comprovado por teste automatizado.
3. O Route Handler usa `createIdentityRepository` de `@saas/db`. Nenhuma reimplementação da
   reconciliação em SQL cru na camada web.
4. `SCR-AUTH-001` autentica e recebe a identidade pelo Route Handler, sem invocar a Edge Function.
5. **A prova autenticada pendente do Slice 01 é executada uma única vez, contra o Route Handler**,
   com evidência de request, resposta e mapeamento persistido registrada no QA. Nenhuma senha,
   token ou secret é solicitado, exibido ou registrado.
6. A Edge Function continua versionada e ativa. `verify:structure` e a CI seguem exigindo-a.
7. `pnpm run ci` passa inteiro, e os testes novos aparecem na contagem.
8. Repositório limpo após build.

## Testes obrigatórios

- **unit — contrato HTTP:** um caso por linha da tabela. Sete no mínimo: método inválido, sem
  header, header malformado, serviço não configurado, token inválido, usuário sem e-mail, sucesso.
- **unit — parsing do Bearer:** `bearer` minúsculo aceito; `Bearer` vazio rejeitado; token com
  espaço rejeitado.
- **unit — repositório de identidade:** primeira reconciliação cria usuário e mapeamento;
  reconciliação repetida do mesmo `subject` devolve o mesmo `user.id` e **não** cria segundo
  usuário; conflito de corrida converge para um único usuário sem deixar órfão.
- **integration:** rota ponta a ponta contra banco, com token verificado mockado na fronteira do
  verificador, nunca mockando o banco.
- **authorization negatives:** campo não confiável enviado no corpo ou em header é ignorado —
  provar que um `user_id` ou `email` injetado pelo cliente não influencia o resultado.
- **DB:** integridade — FK restritiva impede apagar `user` com mapping; `status` fora de
  `active`/`suspended` é rejeitado pelo check.
- **Web E2E:** não obrigatório nesta fatia. A prova do critério 5 cobre o caminho real.
- **Mobile:** — (workspace removido em 2026-09-26)

Não marcar PASS com teste pulado sem justificativa explícita.

## Arquivos e boundaries esperados

Indicação, não obrigação. Se o repositório sugerir outro lugar, seguir o repositório e registrar.

```
apps/web/src/app/api/identity/me/route.ts    Route Handler
apps/web/src/lib/identity/                   verificador de token e composição
apps/web/package.json                        + @saas/db, + uuidv7, + script test
apps/web/src/app/login/page.tsx              alvo da chamada
packages/db/                                 testes do repositório
```

Regras de camada, do TRD §3.1: a rota fica **fina** — valida entrada, chama o caso de uso, mapeia
o resultado para HTTP. Regra de domínio não mora na rota.

## Ações Git autorizadas

- [x] editar arquivos
- [x] executar testes, lint, typecheck e build locais
- [ ] gerar migration
- [x] commit na branch designada
- [x] push da branch
- [ ] criar PR
- [ ] merge
- [ ] deploy
- [ ] migration remota

**Branch:** `epic/00-slice-01-identity-route-handler`, criada a partir da `main`.

Tudo que não está marcado é proibido. Em particular: não mergear, não deployar, não tocar em
ambiente remoto.

## Condições de bloqueio

Parar e registrar `BLOCKED — DOCUMENTATION DECISION REQUIRED` se:

- o contrato da Edge Function divergir desta tabela ao ser lido no código;
- a paridade exigir mudar o corpo ou o status de qualquer resposta;
- for necessário mudar schema, ADR aceito ou contrato público;
- o `max` do `Pool` precisar mudar de um jeito que afete outra parte do sistema;
- o teste só passar enfraquecendo FK, RLS ou verificação de token;
- for necessária ação externa não autorizada — deploy, migration remota, criação de conta Auth;
- a prova do critério 5 exigir credencial que o Product Owner não tenha submetido.

## Documentação a atualizar

- `docs/implementation/EPIC-00-STATUS.md` — item 1 do checklist, diferenças autorizadas, achado
  sobre o `Pool` se houver
- `docs/implementation/EPIC-00-QA.md` — evidências dos testes e da prova autenticada
- `docs/implementation/EPIC-01-STATUS.md` — fechar o blocker
  `BLOCKED — SUCCESSFUL AUTHENTICATION EVIDENCE REQUIRED` e corrigir a contagem de testes, hoje
  desatualizada
- ADR: **não autorizado** nesta tarefa

## Relatório de conclusão obrigatório

Terminar a entrega com:

- **Implemented:**
- **Not implemented:**
- **Files changed:**
- **Tests run + results:**
- **Docs consulted:**
- **Docs updated:**
- **Known issues / blockers:**
- **Next authorized step:**

O próximo passo autorizado, se tudo passar, é o **item 2 do Epic 0** — desativar a Edge Function
e atualizar os dois verificadores de CI no mesmo commit. Item 2 exige Task Packet próprio.
