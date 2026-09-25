**CREWCOMMAND**

**UI/UX DESIGN DOCUMENT**

Design System, navegação, layouts, mobile, Client Portal e handoff

| **Versão**            | 1.0                                                                      |
|-----------------------|--------------------------------------------------------------------------|
| **Status**            | Aprovado — Discovery UI/UX concluído                                     |
| **Mercado primário**  | Estados Unidos                                                           |
| **Base de decisão**   | PRD + App Flow Oficial + Backend Domain Model + 8 blocos UI/UX aprovados |
| **Próximo documento** | TRD — Technical Requirements Document                                    |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Princípio-mestre<br />
</strong>Consistência, clareza e velocidade operacional têm prioridade sobre decoração. Nenhuma decisão visual deve tornar o CrewCommand mais difícil de usar apenas para fazê-lo parecer mais sofisticado.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Sumário executivo

1.  Direção visual e princípios de experiência

2.  Design System base e tokens

3.  Shell principal e navegação global

4.  Biblioteca de componentes

5.  Layouts das telas principais

6.  Mobile, Tablet e Field Experience

7.  Client Portal e estados globais

8.  Wireframes, responsividade, Figma e handoff

9.  Definition of Ready e próxima etapa

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Status de aprovação<br />
</strong>Os 8 blocos de descoberta UI/UX foram aprovados integralmente. Este documento converte as respostas em regras oficiais de produto e substitui o formato de questionário.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Direção visual e princípios de experiência

- Direção visual: moderna e tecnológica, porém simples e amigável.

- Prioridades de percepção: Controle + Organização + Facilidade.

- Mercado de referência: empresas de serviços nos Estados Unidos.

- Jobber é referência funcional, nunca referência para cópia de identidade visual.

- Desktop administrativo: densidade equilibrada, com mais informação simultânea.

- Mobile/Field: touch-first, botões maiores, menor densidade, ações essenciais sempre próximas.

- Estrutura visual: Sidebar escura + Topbar clara + conteúdo em superfícies brancas sobre fundo Cool White.

- Light Mode na V1; Design Tokens preparados para futuro Dark Mode.

- Cards para resumo/operacional; tabelas para dados volumosos; Drawers para consulta rápida; páginas completas para trabalho profundo.

- Uma ação primária dominante por tela; ações secundárias entram em menus ou padrões discretos.

- Vermelho reservado a erro, atraso crítico e ação destrutiva. Status nunca dependem apenas da cor.

- Animações são curtas, funcionais e nunca decorativas.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Regra oficial mobile<br />
</strong>A experiência Field do CrewCommand deve ser possível de operar rapidamente com uma mão, com ações principais sempre próximas, textos objetivos e mínimo de navegação desnecessária.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 2. Design System base e tokens

## 2.1 Paleta principal

| **Token**            | **Uso**                        | **Hex**  | **Amostra** | **Observação**     |
|----------------------|--------------------------------|----------|-------------|--------------------|
| brand-primary        | Ações principais, links e foco | \#2563EB |             | Command Blue       |
| brand-primary-hover  | Hover/pressed                  | \#1D4ED8 |             | Azul mais profundo |
| brand-primary-soft   | Seleções e fundos suaves       | \#DBEAFE |             | Blue 100           |
| brand-primary-subtle | Fundos muito leves             | \#EFF6FF |             | Blue 50            |
| nav-bg               | Sidebar                        | \#0F172A |             | Midnight Navy      |
| nav-hover            | Hover na Sidebar               | \#1E293B |             | Slate Navy         |
| nav-active-bg        | Item ativo na Sidebar          | \#1E3A5F |             | Navy azulado       |
| nav-text             | Texto principal Sidebar        | \#F8FAFC |             | Alto contraste     |
| nav-text-muted       | Texto secundário Sidebar       | \#94A3B8 |             | Muted              |
| page-bg              | Fundo da aplicação             | \#F8FAFC |             | Cool White         |
| surface-primary      | Cards / painéis                | \#FFFFFF |             | White              |
| surface-secondary    | Seções secundárias             | \#F1F5F9 |             | Slate 100          |
| border-default       | Bordas e divisores             | \#E2E8F0 |             | Slate 200          |
| text-primary         | Texto principal                | \#0F172A |             | Slate 900          |
| text-secondary       | Texto secundário               | \#475569 |             | Slate 600          |
| text-muted           | Helper/muted                   | \#64748B |             | Slate 500          |
| text-disabled        | Desabilitado                   | \#94A3B8 |             | Slate 400          |

