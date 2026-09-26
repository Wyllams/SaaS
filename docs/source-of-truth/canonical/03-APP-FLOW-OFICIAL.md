# APP FLOW OFICIAL

**v2.0** — Navegação, telas, papéis, fluxos e exceções

| Campo | Definição |
|---|---|
| Versão | 2.0 |
| Status | Substitui o App Flow v1.0 |
| Data | 2026-09-25 |
| Marca | Não definida; nomes brand-neutral |
| Base | PRD v2.0 + decisões do Product Owner de 2026-09-25 |
| Idiomas do produto | English (US) e Español — ambos completos |
| Telas na V1 | 91 |
| Telas adiadas | 25 |

> **O que mudou em relação à v1.0.** Sete papéis no lugar de oito. Dashboard único com blocos por permissão no lugar de cinco dashboards. Portal do cliente por magic link. Saem Chat interno, Automation Engine, Inbox bidirecional, Public API, Webhooks, MCP, Super Admin como aplicação separada, Financing, serviços recorrentes, Custom Fields e o módulo de Tarefas. Entram Materiais e Compras, assinatura via Stripe Billing e o controle de Crew parceira.
>
> **Screen IDs foram preservados.** Telas adiadas mantêm o ID reservado e aparecem no §16 marcadas como fora da V1, para não quebrar rastreabilidade nem reaproveitar número.

---

# 1. Princípios globais

- Desktop administrativo com Sidebar recolhível e Topbar. Campo e Portal são mobile-first.
- Seletor de Location visível para quem tem acesso a mais de uma. "All Locations" consolida **apenas** as Locations do usuário.
- O sistema lembra a última Location e o último Workspace.
- "+ Novo" mostra somente ações permitidas pelo papel.
- Busca global, notificações, ajuda e perfil ficam na Topbar.
- Deep link leva ao registro e **revalida permissão** antes de abrir.
- Ao voltar para uma lista, filtros, ordenação e posição de rolagem são preservados.
- **Valor financeiro desaparece por completo** para quem não tem permissão financeira — não borrado, não zerado.
- Estados de vazio, carregamento, erro recuperável e confirmação de ação destrutiva são obrigatórios.
- Sem Offline Mode: falha de conexão é explícita e nunca sugere que salvou.
- Todo texto existe em inglês e espanhol.

---

# 2. Navegação por papel

| Papel | Navegação | Superfície |
|---|---|---|
| **Owner** | Dashboard, CRM, Sales, Jobs, Schedule, Team, Purchases, Financial, Reports, Settings | Desktop |
| **Admin** | Igual ao Owner, limitado ao que o Owner liberar | Desktop |
| **Salesperson** | Dashboard, CRM, Sales, Schedule | Desktop + tablet + PWA |
| **Supervisor** | Dashboard, Jobs, Schedule, Team, Purchases, Approvals | Desktop + tablet |
| **Crew** | Today, Jobs, Notifications, More | **PWA, mobile-first** |
| **Accounting** | Dashboard, Financial, Purchases, Reports | Desktop |
| **Client** | Portal: Início, Projetos, Documentos, Financeiro, Mais | Mobile-first |

Navegação com três níveis é evitada. Submódulo usa aba interna.

Bottom navigation tem no máximo cinco itens. Drawer de desktop vira tela cheia no mobile.

---

# 3. Autenticação, assinatura e onboarding

## 3.1 Cadastro e Trial — `SCR-AUTH-002`, `SCR-AUTH-003`, `SCR-AUTH-004`

O usuário informa nome, sobrenome, empresa, e-mail, telefone e senha. Antes do envio da verificação, o sistema avisa que um e-mail válido será necessário e permite revisar o endereço.

Escolhe Starter, Growth, Pro ou Enterprise antes de iniciar.

**Trial de 14 dias, com cartão.** A interface informa explicitamente que não haverá cobrança antes do fim do período. O Trial libera apenas os recursos do plano escolhido e exibe contagem regressiva. O banner pode ser ocultado temporariamente e volta ao recarregar.

