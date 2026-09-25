# Arquitetura Técnica Consolidada do SaaS

- **Status:** baseline técnico consolidado para implementação
- **Data:** 2026-09-25
- **Fonte:** POCs 01–12 e ADRs associados do repositório `Wyllams/SaaS`
- **Marca do produto:** não definida
- **Regra de naming:** nenhum novo namespace, pacote, domínio, variável ou documento deve assumir uma marca definitiva até decisão explícita

## 1. Objetivo

Este documento consolida as decisões técnicas comprovadas pelos POCs em uma única fonte de verdade para a próxima etapa de implementação do SaaS.

Ele não transforma código experimental em código de produção automaticamente.

A regra é:

`POC validado → decisão arquitetural → implementação limpa e revisável`

Código em `packages/*-poc` existe como evidência técnica. A implementação definitiva deve adotar as decisões comprovadas, não copiar cegamente os artefatos experimentais.

## 2. Estado consolidado dos POCs

| POC | Tema | Estado consolidado | Decisão para a arquitetura |
| --- | --- | --- | --- |
| 01 | ORM / Query Layer | **PASS** | Drizzle ORM + Drizzle Kit |
| 02 | PostgreSQL Pooling / Supabase | **PASS** | Direct quando viável; Supavisor Session para serviços persistentes; Transaction para workloads curtos |
| 03 | Design System em código | **PASS** | Tailwind CSS 4 + CSS variables semânticas |
| 04 | Monorepo pnpm + Turborepo | **PASS** | pnpm workspace + Turborepo |
| 05 | BullMQ + Valkey | **PASS** | BullMQ + serviço Redis-compatible/Valkey |
| 06 | Supabase Realtime | **PASS** | Realtime Broadcast privado, com PostgreSQL como fonte de verdade |
| 07 | Stripe Connect | **PASS** | Stripe Connect Accounts v2 + Direct Charges |
| 08 | QuickBooks Online | **PASS** | QBO via adapter de accounting e reconciliação |
| 09 | SMS / Twilio | **CANCELADO / FORA DO ESCOPO** | Não integrar SMS no produto atual |
| 10 | Resend Email | **PARCIAL** | Resend permanece candidato; outbound/inbound/anexos comprovados, webhook público real ainda pendente |
| 11 | Expo Mobile | **PASS** | React Native + Expo + Expo Router |
| 12 | Observabilidade E2E | **PASS** | OpenTelemetry + logs estruturados + Sentry para Error Monitoring e Tracing |

### Regra de interpretação

- **PASS**: hipótese técnica aceita como baseline.
- **PARCIAL**: parte da hipótese foi comprovada, mas existe gate técnico explícito pendente.
- **CANCELADO / FORA DO ESCOPO**: não entra na arquitetura atual.

## 3. Topologia do repositório

A arquitetura adota um único monorepo TypeScript:

```text
apps/
  web/
  api/
  worker/
  mobile/

packages/
  api-client/
  design-tokens/
  types/
  validation/
  config/
```

Regras:

1. aplicações executáveis ficam em `apps/*`;
2. código reutilizável fica em `packages/*`;
3. dependências internas usam `workspace:*`;
4. dependências circulares são proibidas;
5. pnpm é o único package manager;
6. Web e Mobile podem compartilhar contratos e tokens, sem serem obrigados a compartilhar implementação de UI;
7. código de POC não é automaticamente promovido a package definitivo.

### Ferramentas de fundação validadas

- Node.js 24.21.0;
- pnpm 12.6.0;
- Turborepo 2.11.4;
- lockfile versionado;
- CI com `--frozen-lockfile`.

## 4. Banco e acesso a dados

### Banco autoritativo

PostgreSQL é a fonte de verdade dos dados de negócio.

Supabase fornece a infraestrutura PostgreSQL e serviços associados validados pelos POCs.

### Query layer

Usar:

