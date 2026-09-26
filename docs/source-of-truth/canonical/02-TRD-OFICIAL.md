# TECHNICAL REQUIREMENTS DOCUMENT

**TRD Oficial — v2.0**

| Campo | Definição |
|---|---|
| Versão | 2.0 |
| Status | Substitui o TRD v1.0 |
| Data | 2026-09-25 |
| Marca | Não definida; nomes brand-neutral |
| Mercado | Estados Unidos |
| Base | PRD v2.0 + App Flow v2.0 + Domain Model v2.0 + decisões de 2026-09-25 |
| Infraestrutura | **Supabase + Vercel + GitHub** |

> **O que mudou.** A V1.0 previa Modular Monolith em NestJS no Render, com BullMQ e Valkey, mobile em Expo e Web na Vercel — quatro fornecedores e três alvos de deploy. A v2.0 concentra tudo em Supabase e Vercel. A lógica de negócio vive no Next.js, a fila vive no PostgreSQL e o campo é PWA.
>
> **O ADR-016 já havia removido o Render** e consolidado o backend no Supabase, superseding ADR-005, ADR-014 e ADR-015. Este TRD acrescenta duas emendas ao ADR-016, registradas no **ADR-017** (execução HTTP de negócio no Next.js, em vez de Edge Functions, e consumo de fila por Vercel Cron em vez de `pg_net`) e no **ADR-018** (campo em PWA, em vez de Expo/EAS). Todo o restante do ADR-016 permanece vigente.

---

# 1. Escopo técnico

Este TRD define como a Plataforma é construída e operada. Não define preço, limite comercial de plano, desenho visual nem ordem de entrega.

## 1.1 Princípios

1. **Um alvo de deploy.** Web, API e jobs saem do mesmo build na Vercel.
2. **PostgreSQL é a fonte de verdade transacional.** Realtime entrega, não decide.
3. **Autorização é server-side.** Visibilidade de interface nunca é autorização. RLS é defesa em profundidade, não a camada primária.
4. **Efeito externo é assíncrono e idempotente.**
5. **Transação de banco não espera API externa lenta.**
6. **Provider SDK não vira modelo de domínio.**
7. **Regra de negócio não se duplica** entre web, rota e job.
8. Secret nunca entra no Git nem no bundle do cliente.
9. Production não reutiliza recurso ou credencial de Development ou Staging.

---

# 2. Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Linguagem | TypeScript | Em todo o repositório |
| Web, API e PWA | **Next.js App Router** na Vercel | Route Handlers e Server Actions. ADR-013 |
| Acesso a dados | **Drizzle ORM + Drizzle Kit** | SQL nativo permitido. ADR-001 |
| Banco | **PostgreSQL no Supabase** | Fonte de verdade |
| Autenticação | **Supabase Auth** | Identidade externa separada do User interno |
| Storage | **Supabase Storage** | Atrás de um contrato `FileService` |
| Realtime | **Supabase Realtime Broadcast** | Canais privados por tenant. ADR-006 |
| Filas e agendamento | **pgmq + pg_cron** | Dentro do próprio PostgreSQL |
| E-mail | **Resend** | Provider único, inclusive SMTP do Supabase Auth |
| Pagamentos do cliente final | **Stripe Connect** | Accounts v2 + Direct Charges. ADR-007 |
| Assinatura da Plataforma | **Stripe Billing** | Integração **separada** do Connect |
| Contabilidade | **QuickBooks Online** | OAuth 2.0, atrás de adapter. ADR-008 |
| Imposto | **Provider interno** atrás de `TaxProvider` | Tabelas próprias; externo plugável |
| Estilo | **Tailwind CSS 4 + tokens semânticos** | ADR-003 |
| Monorepo | **pnpm + Turborepo** | ADR-004 |
| CI | **GitHub Actions** | — |
| Erros | **Sentry** | Web e jobs |
| Tracing e métricas | **OpenTelemetry** | ADR-012 |
| Testes | **Vitest** e **Playwright** | Ver §12 |

## 2.1 Fora da stack

Render · Valkey/Redis · BullMQ · NestJS · Expo/EAS · Twilio · k6 · Maestro.

Nenhum deles retorna sem nova decisão registrada.

---

# 3. Arquitetura

