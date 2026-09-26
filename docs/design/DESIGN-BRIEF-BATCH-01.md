# Briefing de design — Leva 01 (high-fidelity)

| Campo | Definição |
|---|---|
| Versão | 1.0 |
| Data | 2026-09-26 |
| Produto | CrewCommand (marca provisória) |
| Etapa | High-fidelity sobre low-fi já existente |
| Telas nesta leva | 14 |
| Idiomas do produto | `en-US` e `es-US`, ambos completos |

---

## Como usar este documento

Ele **reúne** o que já está aprovado e espalhado em outros arquivos. Ele **não decide nada
novo**. Onde ele e um documento oficial divergirem, o documento oficial vence, e a
divergência deve ser reportada.

Ordem de autoridade (`AGENTS.md` §3):

1. `docs/source-of-truth/CURRENT-DECISIONS.md`
2. `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
3. `docs/architecture/TECHNICAL-ARCHITECTURE.md`
4. ADRs Accepted
5. `docs/source-of-truth/canonical/02-TRD-OFICIAL.md`
6. `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md` ← **comportamento das telas**
7. `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md`
8. `docs/source-of-truth/canonical/04-UI-UX-DESIGN.md` ← **aparência e componentes**
9. `docs/source-of-truth/canonical/01-PRD.md`

**Regra que não se quebra:** nada pode ser inventado. Se faltar informação para desenhar
uma tela, pare e registre a pergunta em vez de escolher. Isso vale para campo, estado,
mensagem, permissão, regra de negócio e nomenclatura.

---

## 1. Ponto de partida — o low-fi já existe

**Não se começa do zero.** O catálogo low-fidelity cobre **as 91 telas da V1**, 100% de
cobertura, verificado por contagem de Screen ID contra o App Flow §16.1.

```
docs/reference/wireframes/historical/2026-09-25/CrewCommand Telas Completas.dc.html
```

Isso cumpre a etapa low-fi exigida pelo UI/UX §8.1. **O trabalho desta leva é o
high-fidelity**: aplicar o Design System sobre a estrutura já validada.

### O que descartar do catálogo antes de usar

| O quê | Quanto | Por quê |
|---|---|---|
| As 25 telas adiadas | 25 telas | Fora da V1 pelo App Flow §16.2. Estão desenhadas ali, **ignorar** |
| SMS e Twilio | 15 menções | Revogado — `AGENTS.md` §4 |
| Chat interno / Inbox | 14 menções | Revogado — UI/UX §A8 |
| Automações | 4 menções | Fora da V1 |
| Financing | 7 menções | Fora da V1 |

O catálogo é **anterior ao App Flow v2.0**. Nome de papel, estrutura do dashboard e acesso
ao portal podem estar desatualizados ali. **O App Flow v2.0 vence sempre.**

### Telas que NÃO se desenha

`SCR-INB-001` a `004` · `SCR-TASK-001` a `003` · `SCR-AUT-001` a `004` · `SCR-DASH-002` a
`005` · `SCR-SA-003` a `007` · `SCR-SET-008` · `SCR-SET-013` · `SCR-FIN-008` ·
`SCR-JOB-011` · `SCR-REP-002`

Também fora do escopo visual: Dark Mode completo, Offline Sync e Time Tracking/Clock
In-Out (UI/UX §A10 e §11). Apenas o **estado de conexão perdida** é desenhado.

---

## 2. As 14 telas desta leva

Origem da lista: UI/UX §8.1, com o Inbox removido por estar fora da V1.

| # | Tela | Screen ID | Comportamento descrito em | Superfície |
|---|---|---|---|---|
| 1 | Login / Trial / Onboarding | `SCR-AUTH-001` a `006` · `SCR-ONB-001`, `002` | App Flow §3 | Desktop |
| 2 | Dashboard | `SCR-DASH-001` | App Flow §4 | Desktop |
| 3 | Lista de CRM | `SCR-CRM-001` | App Flow §5 | Desktop |
| 4 | Detalhe do Cliente | `SCR-CRM-003` | App Flow §5 | Desktop |
| 5 | Pipeline de Vendas | `SCR-SALES-001` | App Flow §6 | Desktop |
| 6 | Editor de Orçamento | `SCR-SALES-004` | App Flow §6.1 | Desktop |
| 7 | Kanban de Projetos | `SCR-JOB-001` | App Flow §7 | Desktop |
| 8 | Detalhe do Projeto | `SCR-JOB-003` | App Flow §7 | Desktop |
| 9 | Detalhe do Serviço | `SCR-JOB-005` | App Flow §7 | Desktop |
| 10 | Agenda | `SCR-SCH-001` | App Flow §8.1 | Desktop |
| 11 | Diário de Obra (campo) | `SCR-FIELD-003` | App Flow §9 | **Mobile-first** |
| 12 | Client Portal | `SCR-PORT-002` (Home) | App Flow §11 | **Mobile-first** |
| 13 | Financeiro | `SCR-FIN-001` | App Flow §12 | Desktop |
| 14 | Configurações | `SCR-SET-001` | App Flow §14 | Desktop |

### Detalhamento dos IDs de autenticação

O App Flow §3 agrupa os IDs sem rotular um a um. A atribuição abaixo vem do
`EPIC-01-SLICE-02-TASK-PACKET.md` (aprovado) e é corroborada pelo catálogo low-fi:

| ID | Tela | Fonte da atribuição |
|---|---|---|
| `SCR-AUTH-001` | Login | App Flow §3.3 + Task Packet Slice 01 |
| `SCR-AUTH-002` | Cadastro / Trial | App Flow §3.1 (grupo) + low-fi |
| `SCR-AUTH-003` | Verificação de e-mail | App Flow §3.1 (grupo) + low-fi |
| `SCR-AUTH-004` | Escolha de plano | App Flow §3.1 (grupo) + low-fi |
| `SCR-AUTH-005` | Escolha de Workspace | Task Packet Slice 02 |
| `SCR-AUTH-006` | Recuperar senha | Task Packet Slice 02 |

A definição de nova senha **não tem ID próprio** — é estado do fluxo de `SCR-AUTH-006`.

`SCR-AUTH-007` e `008` (trial expirado, conta suspensa) pertencem ao Epic 4 e **não entram
nesta leva**.

> **Atenção ao A9 do UI/UX:** `SCR-JOB-DETAIL-001` **não existe**. O detalhe do Job é
> `SCR-JOB-003`. Screen IDs válidos são exclusivamente os do App Flow §16.

---

## 3. Marca

**CrewCommand**, provisória. Arquivos e regra completa em `apps/web/public/brand/README.md`.

| Fundo | Arquivo |
|---|---|
| Sidebar escura (`#0F172A`) | `logo-horizontal-on-dark.webp` |
| Branco puro (`#FFFFFF`) | `logo-horizontal-on-white.webp` |
| Qualquer / espaço pequeno / favicon | `logo-mark.png` |