## 2.2 Status operacionais

| **Token**          | **Uso**     | **Hex**  | **Amostra** | **Observação** |
|--------------------|-------------|----------|-------------|----------------|
| status-new         | New         | \#F3F4F6 |             | Texto \#4B5563 |
| status-scheduled   | Scheduled   | \#DBEAFE |             | Texto \#1D4ED8 |
| status-in-progress | In Progress | \#DCFCE7 |             | Texto \#15803D |
| status-waiting     | Waiting     | \#FEF3C7 |             | Texto \#B45309 |
| status-completed   | Completed   | \#BBF7D0 |             | Texto \#166534 |
| status-delayed     | Delayed     | \#FEE2E2 |             | Texto \#B91C1C |

- Critical usa vermelho; Warning usa amber/laranja; Info usa azul; Success usa verde.

- Sempre usar cor + texto e, quando apropriado, ícone. Nunca comunicar estado apenas por cor.

- Tags personalizadas podem usar cores da empresa, porém dentro de uma paleta limitada e acessível.

## 2.3 Tipografia

| **Elemento**     | **Especificação**                                  |
|------------------|----------------------------------------------------|
| Fonte do produto | Inter                                              |
| Pesos            | 400 Regular / 500 Medium / 600 Semibold / 700 Bold |
| Display          | 32px                                               |
| Page Title       | 28px                                               |
| Section Title    | 20px                                               |
| Card Title       | 16px                                               |
| Body             | 14px                                               |
| Label            | 13px                                               |
| Helper Text      | 12px                                               |

- Evitar pesos 300 e 800/900 na interface operacional.

- Textos em inglês, espanhol e PT-BR devem caber sem depender de larguras rígidas.

- Números e valores financeiros devem manter legibilidade em tabelas e cards.

## 2.4 Espaçamento, grid, radius e motion

| **Categoria**            | **Padrão aprovado**                                   |
|--------------------------|-------------------------------------------------------|
| Spacing scale            | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 px      |
| Grid                     | Desktop 12 colunas / Tablet 8 / Mobile 4              |
| Gutters                  | Desktop 24px / Tablet 20px / Mobile 16px              |
| Margem mínima mobile     | 16px                                                  |
| Inputs / Buttons         | 8px radius                                            |
| Cards / Drawers / Modals | 12px radius                                           |
| Pills / Badges           | Totalmente arredondado quando semanticamente adequado |
| Microinterações          | ~150ms                                                |
| Drawer / Modal           | ~200–250ms                                            |
| Transições maiores       | até ~300ms                                            |

- Sombras devem ser sutis; cards normais permanecem quase planos.

- Elevação é reservada a dropdowns, modais, drawers, menus flutuantes e drag & drop.

- Respeitar preferência Reduced Motion quando possível.

## 2.5 Breakpoints

| **Faixa**   | **Uso**       |
|-------------|---------------|
| 0–639px     | Mobile        |
| 640–1023px  | Tablet        |
| 1024–1439px | Desktop       |
| 1440px+     | Large Desktop |

- Administrativo é Desktop-first.

- Field Worker e Client Portal são Mobile-first.

- Tablet é tratado como experiência própria quando o comportamento muda significativamente.

- Componentes também devem reagir ao espaço real disponível, não apenas ao breakpoint global.

# 3. Shell principal e navegação global

## 3.1 Desktop Shell

| **Elemento**         | **Regra**                                              |
|----------------------|--------------------------------------------------------|
| Sidebar expandida    | 256px                                                  |
| Sidebar recolhida    | 72px                                                   |
| Topbar               | 64px                                                   |
| Área principal       | Fundo \#F8FAFC com conteúdo em surfaces brancas        |
| Lembrar preferências | Estado expandido/recolhido e última Location/Workspace |

- Sidebar: Dashboard → CRM → Sales → Jobs → Schedule → Tasks → Inbox → Team → Purchases → Financial → Reports.

