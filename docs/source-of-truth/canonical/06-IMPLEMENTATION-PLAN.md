# IMPLEMENTATION PLAN

**v2.0**

| Campo | Definição |
|---|---|
| Versão | 2.0 |
| Status | Substitui o Implementation Plan v1.0 |
| Data | 2026-09-25 |
| Base | PRD v2.0 + App Flow v2.0 + Domain Model v2.0 + TRD v2.0 |
| Escopo V1 | Núcleo comercial e operacional + Materiais e Compras |
| Telas | 91 |
| Caminho | `canonical/06-IMPLEMENTATION-PLAN.md` — renomeado de `06-IMPLEMENTATION-PLAN-v1.0.md`, sem sufixo de versão, para não precisar mover o arquivo a cada revisão |

> **Por que uma v2.0.** O plano v1.0 assumia NestJS no Render, workers BullMQ com Valkey e mobile em Expo. A stack mudou para Supabase + Vercel, o escopo encolheu e sete papéis substituíram oito perfis. Os Epics foram refeitos.

A regra de implementação continua:

`requisito aprovado → arquitetura aceita → contrato → implementação testada → evidência → gate de release`

Código de PoC é evidência, não código de produção.

---

# 1. Precedência

1. `CURRENT-DECISIONS.md`
2. ADRs Accepted
3. TRD v2.0
4. PRD v2.0, App Flow v2.0, Domain Model v2.0, UI/UX
5. Evidência de PoC, para reprodução e depuração

Planos de implementação anteriores não controlam este.

---

# 2. Repositório alvo

```text
apps/
  web/          ← aplicação única: UI + Route Handlers + Server Actions + workers
packages/
  db/           ← schema Drizzle, migrations, repositórios
  domain/       ← Application Services e regras
  validation/   ← schemas compartilhados
  ui-web/       ← Design System
  design-tokens/
  observability/
  config/
  i18n/         ← catálogos en-US e es-US
```

`apps/api` e `apps/worker` já foram removidos pelo ADR-016. `apps/mobile` sai no Epic 0. Regras:

- um único app implantável;
- `packages/domain` **não importa** nada de `apps/web`;
- sem dependência circular entre pacotes;
- objeto de SDK de provider não vira modelo de domínio.

---

# 3. Sequência

```
Epic 0   Fundação e migração da arquitetura
   ↓
Epic 1   Identidade, Workspace, Membership, Permissões
   ↓
Epic 2   Fundação de dados: migrations, Outbox, pgmq, Storage, Audit
   ↓
Epic 3   Walking Skeleton — ponta a ponta, fino
   ↓
Epic 4   Assinatura e Entitlements
   ↓
Epic 5   CRM, Sales, Estimates e Imposto
   ↓
Epic 6   Jobs, Services, Schedule, Capacidade e Escadinha
   ↓
Epic 7   Campo (PWA), Daily Logs e Change Orders
   ↓
Epic 8   Materiais e Compras
   ↓
Epic 9   Financeiro e QuickBooks
   ↓
Epic 10  Client Portal
   ↓
Epic 11  i18n, Relatórios e Administração
   ↓
Epic 12  Hardening, performance e GA
```

Nenhum Epic posterior autoriza pular gate bloqueante de Epic anterior.

---

# Epic 0 — Fundação e migração

## Objetivo

Concluir a convergência para a arquitetura do TRD v2.0, sem carregar resíduo.

## Já concluído pelo ADR-016

Não repetir. `apps/api` e `apps/worker` removidos · dependências de BullMQ, Valkey e Render
removidas · `pgmq`, `pg_cron` e `pg_net` habilitados por migration · contrato de identidade
do Slice 01 migrado para a Edge Function `identity-me`.

## Trabalho

1. **Migrar a Edge Function `identity-me` para Route Handler** em `apps/web`, preservando o
   contrato do Slice 01, com paridade comprovada por teste.
2. Remover a Edge Function do Supabase somente após a paridade.
3. Implementar o worker de fila como **rota protegida acionada por Vercel Cron**, substituindo
   o dispatch por `pg_net`.