```
┌───────────────────── Vercel ─────────────────────┐
│  Next.js App Router                              │
│   ├── UI (Server + Client Components)            │
│   ├── Route Handlers  → contrato HTTP            │
│   ├── Server Actions  → mutações da própria UI   │
│   └── Application Services  ← regra de negócio   │
│        └── Repositories (Drizzle)                │
│  Vercel Cron → dispara o worker de fila          │
└───────────────┬──────────────────────────────────┘
                │
┌───────────────▼──────────── Supabase ────────────┐
│  PostgreSQL  ── Outbox ── pgmq ── pg_cron        │
│  Auth · Storage · Realtime                       │
└──────────────────────────────────────────────────┘
```

## 3.1 Onde a regra vive

**Application Services** são a única camada que contém regra de negócio. Route Handlers, Server Actions e workers são invocadores finos.

Um Use Case é chamado de três lugares: da UI por Server Action, de fora por Route Handler, e do worker de fila. A regra é escrita uma vez.

| Camada | Pode | Não pode |
|---|---|---|
| Server / Client Component | Renderizar, chamar Server Action | Consultar banco direto, decidir autorização |
| Server Action | Validar entrada, chamar Use Case | Conter regra de negócio |
| Route Handler | Autenticar, validar, chamar Use Case | Conter regra de negócio |
| Application Service | **Toda a regra**, transação, autorização | Conhecer HTTP ou SDK de provider |
| Repository | Consulta e persistência | Regra de negócio |
| Provider Adapter | Falar com Stripe, QuickBooks, Resend | Vazar tipo do SDK para o domínio |

## 3.2 Módulos

`identity` · `billing` · `crm` · `sales` · `jobs` · `scheduling` · `field` · `financial` · `tax` · `purchasing` · `portal` · `communications` · `integrations` · `audit`

Módulo conversa com módulo por Use Case ou por evento, nunca por repositório alheio.

## 3.3 Contrato HTTP

Route Handlers sob `/api`. Erro padronizado com `code`, `message`, `details` e `request_id`.

Códigos estáveis: `SCHEDULE_CONFLICT`, `PLAN_LIMIT_REACHED`, `INSUFFICIENT_PERMISSION`, `OVERBILLING_BLOCKED`, `OVERPAYMENT_BLOCKED`, `TAX_EXEMPTION_EXPIRED`, `SUBCONTRACTOR_INSURANCE_EXPIRED`, `PORTAL_GRANT_EXPIRED`.

Transição de estado usa endpoint explícito: `POST /api/estimates/:id/approve`, `POST /api/services/:id/complete`.

Paginação no servidor. Filtro e ordenação por whitelist — **nunca interpolar campo vindo do cliente**.

---

# 4. Autenticação e autorização

## 4.1 Identidade

Supabase Auth é o provider. Métodos da V1: e-mail e senha.

- Senha nunca é persistida em tabela própria.
- `User` é identidade global; `UserAuthIdentity` mapeia o `subject` externo.
- Relação de negócio usa `user.id` interno, jamais o ID do provider.
- Ação crítica pode exigir reautenticação.

## 4.2 Tenancy

Shared database, shared schema. Toda entidade de tenant carrega `workspace_id`.

Todo request resolve o contexto **no servidor**: sessão → `User` → `Membership` ativa → papel → permissões → escopo de Location. O contexto nunca vem do cliente.

Trocar de Workspace invalida cache e recarrega permissões.

## 4.3 Autorização

A verificação acontece no Application Service, antes de qualquer efeito:

```ts
await authorize(ctx, 'financial.payments.record', { locationId })
```

Escopos: `own`, `assigned`, `location`, `workspace`.

**RLS fica habilitada em todas as tabelas de tenant**, com política default-deny. É a segunda barreira: se um Use Case esquecer o filtro, o banco nega. Não substitui a verificação na aplicação.

Acesso por ID direto, deep link e notificação passam pela mesma verificação.

## 4.4 Portal do cliente

Caminho separado, sem `Membership`.

`PortalGrant` é um token aleatório de alta entropia, guardado **apenas como hash**, com finalidade, entidade alvo, validade e uso único. Ao consumir: valida hash, validade e finalidade, cria `PortalSession` restrita ao próprio cliente e registra IP.

Senha é opcional e leva ao mesmo escopo. O grant **nunca** concede acesso a dado de outro cliente, mesmo com ID válido.

---

# 5. Dados

## 5.1 Convenções