## 3.2 Ciclo da assinatura — `SCR-AUTH-007`, `SCR-AUTH-008`

```
Trial → Active
Payment Failed → Grace (3 dias) → Read-only → Suspended → Active
```

Em Read-only, banner persistente e ações de edição desabilitadas. Em Suspended, usuários comuns não entram e o Owner vê a tela de regularização.

**Dados nunca são apagados.** O acesso retorna com o pagamento. Cancelamento pelo Owner leva a um período somente de exportação antes da exclusão definitiva.

## 3.3 Login e Workspaces — `SCR-AUTH-001`, `SCR-AUTH-005`, `SCR-AUTH-006`

Login por e-mail e senha. Recuperação envia link, permite definir nova senha e volta ao login.

Um usuário pode pertencer a vários Workspaces. Havendo mais de um, aparece a escolha; depois a troca fica no perfil. Dados, permissões, notificações e contexto **nunca se misturam** entre Workspaces.

## 3.4 Onboarding — `SCR-ONB-001`, `SCR-ONB-002`

Welcome com "Start Setup" ou "Fazer depois", avisando que recursos dependentes podem não funcionar enquanto etapas forem puladas.

Checklist persistente com percentual, acessível depois em Settings.

Etapas: **Empresa → Locations → Serviços → Crews → Usuários → Imposto → Pagamentos → Integrações → Templates → Pronto.**

- Company Info: nome, logo, telefone, e-mail, site, endereço, timezone, idioma e moeda.
- A primeira Location nasce do endereço da empresa como "Main Location".
- Serviços vêm de sugestões por vertical ou são criados manualmente; no onboarding exige-se apenas nome, categoria, unidade e status padrão.
- Crews podem nascer vazias. Já no onboarding a Crew é marcada como **própria ou parceira**.
- **Imposto** é etapa própria: alíquota por Location, tratamento de mão de obra e material.
- Convites levam e-mail, papel e Location; podem ser reenviados e cancelados.
- Importação CSV/Excel: Upload → Preview → Mapping → revisão de duplicados → resumo.

---

# 4. Dashboard — `SCR-DASH-001`

**Uma única tela.** Os blocos aparecem conforme a permissão de quem entrou.

Topo: saudação, Location, data e filtro de período (Hoje, Semana, Mês, Personalizado).

| Bloco | Aparece para |
|---|---|
| Avisos de Trial e Setup | Owner, Admin |
| Command Center — Requer Atenção | Todos, filtrado por escopo |
| Aprovações pendentes | Owner, Admin, Supervisor |
| Jobs e agenda do dia | Owner, Admin, Supervisor |
| Conflitos de agenda | Owner, Admin, Supervisor |
| Pipeline e follow-ups | Owner, Admin, Salesperson |
| Estimates aguardando resposta | Owner, Admin, Salesperson |
| Resumo financeiro e AR | Owner, Admin, Accounting |
| Minha comissão | Salesperson (apenas a própria) |
| Atividade recente | Todos, respeitando permissão |

Widgets são reorganizáveis e ocultáveis por usuário; a empresa pode definir um padrão por papel.

"Requer Atenção" abre drawer com "ver tudo"; cada item mostra motivo concreto e ação rápida. Aprovação simples resolve no drawer; Change Order abre o detalhe completo.

O Crew não usa esta tela — sua entrada é `SCR-FIELD-001`.

---

# 5. CRM

Tela principal em tabela, com busca, filtros, Saved Views, colunas configuráveis e importação — `SCR-CRM-001`, `SCR-CRM-005`.

CRM único: Lead e Customer são o mesmo cadastro. **Lifecycle: Lead → Customer → Past Customer.**

Criação manual pergunta o lifecycle inicial. Obrigatórios: nome, sobrenome, telefone, e-mail, endereço completo e serviço de interesse — `SCR-CRM-002`.