4. Avaliar a remoção de `pg_net`, que deixa de ser necessário para fila.
5. Criar `packages/domain` e `packages/i18n`.
6. Reavaliar `packages/api-client` e `packages/domain-types`: com a regra dentro do `apps/web`,
   parte deles pode perder propósito.
7. Decidir e registrar o destino de `apps/mobile` — fora da V1 pelo ADR-018.
8. Configurar Drizzle Kit com conexão direta para migration e pooler transaction para runtime.
9. Estabelecer o contrato de configuração por ambiente e a política de secret.
10. Ativar observabilidade: `request_id`, logs estruturados, Sentry e OpenTelemetry.
11. Rota de health e readiness.
12. Manter todo identificador brand-neutral.

## CI

Integridade de dependências · lint · type-check · testes · **cobertura por módulo** · validação de migration · build · verificação de secret.

## Gate de saída

- um único app implantável, construído a partir de lockfile commitado;
- nenhum vestígio de NestJS, BullMQ ou Valkey;
- `identity-me` servido por Route Handler, com a Edge Function desativada;
- worker de fila acionado por Vercel Cron, verificado sob falha e reinício;
- CI verde com os gates acima;
- ADRs 017 a 023 aceitos;
- nenhum secret ou ID de PoC vazado para configuração de produto.

---

# Epic 1 — Identidade, Workspace, Membership e Permissões

## Superfícies

`SCR-AUTH-001`, `005`, `006` · `SCR-ONB-001`, `002` · `SCR-SET-001`, `002`, `003`, `004`

## Trabalho

1. Autenticação por e-mail e senha via Supabase Auth.
2. Separar identidade externa (`UserAuthIdentity`) do `User` de negócio.
3. Workspace, Location, Membership e `UserLocation`.
4. Sete papéis de sistema com permissões e escopos.
5. Função única de autorização chamada pelos Application Services.
6. **RLS default-deny** em toda tabela de tenant.
7. Ciclo de convite com expiração e proteção contra replay.
8. Seleção e troca de Workspace, com invalidação de contexto.
9. Invariante de Primary Owner e transferência auditada.
10. Resolução de deep link que revalida autorização.
11. Eventos de auditoria para mudança privilegiada.
12. Onboarding com checklist persistente, incluindo a etapa de imposto.

## Testes obrigatórios

Não autenticado · autenticado sem Membership · um Workspace · vários Workspaces · Membership suspensa · **tentativa cross-workspace por ID direto** · violação de escopo de Location · tentativa de auto-elevação · convite expirado e reusado · invariante de Owner · permissão alterada durante sessão ativa.

## Gate de saída

Nenhuma mutação de dado de tenant é liberada antes de os testes de cross-tenant e de permissão negativa passarem.

---

# Epic 2 — Fundação de dados

## Trabalho

1. Traduzir o Domain Model em schema físico, incrementalmente.
2. Foreign keys reais e unicidades lógicas do §4 do Domain Model.
3. `integer` em cents para todo valor monetário.
4. `AuditLog` e `ActivityEvent` separados.
5. **Outbox transacional** e o padrão de gravação junto com o dado de negócio.
6. Filas `pgmq` e o worker por Vercel Cron, com lote, visibility timeout, retry com backoff e fila morta.
7. `pg_cron` para as rotinas periódicas.
8. `FileService` sobre Supabase Storage, com bucket privado e URL assinada temporária.
9. Caminho de objeto com `workspace_id` e autorização na emissão da URL.
10. Primitivas de busca: FTS, `pg_trgm` e campos normalizados.
11. Procedimento de migration e recuperação.

## Testes obrigatórios

Migrations reproduzem de banco vazio · constraint de tenant e RLS · Outbox e enfileiramento na mesma transação, com rollback comprovado · worker idempotente sob mensagem duplicada · retry com backoff e fila morta · **acesso a objeto por adivinhação de caminho é negado** · URL assinada expira.