`snake_case` no banco, `camelCase` no TypeScript, nomes em inglês. UUID não sequencial gerado na aplicação. Foreign keys reais. `timestamptz` para instante, `date` para data civil. Soft delete apenas onde faz sentido.

Migrations versionadas em Git via Drizzle Kit. **Nenhuma alteração manual em Production.**

## 5.2 Dinheiro

**`integer` em cents.** Sem exceção, sem `float`, sem decimal ambíguo. `currency_code` acompanha o registro; a V1 opera em USD.

Percentual em basis points. Arredondamento é decidido no Use Case e testado.

## 5.3 Conexão

Runtime da Vercel usa o **pooler do Supabase em modo transaction**, adequado a função serverless. Migrations e tarefas administrativas usam conexão direta, com credencial separada. Ver ADR-002.

O driver é configurado para não depender de prepared statement nomeado no modo transaction.

## 5.4 Busca

Dentro do PostgreSQL: B-tree, Full-Text Search e `pg_trgm`, com campos normalizados para e-mail, telefone e endereço.

Sempre com escopo de Workspace e, quando aplicável, de Location e permissão. Entidades: Customer, Contact, Property, Job, Estimate e Invoice.

## 5.5 Storage

Supabase Storage atrás de `FileService`. Bucket privado; acesso por URL assinada temporária, **nunca persistida como URL permanente**.

Upload valida MIME real e tamanho. Foto gera variante comprimida; documento oficial preserva o original. O banco guarda metadados, nunca binário.

Caminho do objeto inclui o `workspace_id` e a autorização é verificada na emissão da URL — **adivinhar caminho não dá acesso**.

---

# 6. Filas, jobs e eventos

## 6.1 Outbox transacional

O ganho central da escolha de `pgmq`: dado de negócio, `OutboxEvent` e enfileiramento ocorrem **na mesma transação**.

```sql
BEGIN;
  UPDATE estimates SET status = 'APPROVED' ...;
  INSERT INTO outbox_events ...;
  SELECT pgmq.send('integrations', ...);
COMMIT;
```

Some a classe de falha "salvou mas não enfileirou". Nenhuma implementação deve reintroduzir fila externa sem nova decisão.

## 6.2 Filas

`notifications` · `integrations` · `documents` · `media` · `maintenance`

Consumo por Vercel Cron, que invoca uma rota protegida de worker. A rota lê um lote com `pgmq.read`, processa e confirma com `pgmq.delete`. Falha deixa a mensagem voltar após o visibility timeout.

- Retry com backoff e limite. Esgotado, vai para fila morta e fica inspecionável.
- **Todo worker é idempotente.** Chave de idempotência por `provider_event_id` ou por evento de Outbox.
- Lote e timeout dimensionados para caber no limite de execução da função.

## 6.3 Periódicas

`pg_cron` agenda: reconciliação com QuickBooks e Stripe, lembretes de cobrança, expiração de Trial e de grants do portal, **alerta de vencimento de seguro de subcontratado**, limpeza e agregações.

O cron enfileira; o trabalho pesado roda no worker.

## 6.4 Realtime

Supabase Realtime Broadcast em canais privados por Workspace. Casos: atualização de Job e Service, notificações e status de integração.

**Postgres Changes não é habilitado indiscriminadamente.** Realtime é entrega; o estado autoritativo vem sempre da API após reconexão.

---

# 7. Integrações

Toda integração fica atrás de um contrato interno. O módulo de negócio não conhece SDK.

## 7.1 Stripe — duas integrações distintas

| | Connect | Billing |
|---|---|---|
| Serve | Pagamentos dos clientes do contractor | Assinatura da Plataforma |
| Modelo | Accounts v2 + Direct Charges | Customer, Subscription, Price |
| Entidades | `IntegrationConnection`, `Payment`, `Refund` | `BillingCustomer`, `SubscriptionInvoice` |
| Contrato | `PaymentProvider` | `BillingProvider` |

**Não compartilham código de domínio.** Misturar os dois é erro de arquitetura.

A Plataforma não armazena PAN, CVC ou dado bancário completo. Confirmação depende do estado no provider, nunca do navegador.

## 7.2 Webhooks recebidos

Route Handler dedicado por provider, com **verificação de assinatura obrigatória** antes de qualquer processamento.

Fluxo: valida assinatura → grava `InboundWebhookEvent` com `UNIQUE(provider, provider_event_id)` → responde 2xx → enfileira o processamento.

Evento duplicado não reprocessa. Webhook perdido é recuperado por reconciliação periódica.