🔴 **Pendência que afeta o desenho.** Não existe logo horizontal com fundo transparente e
"Crew" escuro. Como o fundo das telas é `#F8FAFC` e não branco puro, **não há logo
utilizável em `SCR-AUTH-001`, `SCR-AUTH-006` e no Client Portal**. Enquanto não chegar,
desenhar essas telas com `logo-mark.png`.

⚠️ **O azul do logo (≈`#0070F8`) não é o azul da interface (`#2563EB`).** É intencional: o
azul do logo reprova o contraste mínimo WCAG de 4,5:1. **Não usar a cor do logo em botão,
link ou foco.**

---

## 4. Fundamentos

Fonte: UI/UX §2. Reproduzido aqui na íntegra para não obrigar ida e volta.

### 4.1 Cores da interface

| Token | Uso | Hex |
|---|---|---|
| `brand-primary` | Ações principais, links e foco | `#2563EB` |
| `brand-primary-hover` | Hover / pressionado | `#1D4ED8` |
| `brand-primary-soft` | Seleções e fundos suaves | `#DBEAFE` |
| `brand-primary-subtle` | Fundos muito leves | `#EFF6FF` |
| `nav-bg` | Sidebar | `#0F172A` |
| `nav-hover` | Hover na Sidebar | `#1E293B` |
| `nav-active-bg` | Item ativo na Sidebar | `#1E3A5F` |
| `nav-text` | Texto principal da Sidebar | `#F8FAFC` |
| `nav-text-muted` | Texto secundário da Sidebar | `#94A3B8` |
| `page-bg` | Fundo da aplicação | `#F8FAFC` |
| `surface-primary` | Cards e painéis | `#FFFFFF` |
| `surface-secondary` | Seções secundárias | `#F1F5F9` |
| `border-default` | Bordas e divisores | `#E2E8F0` |
| `text-primary` | Texto principal | `#0F172A` |
| `text-secondary` | Texto secundário | `#475569` |
| `text-muted` | Helper / apagado | `#64748B` |
| `text-disabled` | Desabilitado | `#94A3B8` |