- Settings e Help & Support ficam próximos ao rodapé da Sidebar.

- Evitar navegação com 3 níveis. Submódulos usam tabs internas ou navegação secundária.

- Item ativo usa fundo navy mais claro, ícone azul e texto branco; não usar faixa saturada em excesso.

- Badges aparecem somente quando existe algo pendente e relevante.

## 3.2 Topbar

- Controles principais: Workspace → Location → Global Search → + New → Notifications → Help → Profile.

- Workspace e Location são controles separados.

- Location Selector respeita “All Locations” ou uma filial específica e lembra última seleção.

- Mudança de Workspace/Location não pode descartar alterações não salvas silenciosamente.

- Global Search aceita atalho ⌘K / Ctrl+K e mostra resultados agrupados por entidade enquanto digita.

- Antes de digitar, a busca pode mostrar Recent Items. “View all results” abre página completa com filtros.

- \+ New mostra apenas ações permitidas pela Role; ações contextuais aparecem primeiro quando útil.

- Notifications abrem Drawer; Approvals continuam visíveis também no Command Center.

- Help abre Drawer com busca, conteúdo contextual e Contact Support.

- Profile: My Profile, Personal Settings, Switch Workspace, Language, Sign Out.

## 3.3 Navegação por Role no mobile

| **Role**        | **Navegação principal**                                                             |
|-----------------|-------------------------------------------------------------------------------------|
| Field Worker    | Hoje \| Projetos \| Chat \| Notificações \| Mais                                    |
| Salesperson     | Início \| Leads \| Agenda \| Tarefas \| Mais                                        |
| Project Manager | Experiência adaptada com maior densidade; Job/Approvals/Issues/Schedule em destaque |
| Client Portal   | Início \| Projetos \| Documentos \| Financeiro \| Mais                              |

- Bottom Navigation terá no máximo 5 itens principais.

- Mobile administrativo usa menu compacto; não replica a Sidebar desktop.

- Ações primárias críticas podem usar botão sticky inferior com moderação.

- Drawers do desktop viram tela cheia no mobile quando necessário.

# 4. Biblioteca de componentes

| **Componente**    | **Contrato de UX**                                                                                                       |
|-------------------|--------------------------------------------------------------------------------------------------------------------------|
| Button            | Primary, Secondary, Tertiary/Ghost, Destructive; 32/40/48px; loading e icon-only acessível.                              |
| Input             | Label acima, helper opcional, erro abaixo; estados default/hover/focus/filled/error/disabled/read-only.                  |
| Combobox          | Busca, recentes e criação contextual quando apropriado; usado para Customer/Job/Crew/Service.                            |
| Tag / Badge       | Badge = estado; Tag = classificação. Status sempre texto + cor.                                                          |
| Advanced Table    | Sort, filtros, resize, reorder, pin, show/hide, Saved Views, bulk actions, paginação, sticky header.                     |
| Filter Bar        | Filtros principais visíveis; demais em More Filters; filtros aplicados como chips com Clear All.                         |
| Cards             | KPI, Operational, Information, Attention; estados clicáveis claros.                                                      |
| Kanban            | Colunas com nome/contagem; drag & drop com elevação e highlight; dados adicionais solicitados antes de concluir mudança. |
| Tabs              | Indicador azul simples; contador opcional; overflow em More ou scroll conforme device.                                   |
| Drawer            | Header + conteúdo scrollável + footer fixo; confirmação ao fechar com mudanças não salvas.                               |
| Modal             | Usado para decisão/confirmação; nunca para formulários longos.                                                           |
| Toast             | Confirmação curta; erro crítico permanece visível fora do Toast.                                                         |
| Date/Time Picker  | Data única, range, data+hora, presets; locale-aware.                                                                     |
| File Upload       | Drag & Drop/Browse, múltiplos arquivos, thumbnails, progresso e erro por arquivo.                                        |
| Gallery           | Grid responsivo, filtros e lightbox com metadados.                                                                       |
| Calendar Event    | Cor como indicador/borda, não bloco saturado; detalhes extras via hover/click.                                           |
| Progress          | Barra + percentual; detalhamento opcional de cálculo.                                                                    |
| Stepper           | Onboarding, Import e setups; mostra posição, passos restantes e capacidade de voltar.                                    |
| Empty State       | Ícone discreto, título, explicação curta e CTA.                                                                          |
| Skeleton          | Loading de páginas/cards/tabelas.                                                                                        |
| Tooltip / Popover | Tooltip para explicação curta; Popover para interação pequena.                                                           |
| Avatar            | Foto ou iniciais; Crews usam ícone/iniciais próprias.                                                                    |
| Charts            | Line, Bar, Area e Donut apenas quando útil; sem 3D ou excesso de cores.                                                  |

