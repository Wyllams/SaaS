# Codex Task Packet — EPIC-01-SLICE-02

- **Emitido em:** 2026-09-26
- **Status:** aguardando aprovação do Product Owner
- **Aprovado por:** _(preencher antes de iniciar)_
- **Pré-requisito:** `EPIC-00-SLICE-01` concluído e verificado

## Task ID

`EPIC-01-SLICE-02`

## Epic

**Epic 1 — Identidade, Workspace, Membership e Permissões**, item 1 (autenticação por e-mail e
senha via Supabase Auth), na parte de **recuperação de senha**.

## Objetivo

Fechar o ciclo de recuperação de senha do App Flow §3.3: *"Recuperação envia link, permite
definir nova senha e volta ao login"* — `SCR-AUTH-006` — e ligar a entrada desse fluxo ao
`SCR-AUTH-001`.

## Exceção ao gate do Epic 0 — precisa de aprovação explícita

O Implementation Plan diz: *"Nenhum Epic posterior autoriza pular gate bloqueante de Epic
anterior."* O gate de saída do Epic 0 ainda tem itens abertos — worker de fila por Vercel Cron,
`packages/domain` e `packages/i18n`, observabilidade, health e readiness.

**Esta fatia pede uma exceção limitada:** começar o Epic 1 depois dos itens 1 e 2 do Epic 0
apenas, que são os que tocam identidade. Os itens 3 a 12 não têm relação com recuperação de
senha — fila, pacotes, observabilidade e health não participam deste fluxo.

Justificativa técnica: `resetPasswordForEmail` e `updateUser` são operações do Supabase Auth que
**não tocam** `users` nem `user_supabase_identities`. A reconciliação de identidade não participa
da recuperação. O acoplamento com o Epic 0 existe só no `SCR-AUTH-001`, e os itens 1 e 2 o
resolvem.

Se o Product Owner não aprovar a exceção, esta fatia espera o gate completo do Epic 0.

## Fontes obrigatórias

1. `AGENTS.md`
2. `docs/source-of-truth/CURRENT-DECISIONS.md`
3. `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md` — Epic 1
4. `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md` — **§3.3**
5. `docs/source-of-truth/canonical/04-UI-UX-DESIGN.md` — §2 tokens, §5.1 regras de layout, §7.5 estados globais
6. `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md` — §A
7. `docs/source-of-truth/canonical/02-TRD-OFICIAL.md` — §3.1
8. **ADR-017** — Route Handlers e Server Actions
9. **ADR-021** — Resend como provider único, inclusive SMTP do Supabase Auth
10. `docs/implementation/EPIC-00-SLICE-01-TASK-PACKET.md` — o padrão de Route Handler estabelecido
11. `docs/implementation/EPIC-01-STATUS.md`

**Código a ler antes de escrever:**

- `apps/web/src/app/login/page.tsx` — `SCR-AUTH-001` como está
- `apps/web/src/lib/supabase/browser.ts`
- o Route Handler de identidade criado no `EPIC-00-SLICE-01`

## Escopo autorizado

1. **`SCR-AUTH-006` — solicitar recuperação.** Formulário de e-mail que dispara
   `resetPasswordForEmail` com `redirectTo` apontando para a rota de confirmação.
2. **Rota de confirmação do link.** Verifica o token do e-mail **no servidor**, estabelece a
   sessão de recuperação e leva à definição de nova senha. Preferir Route Handler com
   `@supabase/ssr` a manipular token no cliente.
3. **Definir nova senha.** Formulário que chama `updateUser({ password })`. Não é tela com Screen
   ID próprio — o App Flow §3.3 trata como estado do fluxo de `SCR-AUTH-006`.
4. **Volta ao login** após sucesso, com confirmação visível.
5. **Link "Forgot your password?" no `SCR-AUTH-001`**, que hoje não existe.
6. Testes conforme a seção própria.
7. Adicionar `site_url` e a lista de redirect URLs em `supabase/config.toml`, versionados.

## Fora de escopo

- `SCR-SET-001` e troca de senha com usuário logado — decisão do Product Owner em 2026-09-26: **fora desta fatia**.
- `SCR-AUTH-005` escolha de Workspace.
- Cadastro, trial, verificação de e-mail, escolha de plano — `SCR-AUTH-002`, `003`, `004`.
- Google OAuth.
- Workspace, Location, Membership, Role, Permission, RLS de tenant.
- Onboarding.
- Qualquer mudança de schema.
- Configurar a conta Resend, domínio ou SMTP em ambiente remoto — ver a seção seguinte.
- Remover ou alterar a Edge Function `identity-me`.