Endereço é estruturado e o primeiro cria automaticamente a primeira Property. Duplicidade por e-mail, telefone ou endereço gera aviso antes de salvar ou importar.

**Detalhe** — `SCR-CRM-003`: abas Overview, Properties, Sales, Documents, Communications e Activity.

Overview traz contato, lead source, vendedor, serviço de interesse, tags, follow-up, notas e Total Contract Value dos negócios aprovados.

Lifecycle muda manualmente com permissão; Estimate aprovado converte para Customer automaticamente. Trocar o vendedor pergunta se os follow-ups do anterior vão junto.

Notas são permanentes, com menção e anexo. Um cliente tem várias Properties e vários contatos — Primary, Billing, Property, Other.

**Property** — `SCR-CRM-004`: Overview, Estimates, Jobs, Schedule, Photos, Documents, Activity e botão de abrir no mapa. Ao criar Estimate para cliente com várias Properties, escolher a Property é obrigatório.

Exclusão de histórico é restrita ao Owner. Cliente com registro financeiro ou assinado não é excluído.

---

# 6. Sales e Estimates

Abre no pipeline — `SCR-SALES-001`. Abas: Pipeline, Estimates, Appointments.

Arrastar muda estágio. Mover para Lost **exige motivo**. Won pode vir da aprovação do Estimate ou manualmente, com permissão.

Appointment — `SCR-SALES-002`: cliente, Property, vendedor, data, hora, duração, serviço de interesse, notas, Location, status e data de fechamento. Pode ser reagendado e gerar confirmação automática.

## 6.1 Editor — `SCR-SALES-004`

Começa pela Property, depois template ou em branco.

Cabeçalho: número, cliente, Property, vendedor, Location, criação e expiração. Numeração automática com prefixo configurável.

Linha de serviço: nome, descrição, quantidade, unidade, preço unitário, desconto, **imposto**, total e fotos. A descrição pode mudar sem alterar o catálogo. Serviço ad hoc pode ser criado ali e opcionalmente salvo.

**Imposto por linha distingue mão de obra e material**, e usa a alíquota da Location com override por Estimate. Cliente isento com certificado válido zera o imposto e registra o motivo.

Totais: Subtotal, Discount, Tax, Total Contract Value, Deposit Required, Remaining Balance.

Customer Notes, Terms & Conditions e Internal Notes são separados.

**Preview é obrigatório antes de qualquer envio** — `SCR-SALES-005`. PDF e impressão disponíveis.

## 6.2 Envio e status — `SCR-SALES-003`, `SCR-SALES-006`

Draft com autosave. Envio por e-mail, escolhendo os contatos e personalizando a mensagem.

**Status:** Draft → Sent → Viewed → Awaiting Approval → Approved | Rejected | Expired | Cancelled.

Cada visualização do cliente é registrada; a interface resume primeira e última. Versões antes da aprovação: o cliente vê só a versão ativa e é avisado quando uma versão enviada é substituída.

**Aprovado fica bloqueado.** Pode ser duplicado como novo Estimate independente ou convertido em template.

## 6.3 Aprovação — `SCR-SALES-007`

O cliente abre o **magic link** e aprova sem precisar de conta. Ver §11.1.

Aprovação é do documento inteiro. O cliente escolhe payment term e método quando aplicável, assina desenhando ou digitando o nome, e o sistema registra signatário, data, hora, IP e metadados do dispositivo.

Rejeição exige motivo e comentário opcional. **Não move automaticamente para Lost** — a decisão é do vendedor.

Efeitos padrão, configuráveis: lifecycle vira Customer, pipeline vira Won, cria o Job copiando Property, serviços, valores, fotos e documentos, mantém o vendedor, calcula comissão, cria saldo de depósito e notifica Admin. Depois oferece "Agendar agora" ou "Fazer depois".

Outro Estimate aprovado para a mesma Property pode criar novo Job ou adicionar Services a um Job existente.

---

# 7. Jobs e Services

Abre em Kanban — `SCR-JOB-001`, com alternativa em lista — `SCR-JOB-002`.