## 4.1 Componentes próprios do CrewCommand

- Job Card

- Service Card

- Estimate Card

- Crew Capacity Indicator

- Schedule Conflict Alert

- Stair-Step Preview

- Daily Log Composer

- Change Order Request

- Material Request

- Needs Attention Item

- Approval Item

- Financial Balance Summary

- Property Selector

- Activity Timeline

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Regra de consistência<br />
</strong>Nenhuma tela deve criar um novo estilo de botão, input, card, tabela ou modal sem verificar primeiro se o Design System já possui um componente adequado.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 5. Layouts das telas principais

| **Tela / módulo**          | **Blueprint aprovado**                                                                                                                                                 |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Dashboard / Command Center | Banners → Command Center → KPIs → Jobs/Agenda do dia → Sales Summary → Financial Summary → Tasks → Recent Activity. Widgets personalizáveis.                           |
| CRM                        | Table/List como visão principal. Topo com busca, filtros, Saved Views, Import e + Novo Contato. Detail em página completa.                                             |
| Client Detail              | Header compacto + tabs. Desktop em 2 colunas: conteúdo principal e coluna lateral contextual.                                                                          |
| Property Detail            | Header com endereço/cliente; tabs Overview/Estimates/Jobs/Schedule/Photos/Documents/Activity; botão Abrir no mapa.                                                     |
| Sales                      | Pipeline/Kanban como padrão. Tabs Pipeline/Estimates/Appointments/Follow-ups. Filtros compactos no topo.                                                               |
| Estimate Editor            | Full Page. Coluna principal para conteúdo; painel financeiro sticky à direita no desktop. Preview obrigatório antes de enviar.                                         |
| Jobs                       | Kanban padrão com alternância Pipeline/List. Card padrão: Cliente, Property, Total Contract Value (se permitido), Status, Salesperson, Alerta.                         |
| Job Detail                 | Header denso sem valor do contrato. Tabs: Overview, Services, Schedule, Tasks, Financial, Change Orders, Materials, Daily Logs, Photos, Documents, Messages, Activity. |
| Job Overview               | Área principal: Summary/Progress/Services/Milestones/Next Actions. Lateral: Needs Attention/Project Team/Recent Activity.                                              |
| Service Detail             | Mantém breadcrumb/contexto do Job. Header com status, Crew/Team, datas e progresso. Tabs operacionais.                                                                 |
| Schedule                   | Máxima área útil; Week como padrão; toolbar completa. Evento abre Drawer. Conflito abre Modal maior. Escadinha usa Before → After.                                     |
| Tasks                      | Table/List com Saved Views. Task simples abre Drawer.                                                                                                                  |
| Inbox                      | Desktop em 3 painéis: lista/filtros, conversa, contexto. Customer e Internal separados. Mobile usa uma tela por vez.                                                   |
| Team                       | Tabs Users/Crews/Subcontractors/Availability. Crew Detail em página completa.                                                                                          |
| Purchases                  | Tabs Purchases/Purchase Orders/Vendors. Tabelas como base; Vendor Detail em página completa.                                                                           |
| Financial                  | Tabs Invoices/Payments/Accounts Receivable/Commissions/Financing. Resumo curto no topo.                                                                                |
| Reports                    | Home por categorias. Dentro: filtros → KPIs → gráfico → tabela → drill-down.                                                                                           |
| Settings                   | Navegação secundária vertical no desktop; menu/seletor em tablet/mobile.                                                                                               |
| Client Portal              | Shell mais simples, com identidade da empresa, navegação horizontal no desktop e Bottom Navigation no mobile.                                                          |
| Super Admin                | Shell separado e explicitamente identificado como CrewCommand Admin.                                                                                                   |