## Gate de saída

- migrations reproduzíveis;
- testes de isolamento automatizados;
- nenhum domínio obrigado a guardar binário no PostgreSQL;
- worker de fila verificado sob falha e reinício.

---

# Epic 3 — Walking Skeleton

## Objetivo

Atravessar o fluxo inteiro com uma feature de cada, antes de engrossar qualquer módulo. Serve para validar schema, autorização, dinheiro, assinatura e provider de uma só vez — e para ter algo demonstrável a um roofer real.

## Escopo

> Criar cliente com uma Property → Estimate de uma linha com imposto → enviar por e-mail → cliente aprova por **magic link** e assina → Job criado → um Service agendado por capacidade → concluir → Invoice → pagamento por Stripe.

Sem Saved Views, sem template, sem versão, sem Kanban, sem bulk action. Feio e completo.

## Trabalho

1. `ClientAccount`, `ContactPerson` e `Property` mínimos.
2. `Estimate` com uma `EstimateVersion` e uma linha, com cálculo de imposto.
3. Envio por Resend pela fila `notifications`.
4. `PortalGrant`, consumo e assinatura.
5. Criação do Job com um `ProjectService`.
6. Agendamento com `ProductionCapacity` e cálculo de duração.
7. Conclusão do Service.
8. `InvoiceRecord` e `Payment` via Stripe Connect em sandbox, com webhook verificado e idempotente.

## Gate de saída

O fluxo roda ponta a ponta em Staging, com evidência gravada, sem intervenção manual no banco.

---

# Epic 4 — Assinatura e Entitlements

## Superfícies

`SCR-AUTH-002`, `003`, `004`, `007`, `008` · `SCR-SET-012`

## Trabalho

1. `Plan`, `PlanLimit`, `Subscription`, `BillingCustomer`, `BillingPaymentMethod`, `SubscriptionInvoice`.
2. **Stripe Billing**, com adapter próprio e **sem compartilhar código com o Connect**.
3. Cadastro com escolha de plano e Trial de 14 dias **com cartão**.
4. Ciclo `Past Due → Grace (3 dias) → Read-only → Suspended → Active`, dirigido por webhook.
5. Estado Read-only aplicado **no servidor**, não apenas na interface.
6. `Entitlement` como dado; limite atingido bloqueia com explicação e CTA.
7. Medição de uso por Workspace.
8. Cancelamento com período somente de exportação.
9. `pg_cron` para expiração de Trial e transições de Grace.

## Testes obrigatórios

Trial expira sem cartão válido · falha de pagamento leva a Grace e depois a Read-only · **mutação é negada em Read-only mesmo por chamada direta à rota** · Suspended bloqueia usuário comum e libera o Owner para regularizar · webhook duplicado não duplica transição · limite de plano bloqueia a ação correta · **dados nunca são apagados**.

## Gate de saída

Um Workspace percorre Trial → Active → Past Due → Grace → Read-only → Suspended → Active sem intervenção manual, com dados preservados.

---

# Epic 5 — CRM, Sales, Estimates e Imposto

## Superfícies

`SCR-CRM-001` a `005` · `SCR-SALES-001` a `007` · `SCR-SET-005`, `006`, `007`, `009`

## Fatias

**5A — CRM.** Cliente, contatos, múltiplas Properties, normalização e aviso de duplicidade, tags, lead source, atribuição, follow-up, Saved Views, importação CSV com preview e mapeamento.

**5B — Pipeline.** Oportunidades, etapas configuráveis, Lost com motivo, appointments.

**5C — Imposto.** `TaxRate`, `TaxExemption`, `TaxTreatment` e o contrato `TaxProvider`. Cálculo com labor e material separados, alíquota pelo endereço da Property e explicação persistida no documento.

**5D — Estimates.** Draft com autosave, versões, linhas, catálogo de serviços, template, preview obrigatório, envio, registro de visualização, aprovação, assinatura, snapshot imutável e o comando que cria o Job **exatamente uma vez**.

## Testes obrigatórios

