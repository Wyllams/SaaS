**CrewCommand**

APP FLOW OFICIAL

Arquitetura de navegação, telas, papéis, fluxos e casos de exceção do CrewCommand

| **Versão**              | 1.0                                              |
|-------------------------|--------------------------------------------------|
| **Status**              | Oficial                                          |
| **Base**                | PRD + Product Discovery + App Flow (Blocos 1–10) |
| **Idioma do documento** | Português (Brasil)                               |

# 1. Objetivo e status do documento

Este documento consolida as decisões tomadas durante o PRD e os 10 blocos de descoberta do App Flow. Ele substitui o formato de questionário por uma especificação operacional: quais telas existem, como os usuários navegam, quais ações são permitidas, como os módulos se conectam e quais exceções devem ser tratadas.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Regra de precedência</strong></p>
<p>Quando uma resposta específica do Product Owner divergir de uma recomendação genérica do questionário, a resposta específica prevalece. O App Flow Oficial registra a decisão final, não a recomendação original.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<img src="media/image1.png" style="width:6.55in;height:0.30768in" />

Fluxo principal do negócio: do Lead ao Pagamento.

# 2. Princípios globais de experiência

- Arquitetura desktop principal: Sidebar recolhível + Topbar.

- O seletor de Filial/Location permanece visível para usuários com acesso a múltiplas filiais; “Todas as Filiais” consolida dados e uma filial específica restringe o contexto.

- O sistema lembra a última Filial e, quando aplicável, o último Workspace utilizado.

- O botão global “+ Novo” exibe apenas ações permitidas pela Função/Role do usuário.

- Busca Global, Notificações, Ajuda e Perfil ficam na Topbar.

- Deep Links levam diretamente ao registro/aba relacionada, sempre revalidando permissões.

- Ao voltar para listas, o sistema preserva filtros, ordenação e posição de rolagem.

- Todos os módulos respeitam Workspace, Filial, Role e permissões granulares.

- Valores financeiros desaparecem completamente para usuários sem permissão financeira.

- Empty States, Loading States, erros recuperáveis e confirmações de ações destrutivas são padrões obrigatórios.

- Web/PWA e tablet são responsivos; experiências mobile variam por Role.

- Offline Mode e Time Tracking ficam fora da V1.

# 3. Navegação principal por perfil

| **Perfil**               | **Navegação principal**                                                                                                     | **Regra**                                                                      |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| Owner                    | Dashboard, CRM, Vendas, Projetos, Agenda, Tarefas, Caixa de Entrada, Equipe, Compras, Financeiro, Relatórios, Configurações | Acesso total, limitado apenas por regras de plataforma.                        |
| Admin                    | Mesma base do Owner                                                                                                         | Vê apenas configurações e módulos liberados pelo Owner.                        |
| Vendedor                 | Dashboard adaptado, CRM, Vendas, Agenda, Tarefas, Caixa de Entrada                                                          | Somente Leads/Clientes e conversas atribuídos, salvo permissão ampliada.       |
| Gerente de Projeto       | Dashboard adaptado, Projetos, Agenda, Tarefas, Caixa de Entrada, Equipe                                                     | Foco em execução, aprovações operacionais e alocação.                          |
| Financeiro/Contabilidade | Dashboard adaptado, Financeiro, Compras, Relatórios                                                                         | Acesso financeiro conforme permissão; sem necessidade de módulos de campo.     |
| Funcionário de Campo     | Hoje, Projetos/Serviços atribuídos, Caixa de Entrada/Chat, Notificações, Mais                                               | Interface simplificada; sem financeiro/comissões.                              |
| Cliente                  | Portal do Cliente                                                                                                           | Somente dados próprios e visibilidades liberadas pela empresa.                 |
| Super Admin CrewCommand  | Aplicação separada                                                                                                          | Administração da plataforma, planos, limites, suporte e saúde das integrações. |

# 4. Autenticação, Trial, Workspaces e Onboarding

## 4.1 Cadastro e Trial

1.  Usuário inicia em “Start Free Trial” e informa nome, sobrenome, empresa, e-mail, telefone e senha.

2.  Antes do envio da verificação, o sistema alerta que um e-mail válido será necessário e permite revisar o endereço digitado.

3.  Usuário escolhe Starter, Growth, Pro ou Enterprise antes de iniciar o Trial.

4.  O Trial dura 14 dias e exige cartão. A interface informa explicitamente que não haverá cobrança antes do fim do Trial.

5.  O Trial libera apenas recursos do plano escolhido e exibe contagem regressiva. O banner pode ser ocultado temporariamente, mas retorna ao recarregar.

6.  Sem pagamento ao fim do Trial, dados permanecem; a conta fica bloqueada até regularização/assinatura.

## 4.2 Login e múltiplos Workspaces

- Login: E-mail + Senha ou Google.

- Fluxo “Esqueci minha senha” envia link, permite definir nova senha e retorna ao Login.

- Usuários convidados que usam Google com o mesmo e-mail são vinculados ao convite existente.

- Um usuário pode pertencer a vários Workspaces/empresas. Se houver mais de um, existe “Escolher Workspace”; depois a troca também fica disponível no perfil/topbar.

- Dados, permissões, notificações e contexto nunca se misturam entre Workspaces.

## 4.3 Onboarding

- Welcome Screen: “Start Setup” ou “Fazer depois”. O sistema avisa que recursos dependentes de configuração podem não funcionar enquanto etapas forem puladas.

- Checklist persistente de Setup mostra percentual e pendências; permanece acessível em Configurações \> Guia de Configuração.

- Etapas: Empresa → Filiais → Serviços → Crews/Equipes → Usuários → Pagamentos → Integrações → Templates → Pronto.