## 5.1 Regras de layout

- Listagens usam largura ampla; formulários e leitura usam largura controlada.

- Ação primária fica preferencialmente no canto superior direito no desktop.

- Ações destrutivas permanecem visualmente separadas da ação principal.

- Informação secundária é progressivamente revelada via Drawer, More, Tooltip ou expansão.

- Mobile prioriza ação atual; nunca é apenas desktop espremido.

- Sempre deixar clara a Property ativa quando houver múltiplas propriedades.

- Em Job/Service, manter contexto visível de Customer + Property + Job.

# 6. Mobile, Tablet e Field Experience

## 6.1 Field Worker

- Home padrão = Hoje.

- Cards grandes mostram horário, Service, Customer, Property/endereço e Status; sem financeiro.

- Ao abrir Service: header com Service + Status + Customer + Property; ações rápidas Ligar / Mensagem / Mapa.

- Se houver múltiplos Services do mesmo Job, mostrar “Serviço X de Y” e seletor rápido.

- Navegação interna usa seções/cards, não uma linha de 8 tabs.

- Ações operacionais: Daily Log, Add Photo, Material Extra, Change Order, Report Problem.

- Complete Service é ação própria/sticky e dispara revisão de pendências antes do fechamento.

- Field Worker não vê valores financeiros ou administrativos sem permissão.

## 6.2 Daily Log mobile

- Campos automáticos: data, Job, Service, Crew/Team, Property e usuário.

- Campos editáveis: trabalho realizado, progresso do dia, problemas, materiais usados, fotos, próximos passos, observações.

- Campos opcionais podem permanecer recolhidos em “+ Adicionar mais detalhes”.

- Fotos ocupam posição de destaque; upload permite câmera e galeria, múltiplas imagens, thumbnails e retry por arquivo.

- Sem Offline Mode na V1: falha de conexão precisa ser explícita e nunca sugerir que o dado foi salvo.

- Após Service DONE: Daily Log bloqueado; apenas Add Photos permanece disponível.

## 6.3 Material Extra, Change Order e Report Problem

| **Fluxo**            | **UX mobile**                                                                              |
|----------------------|--------------------------------------------------------------------------------------------|
| Material Extra       | Material → Quantity → Reason → Photo → Notes → Send. Status acompanhável pelo solicitante. |
| Change Order Request | Service → Description → Reason → Photos → Documents → Send. Field Worker não vê preço.     |
| Report Problem       | Escolha rápida de categoria → Description → Photos → Send. Formulário curto.               |

## 6.4 Conclusão e assinatura

- Antes de Complete Service, Bottom Sheet mostra checklist de pendências: Checklist, Daily Log, Change Orders, Required Photos.

- Warnings permitem “Continue anyway” quando configurado; Blocking Rules exigem resolução.

- Assinatura usa tela limpa, com texto configurável, opção Draw ou Type Name.

- Se cliente não estiver presente, “Customer not available” cria pendência visível para Office/PM.

- Após sucesso: “Service completed successfully” + retorno para Hoje.

## 6.5 Salesperson e Tablet

- Salesperson Home prioriza Follow-ups, New Leads, Today’s Appointments, Estimates Awaiting Response e Commission Summary.

- Lead mobile: Call / SMS / Email + informações comerciais; Create Estimate é CTA forte.

- Estimate mobile usa seções verticais; tablet pode usar mais colunas quando houver espaço.

- Antes da assinatura presencial, entrar em Presentation/Signature Mode para esconder informação interna.

- Tablet suporta Portrait e Landscape; Schedule pode sugerir Landscape, sem bloquear Portrait.

- Project Manager no tablet usa experiência mais próxima do desktop, respeitando permissões.

# 7. Client Portal e estados globais

## 7.1 Direção do Portal

- Visual mais simples que o administrativo: menos navegação, mais espaço em branco e CTAs claros.

- Usa logo, nome, contato e cor principal da empresa; se não houver branding, usa CrewCommand padrão.

- A empresa escolhe cor principal e o sistema deriva variações seguras; não permitir combinações arbitrárias que prejudiquem contraste.

- Estrutura UI continua sendo CrewCommand para garantir consistência e acessibilidade.