## 7.3 QuickBooks Online

A Plataforma é a fonte operacional; o QuickBooks é a fonte contábil dos objetos sincronizados.

Invoice nasce por ação manual e vai ao QBO após revisão. Mapeamento explícito em `ExternalObjectLink` — **nunca casamento por nome**. Conflito de versão não sobrescreve silenciosamente. Refresh token rotacionado e persistido a cada uso.

## 7.4 Resend

Provider único de e-mail, incluindo o SMTP do Supabase Auth — um domínio, uma reputação.

Envio é sempre assíncrono, pela fila `notifications`. Eventos de entrega chegam por webhook e alimentam `MessageDeliveryEvent`. Domínio só envia após verificação.

**Inbound está fora da V1.**

## 7.5 Imposto

`TaxProvider` com uma implementação interna baseada em `TaxRate`, `TaxExemption` e `TaxTreatment`.

O cálculo recebe linhas com valor de mão de obra e material separados, o endereço da Property e a isenção vigente, e devolve o imposto por linha mais a explicação aplicada — que é persistida no documento para auditoria.

---

# 8. Internacionalização

Requisito sem projeto técnico na v1.0. Fechado aqui.

- **Idiomas: `en-US` e `es-US`.** Ambos completos.
- Roteamento por segmento de caminho no App Router, com detecção inicial por preferência do usuário e fallback para o padrão do Workspace.
- Mensagens em catálogos versionados no repositório, com chave semântica. Chave sem tradução falha o build, não cai silenciosamente no inglês.
- Data, número e moeda por `Intl`, com a locale efetiva e o timezone da Location.
- **Conteúdo que sai do produto é traduzido:** template de e-mail, PDF do Estimate, rótulo do portal e notificação. `MessageTemplate` guarda um registro por idioma.
- Preferência de idioma existe no Workspace e no usuário; o portal usa a do contato, com fallback para a do Workspace.
- Texto vindo do cliente — descrição de serviço, notas — não é traduzido.

---

# 9. Web e PWA

## 9.1 Next.js

Server Components por padrão; Client Components em módulo interativo. TanStack Query para estado de servidor no cliente, com invalidação explícita.

Design System em `packages/ui-web`, tokens em `packages/design-tokens`. Nenhuma tela cria estilo ad hoc.

## 9.2 PWA de campo

O campo é PWA instalável, no mesmo deploy.

- Manifest com ícones e `display: standalone`.
- Service Worker para shell e assets. **Sem sincronização offline de dados de negócio.**
- Câmera e galeria por `input` com `capture`; compressão no dispositivo antes do upload; progresso e retry por arquivo.
- **Web Push** com VAPID; a inscrição vive em `PushSubscription`. No iOS exige o app adicionado à tela inicial.
- Falha de rede é explícita e **nunca sugere que salvou**.
- Alvos de toque grandes, operação com uma mão, ação primária fixa no rodapé.

---

# 10. Segurança

Baseline **OWASP ASVS**, com least privilege e default deny.

- Validação de todo payload externo no servidor, com schema compartilhado em `packages/validation`.
- SQL parametrizado; sanitização de HTML rico; whitelist de redirect; headers e CSP.
- Validação de arquivo por MIME real e tamanho, com bloqueio de tipo perigoso.
- **Isolamento multi-tenant é propriedade crítica** e vale também em busca, relatório, exportação, Realtime e jobs.
- Log com redaction: sem senha, PAN, CVC, token, cookie, `Authorization` ou PII não aprovada.
- Secret em variável de ambiente da Vercel e do Supabase, por ambiente. **Chave de service role nunca no cliente.**
- Rate limit em autenticação, emissão de grant do portal, webhook e rotas caras.
- Token do portal com alta entropia, guardado como hash, com validade curta e uso único.

## 10.1 Backup e recuperação

Backup gerenciado do Supabase, com PITR habilitado quando o estágio comercial justificar. Exercício de restauração periódico em ambiente isolado.

Alvos: RPO ≤ 15 minutos e RTO ≤ 4 horas para Production madura.

Runbook cobre perda de banco, indisponibilidade de provider, deploy ruim e comprometimento de credencial.

---

# 11. Observabilidade