- Company Info: nome, logo, telefone, e-mail, site, endereço, timezone, idioma e moeda.

- Tipo de negócio é opcional e permite selecionar múltiplos segmentos; serve para sugerir serviços e templates.

- A primeira Filial nasce do endereço da empresa como “Main Location”. Filiais adicionais respeitam limite do plano.

- Serviços podem ser escolhidos de sugestões ou criados manualmente; no onboarding só se exigem nome, categoria, unidade e status padrão.

- Crews podem ser criadas vazias; a empresa pode trabalhar com Crew individual ou Equipe composta por várias Crews.

- Convites de usuários recebem e-mail, Role e Filial; podem ser reenviados/cancelados.

- Importação CSV/Excel usa Upload → Preview → Mapping → revisão de duplicados → resumo de importação.

- Integrações são opcionais; funções dependentes explicam o que falta e oferecem “Configurar agora”.

- Demo Data pode criar um Workspace fictício claramente marcado como demonstração e removível sem afetar dados reais.

# 5. Dashboard / Command Center

- Primeira tela para Owner/Admin: Dashboard adaptado à Role.

- No topo: saudação, Filial, data e filtro de período (Hoje, Semana, Mês, Personalizado).

- Widgets são reorganizáveis, ocultáveis e salvos por usuário; a empresa pode definir um padrão por Role.

- Ordem recomendada: avisos Trial/Setup → Command Center → KPIs → Jobs/Agenda do dia → Vendas → Financeiro → Tarefas → Atividade Recente.

- Command Center: Requer Atenção, Aprovações, Tarefas Atrasadas, Jobs do Dia, Compromissos de Vendas e Próximos Prazos.

- Requer Atenção abre Drawer rápido com “Ver tudo”; itens mostram motivo concreto e ações rápidas.

- Aprovações simples podem ser feitas em Drawer; Change Orders e itens complexos abrem detalhe completo.

- Today’s Jobs mostra status resumidos, mas não precisa exibir Crew no card. Conflitos de agenda são destacados.

- My Tasks permite concluir tarefas diretamente e envia notificação de conclusão.

- Recent Activity respeita permissões e pode ser filtrada por domínio.

- Agenda compacta mostra Hoje/Próximos 7 dias; capacidade de Crew não precisa de widget próprio no Dashboard.

- No tablet/desktop do Field Worker, o Dashboard continua simplificado e semelhante à experiência de tablet.

# 6. CRM, Cliente, Lead e Propriedade

- Existe um único CRM. Lead e Customer são o mesmo cadastro com Lifecycle/Status/Tags; filtros e Saved Views separam Leads, Customers e Past Customers.

- Tela principal em List/Table com filtros, Saved Views, colunas configuráveis, reordenáveis e ordenáveis.

- Criação manual pergunta Lifecycle inicial (Lead ou Customer). Campos obrigatórios: nome, sobrenome, telefone, e-mail, endereço completo e serviço de interesse.

- Endereço é armazenado estruturadamente; autocomplete é desejado. O primeiro endereço cria automaticamente a primeira Property.

- Duplicidades por e-mail/telefone/endereço geram aviso antes de salvar/importar.

- Lead/Client Detail: Overview, Properties, Sales, Tasks, Messages, Documents, Activity.

- Overview mostra contato, Lead Source, vendedor, serviço de interesse, tags, follow-up, notas, campos customizados e Total Contract Value de negócios aprovados/fechados.

- Lifecycle pode ser alterado manualmente com permissão; Estimate aprovado converte automaticamente para Customer.

- Troca de vendedor pergunta se Tasks/Follow-ups do responsável anterior devem ser transferidos.

- Notes são permanentes e distintas de Chat; suportam @mentions, anexos e pin.

- Um cliente pode ter várias Properties e vários contatos secundários (Primary, Billing, Property, Other).

- A Property possui Overview, Estimates, Jobs, Schedule, Photos, Documents, Activity e botão para abrir Mapas.

- Ao criar Estimate para cliente com múltiplas Properties, o usuário precisa escolher a Property.

- Documentos do cliente permanecem contextuais; não existe biblioteca global para duplicar arquivos de Jobs/Properties.

- Exclusão de histórico é restrita ao Owner ou quem ele permitir; clientes com registros legais/financeiros não são excluídos de forma comum.

# 7. Vendas, Compromissos e Orçamentos

- Sales abre por padrão no Pipeline/Kanban, com tabs Pipeline, Orçamentos, Compromissos e Follow-ups.

- Cards do pipeline são responsivos e configuráveis. Arrastar muda estágio; mover para Lost exige Lost Reason. Won pode ocorrer por aprovação do Estimate ou manualmente para usuários autorizados.

- Sales Appointment tem cliente/lead, Property, vendedor, data, hora, duração, serviço de interesse, notas, Filial, status e data em que o contrato foi fechado.

- Compromissos podem ser reagendados por calendário e gerar confirmações/lembretes automáticos. Não há necessidade de CTA “Create Estimate” ao concluir appointment.

- Estimate começa por seleção de Property, depois “Template” ou “Em branco”. Templates podem ser da empresa ou do vendedor, conforme permissão.

- Header do Estimate contém número, cliente, Property, vendedor, Filial, criação e expiração. Numeração é automática e prefixo configurável.

- Cada linha de serviço possui nome, descrição, quantidade, unidade, preço unitário, desconto, imposto, total e fotos. Descrição pode ser alterada sem modificar o catálogo.

- Serviços ad hoc podem ser criados no Estimate e opcionalmente salvos no catálogo.

- Total: Subtotal, Discount, Tax, Total Contract Value, Deposit Required, Remaining Balance. Total Contract Value no CRM usa somente Estimates aprovados/Won.