### 4.2 Cores de status operacional

| Token | Status | Fundo | Texto |
|---|---|---|---|
| `status-new` | New | `#F3F4F6` | `#4B5563` |
| `status-scheduled` | Scheduled | `#DBEAFE` | `#1D4ED8` |
| `status-in-progress` | In Progress | `#DCFCE7` | `#15803D` |
| `status-waiting` | Waiting | `#FEF3C7` | `#B45309` |
| `status-completed` | Completed | `#BBF7D0` | `#166534` |
| `status-delayed` | Delayed | `#FEE2E2` | `#B91C1C` |

Critical usa vermelho · Warning usa amber/laranja · Info usa azul · Success usa verde.

**Status é sempre cor + texto.** Nunca comunicar estado apenas por cor.

### 4.3 Tipografia

Fonte do produto: **Inter**. Pesos 400 / 500 / 600 / 700. Evitar 300 e 800/900.

| Elemento | Tamanho |
|---|---|
| Display | 32px |
| Page Title | 28px |
| Section Title | 20px |
| Card Title | 16px |
| Body | 14px |
| Label | 13px |
| Helper Text | 12px |

⚠️ Rótulos em espanhol costumam ser **15% a 30% mais longos** que em inglês (ADR-023).
Nenhum componente pode depender de largura fixa para caber o texto.

### 4.4 Espaçamento, grid, raio e movimento

| Categoria | Padrão |
|---|---|
| Escala de espaçamento | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 px |
| Grid | Desktop 12 colunas · Tablet 8 · Mobile 4 |
| Gutters | Desktop 24px · Tablet 20px · Mobile 16px |
| Margem mínima no mobile | 16px |
| Raio — inputs e botões | 8px |
| Raio — cards, drawers, modais | 12px |
| Raio — pills e badges | totalmente arredondado quando couber semanticamente |
| Microinterações | ~150ms |
| Drawer e modal | ~200–250ms |
| Transições maiores | até ~300ms |

Sombras sutis. Cards normais quase planos. **Elevação é reservada** a dropdown, modal,
drawer, menu flutuante e drag & drop. Respeitar Reduced Motion.

### 4.5 Breakpoints

| Faixa | Uso |
|---|---|
| 0–639px | Mobile |
| 640–1023px | Tablet |
| 1024–1439px | Desktop |
| 1440px+ | Large Desktop |

Administrativo é desktop-first. Crew (PWA de campo) e Client Portal são mobile-first.
Tablet vira experiência própria quando o comportamento muda de verdade.

---

## 5. A moldura do sistema

| Elemento | Regra |
|---|---|
| Sidebar expandida | 256px |
| Sidebar recolhida | 72px |
| Topbar | 64px |
| Área principal | Fundo `#F8FAFC`, conteúdo em surfaces brancas |
| Preferências lembradas | Estado expandido/recolhido e última Location/Workspace |

Topbar carrega busca global, notificações, ajuda e perfil. "+ Novo" mostra **somente**
ações permitidas ao papel. Navegação de três níveis é evitada — submódulo usa aba interna.
Bottom navigation no mobile tem **no máximo cinco itens**. Drawer de desktop vira tela
cheia no mobile.

### Navegação por papel