| Área | Decisão |
|---|---|
| Logs | JSON estruturado, com `request_id`, `workspace_id` e módulo |
| Tracing | OpenTelemetry em HTTP, PostgreSQL, fila e chamada externa |
| Erros | Sentry no browser, no servidor e no worker |
| Correlação | `request_id` atravessa Action ou Route → Outbox → pgmq → worker → provider |

Erro de negócio esperado — conflito de agenda, limite de plano — **não vira exceção no Sentry**.

## 11.1 Alvos

| Métrica | Alvo |
|---|---|
| Rota simples, p95 | ≤ 500 ms, excluindo chamada externa longa |
| Core Web Vitals, p75 | LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1 |
| Espera em fila, p95 | < 60 s em condição normal |
| Disponibilidade pós-GA | 99,9% mensal no que está sob nosso controle |

---

# 12. Testes

| Camada | Ferramenta | Foco |
|---|---|---|
| Unidade e integração | Vitest | Regras, cálculo, permissões, transições, Escadinha, imposto |
| Banco | Vitest + PostgreSQL efêmero | Migrations, constraints, RLS |
| Fila | Vitest + pgmq real | Retry, idempotência, visibility timeout |
| E2E | Playwright | Ver §12.2 |

## 12.1 Cobertura

Cobertura alta é exigida **onde o erro custa caro**, não como média global:

| Módulo | Mínimo |
|---|---|
| `identity` (autorização e tenancy) | 90% |
| `financial` e `tax` | 90% |
| `scheduling` (capacidade, conflito, Escadinha) | 90% |
| `portal` | 85% |
| Demais | 70% |

A CI falha se um módulo crítico ficar abaixo do mínimo.

## 12.2 Fluxos E2E obrigatórios

Aprovação de Estimate por magic link · conclusão de Service com assinatura · criação de Invoice e pagamento · conflito de agenda e Escadinha com Before/After e desfazer · negativa de permissão em acesso por ID direto.

## 12.3 Casos obrigatórios

Timezone e horário de verão dos EUA · Escadinha com feriado, bloqueio, serviço concluído e múltiplas Crews · arredondamento, imposto com isenção vencida, desconto, comissão, pagamento parcial e estorno · webhook duplicado, assinatura inválida, fora de ordem e timeout · retry e reinício de worker · imutabilidade do Estimate aprovado · matriz de permissão com acesso por ID direto e escopo do portal · grant expirado, consumido e de outro cliente · atribuição de Crew com seguro vencido.

---

# 13. CI/CD e ambientes

## 13.1 Git

Trunk-based com branches curtas. `main` protegida, mudança por Pull Request com ao menos uma aprovação humana. Squash merge.

## 13.2 Gates do PR

Integridade de dependências · lint · type-check · testes unitários e de integração · **cobertura por módulo** · validação de migration · build · verificação de secret · E2E de fumaça nos fluxos críticos.

## 13.3 Ambientes

| Ambiente | Configuração |
|---|---|
| Development | Supabase local ou projeto de dev; providers em sandbox |
| Preview | Deploy automático por PR na Vercel, contra o Supabase de Staging; providers em sandbox |
| Staging | Projeto Supabase próprio; providers em sandbox; **sem pagamento real** |
| Production | Projeto, secrets e providers próprios; monitoramento e backup |

Production **não reutiliza** nada de Development ou Staging.

## 13.4 Deploy

Deploy automatizado pela Vercel. Migration preferencialmente compatível com a versão anterior: expandir → publicar → migrar → limpar.

Rollback de aplicação **não implica** rollback de schema. Feature flag simples, como dado, para liberação progressiva.

## 13.5 Domínio

O domínio próprio é adquirido **apenas na entrada em produção**. Até lá, tudo opera em domínio da Vercel.

Consequência a planejar: verificação de domínio no Resend, URL de webhook no Stripe e no QuickBooks, e `redirect_uri` de OAuth precisarão ser refeitos na virada. Nada deve depender de URL fixa escrita no código.

---

# 14. Operação

- Rota de health verifica processo e dependências essenciais, sem varrer todos os providers.
- Toda chamada externa tem timeout explícito e retry com backoff.
- Revisão de capacidade por usuários, Jobs, tamanho de banco, arquivos, volume de fila e tráfego.
- Limite técnico para tamanho e quantidade de arquivo, ação em massa, destinatários e linhas de exportação.
- Rate limit por categoria, mais restrito em autenticação e portal.
- **Limite de plano é dado** em `Entitlement`, nunca condicional de nome de plano espalhado pelo código.
- Conta de Supabase, Vercel, GitHub, Stripe, Resend e Intuit pertencem à empresa, não ao e-mail pessoal de um desenvolvedor.
- Desenvolvedor não tem acesso irrestrito rotineiro ao banco de Production.