- Fotos podem existir no Estimate e por line item, mas templates não carregam fotos.

- Customer Notes, Terms & Conditions e Internal Notes são separados. Terms podem usar template.

- Payment Terms cadastrados podem ser escolhidos pelo vendedor e, conforme configuração, também pelo cliente. Financing aparece quando disponível.

- Antes de qualquer envio, Preview é obrigatório. Download PDF e Print ficam disponíveis.

- Estimate tem Draft, autosave e envio por Email, SMS ou ambos. O remetente escolhe os contatos e pode personalizar a mensagem.

- Status: Draft, Sent, Viewed, Awaiting Approval, Approved, Rejected, Expired, Cancelled. Cada visualização do cliente é registrada; a UI resume First/Last Viewed.

- Follow-up pode ser automático e também manual.

- Cliente abre link seguro → autentica no Portal → retorna ao Estimate. Aprovação/rejeição é do documento como um todo (sem Good/Better/Best).

- Rejeição exige motivo e comentário opcional; não move automaticamente para Lost, deixando a decisão ao vendedor.

- Aprovação: cliente escolhe Payment Term/Method/Financing quando aplicável, assina desenhando ou digitando o nome, e o sistema registra signer, data/hora e metadados apropriados.

- Depósito pode ser cobrado imediatamente ou depois conforme configuração; Cash/Check pode deixar Deposit Pending.

- Aprovação padrão: Lifecycle = Customer, Pipeline = Won, cria Job, copia Property/serviços/valores/fotos/documentos, registra vendedor, calcula comissão, cria saldo de depósito e notifica Admin. Automação pode ser desligada.

- Após criação do Job: “Agendar agora” ou “Fazer depois”.

- Estimate pode ter múltiplas versões antes da aprovação; cliente vê somente a versão ativa e recebe aviso quando uma versão enviada é substituída.

- Estimate aprovado é Locked; mudanças viram Change Order.

- Estimate pode ser duplicado; nova cópia é independente. Também pode ser convertido em Template.

- Quando outro Estimate é aprovado para a mesma Property, pode criar novo Job ou adicionar Services a Job existente.

# 8. Projetos (Jobs) e Serviços

- Projects abre por padrão no Kanban, com alternativa List e filtros/Saved Views.

- Card padrão do Kanban: Cliente, Propriedade, Valor Total do Contrato, Status, Vendedor do Projeto e alertas. A empresa pode personalizar os campos.

- Arrastar card altera status; Waiting pode solicitar motivo opcional.

- Job Detail: Overview, Services, Schedule, Tasks, Financial, Change Orders, Materials, Photos, Documents, Messages, Activity e Daily Logs consolidados.

- Milestones permanecem na Overview com “Ver tudo”, evitando nova tab principal.

- Overview: resumo, progresso, serviços, milestones, próximas ações, requer atenção, equipe e atividade recente.

- Mostra “X de Y serviços concluídos”, % do projeto e próximo serviço. Não mostra Planned/Estimated Completion; atraso pode aparecer como badge simples (ex.: “2 dias de atraso”).

- O cabeçalho do Projeto não precisa exibir Total Contract Value, mesmo para usuários financeiros; o valor continua disponível onde fizer sentido no fluxo.

- Cada Service possui Detail próprio: Overview, Schedule, Checklist, Daily Logs, Materials, Photos, Documents, Activity.

- Service Overview: status, Crew/Equipe, datas planejadas/reais, quantidade, unidade/capacidade, duração calculada, progresso, notas e responsáveis.

- Quantidade pode ser editada com permissão e Audit Log; se isso mudar duração, dispara Escadinha e pergunta se serviços seguintes devem mudar de data.

- Progresso pode ser manual ou automático por Template; checklist pode ter pesos. Manager/Admin pode ajustar manualmente com auditoria.

- Milestones podem vir de Template e ser adicionados manualmente.

- Um Daily Log por Service por dia; nova tentativa abre o existente. Depois de Service DONE, campos ficam read-only e apenas novas fotos podem ser adicionadas; reabertura exige Manager/Admin autorizado.

- Change Order nasce como solicitação sem preço no campo, passa por vendedor/Admin para precificação, Preview, cliente, aprovação/rejeição e assinatura. Pode ter múltiplos itens e múltiplas solicitações em lote.

- Materials separa Requests e Purchases; uma solicitação pode gerar múltiplas compras.

- Photos usam galeria, categorias, filtros, bulk actions e restrição de exclusão para registros oficiais.

- Documents possuem categoria, visibilidade, vínculo e preview quando possível.

- Messages possui subtabs Customer e Internal; Job Chat automático abre na área interna.

- Tasks no Job são apenas as vinculadas ao projeto e registram conclusão no Activity Log.

- Activity é cronológica e filtrável.

- Cliente/Property de Job com Estimate aprovado/documentos assinados fica bloqueado contra troca; qualquer exceção anterior a isso é fortemente restrita.

- Services adicionados por Estimates posteriores registram origem (Estimate ID).

- Antes de Completed, o sistema verifica pendências; cada regra pode ser warning ou blocking conforme configuração.

- Completed oferece Project Progress Report, Create Invoice e assinatura do cliente quando necessário. Invoice permanece manual.

- Paid pode ser automático quando todos os invoices forem pagos; “Closed” é status administrativo opcional.

- Project pode ser favoritado, ter link interno copiável, resumo imprimível e ser arquivado sem perder histórico.

# 9. Agenda, Crews/Equipes e Operações de Campo

- Schedule abre em Week. Views: Day, Week, Month, Agenda/List, Employee, Crew/Team, Salesperson, Service e Location.