Card: cliente, Property, Total Contract Value quando permitido, status, vendedor e alertas. Arrastar muda status; Waiting pode pedir motivo.

**Detalhe** — `SCR-JOB-003`: Overview, Services, Schedule, Financial, Change Orders, Materials, Daily Logs, Photos, Documents, Activity.

O cabeçalho **não exibe o valor do contrato**. Milestones ficam na Overview com "ver tudo".

Overview: resumo, progresso, serviços, milestones, próximas ações, requer atenção, equipe e atividade recente. Mostra "X de Y serviços concluídos", percentual e próximo serviço. Atraso aparece como badge simples.

**Service** — `SCR-JOB-005`: Overview, Schedule, Checklist, Daily Logs, Materials, Photos, Documents, Activity.

Overview do Service: status, Crew, datas planejadas e reais, quantidade, unidade, duração calculada, progresso, notas e responsáveis.

Quantidade é editável com permissão e auditoria. **Se a duração mudar, dispara a Escadinha** (§8.4).

Progresso é manual ou calculado pelo checklist, com pesos de template. Supervisor e Admin ajustam manualmente com auditoria.

Antes de Completed o sistema verifica pendências; cada regra é aviso ou bloqueio conforme configuração. Completed oferece Progress Report — `SCR-JOB-013` — e criação de Invoice. Paid pode ser automático quando todas as invoices forem pagas.

Cliente e Property de Job com Estimate aprovado ficam bloqueados contra troca. Services vindos de Estimates posteriores registram a origem.

---

# 8. Agenda, Crews e capacidade

## 8.1 Calendário — `SCR-SCH-001`

Abre em Week. Views: Day, Week, Month, Agenda, Employee, Crew, Salesperson, Service e Location.

Filtros rápidos, Saved Views, cores configuráveis e respeito ao seletor global de Location. Clique abre drawer — `SCR-SCH-002`. Arrastar muda data, redimensionar muda duração, mover entre linhas muda atribuição.

## 8.2 Capacidade — `SCR-SCH-003`

O Service é agendado pelo Job, pelo detalhe do Service ou pela agenda. Data e Crew podem ser escolhidas em qualquer ordem, desde que ambas estejam válidas ao salvar.

```
quantidade ÷ capacidade da Crew = duração em dias → End Date automática
```

Unidades: SQ, linear feet, units, rooms, ft². Quando um Team reúne várias Crews, soma **apenas as Crews selecionadas e disponíveis**.

O cálculo respeita dias e horários da Location, feriados e bloqueios. Capacidade fracionada usa incrementos simples, como meio dia. Sem capacidade configurada, a duração é manual. Override exige permissão, motivo e fica registrado.

## 8.3 Conflito — `SCR-SCH-004`

Conflito **impede o salvamento imediato** e mostra o Job e o horário em choque. Opções: agendar mesmo assim, outra data, outra Crew. "Mesmo assim" exige segunda confirmação.

Conflito de Team identifica qual Crew está sobreposta. Conflito de pessoa também é detectado. **Nunca fica escondido.**

## 8.4 Escadinha — `SCR-SCH-005`

Disparada quando data ou duração mudam, por troca de Crew, mudança de quantidade ou arraste.

Comportamento obrigatório:

1. considera apenas Services futuros **não concluídos**;
2. preserva por padrão os intervalos relativos;
3. mostra **Before → After**;
4. lista todos os novos conflitos gerados;
5. permite desfazer imediatamente;
6. registra quem, quando e por quê.

## 8.5 Crews e parceiros — `SCR-TEAM-002`, `SCR-TEAM-003`, `SCR-TEAM-004`

Uma Crew pode pertencer a mais de um Team. Ao atribuir um Team, escolhe-se quais Crews participam. Primary Crew mais adicionais é permitido.

**Crew parceira (subcontratada)** — `SCR-TEAM-004`: empresa, contato, W-9, licença e **certificado de seguro com data de validade**.