- Indicação discreta “Powered by CrewCommand”, configurável por plano no futuro.

## 7.2 Navegação e Home

| **Contexto**    | **Estrutura**                                                                        |
|-----------------|--------------------------------------------------------------------------------------|
| Desktop         | Topbar simples: Início \| Propriedades \| Projetos \| Documentos \| Financeiro       |
| Mobile          | Bottom Navigation: Início \| Projetos \| Documentos \| Financeiro \| Mais            |
| Home prioridade | Pendências → Próximo serviço → Projetos ativos → Saldo/Faturas → Documentos recentes |

## 7.3 Project e progresso no Portal

- Lista de Projects separa Ativos e Concluídos.

- Project Card: nome/Job \#, Property, Status, próximo serviço; PM e progresso somente se empresa liberar.

- Valor do contrato não aparece no card por padrão; financeiro fica em seção própria.

- Project Detail: Overview, Services, Photos, Documents, Financial; Daily Logs somente se liberados.

- Nunca expor Crew capacity, internal notes, commissions, material cost, internal tasks ou private chat.

- Progresso, quando habilitado: progress bar + percentual + “X de Y services completed”; pesos internos não são expostos.

- Daily Log no Portal mostra versão simplificada: data, serviço, resumo, fotos visíveis, progresso e observações liberadas.

## 7.4 Estimates, Change Orders e pagamentos

- Estimate tem aparência de proposta/documento, não de tela administrativa.

- Fluxo de aprovação: Review → Payment Terms → Payment Method/Financing → Sign → Confirm; etapas não aplicáveis são puladas.

- Approve é Primary; Reject é Secondary/destructive textual.

- Assinatura: Draw ou Type Name.

- Se pagamento imediato falhar após aprovação, Estimate continua Approved e Deposit fica Pending/Failed.

- Change Order é visualmente semelhante ao Estimate, porém mais compacto; Reject exige motivo e Approve exige assinatura.

- Financial Portal: Open Balance, Next Payment, Invoices, Payment History, Financing.

- Open/Paid/Overdue são estados visíveis; linguagem nunca é agressiva.

- Pay Now aparece apenas se provider/método realmente estiver disponível.

- Checkout utiliza componente seguro do provider; CrewCommand não coleta cartão fora do padrão seguro.

## 7.5 Estados globais de interface

| **Estado**               | **Contrato de UX**                                                                        |
|--------------------------|-------------------------------------------------------------------------------------------|
| Empty                    | Explica o que falta + orientação + CTA quando possível.                                   |
| Loading                  | Skeleton para conteúdo; spinner apenas para ações pequenas.                               |
| Success                  | Feedback curto + próximo passo quando necessário.                                         |
| Warning                  | Explica consequência; permite decisão quando não bloqueante.                              |
| Blocking Error           | Explica o que impede e como resolver.                                                     |
| Permission Denied        | Ação não aparece se nunca permitida; deep link mostra acesso negado sem revelar detalhes. |
| Plan Limit               | Mostra limite, uso atual e CTA View Plans/Upgrade.                                        |
| Missing Configuration    | Explica dependência e oferece Configure.                                                  |
| Integration Error        | Provider + ação + status + Retry quando aplicável.                                        |
| Read-only                | Banner persistente; ações de edição desabilitadas.                                        |
| Suspended                | Usuários comuns não entram; Owner vê regularização.                                       |
| Unsaved Changes          | Discard Changes \| Keep Editing.                                                          |
| Destructive Confirmation | Explica consequência concreta; confirmação reforçada em ações irreversíveis.              |
| Bulk Destructive         | Explicita quantidade de registros afetados antes de confirmar.                            |

# 8. Wireframes, responsividade, Figma e handoff

## 8.1 Estratégia de wireframes

- Produzir wireframes low-fidelity antes do visual final nas telas críticas.

- Low-fi valida estrutura, hierarquia, componentes, posicionamento, fluxo e estados — sem depender das cores finais.

- Após aprovação do low-fi, aplicar Design System e criar high-fidelity.

- Primeira leva: Login/Trial/Onboarding, Dashboard, CRM List, Client Detail, Sales Pipeline, Estimate Editor, Job Kanban, Job Detail, Service Detail, Schedule, Daily Log mobile, Client Portal, Financial, Inbox, Settings.