- Filtros rápidos, Saved Views, cores configuráveis e respeito automático ao Location Selector global.

- Card do calendário é configurável. Clique abre Drawer de resumo com links para Service/Job.

- Drag & Drop altera data; resize altera duração; mover entre linhas altera atribuição. Duplicar agendamento fica fora da V1.

- Service pode ser agendado pelo Job, Service Detail ou Schedule. Pode-se agendar individualmente ou por wizard em sequência.

- Data e Crew/Team podem ser escolhidos em qualquer ordem, desde que ambos estejam válidos antes de salvar.

- Production Capacity: quantidade + unidade + capacidade da Crew/Team calculam duração e End Date automaticamente. Equipe soma apenas Crews efetivamente selecionadas/disponíveis.

- Sem capacidade configurada, duração é manual. Override manual exige permissão; motivo e histórico são registrados.

- Cálculo respeita dias/horários da Filial, feriados e bloqueios. Capacidade fracionada pode usar incrementos simples como 0,5 dia.

- Conflitos impedem salvamento imediato e mostram Job/Service conflitante. Opções: Agendar Mesmo Assim, Outra Data, Outra Crew/Equipe. “Mesmo assim” usa segunda confirmação.

- Conflitos de Equipe identificam qual Crew está sobreposta; conflitos de funcionário individual também são detectados e nunca são escondidos.

- Trocar Crew/Team recalcula capacidade/duração. Se datas mudarem, a Escadinha dispara: considera apenas Services futuros não concluídos, preserva intervalos relativos, mostra Before/After, lista novos conflitos e permite Undo imediato.

- Uma Crew pode pertencer a mais de uma Equipe. Ao atribuir Equipe, escolhem-se quais Crews participarão; capacidade usa apenas as escolhidas.

- Primary Crew + Additional Crew/Workers é permitido. Subcontractors usam o mesmo mecanismo de agenda/capacidade, identificados como recursos externos.

- Disponibilidade: Available, Partially Booked, Fully Booked, Unavailable. Crew Detail mostra calendário, capacidade, Services, membros e próximos agendamentos.

- Bloqueios podem ser por intervalo, dia inteiro, vários dias e recorrentes. Feriados podem ser globais com override por Filial; criação posterior alerta agendamentos afetados, sem mover automaticamente.

- Serviços recorrentes suportam padrões flexíveis. Editar ocorrência oferece “Somente esta”, “Esta e futuras” ou “Toda a série”. Feriado/bloqueio pede nova data.

- Field Worker entra em “Hoje”, vendo somente Services/Jobs atribuídos. Service mobile: Overview, Checklist, Daily Log, Materials, Photos, Change Order, Documents, Chat.

- Empresa controla quais status o trabalhador pode alterar. Todos os membros autorizados de uma Crew veem informações operacionais e podem atualizar o único Daily Log do dia.

- Daily Log mobile pré-preenche contexto; campos podem ser obrigatórios. Upload múltiplo de imagens com compressão. Vídeo fica para depois.

- Report Problem é separado de Change Order e Material Request. Trabalhador vê o status das solicitações que enviou.

- Mark Service Complete valida checklist, Daily Log, Change Orders, materiais e regras configuradas. Assinatura usa template; se cliente não estiver presente, gera pendência posterior.

- Reagendamentos podem notificar cliente/equipe/vendedor/PM/Admin; Field Worker recebe Push com Deep Link.

- Endereço abre Google Maps ou Apple Maps. Mapa administrativo mostra pins do dia sem otimização automática de rota. Work Order e Checklist são imprimíveis.

# 10. Financeiro, Compras e Portal do Cliente

- Financial: Invoices, Payments, Accounts Receivable, Commissions, Financing. Resumo financeiro no topo respeita permissão.

- Create Invoice pode partir do Job, Financial \> Invoices ou conclusão do Job; progress billing permite faturar antes de Completed.

- Usuário escolhe Services, Change Orders ou percentuais a faturar. Labels: Deposit, Progress, Final. Payment Terms usam datas e percentuais.

- Pode haver provider padrão e override autorizado. Antes de enviar: Review/Preview e Save Draft.

- CrewCommand armazena vínculo externo, número, valor, vencimento, status, link e sync status. Webhooks/API atualizam status quando possível; Sync Failed oferece Retry.

- Múltiplos invoices por Job; o sistema compara total faturado com Contract Value + approved Change Orders e bloqueia overbilling por padrão, salvo exceção autorizada e justificada.

- Invoice pode ter ajustes autorizados sem alterar Estimate aprovado; destinatários são selecionáveis. Depois de criado externamente, aparece no Client Portal.

- Void/Cancel segue suporte do provider e preserva histórico.

- Payment Schedule mostra parcelas/percentuais/datas/status/saldo. Depósitos e pagamentos parciais reduzem saldos automaticamente.

- Approved Change Order aumenta saldo ainda não faturado. Job Finance mostra Contract Total, Invoiced, Paid e Open Balance.

- Payments: Card, ACH, Cash, Check, PayPal, Financing, Zelle, Wire e custom. Dados sensíveis de cartão ficam no provider.

- Record Payment manual exige permissão e gera recibo. Cada pagamento se aplica a Invoice específico; overpayment é bloqueado enquanto não houver Customer Credit.

- Refund é transação separada. Timeline financeira registra eventos.

- Financing providers são cadastráveis; cliente escolhe no Estimate/Portal. Status: Applied/Pending/Approved/Declined/Funded; valor aprovado pode ser menor que o contrato.

- Accounts Receivable usa aging Current, 1–30, 31–60, 61–90, 90+; filtros e drill-down. Reminders param ao ficar Paid e podem ser pausados manualmente.