- A agenda marca visualmente o recurso externo.
- Atribuir Crew com **seguro vencido** exibe alerta bloqueante configurável.
- O sistema avisa com antecedência sobre vencimento próximo.

Disponibilidade — `SCR-TEAM-005`: Available, Partially Booked, Fully Booked, Unavailable. Bloqueios por intervalo, dia inteiro, vários dias e recorrentes — `SCR-SCH-006`. Feriados globais com override por Location; criação posterior alerta os agendamentos afetados sem mover automaticamente.

---

# 9. Campo (PWA)

Entrada em **Today** — `SCR-FIELD-001`. O Crew vê apenas Services atribuídos a ele ou à sua Crew.

Cards com horário, Service, cliente, Property e status. **Sem qualquer valor financeiro.**

**Service** — `SCR-FIELD-002`: seções e cards, não uma fila de abas. Cabeçalho com Service, status, cliente e Property. Ações rápidas: ligar, mensagem, mapa. Havendo vários Services do mesmo Job, mostra "Serviço X de Y".

**Daily Log** — `SCR-FIELD-003`: um por Service por dia; nova tentativa abre o existente.

Preenchidos automaticamente: data, Job, Service, Crew, Property e usuário. Editáveis: trabalho realizado, progresso, problemas, materiais usados, fotos, próximos passos e observações. A empresa define obrigatórios. Upload múltiplo com compressão, miniatura e retry por arquivo.

Depois de DONE, fica somente leitura; só novas fotos podem ser anexadas. Reabrir exige Supervisor ou Admin com motivo.

Outras ações: reportar problema — `SCR-FIELD-004`; solicitar Change Order sem ver preço — `SCR-FIELD-005`; solicitar material — `SCR-FIELD-006`. O solicitante acompanha o status do que enviou.

**Conclusão** — `SCR-FIELD-007`: antes de concluir, bottom sheet lista pendências de checklist, Daily Log, Change Orders e fotos obrigatórias. Aviso permite continuar; bloqueio exige resolver. Assinatura em tela limpa, desenhada ou digitada. Cliente ausente gera pendência para o escritório.

Reagendamento notifica quem for pertinente. O Crew recebe notificação com deep link.

---

# 10. Change Orders, materiais e compras

## 10.1 Change Order — `SCR-JOB-007`

Nasce no campo **sem preço**. Contém Service, descrição, motivo e fotos. Vendedor e Admin são notificados.

Sales ou Admin revisam, precificam, geram preview e enviam. Pode ter várias linhas; um Job pode ter vários. O cliente aceita ou rejeita e assina — rejeição exige motivo.

Aprovado fica bloqueado, aumenta o valor do Job e passa a ser faturável.

## 10.2 Materiais e compras — `SCR-JOB-008`, `SCR-PUR-001` a `SCR-PUR-004`

Material Request: material, quantidade, motivo, foto e observações. Supervisor aprova.

Estados: Requested → Approved | Rejected → Purchased → Delivered.

Purchases registra fornecedor, data, número de PO, valor, comprador, status de pagamento, recibo e observações. Uma solicitação pode gerar várias compras. Compra pode existir sem solicitação, com permissão.

Vendors/Stores têm tela própria com histórico, total gasto e jobs relacionados.

---

# 11. Client Portal

## 11.1 Acesso — `SCR-PORT-001`

**Magic link para aprovar.** O cliente recebe link assinado com validade, abre e aprova sem criar conta. O link carrega contexto suficiente para resolver Workspace, Customer e documento, e **revalida autorização no servidor**.

Definir senha é **opcional** e serve para quem quer voltar a acompanhar a obra. Quem tem senha entra por e-mail e senha.

Link expirado oferece reenvio. Link nunca dá acesso a dado de outro cliente.

## 11.2 Portal

Visual da empresa prestadora, estrutura da plataforma, mobile-first.

Home — `SCR-PORT-002`: aprovações pendentes → próximo serviço → projetos ativos → saldo e faturas → documentos recentes.