- **Drizzle ORM** para queries tipadas;
- **Drizzle Kit** para migrations;
- SQL PostgreSQL explícito quando necessário.

RLS, JSONB, Full-Text Search, `pg_trgm` e outras capacidades nativas do PostgreSQL permanecem first-class.

A arquitetura não deve deformar o schema para acomodar limitações do ORM.

### RLS

Isolamento multi-tenant permanece protegido por:

1. autorização backend;
2. PostgreSQL Row-Level Security como defesa em profundidade.

Policies e grants devem permanecer explícitos e revisáveis.

### Connection policy

#### Serviços persistentes — API e Worker

Preferência:

1. Direct Postgres quando o ambiente de deploy tiver conectividade IPv6 validada e orçamento de conexões adequado;
2. Supavisor **Session Pooler** como caminho persistente compatível com IPv4.

#### Workloads serverless / curtos

Usar Supavisor **Transaction Pooler** quando a característica do workload justificar.

Nesses caminhos:

- não depender de prepared statements nomeados;
- não depender de estado de sessão;
- não depender de afinidade da conexão;
- contexto do tenant deve ser aplicado dentro da transação com estado transaction-local.

### Connection budget

Pools devem ser pequenos e explícitos.

Escala horizontal deve considerar a soma:

`réplicas × pool por réplica + conexões da plataforma <= orçamento seguro do PostgreSQL`

## 5. Background jobs

Usar:

- **BullMQ**;
- serviço Redis-compatible, com **Valkey** explicitamente validado.

### Papel da fila

A fila é infraestrutura de execução, não banco de negócio.

PostgreSQL continua autoritativo.

### Regras

- payloads preferem IDs e contexto imutável mínimo;
- jobs devem tolerar entrega repetida;
- efeitos externos precisam de idempotency keys;
- retry/backoff é finito e explícito por categoria;
- falhas permanentes permanecem observáveis;
- operações críticas devem ser reconstruíveis a partir do estado persistido quando necessário;
- hosted queue deve usar autenticação e TLS.

## 6. Realtime

Usar **Supabase Realtime Broadcast com canais privados**.

### Regra central

> Realtime é sinal de entrega, não fonte de verdade.

Fluxo conceitual:

```text
persistir estado no PostgreSQL
→ publicar sinal Realtime quando apropriado
→ cliente atualiza UX
→ reconnect/refetch recupera estado autoritativo
```

Uso adequado:

- notificações;
- chat/mensagens;
- alterações de aprovação/status;
- atualizações operacionais selecionadas.

Não assinar indiscriminadamente alterações brutas de todas as tabelas.

### Autorização

Tópicos devem ser tenant/resource scoped e protegidos por Realtime Authorization/RLS.

Conhecer o nome de um tópico nunca concede acesso.

## 7. Design System Web

Usar:

- **CSS custom properties semânticas** como fonte de tokens;
- **Tailwind CSS 4** como camada padrão de composição;
- componentes React reutilizáveis para comportamento e acessibilidade.

Regras:

- componentes consomem tokens semânticos, não valores de marca hard-coded;
- status nunca depende apenas de cor;
- tokens ficam independentes das telas;
- CSS Modules são exceção permitida, não padrão;
- Mobile pode consumir conceitos/tokens, sem compartilhar obrigatoriamente os componentes Web.

A marca final não está definida. Tokens de marca históricos dos POCs não constituem decisão de branding.

## 8. Pagamentos — Stripe

Usar **Stripe Connect** com:

- Accounts v2;
- Direct Charges;
- onboarding hospedado pelo Stripe.

### Modelo financeiro

A empresa cliente conectada é merchant of record dos pagamentos de seus próprios clientes.

A plataforma SaaS não recebe primeiro o dinheiro do consumidor para depois transferi-lo ao prestador.

### V1