- Commissions: Owner/Admin vê todas, vendedor só as próprias. Modelos: % sale, % gross profit, fixed, % by service, combination. Trigger configurável. Status Projected, Earned, Approved, Paid. Ajustes exigem motivo; Paid congela.

- Purchases: tabs Purchases, Purchase Orders, Vendors/Stores. Compra pode existir sem Material Request, com permissão. Vendor Detail mostra histórico e total gasto.

- Client Portal: Email + Password, branding da empresa, múltiplas Properties, Home com projetos, próximos serviços, approvals, invoices e documentos.

- Project progress fica oculto por padrão e pode ser liberado. Daily Log/Photos/Progress Report dependem de visibilidade configurada.

- Portal Documents permite upload com nome e vínculo. Estimates/Change Orders/Invoices/Receipts permitidos podem ser baixados/impressos.

- Cliente pode ver saldo, pagamentos, depósito, parcelas, método e financiamento; pode atualizar dados básicos do perfil.

- Nova Property no Portal vira solicitação para revisão da empresa, não criação direta.

- Request Service / Request Estimate entra na V1 como solicitação/Lead para revisão interna.

- Portal é totalmente responsivo.

# 11. Caixa de Entrada, Chat, Tarefas, Notificações e Automações

- Inbox é único, com separação clara entre Customer Communications e Internal Chat.

- Customer channels: SMS, Email, Portal. Filtros por canal, cliente, Job, usuário, Filial, lida/não lida e data.

- Conversas têm responsável, transferência auditada, busca, arquivo sem exclusão e links para Customer/Property/Job.

- SMS e Email são bidirecionais quando o provider permitir. Falhas aparecem com motivo e Retry. Delivery/Open/Bounce/Reply são registrados quando disponíveis.

- Anexos são permitidos onde o canal suportar. Scheduled Messages respeitam fuso e preferências.

- Identidade padrão pode ser global com override por Filial.

- Message Templates são categorizados por canal, usam variáveis e podem ser editados antes do envio manual.

- Consentimento/opt-out é armazenado por contato e canal; envios proibidos são bloqueados com explicação.

- Internal Chat: Direct, Groups, Job Chats, Crew Chats; criação automática de Job Chat; permissões controlam histórico e administração do grupo.

- Chat suporta imagens, áudio, documentos, @mentions, replies, pinned, read receipts, reactions, busca e mute. Editar mostra “Editada” e mantém histórico; delete usa soft delete autorizado.

- Tasks: My/All/Overdue/Completed; vínculo opcional com Lead, Client, Property, Estimate ou Job. Um responsável principal + Followers.

- Task tem título, descrição, due date/time, prioridade, status, comentários, anexos, subtasks/checklist e recurrence. Bulk Actions e Templates são suportados.

- Notification Center: In-App, Email, SMS, Push. Usuário personaliza, exceto notificações obrigatórias. Deep Links são padrão; repetidas podem ser agrupadas; Quiet Hours valem para não críticas.

- Approvals: Change Orders, Material Requests, Commission Adjustments e extensível. Dashboard/Sidebar mostra pendências. Reject exige Reason e tudo é auditado. Delegação temporária é permitida.

- Automation Engine usa QUANDO → SE → ENTÃO, com automações prontas e custom.

- Triggers cobrem Lead, Estimate, Job, Service, Task, Invoice, Payment, Change Order, Material Request e Schedule; Conditions suportam AND/OR; Actions incluem Task, mensagem, notificação, assignment, status e tag.

- Automações suportam delay/wait, janelas de envio, prevenção de loops, enable/disable, modo de teste, histórico de execuções e limites por plano.

- Toda Task criada por automação informa sua origem; falhas alertam Owner/Admin e ficam visíveis. Falta de provider nunca é tratada como envio bem-sucedido.

# 12. Configurações, Relatórios, Plataforma e Super Admin

- Todos têm Settings pessoais; Owner vê tudo; Admin vê somente tabs liberadas.

- Settings: Empresa, Filiais, Usuários & Permissões, Serviços, Templates, Pipelines, Custom Fields, Financeiro, Comunicações, Automações, Integrações, Billing, Data & Retention.

- Branding define logo e pontos de aplicação; detalhamento visual fica para UI/UX.

- Locations têm endereço, contato, timezone, horário, usuários, Crews e feriados.

- Service Catalog e Production Units são configuráveis. Pipelines permitem criar, renomear, reordenar e excluir com proteção de registros existentes.

- Roles padrão + Custom Roles; permissões granulares por módulo/ação. Usuário pode estar em múltiplas Filiais e Workspaces.

- Primary Owner pode ser transferido com confirmação forte e auditoria; apenas um por empresa.

- Integrations mostram Connected/Disconnected/Error/Needs Reauthorization; empresas conectam contas próprias via OAuth quando possível. Pode haver mais de um provider do mesmo tipo com default.

- Public API, Webhooks e MCP são controlados por plano/permissão. API keys têm scopes e revogação; webhooks têm assinatura, delivery logs e retry; MCP respeita Workspace/usuário/escopos e pode ser desligado.

- Planos provisórios: Starter, Growth, Pro, Enterprise; 5 usuários incluídos e cobrança adicional por usuário. Limites podem envolver Users, Locations, Storage, SMS, Automations, Custom Fields, Templates, Crews, Integrations, Advanced Reports, API e Webhooks.

- Atingir limite bloqueia ação com explicação e CTA de upgrade. Owner vê Usage.

- Payment Failed → Grace Period de 3 dias → Read-only → Suspended. Dados não são apagados e acesso retorna após pagamento.

- Cancelamento direto pelo Owner; depois há período Export-only antes da exclusão definitiva.