- Depois, expandir telas secundárias reutilizando padrões já validados.

## 8.2 IDs, rastreabilidade e estados

- Toda tela mantém Screen ID estável do App Flow (ex.: SCR-DASH-001, SCR-JOB-DETAIL-001).

- Componentes específicos podem receber IDs (ex.: CMP-JOB-CARD-001, CMP-DAILY-LOG-001).

- Cada tela importante documenta Default, Loading, Empty, Error, Permission Denied, Read-only e Plan Limit quando aplicável.

- Formulários também documentam Validation Error, Unsaved Changes, Saving e Saved.

- Integrações documentam Connected, Disconnected, Error e Reauthorization Required.

- Variantes Desktop/Tablet/Mobile só são desenhadas quando o comportamento realmente muda.

## 8.3 Design Tokens no Figma

- Tokens oficiais: colors, typography, spacing, radius, shadows, borders, breakpoints, z-index, motion e component sizes.

- Usar nomes semânticos: color-bg-primary, color-text-muted, color-status-success, brand-primary etc.

- Status tokens: status-new, status-scheduled, status-in-progress, status-waiting, status-completed, status-delayed.

- Typography tokens: Display, Page Title, Section Title, Card Title, Body, Label, Helper.

- Figma Variables devem ser usadas para cores, spacing, radius e demais tokens sempre que possível.

- Tokens já devem permitir futura implementação de Dark Mode sem redesenhar componentes.

## 8.4 Estrutura oficial do Figma

| **Página**          | **Conteúdo**                                                          |
|---------------------|-----------------------------------------------------------------------|
| 00 — Foundations    | Cores, tipografia, spacing, grid, radius, shadow, motion, breakpoints |
| 01 — Components     | Componentes reutilizáveis e variantes                                 |
| 02 — Patterns       | Filtros, tabelas, drawers, forms, empty/error states, interactions    |
| 03 — Desktop        | Telas administrativas desktop                                         |
| 04 — Tablet         | Variantes tablet quando necessárias                                   |
| 05 — Mobile / Field | Field Worker e Sales mobile                                           |
| 06 — Client Portal  | Desktop/mobile do portal                                              |
| 07 — Prototypes     | Fluxos clicáveis críticos                                             |
| 08 — Archive        | Versões antigas e referências                                         |

- Auto Layout deve ser usado extensivamente.

- Component variants documentam type/size/state, por exemplo Primary/Secondary/Destructive × Small/Medium/Large × Default/Hover/Disabled/Loading.

- Designs antigos são arquivados, não apagados imediatamente.

- Documento UI/UX e Figma utilizam versionamento (v1.0, v1.1...).

## 8.5 Protótipos críticos

- Onboarding

- Lead → Estimate

- Estimate Approval

- Estimate → Job

- Scheduling Conflict

- Stair-Step (“Escadinha”)

- Daily Log

- Change Order

- Client Portal Approval/Payment

- Também documentar Edge Cases críticos: Permission Denied, Plan Limit, Integration Error, Payment Failure, Schedule Conflict, No Connection e Expired Estimate.

- Não é necessário prototipar cada botão de cada tela; foco nos fluxos de maior risco/complexidade.

## 8.6 Handoff para desenvolvimento

| **Item obrigatório** | **Descrição**                                                           |
|----------------------|-------------------------------------------------------------------------|
| Screen ID            | Identificador estável conectado ao App Flow.                            |
| Version              | Versão visual aprovada.                                                 |
| States               | Estados relevantes e comportamento de erro/loading.                     |
| Breakpoints          | Variantes ou regras responsivas.                                        |
| Components           | Componentes do Design System utilizados.                                |
| Interactions         | Hover, click, drag, modal, drawer, deep link, etc.                      |
| Rules                | Regras de negócio visuais/comportamentais necessárias para implementar. |
| Traceability         | Link para App Flow/requisito correspondente.                            |
| Annotations          | Notas para comportamentos não óbvios.                                   |
| Acceptance Criteria  | Critérios visuais/UX passíveis de QA.                                   |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Regra de handoff<br />
</strong>Desenvolvedores não devem depender de adivinhar comportamento a partir de uma screenshot. Toda interação relevante deve estar documentada.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 9. Glossário e nomenclatura