Properties — `SCR-PORT-003`: o cliente vê todas as próprias. Nova Property vira **solicitação**, não criação direta.

Project — `SCR-PORT-004`: Overview, Services, Photos, Documents, Financial. Daily Logs só se liberados.

**Progresso fica oculto por padrão.** Quando liberado: barra, percentual e "X de Y serviços concluídos", sem expor pesos internos.

**Nunca expor:** capacidade de crew, notas internas, comissões, custo de material, dados de Crew parceira e qualquer conteúdo não marcado como customer-visible.

Estimate — `SCR-PORT-005` — com aparência de proposta: Review → Payment Terms → Método → Assinar → Confirmar. Approve é primário; Reject é secundário e exige motivo. Change Order — `SCR-PORT-006` — usa o mesmo fluxo em versão compacta.

Documentos — `SCR-PORT-007`: upload com nome e vínculo; o que for permitido pode ser baixado e impresso.

Financeiro — `SCR-PORT-008`: saldo em aberto, próximo pagamento, faturas, histórico. "Pay Now" aparece apenas se o provider estiver realmente disponível. Checkout usa componente seguro do provider. Linguagem nunca agressiva.

**Falha de pagamento após a aprovação não desfaz a aprovação**; o depósito fica pendente ou falho.

Solicitar serviço — `SCR-PORT-009`: vira solicitação interna para revisão, nunca Job automático.

---

# 12. Financeiro

Abas Invoices, Payments, Accounts Receivable e Commissions — `SCR-FIN-001`. Resumo no topo respeita permissão.

**Invoice** — `SCR-FIN-002`, `SCR-FIN-003`, `SCR-FIN-004`: criada pelo Job, pelo módulo ou pela conclusão. Faturamento parcial permite faturar antes do Job concluído.

O usuário escolhe Services, Change Orders ou percentuais. Rótulos Deposit, Progress e Final. Review e preview antes de enviar.

O sistema compara o total faturado com Contract Value mais Change Orders aprovados e **bloqueia overbilling por padrão**. Exceção exige permissão e justificativa. Sincronização falha mostra motivo e reenvio.

**Payments** — `SCR-FIN-005`: Card, ACH, Cash, Check, Zelle, Wire e custom. Sempre aplicado a uma Invoice específica. Registro manual exige permissão e gera recibo. **Overpayment bloqueado.** Refund é transação separada.

**AR** — `SCR-FIN-006`: aging Current, 1–30, 31–60, 61–90, 90+. Lembretes param ao ficar pago e podem ser pausados.

**Commissions** — `SCR-FIN-007`: percentual sobre venda, sobre margem, fixo, por serviço ou combinação. Gatilho configurável. Projected → Earned → Approved → Paid. **Paid congela.** Ajuste exige motivo. O Salesperson vê apenas a própria.

---

# 13. Comunicação, notificações e aprovações

## 13.1 Comunicação com o cliente

**A V1 envia, mas não recebe.** Sem inbound, não há conversa bidirecional — portanto não há módulo de Inbox.

O histórico de comunicação aparece **dentro do Customer e do Job**, como aba Communications: o que foi enviado, quando, para quem, por qual canal e o estado de entrega (enviado, entregue, aberto, devolvido, falhou). Falha mostra motivo e reenvio.

Templates de mensagem são categorizados, usam variáveis e podem ser editados antes do envio.

Consentimento e opt-out são armazenados por contato e por canal **desde a V1**, mesmo sem SMS.

## 13.2 Notificações — `SCR-NOT-001`

Canais: in-app, e-mail e push via PWA. O usuário personaliza, exceto as obrigatórias. Deep link é padrão. Repetidas podem ser agrupadas. Quiet Hours valem para não críticas.

## 13.3 Aprovações — `SCR-APR-001`

Centraliza Change Orders, Material Requests e ajustes de comissão. Contagem visível no Dashboard e na Sidebar. Rejeição exige motivo. Tudo auditado. Delegação temporária é permitida.

---