- Reports: Sales, Jobs, Crews, Operations, Financial. Filtros, Saved Views, PDF/Excel/CSV/Print, drill-down e comparação de período. Envio recorrente por e-mail fica para versão posterior.

- Global Search agrupa resultados por entidade. Recent Items, Breadcrumbs e preservação de contexto são padrões.

- Internal Announcements podem segmentar Role, Crew, Filial e usuários.

- Audit Log global mostra Before → After, é exportável e não editável por usuários comuns. Soft Delete + Recycle Bin para registros apropriados; assinados/financeiros têm regras mais rígidas.

- Idiomas V1: Inglês (padrão), Espanhol e Português-BR. USD padrão com arquitetura multi-moeda. Timezone por Filial. Unidades e formatos configuráveis.

- Help & Support começa com artigos de texto e imagens; Setup Guide permanece disponível. Support Access exige autorização e auditoria.

- Super Admin é aplicação separada com Companies, Users, Trials, Subscriptions, Plans, Limits, Storage, SMS usage, Integrations, Errors e Support; Feature Flags controlam rollout. Acesso a dados privados não é padrão e impersonation mostra banner permanente.

# 13. Mapa de navegação por Role

| **Role**             | **Caminho principal**                                                                         | **Prioridade de superfície** |
|----------------------|-----------------------------------------------------------------------------------------------|------------------------------|
| Owner/Admin          | Login → Workspace → Dashboard → qualquer módulo autorizado → registro → ação → Activity/Audit | Desktop-first / Responsivo   |
| Vendedor             | Login → Dashboard de Vendas → CRM/Pipeline → Lead/Cliente → Estimate → Follow-up / Won → Job  | Desktop + Tablet + Mobile    |
| Gerente de Projeto   | Login → Dashboard PM → Projetos/Agenda → Job/Service → Crew/Task/Approval → conclusão         | Desktop + Tablet             |
| Funcionário de Campo | Login → Hoje → Service atribuído → Checklist/Daily Log/Photos/Issue/CO/Material → Complete    | Mobile-first / Tablet        |
| Financeiro           | Login → Dashboard Financeiro → Invoices/Payments/AR/Commissions/Purchases → Reports           | Desktop-first                |
| Cliente              | Portal Login → Home → Property → Project/Estimate/CO/Invoice/Documents → ação                 | Mobile + Web responsivo      |
| Super Admin          | Admin Login → Platform Dashboard → Company/Subscription/Plan/Integration/Support              | Desktop-first                |

# 14. Catálogo mestre de telas