## Dependência de e-mail — leia antes de estimar

O **ADR-021** decide: *"Resend como provider único, inclusive configurado como SMTP do Supabase
Auth. Confirmação de conta, recuperação de senha... saem todos do mesmo domínio."*

Estado verificado em 2026-09-26:

- `supabase/config.toml` **não tem** seção de SMTP, mailer ou `site_url`;
- não existe secret do Resend em nenhum ambiente;
- o Resend exige **domínio verificado** para enviar a terceiros, e o Product Owner decidiu comprar
  domínio por último, na entrada em produção.

**Consequência, que não bloqueia esta fatia mas limita o que ela prova:** sem domínio, o envio
real sai pelo serviço de e-mail embutido do Supabase, que tem limite baixo e é documentado pelo
próprio Supabase como adequado apenas a desenvolvimento.

Portanto:

- a fatia **implementa e testa** o fluxo completo;
- a prova de ponta a ponta usa a caixa do próprio Product Owner ou o limite do Supabase;
- a **troca para Resend SMTP fica registrada como pendência de produção**, ligada à compra do
  domínio, e deve constar no `EPIC-01-STATUS.md`;
- o Codex **não** configura Resend, domínio ou SMTP remoto nesta tarefa.

## Requisitos funcionais

### Solicitar recuperação — `SCR-AUTH-006`

| Estado | Comportamento |
|---|---|
| Inicial | Campo de e-mail e botão de envio |
| Enviando | Botão desabilitado, indicação de progresso |
| Enviado | **Mensagem idêntica exista ou não a conta** — ver Segurança |
| Ambiente sem configuração | Mesmo tratamento do `SCR-AUTH-001`: explicação e controles desabilitados |
| Falha de transporte | Erro genérico, sem detalhe de provider |

### Definir nova senha

| Estado | Comportamento |
|---|---|
| Link válido | Formulário de nova senha e confirmação |
| Link expirado, já usado ou inválido | Mensagem clara e caminho para solicitar novo link |
| Salvando | Controles desabilitados |
| Sucesso | Confirmação e retorno ao login |
| Falha na política de senha | Mensagem que diz o que falta, sem revelar a senha |

## Requisitos de backend e domínio

- **Nenhuma entidade nova.** O fluxo não toca `users` nem `user_supabase_identities`.
- **Verificação do token no servidor.** A rota de confirmação valida o token pelo Supabase Auth
  antes de estabelecer qualquer sessão. O token não deve ser processado por código de cliente nem
  permanecer na URL após o consumo.
- **Camada fina.** Route Handler valida entrada, chama o caso de uso, mapeia para HTTP. O TRD §3.1
  vale igual aqui.
- **Sem log de token, e-mail completo ou senha**, em nenhuma circunstância, inclusive em erro.
- **Runtime Node.js.** Não usar `runtime = "edge"`.

## Requisitos UI/UX

- **Screen ID:** `SCR-AUTH-006`. A definição de nova senha é estado do mesmo fluxo, sem ID próprio.
- **Tokens:** reusar os semânticos já aplicados no `SCR-AUTH-001` — `bg-app-page`,
  `bg-app-surface`, `text-app-foreground`, `text-app-muted`, `border-app-border`, `bg-app-primary`,
  `--radius-surface`. **Nenhuma cor literal.**
- **Estados obrigatórios:** loading, erro, sucesso, link inválido e ambiente não configurado.
- **Breakpoints:** sem overflow horizontal em 320, 375, 768, 1024 e 1440 px — mesmo critério já
  aplicado ao `SCR-AUTH-001`.
- **Acessibilidade:** erro em `role="alert"` associado ao campo por `aria-describedby`; rótulo em
  todo campo; `autoComplete="email"` e `autoComplete="new-password"`; foco visível; contraste
  conforme os tokens.
- **Higiene a corrigir de passagem:** o `SCR-AUTH-001` renderiza o texto `SCR-AUTH-001` na
  interface. É resíduo de desenvolvimento. Remover da UI visível nas telas desta fatia; se houver
  necessidade de rastreabilidade em tela, usar atributo `data-*`, não texto para o usuário.

## Banco / migration

- [x] **nenhuma mudança de schema**
- [ ] migration local/Git autorizada
- [ ] execução remota **não autorizada**

## Segurança

Obrigatório:

- **Não vazar existência de conta.** A resposta a "enviar link" é idêntica para e-mail cadastrado
  e não cadastrado: mesma mensagem, mesmo status, e sem diferença de tempo observável que permita
  distinguir os dois casos.