| **Termo oficial (produto EUA)** | **Uso**                                             |
|---------------------------------|-----------------------------------------------------|
| Job                             | Entidade operacional principal do trabalho vendido. |
| Service                         | Serviço individual dentro do Job.                   |
| Property                        | Endereço/propriedade do cliente.                    |
| Estimate                        | Orçamento/proposta comercial.                       |
| Change Order                    | Alteração de escopo após aprovação.                 |
| Crew                            | Grupo operacional de campo.                         |
| Team                            | Agrupamento de Crews quando aplicável.              |
| Daily Log                       | Registro diário por Service/dia.                    |
| Sales Pipeline                  | Pipeline comercial.                                 |
| Job Pipeline                    | Pipeline operacional.                               |

- Evitar alternar entre sinônimos no produto sem regra definida.

- O documento interno pode usar PT-BR, mas a UI em inglês deve manter a terminologia oficial.

- Datas, números, moeda e unidades seguem locale/configuração; exemplos de mockup usam padrão americano.

# 10. Definition of Ready — tela pronta para desenvolvimento

- Fluxo aprovado.

- Layout final.

- Estados relevantes documentados.

- Responsividade definida.

- Componentes definidos.

- Permissões e visibilidade definidas.

- Conteúdo/microcopy definido.

- Interações/edge cases anotados.

- Screen ID e rastreabilidade presentes.

- Design Review concluído.

## 10.1 Design Review obrigatório

- Fluxo e consistência com App Flow.

- Consistência com Design System.

- Permissões e escopos por Role/Location/Workspace.

- Responsividade.

- Estados e edge cases.

- Acessibilidade básica: teclado, labels, contraste, área de toque, não depender só de cor.

# 11. Ordem recomendada de execução visual

1\. Foundations

2\. Shell

3\. Dashboard

4\. CRM

5\. Job

6\. Schedule

7\. Sales / Estimate

8\. Field Mobile

9\. Client Portal

10\. Financial

11\. Demais módulos

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>V1 — escopo visual explicitamente excluído<br />
</strong>Não desenhar Dark Mode completo, Offline Sync ou Time Tracking/Clock In-Out na V1. Documentar apenas estado de conexão perdida; tokens ficam preparados para futuro Dark Mode.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 12. Separação de responsabilidade entre documentos

| **Documento**         | **Responsabilidade**                                |
|-----------------------|-----------------------------------------------------|
| PRD                   | O que construir e por quê.                          |
| App Flow              | Como o usuário percorre o produto.                  |
| Backend Domain Model  | Estrutura lógica dos dados e relacionamentos.       |
| UI/UX Design Document | Como a experiência é apresentada e operada.         |
| TRD                   | Como tecnicamente será implementado.                |
| Implementation Plan   | Como o trabalho será dividido, ordenado e entregue. |

- UI/UX não escolhe framework, banco, cloud ou arquitetura de backend.

- Decisões técnicas de stack, storage, filas, observabilidade, autenticação e deploy ficam para o TRD.

# 13. Próxima etapa

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>TRD — Technical Requirements Document<br />
</strong>Com o PRD, App Flow, Backend Domain Model e UI/UX Design Document definidos, o próximo documento deverá fechar arquitetura técnica: frontend, backend, banco, autenticação, multi-tenancy, storage, filas, notificações, integrações, webhooks, API, MCP, mobile, segurança, observabilidade e deploy.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 14. Princípios finais aprovados

*“Nenhuma decisão visual deve tornar o CrewCommand mais difícil de usar apenas para fazê-lo parecer mais sofisticado.”*

*“Consistência, clareza e velocidade operacional têm prioridade sobre decoração.”*

*“Desktop, tablet, mobile de campo e Client Portal pertencem ao mesmo produto, mas cada experiência deve respeitar o contexto real de uso.”*

*“O Client Portal deve permitir que o cliente encontre rapidamente o que precisa aprovar, pagar, acompanhar ou baixar, sem precisar entender a estrutura interna do CrewCommand.”*

*“A experiência do cliente deve parecer uma extensão digital da empresa prestadora do serviço, e não um painel administrativo do CrewCommand.”*