| **ID**         | **Tela**                     | **Módulo**    | **Prioridade** |
|----------------|------------------------------|---------------|----------------|
| SCR-AUTH-001   | Login                        | Autenticação  | Compartilhada  |
| SCR-AUTH-002   | Cadastro / Trial             | Autenticação  | Web            |
| SCR-AUTH-003   | Verificação de e-mail        | Autenticação  | Web            |
| SCR-AUTH-004   | Escolha de plano             | Autenticação  | Web            |
| SCR-AUTH-005   | Escolha de Workspace         | Autenticação  | Compartilhada  |
| SCR-AUTH-006   | Recuperar senha              | Autenticação  | Compartilhada  |
| SCR-AUTH-007   | Trial Expirado / Assinar     | Autenticação  | Web            |
| SCR-AUTH-008   | Conta Suspensa / Pagamento   | Autenticação  | Web            |
| SCR-ONB-001    | Onboarding / Setup Wizard    | Onboarding    | Web            |
| SCR-ONB-002    | Guia de Configuração         | Onboarding    | Web            |
| SCR-DASH-001   | Dashboard Owner/Admin        | Dashboard     | Desktop        |
| SCR-DASH-002   | Dashboard Vendedor           | Dashboard     | Responsiva     |
| SCR-DASH-003   | Dashboard Gerente de Projeto | Dashboard     | Responsiva     |
| SCR-DASH-004   | Dashboard Financeiro         | Dashboard     | Desktop        |
| SCR-DASH-005   | Home Funcionário de Campo    | Dashboard     | Mobile         |
| SCR-CRM-001    | Lista CRM                    | CRM           | Desktop/Tablet |
| SCR-CRM-002    | Novo Contato                 | CRM           | Compartilhada  |
| SCR-CRM-003    | Detalhes Lead/Cliente        | CRM           | Compartilhada  |
| SCR-CRM-004    | Detalhes Property            | CRM           | Compartilhada  |
| SCR-CRM-005    | Importação CRM               | CRM           | Desktop        |
| SCR-SALES-001  | Sales Pipeline               | Vendas        | Desktop/Tablet |
| SCR-SALES-002  | Compromissos                 | Vendas        | Compartilhada  |
| SCR-SALES-003  | Lista de Orçamentos          | Vendas        | Desktop/Tablet |
| SCR-SALES-004  | Editor de Orçamento          | Vendas        | Compartilhada  |
| SCR-SALES-005  | Preview de Orçamento         | Vendas        | Compartilhada  |
| SCR-SALES-006  | Detalhe do Orçamento         | Vendas        | Compartilhada  |
| SCR-SALES-007  | Aprovação do Cliente         | Vendas/Portal | Compartilhada  |
| SCR-JOB-001    | Kanban de Projetos           | Projetos      | Desktop/Tablet |
| SCR-JOB-002    | Lista de Projetos            | Projetos      | Desktop/Tablet |
| SCR-JOB-003    | Visão Geral do Projeto       | Projetos      | Compartilhada  |
| SCR-JOB-004    | Serviços do Projeto          | Projetos      | Compartilhada  |
| SCR-JOB-005    | Detalhe do Serviço           | Projetos      | Compartilhada  |
| SCR-JOB-006    | Daily Logs Consolidados      | Projetos      | Compartilhada  |
| SCR-JOB-007    | Change Orders                | Projetos      | Compartilhada  |
| SCR-JOB-008    | Materiais                    | Projetos      | Compartilhada  |
| SCR-JOB-009    | Fotos                        | Projetos      | Compartilhada  |
| SCR-JOB-010    | Documentos                   | Projetos      | Compartilhada  |
| SCR-JOB-011    | Mensagens do Projeto         | Projetos      | Compartilhada  |
| SCR-JOB-012    | Atividade do Projeto         | Projetos      | Compartilhada  |
| SCR-JOB-013    | Project Progress Report      | Projetos      | Compartilhada  |
| SCR-SCH-001    | Agenda                       | Agenda        | Desktop/Tablet |
| SCR-SCH-002    | Drawer do agendamento        | Agenda        | Compartilhada  |
| SCR-SCH-003    | Wizard de agendamento        | Agenda        | Compartilhada  |
| SCR-SCH-004    | Conflito de Agenda           | Agenda        | Compartilhada  |
| SCR-SCH-005    | Preview Escadinha            | Agenda        | Desktop/Tablet |
| SCR-SCH-006    | Editor de Recorrência        | Agenda        | Compartilhada  |
| SCR-TEAM-001   | Equipe / Usuários            | Equipe        | Desktop        |
| SCR-TEAM-002   | Crews/Equipes                | Equipe        | Desktop/Tablet |
| SCR-TEAM-003   | Detalhe da Crew              | Equipe        | Compartilhada  |
| SCR-TEAM-004   | Subcontratados               | Equipe        | Desktop        |
| SCR-TEAM-005   | Disponibilidade/Bloqueios    | Equipe        | Desktop/Tablet |
| SCR-FIELD-001  | Hoje                         | Campo         | Mobile         |
| SCR-FIELD-002  | Service Mobile               | Campo         | Mobile         |
| SCR-FIELD-003  | Daily Log Mobile             | Campo         | Mobile         |
| SCR-FIELD-004  | Reportar Problema            | Campo         | Mobile         |
| SCR-FIELD-005  | Solicitar Change Order       | Campo         | Mobile         |
| SCR-FIELD-006  | Solicitar Material           | Campo         | Mobile         |
| SCR-FIELD-007  | Assinatura de Conclusão      | Campo         | Mobile/Tablet  |
| SCR-FIN-001    | Financeiro Overview          | Financeiro    | Desktop        |
| SCR-FIN-002    | Invoices                     | Financeiro    | Desktop        |
| SCR-FIN-003    | Criar/Revisar Invoice        | Financeiro    | Desktop/Tablet |
| SCR-FIN-004    | Detalhe Invoice              | Financeiro    | Compartilhada  |
| SCR-FIN-005    | Payments                     | Financeiro    | Desktop        |
| SCR-FIN-006    | Accounts Receivable          | Financeiro    | Desktop        |
| SCR-FIN-007    | Commissions                  | Financeiro    | Desktop        |
| SCR-FIN-008    | Financing                    | Financeiro    | Desktop        |
| SCR-PUR-001    | Purchases                    | Compras       | Desktop        |
| SCR-PUR-002    | Purchase Orders              | Compras       | Desktop        |
| SCR-PUR-003    | Vendors/Stores               | Compras       | Desktop        |
| SCR-PUR-004    | Detalhe Vendor               | Compras       | Desktop        |
| SCR-PORT-001   | Portal Login                 | Portal        | Compartilhada  |
| SCR-PORT-002   | Portal Home                  | Portal        | Compartilhada  |
| SCR-PORT-003   | Portal Properties            | Portal        | Compartilhada  |
| SCR-PORT-004   | Portal Project               | Portal        | Compartilhada  |
| SCR-PORT-005   | Portal Estimate              | Portal        | Compartilhada  |
| SCR-PORT-006   | Portal Change Order          | Portal        | Compartilhada  |
| SCR-PORT-007   | Portal Documents             | Portal        | Compartilhada  |
| SCR-PORT-008   | Portal Financeiro            | Portal        | Compartilhada  |
| SCR-PORT-009   | Solicitar Serviço/Orçamento  | Portal        | Compartilhada  |
| SCR-INB-001    | Customer Inbox               | Comunicação   | Desktop/Tablet |
| SCR-INB-002    | Internal Chat                | Comunicação   | Compartilhada  |
| SCR-INB-003    | Conversa                     | Comunicação   | Compartilhada  |
| SCR-INB-004    | Grupo / Job Chat             | Comunicação   | Compartilhada  |
| SCR-TASK-001   | Lista de Tarefas             | Tarefas       | Compartilhada  |
| SCR-TASK-002   | Detalhe da Tarefa            | Tarefas       | Compartilhada  |
| SCR-TASK-003   | Criar Tarefa                 | Tarefas       | Compartilhada  |
| SCR-NOT-001    | Central de Notificações      | Notificações  | Compartilhada  |
| SCR-APR-001    | Central de Aprovações        | Aprovações    | Desktop/Tablet |
| SCR-AUT-001    | Lista de Automações          | Automações    | Desktop        |
| SCR-AUT-002    | Builder de Automação         | Automações    | Desktop        |
| SCR-AUT-003    | Teste de Automação           | Automações    | Desktop        |
| SCR-AUT-004    | Histórico de Automações      | Automações    | Desktop        |
| SCR-SET-001    | Configurações Pessoais       | Configurações | Compartilhada  |
| SCR-SET-002    | Empresa                      | Configurações | Desktop        |
| SCR-SET-003    | Filiais                      | Configurações | Desktop        |
| SCR-SET-004    | Usuários & Permissões        | Configurações | Desktop        |
| SCR-SET-005    | Serviços                     | Configurações | Desktop        |
| SCR-SET-006    | Templates                    | Configurações | Desktop        |
| SCR-SET-007    | Pipelines                    | Configurações | Desktop        |
| SCR-SET-008    | Custom Fields                | Configurações | Desktop        |
| SCR-SET-009    | Financeiro                   | Configurações | Desktop        |
| SCR-SET-010    | Comunicações                 | Configurações | Desktop        |
| SCR-SET-011    | Integrações                  | Configurações | Desktop        |
| SCR-SET-012    | Billing/Planos               | Configurações | Desktop        |
| SCR-SET-013    | Data & Retention             | Configurações | Desktop        |
| SCR-REP-001    | Relatórios Home              | Relatórios    | Desktop        |
| SCR-REP-002    | Relatório / Drill-down       | Relatórios    | Desktop        |
| SCR-SEARCH-001 | Busca Global                 | Global        | Compartilhada  |
| SCR-HELP-001   | Ajuda & Suporte              | Global        | Compartilhada  |
| SCR-SA-001     | Super Admin Dashboard        | Super Admin   | Desktop        |
| SCR-SA-002     | Empresas                     | Super Admin   | Desktop        |
| SCR-SA-003     | Assinaturas/Trials           | Super Admin   | Desktop        |
| SCR-SA-004     | Planos/Limites               | Super Admin   | Desktop        |
| SCR-SA-005     | Feature Flags                | Super Admin   | Desktop        |
| SCR-SA-006     | Saúde das Integrações        | Super Admin   | Desktop        |
| SCR-SA-007     | Support Access               | Super Admin   | Desktop        |