Arredondamento e imposto em todos os modos · **isenção vencida não zera imposto** · lump sum não cobra do cliente · Estimate aprovado rejeita edição · aprovação concorrente cria um único Job · versão substituída avisa o cliente · Salesperson só enxerga o que lhe foi atribuído · duplicidade é detectada na importação.

---

# Epic 6 — Jobs, Services, Schedule, Capacidade e Escadinha

## Superfícies

`SCR-JOB-001` a `005`, `012` · `SCR-SCH-001` a `006` · `SCR-TEAM-001` a `005`

## Trabalho

1. Job, Services, status configuráveis, milestones, progresso manual e por checklist.
2. Crews, Teams, membros e **`SubcontractorProfile`** com seguro, licença e W-9.
3. `ProductionUnit` e `ProductionCapacity`.
4. Cálculo de duração e data final respeitando dias úteis, feriados e bloqueios.
5. `ScheduleEvent`, arraste, redimensionamento e mudança de atribuição.
6. **Detecção de conflito que impede o salvamento**, com as três opções e segunda confirmação.
7. **Escadinha**: preview Before/After, preservação de intervalos, exclusão de concluídos, detecção de novos conflitos, aplicação atômica e desfazer.
8. `StairStepChangeSet` com auditoria.
9. Alerta e bloqueio ao atribuir crew com seguro vencido.

## Testes obrigatórios

Duração por capacidade em cada unidade · soma apenas das Crews selecionadas · feriado e bloqueio deslocam corretamente · **horário de verão dos EUA não desloca em um dia** · conflito de crew, de team e de pessoa · override registra motivo · Escadinha não move concluído · Escadinha detecta novos conflitos · desfazer restaura o estado exato · **seguro vencido dispara a regra configurada**.

## Gate de saída

A Escadinha é demonstrável com preview, aplicação e desfazer, sob cenário com feriado, bloqueio e serviço concluído no meio.

---

# Epic 7 — Campo, Daily Logs e Change Orders

## Superfícies

`SCR-FIELD-001` a `007` · `SCR-JOB-006`, `007`, `009` · `SCR-APR-001`

## Trabalho

1. PWA instalável: manifest, service worker para shell e assets, ícone e tela de abertura.
2. `Today` com escopo estrito do Crew.
3. Service mobile em seções, com ações rápidas e ação primária fixa.
4. Daily Log com unicidade por Service e data, campos automáticos e obrigatórios configuráveis.
5. Upload múltiplo com compressão no dispositivo, progresso e retry por arquivo.
6. Bloqueio do Daily Log após DONE e reabertura autorizada com motivo.
7. Reportar problema, solicitar material e solicitar Change Order sem ver preço.
8. Conclusão com verificação de pendências, assinatura e pendência quando o cliente está ausente.
9. Change Order completo: precificação, preview, envio, aprovação, assinatura e efeito no valor do Job.
10. Central de aprovações com delegação.
11. **Web Push** com VAPID e `PushSubscription`.

## Testes obrigatórios

Crew não enxerga Service de outra crew · **nenhum valor financeiro é servido ao Crew, nem na resposta da API** · segundo Daily Log no mesmo dia abre o existente · log bloqueado após DONE · falha de upload não perde os demais arquivos · **falha de rede nunca indica sucesso** · regra bloqueante impede conclusão · Change Order aprovado fica imutável e altera o valor do Job.

---

# Epic 8 — Materiais e Compras

## Superfícies

`SCR-JOB-008` · `SCR-PUR-001` a `004`

## Trabalho

Material Request com aprovação do Supervisor; Purchase com fornecedor, PO, valor, recibo e status de pagamento; Purchase Order; Vendors com histórico e total gasto; vínculo N:M entre solicitação e compras; gasto de material por Job.

## Testes obrigatórios

Uma solicitação gera várias compras · compra sem solicitação exige permissão · rejeição exige motivo · recibo é armazenado com escopo de tenant · gasto agregado bate com as compras vinculadas.

---