- sem `application_fee_amount` por padrão;
- Stripe gerencia o fluxo de onboarding/KYC;
- estado de pagamento é provider-authoritative;
- browser redirect não é prova final de pagamento;
- criação de pagamento é idempotente;
- processamento de webhook é idempotente;
- assinatura do webhook deve ser validada sobre o raw body;
- duplicidade e ordem de eventos devem ser toleradas.

### Dados sensíveis

Não armazenar:

- PAN;
- CVC;
- credenciais bancárias;
- material de autenticação de pagamento restrito.

### ACH

ACH continua uma capacidade de pagamento que exige testes próprios de comportamento assíncrono antes de produção.

### Abstração

A camada de domínio usa adapter de payment provider.

Objetos do SDK Stripe não devem vazar como modelo central do produto.

## 9. Accounting — QuickBooks Online

Usar **QuickBooks Online Accounting API** atrás de adapter próprio.

### Autoridade

O SaaS permanece fonte de verdade operacional.

QuickBooks é autoridade do estado contábil provider-side para objetos sincronizados.

### Entidades iniciais

- Customer;
- Invoice;
- Payment;
- Item/Service mappings necessários às linhas de Invoice.

### Integration mapping

Cada objeto sincronizado precisa de mapeamento persistente contendo, no mínimo:

- tenant/workspace;
- conexão do provider;
- entidade/tipo interno;
- ID interno;
- tipo/ID QBO;
- SyncToken relevante;
- status de sync;
- timestamp de último sucesso;
- último erro seguro, quando aplicável.

### Concorrência

QBO `SyncToken` é obrigatório nas atualizações que o utilizam.

Ao detectar stale token:

1. refetch;
2. reconciliar;
3. expor conflito quando necessário;
4. nunca sobrescrever cegamente estado mais novo.

### Webhooks

Webhook QBO é change hint.

Fluxo:

```text
raw body
→ verificar assinatura
→ identificar conexão/tenant
→ deduplicar
→ enfileirar reconciliação
→ refetch no QBO
→ reconciliar mapping/estado
```

Chamadas externas QBO não devem permanecer dentro de transações PostgreSQL abertas.

Falha do QBO não deve bloquear CRM/Jobs/operação principal.

## 10. Email — Resend

### Estado atual

Resend permanece **provisório**, porque o POC-10 ainda não fechou todo o gate.

Comprovado:

- envio;
- recebimento em endereço gerenciado pelo Resend;
- leitura da mensagem recebida pela API;
- detecção/consulta de anexos;
- contrato local de validação de webhook;
- assinatura, tamper rejection, replay window e deduplicação testados localmente.

Pendente:

- endpoint HTTPS público do novo SaaS;
- webhook real entregue pelo Resend ao endpoint;
- prova provider-side de assinatura e correlação de `email.received`.

### Regra arquitetural até fechamento do POC

Não promover Resend para decisão definitiva de inbound/webhook enquanto o gate externo estiver pendente.

Qualquer implementação deve:

- tratar inbound email como input não confiável;
- verificar assinatura antes de processar conteúdo;
- usar raw body;
- aplicar replay protection;
- deduplicar eventos;
- usar allowlist estrita durante o POC;
- manter chaves e signing secrets fora do Git.

### SMS

SMS/Twilio está fora do escopo atual.

A existência da branch histórica de POC-09 não autoriza:

- envio/recebimento SMS;
- A2P/10DLC;
- sender pool;
- delivery callback;
- webhook Twilio;
- credenciais Twilio no runtime.

Retorno futuro de SMS exige nova decisão explícita e novo POC.

## 11. Mobile

Usar:

- **React Native**;
- **Expo SDK 57 stable line**;
- **Expo Router**;
- módulos Expo para capacidades nativas validadas.

O app fica em:

`apps/mobile`

### Capacidades validadas

- file-based routing;
- deep-link-compatible routes;
- câmera;
- captura de foto;
- acesso a arquivo local;
- fluxo de upload HTTPS;
- bundle Android;
- bundle iOS.