# 14. Configurações e plataforma

Todos têm configurações pessoais — `SCR-SET-001`. O Owner vê tudo; o Admin vê o que for liberado.

| Tela | Conteúdo |
|---|---|
| `SCR-SET-002` Empresa | Dados, logo, branding, timezone, idioma |
| `SCR-SET-003` Locations | Endereço, contato, timezone, horário, usuários, crews, feriados |
| `SCR-SET-004` Usuários & Permissões | Papéis, permissões por módulo e ação, convites, multi-Location |
| `SCR-SET-005` Serviços | Catálogo, unidades de produção, capacidade padrão |
| `SCR-SET-006` Templates | Estimate, Job, checklist, mensagens |
| `SCR-SET-007` Pipelines | Criar, renomear, reordenar e excluir com proteção |
| `SCR-SET-009` Financeiro | Payment terms, **alíquotas por Location**, tratamento de labor e material, certificados de isenção |
| `SCR-SET-010` Comunicações | Remetente, domínio verificado, templates de e-mail |
| `SCR-SET-011` Integrações | Stripe Connect, QuickBooks, Resend, com estados Connected, Disconnected, Error e Needs Reauthorization |
| `SCR-SET-012` Billing/Planos | Plano, uso, faturas da assinatura, método de pagamento |

Primary Owner pode ser transferido com confirmação forte e auditoria; só um por empresa.

Atingir limite de plano bloqueia a ação com explicação e CTA de upgrade. O Owner vê o consumo.

**Relatórios** — `SCR-REP-001`: a V1 entrega relatórios fixos, não construtor. São três: conversão de vendas por origem e vendedor, jobs por status e atraso, e AR com aging. Exportáveis.

**Busca global** — `SCR-SEARCH-001`: atalho Ctrl/Cmd-K, resultados agrupados por entidade, respeitando Workspace, Location e permissão. Itens recentes antes de digitar.

**Ajuda** — `SCR-HELP-001`: artigos com texto e imagem, mais o guia de configuração.

**Administração da plataforma** — `SCR-SA-001`, `SCR-SA-002`: rotas protegidas **dentro da própria aplicação**, não aplicação separada. Cobrem visão de empresas, assinaturas e trials para suporte. Acesso a dado privado não é padrão e exige autorização registrada, com banner permanente durante a sessão.

---

# 15. Fluxos críticos

| Fluxo | Happy path | Exceções |
|---|---|---|
| **F-01 Lead → Customer** | Criar ou importar → atribuir vendedor → follow-up → Estimate → cliente aprova e assina → Customer + Won + Job | Duplicado; várias Properties; Estimate expira ou é rejeitado; versão substituída |
| **F-02 Estimate → Job** | Property → template ou branco → serviços → imposto → preview → envio → viewed → magic link → assinatura → Job | Contato sem Property; assinatura incompleta; aprovado fica bloqueado |
| **F-03 Agendamento por capacidade** | Service + Crew → carrega capacidade → calcula duração e fim → valida calendário → salva | Sem capacidade vira manual; conflito exige decisão; override exige motivo; crew parceira com seguro vencido alerta |
| **F-04 Escadinha** | Mudança altera duração → identifica Services futuros → preview Before/After → usuário decide → checa conflitos → aplica | Concluído não move; novos conflitos precisam ser resolvidos; desfazer disponível |
| **F-05 Execução em campo** | Today → Service → checklist, Daily Log, fotos → issue, CO ou material → assinatura → Complete | Daily Log obrigatório ausente; cliente ausente gera pendência; reabertura só por Supervisor ou Admin |
| **F-06 Change Order** | Pedido sem preço no campo → Sales precifica → preview → cliente → aceita → assina → valor do Job aumenta | Rejeição exige motivo; envio falha; aprovado fica bloqueado |
| **F-07 Invoice → Pagamento** | Criar invoice → review → provider → sincroniza → cliente paga → saldo atualiza → Job pode chegar a Paid | Sync falha e reenvia; overbilling e overpayment bloqueados; refund preserva o original |
| **F-08 Material → Compra** | Crew solicita → Supervisor aprova → compra registrada com recibo → vinculada ao Job | Rejeição exige motivo; compra sem solicitação exige permissão |
| **F-09 Assinatura da plataforma** | Trial com cartão → cobrança → Active | Falha → Grace 3 dias → Read-only → Suspended → pagamento → restauração; sem exclusão automática |