- **Token de uso único.** Reutilizar o link deve falhar com a mensagem de link inválido.
- **Token não persiste.** Depois do consumo, o token não pode ficar na URL, no histórico do
  navegador ou em `localStorage`.
- **Não enfraquecer o rate limit** do Supabase Auth com retry automático ou reenvio em laço.
- **Sessão de recuperação é mínima.** A sessão estabelecida pelo link serve para trocar a senha e
  nada além disso nesta fatia.
- `Cache-Control: no-store` nas respostas das rotas do fluxo.
- Variável server-only nunca com prefixo `NEXT_PUBLIC_`.

## Critérios de aceite

1. Em `SCR-AUTH-001` existe caminho visível para recuperação, que leva a `SCR-AUTH-006`.
2. Solicitar recuperação com e-mail cadastrado envia o link e mostra a mensagem de confirmação.
3. Solicitar com e-mail **não** cadastrado mostra **exatamente a mesma** mensagem, mesmo status e
   sem diferença de tempo detectável — comprovado por teste.
4. O link do e-mail abre a definição de nova senha, a nova senha é aceita, e o login com ela
   funciona. Evidência registrada no QA.
5. Reutilizar o mesmo link falha com a mensagem de link inválido e oferece solicitar outro.
6. Link expirado ou adulterado cai no mesmo tratamento do item 5.
7. Todos os estados de UI renderizam nos cinco breakpoints sem overflow horizontal.
8. Console do navegador sem warnings ou errors nos fluxos felizes e de erro.
9. Nenhum token, senha ou e-mail completo aparece em log de servidor ou de cliente.
10. `pnpm run ci` passa inteiro, com os testes novos na contagem.

## Testes obrigatórios

- **unit:** validação do formulário de e-mail; validação da nova senha contra a política vigente; mapeamento de cada estado de erro para a mensagem correta.
- **unit — anti-enumeração:** e-mail existente e inexistente produzem resposta idêntica em status e corpo.
- **integration:** rota de confirmação com token válido, expirado, já consumido e adulterado.
- **Web E2E:** ciclo completo — solicitar, abrir o link, definir nova senha, voltar ao login e entrar com ela.
- **authorization negatives:** a sessão de recuperação não dá acesso a nenhuma rota autenticada além da troca de senha.
- **acessibilidade:** erro anunciado por `role="alert"`; navegação por teclado completa em ambos os formulários.

## Arquivos e boundaries esperados

Indicação, não obrigação.

```
apps/web/src/app/forgot-password/page.tsx      SCR-AUTH-006, solicitar
apps/web/src/app/reset-password/page.tsx       definir nova senha
apps/web/src/app/auth/confirm/route.ts         verificação server-side do token
apps/web/src/app/login/page.tsx                link de recuperação, remoção do ID visível
supabase/config.toml                           site_url e redirect URLs
```

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
- [ ] configurar provider, domínio ou SMTP em ambiente remoto

**Branch:** `epic/01-slice-02-password-recovery`, criada a partir da `main` já com o
`EPIC-00-SLICE-01` mergeado.

## Condições de bloqueio

Parar e registrar `BLOCKED — DOCUMENTATION DECISION REQUIRED` se:

- **a política de senha não estiver definida.** Nenhum documento canônico especifica comprimento
  mínimo, exigência de caractere ou verificação contra senha vazada. O padrão do Supabase Auth é
  seis caracteres, e adotá-lo **é uma decisão de produto, não técnica**. O Codex não escolhe:
  usar o padrão do provider e **registrar como decisão pendente**, ou parar se o Product Owner
  preferir decidir antes;
- a exceção ao gate do Epic 0 não tiver sido aprovada;
- o `EPIC-00-SLICE-01` não estiver concluído e verificado;
- o fluxo exigir mudança de schema, de ADR aceito ou de contrato público;
- o teste só passar enfraquecendo verificação de token, rate limit ou a regra anti-enumeração;
- for necessário configurar provider, domínio ou SMTP remoto para o fluxo funcionar em
  desenvolvimento.

## Documentação a atualizar

- `docs/implementation/EPIC-01-STATUS.md` — fatia, evidências, a pendência de produção do Resend
  SMTP, e a decisão de política de senha, quando houver
- `docs/implementation/EPIC-01-QA.md` — evidências de navegador, breakpoints, console e o ciclo
  completo do critério 4
- ADR: **não autorizado** nesta tarefa

## Relatório de conclusão obrigatório

- **Implemented:**
- **Not implemented:**
- **Files changed:**
- **Tests run + results:**
- **Docs consulted:**
- **Docs updated:**
- **Known issues / blockers:**
- **Next authorized step:**