### Regras

- não colocar secrets em `EXPO_PUBLIC_*`;
- upload real deve receber autorização/signed URL do backend;
- servidor valida tipo/tamanho do arquivo;
- MIME/filename enviados pelo cliente não são fronteira de segurança;
- `ios/` e `android/` não são commitados por padrão;
- usar geração/prebuild quando necessário.

Ainda ficam para a etapa de distribuição:

- Apple Developer;
- Google Play Console;
- signing;
- bundle identifiers definitivos;
- Universal Links/App Links de produção;
- testes físicos finais.

## 12. Observabilidade

Usar:

- **OpenTelemetry** para tracing e propagação;
- **W3C Trace Context** entre processos/mensagens;
- logs estruturados com `trace_id` e `span_id`;
- **Sentry** como backend inicial de Error Monitoring + Tracing.

### Evidência validada

Fluxo E2E:

`API → queue → worker → provider`

Foi comprovado:

- um trace compartilhado;
- propagação de contexto;
- parent/child spans;
- exception event;
- error span;
- correlação de logs;
- redaction de secrets;
- ingestão real de erro no Sentry;
- tracing habilitado no SDK;
- DSN armazenado fora do Git.

### Produtos Sentry aprovados

- Error Monitoring;
- Tracing.

Não aprovados implicitamente:

- Sentry Logs;
- Profiling;
- Application Metrics.

### Logs

O contrato de aplicação é log estruturado correlacionado.

A arquitetura não exige o OpenTelemetry Logs SDK neste momento.

### Segurança

Não registrar por padrão:

- Authorization;
- cookies;
- passwords;
- API keys;
- secrets;
- access/refresh tokens;
- request/response bodies completos;
- PII sem política explícita.

## 13. Segurança transversal

As decisões dos POCs estabelecem estas regras mínimas:

1. PostgreSQL é autoritativo para estado de negócio.
2. Tenant isolation não depende do navegador.
3. RLS é defesa em profundidade e deve ser testável.
4. Secrets nunca entram no Git.
5. Raw webhook body deve ser preservado onde a assinatura exigir.
6. Webhooks precisam de assinatura, dedupe e replay protection quando aplicável.
7. Side effects externos precisam de idempotência.
8. Queue, Realtime e webhooks não substituem persistência de negócio.
9. Provider-side state deve ser reconsultado/reconciliado quando for a autoridade.
10. Logs e traces não podem ser usados como depósito de payload sensível.
11. Ambientes Sandbox/Development e Production devem permanecer separados.
12. Credenciais de pagamento/accounting ficam exclusivamente server-side.

## 14. Fronteiras entre camadas

A direção arquitetural consolidada é:

```text
Web / Mobile
    ↓
contratos de aplicação
    ↓
API / casos de uso
    ↓
domínio
    ↓
adapters / infraestrutura
    ├── PostgreSQL / Supabase
    ├── BullMQ / Valkey
    ├── Supabase Realtime
    ├── Stripe
    ├── QuickBooks
    ├── Resend (provisório)
    └── Sentry / OpenTelemetry
```

Regras:

- integração externa fica atrás de adapter;
- domínio não expõe objetos SDK de provider;
- business rules não pertencem a páginas/componentes;
- jobs assíncronos recebem contexto mínimo e IDs;
- componentes não são autoridade de autorização;
- Mobile/Web compartilham contratos quando útil, não detalhes internos de UI.

## 15. Decisões ainda abertas

Este documento não deve esconder o que os POCs não provaram.

### 15.1 POC-10 — Resend

O webhook externo real permanece pendente.

**Decisão do proprietário em 2026-09-25:** esta pendência está **deferida e não bloqueia** o avanço das demais decisões arquiteturais. Até o teste ser retomado, Resend continua não aprovado para o fluxo inbound/webhook definitivo.

### 15.2 Web framework definitivo