# 15. Fluxos críticos: Happy Path e principais exceções

| **Fluxo**                       | **Happy Path**                                                                                                                                                       | **Principais exceções**                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| F-01 Lead → Customer            | Criar/importar Lead → atribuir vendedor → follow-up → Estimate → cliente aprova/assina → Lifecycle Customer → Pipeline Won → Job criado.                             | Duplicado; múltiplas Properties; Estimate expira/rejeita; versão atualizada; pagamento/financing indisponível. |
| F-02 Estimate → Job             | Escolher Property → Template/Blank → services → preview obrigatório → envio → viewed → approval/signature → Job.                                                     | Contato sem Property; provider ausente; assinatura incompleta; Estimate aprovado fica Locked.                  |
| F-03 Agendamento por capacidade | Selecionar Service + Crew/Team → carregar capacity → calcular duração/end date → validar calendário → salvar.                                                        | Capacity ausente → duração manual; conflito → confirmar/alterar; override exige motivo.                        |
| F-04 Escadinha                  | Mudança de quantidade/Crew/data altera duração → identificar Services futuros → Preview Before/After → usuário escolhe mover ou manter → checar conflitos → aplicar. | Service concluído não move; novos conflitos precisam ser resolvidos; Undo imediato disponível.                 |
| F-05 Execução em campo          | Hoje → Service → checklist/Daily Log/fotos → issue/CO/material se necessário → assinatura → Complete.                                                                | Daily Log obrigatório ausente; cliente ausente; pedido pendente; reabertura só por Manager/Admin.              |
| F-06 Change Order               | Field Request sem preço → Sales/Admin revisa e precifica → Preview → cliente → Accept/Reject → assinatura → valor do Job aumenta.                                    | Rejeição exige motivo; múltiplos itens; envio falha; aprovado fica Locked.                                     |
| F-07 Invoice/Payment            | Create Invoice manual → Review → provider → sincronizar status → cliente paga → saldo atualiza → Job pode chegar a Paid.                                             | Sync Failed → Retry; overbilling bloqueado; overpayment bloqueado; refund preserva original.                   |
| F-08 Comunicação                | Usuário envia por Inbox/entidade → provider → delivery event → resposta volta → histórico/Activity.                                                                  | Opt-out bloqueia; provider ausente/falha; mensagem programada respeita timezone.                               |
| F-09 Automação                  | Trigger → conditions → actions → registrar run.                                                                                                                      | Loop detectado; provider ausente; condição deixa de existir durante Wait; erro alerta Owner/Admin.             |
| F-10 Assinatura CrewCommand     | Trial → cobrança → ativo. Falha → 3 dias Grace → Read-only → Suspended → pagamento → restauração.                                                                    | Sem exclusão automática; cancelamento entra em Export-only antes de retenção final.                            |

# 16. Itens explicitamente fora da V1

- Offline Mode.

- Time Tracking / Clock In-Clock Out.

- GPS tracking contínuo.

- Route optimization automática.

- Vídeo em Daily Logs (fotos/documentos primeiro).

- Good / Better / Best e itens opcionais no Estimate.

- Customer Credit.

- Duplicar agendamento.

- Envio recorrente agendado de relatórios por e-mail.

- Status Page pública.

# 17. Decisões comerciais/técnicas ainda abertas

- Preços exatos dos planos e usuário adicional.

- Limites exatos de storage, SMS, Locations, automations e demais features por plano.

- Provider inicial de SMS/e-mail e política comercial de SMS.

- Providers financeiros prioritários no primeiro release.

- Duração do período Export-only, Recycle Bin e políticas de retenção padrão.

- Detalhes de stack, infraestrutura, banco, storage, push, observabilidade e estratégia mobile — definidos no TRD após o Domain Model e UI/UX.

# 18. Próximo documento dependente

O próximo documento é o Backend Schema / Domain Model. Ele transforma estas telas e fluxos em entidades, relacionamentos, estados e regras de consistência, sem ainda fechar tecnologia de banco ou framework.