---

# 16. Catálogo de telas

## 16.1 Na V1 — 91 telas

| Módulo | IDs | Qtd |
|---|---|---|
| Autenticação | `SCR-AUTH-001` a `008` | 8 |
| Onboarding | `SCR-ONB-001`, `002` | 2 |
| Dashboard | `SCR-DASH-001` | 1 |
| CRM | `SCR-CRM-001` a `005` | 5 |
| Vendas | `SCR-SALES-001` a `007` | 7 |
| Projetos | `SCR-JOB-001` a `010`, `012`, `013` | 12 |
| Agenda | `SCR-SCH-001` a `006` | 6 |
| Equipe | `SCR-TEAM-001` a `005` | 5 |
| Campo | `SCR-FIELD-001` a `007` | 7 |
| Financeiro | `SCR-FIN-001` a `007` | 7 |
| Compras | `SCR-PUR-001` a `004` | 4 |
| Portal | `SCR-PORT-001` a `009` | 9 |
| Aprovações | `SCR-APR-001` | 1 |
| Notificações | `SCR-NOT-001` | 1 |
| Configurações | `SCR-SET-001` a `007`, `009` a `012` | 11 |
| Relatórios | `SCR-REP-001` | 1 |
| Busca | `SCR-SEARCH-001` | 1 |
| Ajuda | `SCR-HELP-001` | 1 |
| Administração | `SCR-SA-001`, `002` | 2 |

## 16.2 Adiadas — IDs reservados, 25 telas

| ID | Tela | Motivo |
|---|---|---|
| `SCR-DASH-002` a `005` | Dashboards por papel | Substituídos por dashboard único |
| `SCR-JOB-011` | Mensagens do Projeto | Sem inbound nem chat na V1 |
| `SCR-FIN-008` | Financing | Fora da V1 |
| `SCR-INB-001` a `004` | Inbox e Chat interno | Fora da V1 |
| `SCR-TASK-001` a `003` | Módulo de Tarefas | Follow-up permanece como campo do CRM |
| `SCR-AUT-001` a `004` | Automações | Fora da V1 |
| `SCR-SET-008` | Custom Fields | Fora da V1 |
| `SCR-SET-013` | Data & Retention | Política ainda em aberto |
| `SCR-REP-002` | Drill-down de relatório | V1 tem relatórios fixos |
| `SCR-SA-003` a `007` | Planos, Feature Flags, Saúde de Integrações, Support Access | Fora da V1 |

Esses IDs **não devem ser reaproveitados** para telas novas.

---

# 17. Fora da V1

Offline Mode · Time Tracking · GPS contínuo · otimização de rota · vídeo em Daily Log · Good/Better/Best e itens opcionais · Customer Credit · split commission · duplicar agendamento · serviços recorrentes · envio recorrente de relatórios · status page pública · Dark Mode · multi-moeda · SMS e A2P 10DLC · e-mail inbound · Public API · webhooks de saída · MCP.

Todos **adiados, não cancelados**. Retornam por decisão explícita registrada em `CURRENT-DECISIONS.md`.

---

# 18. Decisões abertas

| Item | Situação |
|---|---|
| Marca | Não definida |
| Valores e limites dos planos | Estrutura definida, números em aberto |
| Extensão da UI de multi-location | `location_id` permanece no modelo; alcance na interface em aberto |
| Período de exportação e retenção | Em aberto — motivo de `SCR-SET-013` estar adiada |
| Escopo exato da administração da plataforma | `SCR-SA-001` e `002` propostos como rotas protegidas; confirmar |