O POC-04 validou a existência de `apps/web`, mas não validou por si só um framework Web de produção.

Uma decisão de framework deve vir de evidência/documento específico, não do comentário de placeholder do monorepo.

### 15.3 API framework definitivo

O POC-04 validou a existência de `apps/api`, mas não aprovou por si só NestJS/Fastify ou qualquer alternativa.

### 15.4 Deployment topology definitiva

Os POCs validaram capacidades técnicas e alguns serviços externos, mas não congelaram sozinhos:

- provedor final de hosting de cada app;
- quantidade de ambientes;
- domínios finais;
- sizing;
- autoscaling;
- budgets;
- backup/restore de produção.

Esses itens precisam de decisão própria antes de produção.

### 15.5 Branding / package scope

A marca final do SaaS não está definida.

Identificadores históricos presentes nos POCs não devem ser propagados para novos packages, apps, domínios, namespaces ou documentação.

## 16. O que entra na implementação definitiva

### Adotar

- Drizzle + Drizzle Kit;
- PostgreSQL/Supabase;
- política de pooling validada;
- Tailwind 4 + semantic tokens;
- pnpm + Turborepo;
- BullMQ + Valkey/Redis-compatible;
- Supabase Realtime Broadcast privado;
- Stripe Connect Direct Charges;
- QBO accounting adapter;
- Expo Mobile;
- OpenTelemetry;
- Sentry Error Monitoring + Tracing.

### Adotar somente após gate pendente

- Resend inbound/webhooks.

### Não adotar no escopo atual

- SMS/Twilio.

## 17. Regra de promoção dos POCs

POC não é production code.

Antes da implementação real:

1. escolher o domínio/app responsável;
2. criar contrato de produção;
3. aplicar naming neutro enquanto a marca estiver indefinida;
4. mover apenas a decisão e o comportamento necessário;
5. reimplementar com testes do produto;
6. aplicar segurança/observabilidade desde o início;
7. usar secrets do ambiente, nunca valores do POC;
8. não transportar fixtures ou IDs de sandbox para produção;
9. preservar branches de POC como evidência histórica;
10. registrar qualquer mudança de decisão em ADR novo, sem reescrever silenciosamente o POC histórico.

## 18. Fontes de evidência no Git

| Tema | Branch | Documento principal |
| --- | --- | --- |
| ORM | `poc/01-orm-query-layer` | `docs/poc/POC-01.md` |
| Pooling | `poc/02-supabase-pooling` | `docs/poc/POC-02.md` |
| Design System | `poc/03-design-system-code` | `docs/poc/POC-03.md` |
| Monorepo | `poc/04-monorepo-foundation` | `docs/poc/POC-04.md` |
| Background Jobs | `poc/05-bullmq-valkey` | `docs/poc/POC-05.md` |
| Realtime | `poc/06-supabase-realtime` | `docs/poc/POC-06.md` |
| Stripe | `poc/07-stripe-connect` | `docs/poc/POC-07.md` |
| QuickBooks | `poc/08-quickbooks-online` | `docs/poc/POC-08.md` |
| SMS | `poc/09-twilio-messaging` | histórico; fora do escopo atual |
| Email | `poc/10-resend-email` | `docs/poc/POC-10.md` |
| Mobile | `poc/11-expo-mobile` | `docs/poc/POC-11.md` |
| Observabilidade | `poc/12-observability-e2e` | `docs/poc/POC-12.md` |

## 19. Autoridade deste documento

Este arquivo é a visão consolidada das decisões técnicas provenientes dos POCs.

Em caso de dúvida:

1. este documento define o baseline integrado;
2. a ADR específica define o detalhe da decisão aceita;
3. o POC correspondente contém a evidência experimental;
4. qualquer alteração futura exige nova decisão explícita e atualização desta arquitetura.

Este documento não substitui o histórico dos POCs e ADRs; ele os consolida para orientar a implementação real.