---

# 15. Migração a partir do estado atual

Parte da migração **já foi executada** pelo ADR-016, em 2026-09-25. O que resta é consequência
do ADR-017.

## 15.1 Já concluído pelo ADR-016

| Item | Situação |
|---|---|
| `apps/api` (NestJS) e `apps/worker` | **Removidos** do workspace |
| Dependências de BullMQ, Valkey e Render | **Removidas** |
| `pgmq`, `pg_cron` e `pg_net` | **Habilitados** por migration |
| Contrato de identidade do Slice 01 | Migrado para a Edge Function `identity-me`, publicada |

## 15.2 Pendente, por consequência do ADR-017

| Item | Ação |
|---|---|
| Edge Function `identity-me` | Migra para **Route Handler** em `apps/web`, preservando o contrato do Slice 01. A função só é removida do Supabase após paridade comprovada por teste |
| Consumo de fila | Passa de `pg_net` acionando Edge Function para **Vercel Cron** acionando rota protegida de worker |
| `pg_net` | Deixa de ser necessário para dispatch de fila; avaliar remoção |
| `apps/mobile` (Expo) | Fora da V1 pelo ADR-018. Permanece sem evolução ou é removido por decisão |
| `packages/observability` | Preservado, reapontado para o runtime da Vercel |
| `packages/db` | Preservado. É o núcleo do acesso a dados |
| `packages/api-client` e `packages/domain-types` | Reavaliados: com a regra dentro do `apps/web`, parte deles pode perder propósito |

`apps/api` e `apps/worker` **não retornam**.

---

# 16. ADRs

Todos aceitos. A cadeia de backend se lê em três camadas: o **ADR-016** removeu o Render e
consolidou o Supabase; o **ADR-017** e o **ADR-018** o emendam em dois pontos.

| ADR | Decisão |
|---|---|
| ADR-001 | Drizzle ORM + Drizzle Kit |
| ADR-002 | Conexão e pooling no Supabase |
| ADR-003 | Tailwind CSS 4 + tokens semânticos |
| ADR-004 | pnpm + Turborepo |
| ADR-006 | Supabase Realtime Broadcast |
| ADR-007 | Stripe Connect Accounts v2 + Direct Charges |
| ADR-008 | QuickBooks Online |
| ADR-012 | OpenTelemetry + logs estruturados + Sentry |
| ADR-013 | Next.js App Router |
| **ADR-016** | Supabase-only backend runtime; `pgmq` e `pg_cron`; sem Render |
| **ADR-017** | Next.js como camada de aplicação — supersede ADR-014, **emenda ADR-016** na execução HTTP e no consumo de fila |
| **ADR-018** | PWA como superfície de campo — supersede ADR-011, **emenda ADR-016** na linha de mobile |
| **ADR-019** | `TaxProvider` e tratamento fiscal |
| **ADR-020** | Stripe Billing para a assinatura, separado do Connect |
| **ADR-021** | Resend como provider único, outbound apenas — substitui ADR-010 |
| **ADR-022** | Portal por magic link |
| **ADR-023** | Arquitetura de i18n |

Superseded: ADR-005, ADR-011, ADR-014 e ADR-015. Permanecem como registro histórico e não
podem ser usados para reintroduzir a decisão revogada.

Do ADR-017 em diante, todo ADR segue o formato do Technical Validation Plan §20, incluindo
**Revisit Trigger** — campo ausente nos ADRs de 001 a 016.

---


# 17. Decisões abertas

| Item | Situação |
|---|---|
| Marca e domínio | Não definidos; domínio adquirido na virada para produção |
| Valores e limites dos planos | Estrutura definida, números em aberto |
| Política de retenção e período de exportação | Em aberto |
| Extensão da UI de multi-location | `location_id` no modelo; alcance na interface em aberto |
| Provider externo de imposto | Contrato definido; adoção só se a operação exigir |

---

> **Princípio final.** A V1 é uma aplicação TypeScript única, multi-tenant e orientada a eventos, com PostgreSQL como fonte de verdade, fila dentro do próprio banco, dois fornecedores de infraestrutura e autorização centralizada no servidor. Complexidade distribuída só entra quando houver carga que a justifique.