# Epic 9 — Financeiro e QuickBooks

## Superfícies

`SCR-FIN-001` a `007`

## Trabalho

1. Invoice com seleção de Services, Change Orders ou percentuais, rótulos e faturamento parcial.
2. **Bloqueio de overbilling** contra Contract Value mais Change Orders aprovados.
3. Payment aplicado a Invoice específica; métodos manuais e por provider.
4. **Bloqueio de overpayment**; Refund como transação separada.
5. `PaymentSchedule` com parcelas e saldos.
6. AR com aging e lembretes que param ao ficar pago.
7. Comissões com as cinco formas de cálculo, gatilho configurável, estados e congelamento em Paid.
8. QuickBooks: OAuth com rotação de refresh token, mapeamento explícito, sincronização de Invoice e Payment, webhook como sinal com refetch autoritativo, reconciliação periódica e tratamento de conflito de versão.

## Testes obrigatórios

Overbilling e overpayment bloqueados · refund preserva o original · **webhook duplicado não duplica pagamento** · assinatura inválida é rejeitada · webhook perdido é recuperado pela reconciliação · conflito de versão não sobrescreve silenciosamente · comissão Paid não recalcula · aging bate com data e saldo · desconexão preserva histórico e mapeamentos.

---

# Epic 10 — Client Portal

## Superfícies

`SCR-PORT-001` a `009`

## Trabalho

1. `PortalAccess`, `PortalGrant`, `PortalSession` e `PortalSettings`.
2. Magic link assinado, com hash, finalidade, validade e uso único; reenvio quando expirado.
3. Senha opcional levando ao mesmo escopo.
4. Home, Properties, Project, Documentos e Financeiro.
5. Aprovação de Estimate e Change Order com assinatura ligada ao grant.
6. Pagamento pelo componente seguro do provider.
7. `PortalRequest` para nova Property e solicitação de serviço.
8. Visibilidade configurável, com **progresso oculto por padrão**.
9. Branding da empresa sobre a estrutura da plataforma.

## Testes negativos obrigatórios

Grant expirado, já consumido e revogado · grant de um cliente **não acessa dado de outro** · adivinhar ID não dá acesso · conteúdo não marcado como customer-visible nunca é servido · capacidade de crew, notas internas, comissão, custo de material e dados de subcontratado **não aparecem em nenhuma resposta** · falha de pagamento não desfaz a aprovação.

---

# Epic 11 — i18n, Dashboard, Relatórios e Administração

## Superfícies

`SCR-DASH-001`

> O **dashboard único** (App Flow §4) agrega avisos de trial e setup, aprovações, jobs e agenda do dia,
> conflitos, pipeline e follow-ups, estimates aguardando resposta, resumo financeiro e AR, comissão e
> atividade recente. Depende de Epic 4, 5, 6, 7 e 9, e por isso só fica completo aqui. O Crew não usa
> esta tela — sua entrada é `SCR-FIELD-001`.

## Trabalho

1. Roteamento por locale, catálogos `en-US` e `es-US`, e **build que falha com chave sem tradução**.
2. Formatação por `Intl` com a locale efetiva e o timezone da Location.
3. Tradução do conteúdo que sai: template de e-mail, PDF do Estimate, rótulos do portal e notificações.
4. Preferência de idioma no Workspace, no usuário e no contato do portal.
5. Três relatórios fixos: conversão de vendas, jobs por status e atraso, AR com aging. Exportáveis.
6. **Dashboard único `SCR-DASH-001`**: blocos por permissão conforme a tabela do App Flow §4, filtro de
   período, widgets reorganizáveis e ocultáveis por usuário, padrão por papel definido pela empresa, e
   drawer de "Requer Atenção" com motivo concreto e ação rápida.
7. Busca global com atalho, agrupamento por entidade e respeito a escopo.
8. Administração da plataforma em rotas protegidas, com acesso de suporte autorizado, registrado e com banner permanente.

## Testes obrigatórios