| Papel | Navegação | Superfície |
|---|---|---|
| Owner | Dashboard, CRM, Sales, Jobs, Schedule, Team, Purchases, Financial, Reports, Settings | Desktop |
| Admin | Igual ao Owner, limitado ao que o Owner liberar | Desktop |
| Salesperson | Dashboard, CRM, Sales, Schedule | Desktop + tablet + PWA |
| Supervisor | Dashboard, Jobs, Schedule, Team, Purchases, Approvals | Desktop + tablet |
| Crew | Today, Jobs, Notifications, More | **PWA, mobile-first** |
| Accounting | Dashboard, Financial, Purchases, Reports | Desktop |
| Client | Portal: Início, Projetos, Documentos, Financeiro, Mais | Mobile-first |

---

## 6. Peças do Design System

### 6.1 Genéricas — 24

Button · Input · Combobox · Tag/Badge · Advanced Table · Filter Bar · Cards · Kanban ·
Tabs · Drawer · Modal · Toast · Date/Time Picker · File Upload · Gallery · Calendar Event ·
Progress · Stepper · Empty State · Skeleton · Tooltip/Popover · Avatar · Charts

O contrato de UX de cada uma está no UI/UX §4 e deve ser seguido literalmente. Exemplos:
Button tem Primary, Secondary, Tertiary/Ghost e Destructive, em 32/40/48px, com loading e
icon-only acessível. Modal é para decisão e confirmação, **nunca** para formulário longo.
Badge é estado, Tag é classificação.

### 6.2 Próprias do produto — 14

Job Card · Service Card · Estimate Card · Crew Capacity Indicator · Schedule Conflict
Alert · Stair-Step Preview · Daily Log Composer · Change Order Request · Material Request ·
Needs Attention Item · Approval Item · Financial Balance Summary · Property Selector ·
Activity Timeline

> **Regra de consistência (UI/UX §4).** Nenhuma tela cria novo estilo de botão, input,
> card, tabela ou modal sem antes verificar se o Design System já tem peça adequada.

---

## 7. Estados obrigatórios

Fonte: UI/UX §8.2. Toda tela importante documenta os que se aplicam.

| Categoria | Estados |
|---|---|
| **Toda tela** | Default · Loading · Empty · Error · Permission Denied · Read-only · Plan Limit |
| **Formulários** | Validation Error · Unsaved Changes · Saving · Saved |
| **Integrações** | Connected · Disconnected · Error · Reauthorization Required |

Variantes Desktop/Tablet/Mobile só são desenhadas **quando o comportamento realmente muda**.

Obrigatórios também, pelo App Flow §1: confirmação de ação destrutiva, e falha de conexão
explícita que **nunca sugere que salvou** (não existe Offline Mode na V1).

---

## 8. Regras de produto que mudam o desenho

Estas não são preferência visual. São regras do App Flow §1 e valem em toda tela.

1. **Valor financeiro desaparece por completo** para quem não tem permissão financeira.
   Não borrado, não zerado, não "———". **Ausente.**
2. **Nunca comunicar estado apenas por cor.** Sempre cor + texto, e ícone quando couber.
3. **Deep link revalida permissão** antes de abrir o registro.
4. Ao voltar para uma lista, **filtros, ordenação e posição de rolagem são preservados**.
5. O seletor de Location aparece para quem tem mais de uma. "All Locations" consolida
   **apenas** as Locations do usuário.
6. **Cabeçalho do Job não exibe o valor do contrato** (App Flow §7).
7. **Crew não vê valor financeiro em nenhum lugar** do campo (App Flow §9).
8. No Portal, **nunca expor**: capacidade de crew, notas internas, comissões, custo de
   material, dados de Crew parceira, nem nada não marcado como customer-visible
   (App Flow §11.2).
9. **Progresso no Portal fica oculto por padrão.** Quando liberado, sem expor pesos internos.
10. O Portal tem a **identidade visual da empresa prestadora**, não a da plataforma.
11. Acessibilidade básica é gate, não bônus: teclado, labels, contraste, área de toque.

---

## 9. Estrutura do Figma

Fonte: UI/UX §8.4. Obrigatória.

| Página | Conteúdo |
|---|---|
| 00 — Foundations | Cores, tipografia, spacing, grid, radius, shadow, motion, breakpoints |
| 01 — Components | Componentes reutilizáveis e variantes |
| 02 — Patterns | Filtros, tabelas, drawers, forms, empty/error states, interactions |
| 03 — Desktop | Telas administrativas desktop |
| 04 — Tablet | Variantes tablet quando necessárias |
| 05 — Mobile / Field | Crew e Salesperson no mobile |
| 06 — Client Portal | Desktop e mobile do portal |
| 07 — Prototypes | Fluxos clicáveis críticos |