Nenhuma chave sem tradução · data, número e moeda corretos em ambas as locales · e-mail e PDF saem no idioma do destinatário · **busca não retorna registro fora do escopo** · **nenhum bloco do dashboard aparece para papel sem permissão** · Crew autenticado não alcança `SCR-DASH-001` · acesso de suporte é registrado e expira.

---

# Epic 12 — Hardening e GA

## Trabalho

Revisão de segurança com foco em multi-tenancy, portal e financeiro · teste de carga nos fluxos críticos · revisão de índices e planos de consulta · verificação de redaction em logs e Sentry · exercício de restauração de backup · runbooks · alertas para falha de webhook, fila morta e erro de sincronização · revisão de rate limit.

## Virada de domínio

Executada aqui, conforme TRD §13.5: domínio adquirido, verificação no Resend, URLs de webhook do Stripe e do QuickBooks, `redirect_uri` de OAuth e URL base do portal. Nada pode depender de URL fixa no código.

## Gate de GA

SLOs monitorados · restauração exercitada · revisão de segurança concluída · E2E críticos verdes · runbooks publicados · processo de suporte definido.

---

# 4. Regras transversais

## 4.1 Autorização

Verificada no Application Service, antes de qualquer efeito. RLS é a segunda barreira. Toda fatia que toca dado de tenant entrega **teste negativo** junto.

## 4.2 Transação e efeito externo

Operação atômica em transação. Efeito externo **nunca** dentro da transação. Dado, Outbox e enfileiramento na mesma transação. Todo consumidor é idempotente.

## 4.3 Dinheiro

`integer` em cents. Arredondamento decidido no Use Case e testado. Nenhum cálculo financeiro no cliente.

## 4.4 Interface

Toda tela implementa os estados aplicáveis: default, loading, empty, error, permission denied, read-only e plan limit. Formulário adiciona validation error, unsaved changes, saving e saved. Componente novo só existe se o Design System não tiver equivalente.

## 4.5 Nomenclatura

Tudo brand-neutral até a decisão de marca.

---

# 5. Definition of Done de uma fatia

1. Requisito rastreado ao PRD, App Flow e Domain Model.
2. Autorização verificada no servidor, com teste negativo.
3. Migration versionada e reproduzível.
4. Regra no Application Service, não no componente nem na rota.
5. Estados de interface implementados.
6. Textos em `en-US` e `es-US`.
7. Testes aplicáveis passando, com a cobertura do módulo respeitada.
8. Efeito externo idempotente e observável.
9. Sem secret, PII não aprovada ou token em log.
10. `EPIC-XX-STATUS.md` e `EPIC-XX-QA.md` atualizados com o que foi feito, o que falta e o próximo passo exato.

Não marcar PASS com gate pulado.

---

# 6. Rastreabilidade

| Epic | Fontes |
|---|---|
| 0 | TRD §2, §3, §15 |
| 1 | PRD §3 · App Flow §2, §3 · Domain Model §A |
| 2 | Domain Model inteiro · TRD §5, §6 |
| 3 | PRD §14 · App Flow §15 |
| 4 | PRD §12 · App Flow §3 · Domain Model §B |
| 5 | PRD §5, §6 · App Flow §5, §6 · Domain Model §C, §D, §I |
| 6 | PRD §7 · App Flow §7, §8 · Domain Model §E, §F |
| 7 | PRD §8, §9.1 · App Flow §9 · Domain Model §G, §H |
| 8 | PRD §9.2 · App Flow §10.2 · Domain Model §H |
| 9 | PRD §10 · App Flow §12 · Domain Model §J |
| 10 | PRD §11 · App Flow §11 · Domain Model §L |
| 11 | TRD §8 · App Flow §14 |
| 12 | TRD §10, §11, §13.5, §14 |

---

# 7. Primeira execução

1. Confirmar os ADRs 017 a 023.
2. Executar o Epic 0, incluindo a migração do contrato de identidade já implementado.
3. Confirmar o gate de saída do Epic 0 antes de qualquer Epic de produto.

Nenhum Epic de produto começa antes disso.