**Figma Variables** para cores, spacing, radius e demais tokens. Nomes semânticos
(`color-bg-primary`, `color-text-muted`, `color-status-success`). Os tokens já devem
permitir Dark Mode futuro **sem redesenhar componente** — mas Dark Mode **não se desenha
agora**.

### Protótipos críticos

Os fluxos do App Flow §15 são os candidatos naturais: F-01 Lead → Customer, F-02 Estimate
→ Job, F-05 Execução em campo, F-07 Invoice → Pagamento.

---

## 10. Régua de entrega

Uma tela só é considerada pronta quando cumpre **todos** os itens. Fonte: UI/UX §10.

- [ ] Fluxo aprovado
- [ ] Layout final
- [ ] Estados relevantes documentados
- [ ] Responsividade definida
- [ ] Componentes definidos
- [ ] Permissões e visibilidade definidas
- [ ] Conteúdo/microcopy definido
- [ ] Interações e edge cases anotados
- [ ] Screen ID e rastreabilidade presentes
- [ ] Design Review concluído

### Design Review — o que se verifica (§10.1)

Fluxo e consistência com o App Flow · consistência com o Design System · permissões e
escopos por Role/Location/Workspace · responsividade · estados e edge cases ·
acessibilidade básica (teclado, labels, contraste, área de toque, não depender só de cor).

### Sobre o item "microcopy definido"

O texto das telas é produzido **fora do design**, pelo Product Owner com o ChatGPT, em
`en-US` e `es-US` (decisão de 2026-09-26). O designer **não escreve o texto final** e não
deve inventá-lo.

Para não travar o desenho, usar texto de posicionamento e **marcar cada um com a chave
semântica** correspondente. O layout precisa aguentar a versão em espanhol, que é mais
longa.

---

## 11. Pendências abertas que afetam esta leva

| Pendência | Impacto no desenho | Quem resolve |
|---|---|---|
| **Logo horizontal com fundo transparente e "Crew" escuro** | Bloqueia o logo em `SCR-AUTH-001`, `SCR-AUTH-006` e Portal | Product Owner |
| **Microcopy `en-US` / `es-US`** | Impede fechar o item "microcopy definido" da régua | Product Owner + ChatGPT |
| **Valores e limites dos planos** | Números em aberto. Afeta `SCR-AUTH-004` (escolha de plano) e `SCR-SET-012` | Product Owner |
| **Extensão da UI de multi-location** | Alcance do seletor de Location na V1 está em aberto | Product Owner |
| **Período de exportação e retenção** | Motivo de `SCR-SET-013` estar adiada. Não afeta esta leva | Product Owner |

As três últimas estão na lista autoritativa de `CURRENT-DECISIONS.md` §Decisões em aberto.
**Nenhuma delas pode ser resolvida por inferência** — `AGENTS.md` §1 exige parar e
registrar `BLOCKED — DOCUMENTATION DECISION REQUIRED`.

---

## 12. Ordem sugerida

Do UI/UX §11, cortado no escopo desta leva:

1. Foundations
2. Shell
3. Dashboard
4. CRM
5. Job
6. Schedule
7. Sales / Estimate
8. Field Mobile
9. Client Portal
10. Financial

Foundations e Shell primeiro não é preferência: todas as outras telas dependem deles.

---

## 13. Princípios que decidem empate

> "Nenhuma decisão visual deve tornar o produto mais difícil de usar apenas para fazê-lo
> parecer mais sofisticado."

> "Consistência, clareza e velocidade operacional têm prioridade sobre decoração."

> "Desktop, tablet, mobile de campo e Client Portal pertencem ao mesmo produto, mas cada
> experiência deve respeitar o contexto real de uso."

> "O Client Portal deve permitir que o cliente encontre rapidamente o que precisa aprovar,
> pagar, acompanhar ou baixar, sem precisar entender a estrutura interna do produto."

> "A experiência do cliente deve parecer uma extensão digital da empresa prestadora do
> serviço, e não um painel administrativo da plataforma."
