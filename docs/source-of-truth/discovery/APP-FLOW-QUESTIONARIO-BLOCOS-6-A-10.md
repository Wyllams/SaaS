**APP FLOW — QUESTIONÁRIO COMPLETO**

**Blocos 6 a 10**

Documento de descoberta e validação de fluxos

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Como responder<br />
</strong>Digite sua resposta logo após “Resposta:” em cada pergunta. Você pode responder com “Sim/Não”, escolher uma opção ou escrever livremente. Se precisar de mais espaço, basta continuar digitando — o documento se expande automaticamente.<br />
<br />
Importante: este questionário trata do fluxo e comportamento do aplicativo. Paleta de cores, fontes, componentes visuais e Design System serão definidos depois, no UI/UX Design Document.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Índice dos blocos

**BLOCO 6 — Jobs / Project Management** — 90 perguntas

> Mapeamento detalhado do Job, Services, progresso, Milestones, Daily Logs, Change Orders, Materials, Photos, Documents e Activity.

**BLOCO 7 — Schedule, Crews e Field Operations** — 86 perguntas

> Calendário, conflitos, capacidade de produção, lógica da Escadinha, Crews/Equipes, recorrências e execução mobile no campo.

**BLOCO 8 — Financial, Billing e Client Portal** — 90 perguntas

> Invoices, Payments, Accounts Receivable, Financing, Commissions, Purchases e toda a experiência financeira/portal do cliente.

**BLOCO 9 — Inbox, Chat, Tasks, Notifications e Automations** — 84 perguntas

> Comunicação externa e interna, tarefas, aprovações, notificações e motor de automações.

**BLOCO 10 — Settings, Reports, Super Admin e Fluxos Globais** — 115 perguntas

> Configurações, permissões, integrações, planos, relatórios, busca, auditoria, estados globais, suporte e Super Admin.

# BLOCO 6 — Jobs / Project Management

Mapeamento detalhado do Job, Services, progresso, Milestones, Daily Logs, Change Orders, Materials, Photos, Documents e Activity.

**Total deste bloco: 90 perguntas**

## Tela principal de Jobs

1\. Ao entrar em Jobs, vamos abrir por padrão o Pipeline/Kanban, correto?

Resposta:

2\. No topo, teremos Pipeline \| List e filtros como Location \| Status \| Project Manager \| Salesperson \| Crew \| Service \| Date \| Customer. Correto?

Resposta:

3\. Quer também permitir Saved Views? Exemplos: My Active Jobs, Roofing Jobs, Waiting for Material, Jobs Without Crew, Jobs Closing This Week.

Resposta:

4\. Nos cards do Kanban, proponho mostrar Job Number, Customer, Property, Total Contract Value, Status, Project Manager, próxima atividade/data, progresso % e alerta quando houver. Está bom?

Resposta:

5\. Quer permitir que a empresa personalize quais informações aparecem nos cards?

Resposta:

6\. Os cards precisam ser responsivos, principalmente em tablet. Confirmamos?

Resposta:

7\. Arrastar um card entre colunas altera o Status do Job, correto?

Resposta:

8\. Se o Status exigir informação complementar, devemos perguntar. Ex.: mover para Waiting -\> opcionalmente informar Waiting Reason. Correto?

Resposta:

## Job Detail

9\. Ao clicar no Job, abrimos Job \#1054 - John Smith. No Header: Status \| Progress % \| Contract Value \| Property \| Project Manager \| Salesperson \| Next Activity. Ações: Edit Job, Schedule, + Task, + Change Order, Add Material, Send Message, More. Faz sentido?

Resposta:

10\. Mantemos estas Tabs? Overview \| Services \| Schedule \| Tasks \| Financial \| Change Orders \| Materials \| Photos \| Documents \| Messages \| Activity.

Resposta:

11\. Quer adicionar uma Tab específica Daily Logs ou prefere que Daily Logs fiquem dentro de cada Service? Minha sugestão: ambos os acessos - dentro do Service para contexto específico e uma Tab Daily Logs para visão consolidada do Job.

Resposta:

12\. Quer também uma Tab Milestones separada ou Milestones dentro de Overview? Minha sugestão: no Overview, com opção View All.

Resposta:

## Overview do Job

13\. No Overview, proponho blocos: Job Summary, Progress, Services, Milestones, Next Actions, Needs Attention, Project Team e Recent Activity. Faz sentido?

Resposta:

14\. Quer mostrar no Overview algo como 3 of 5 Services Completed, 65% Project Complete e Next Service: Gutter Installation - Sep 28?

Resposta:

15\. Quer mostrar também Planned Completion e Estimated Completion quando o sistema perceber atraso?

Resposta:

16\. Se houver atraso, quer badge como 2 Days Behind?

Resposta:

17\. Quer mostrar o Total Contract Value no Header do Job para quem tiver permissão financeira?

Resposta:

## Services dentro do Job

18\. Na Tab Services, teremos lista/cards por serviço mostrando nome, status, Crew/Team, datas e progresso. Correto?

Resposta:

19\. Cada serviço terá seu próprio Detail quando clicar nele?

Resposta:

20\. Dentro do Service Detail, proponho: Overview \| Schedule \| Checklist \| Daily Logs \| Materials \| Photos \| Documents \| Activity. Quer assim?

Resposta:

21\. No Service Overview, mostrar Service Name, Status, Crew/Team, planned dates, actual dates, quantity, production unit, production capacity, calculated duration, progress %, notes e responsible users. Correto?

Resposta:

22\. Quer permitir editar a quantidade do serviço depois que o Job foi criado? Minha sugestão: permitir apenas com permissão e sempre registrar no Audit Log.

Resposta:

23\. Se a quantidade mudar e alterar dias necessários, devemos acionar a lógica da Escadinha, correto?

Resposta:

## Progresso

24\. O progresso do Service pode ser Manual ou Automático. Quer permitir que a empresa escolha por Service Template?

Resposta:

25\. Se o progresso for automático, quer permitir peso diferente para Checklist Items? Ex.: Preparation 10%, Installation 70%, Cleanup 20%.

Resposta:

26\. Mesmo em automático, Manager/Admin poderá ajustar manualmente se tiver permissão?

Resposta:

## Milestones

27\. No Job, Milestones terão name, status, planned date, completed date, responsible person e notes. Correto?

Resposta:

28\. Status padrão: Not Started \| In Progress \| Completed \| Delayed. Quer?

Resposta:

29\. Milestones poderão vir de Job Template?

Resposta:

30\. Quer permitir adicionar Milestone manualmente durante o Job?

Resposta:

## Daily Logs

31\. Na visão consolidada Daily Logs, mostrar por data o serviço e a Crew/Team correspondente. Correto?

Resposta:

32\. Ao abrir um Daily Log, mostrar Service, Date, Crew/Team, workers, progress, work completed, issues, materials, photos, notes, next steps e related Change Orders. Correto?

Resposta:

33\. Como definimos um único Daily Log por Service por dia, ao tentar criar outro no mesmo dia o sistema deve abrir o existente em vez de criar duplicado. Correto?

Resposta:

34\. Quer botão + Add Photos visível mesmo depois do Service estar DONE, conforme regra já definida?

Resposta:

35\. Depois de DONE, todos os outros campos aparecem somente leitura. Correto?

Resposta:

36\. Quer mostrar indicação Locked - Service Completed para ficar claro por que não pode editar?

Resposta:

## Change Orders

37\. Na Tab Change Orders, tabela com CO \# \| Service \| Requested By \| Status \| Amount \| Customer \| Created. Está bom?

Resposta:

38\. Status sugeridos: Draft \| Requested \| Under Review \| Ready for Customer \| Sent \| Viewed \| Approved \| Rejected \| Cancelled. Quer?

Resposta:

39\. Funcionário de campo cria apenas uma Request, sem definir preço, correto?

Resposta:

40\. O formulário de Request terá Service, Description, Reason, Photos e Documents opcional. Correto?

Resposta:

41\. Quando enviar, notificar o Salesperson responsável pela venda e os Admins apropriados. Correto?

Resposta:

42\. Na revisão, Salesperson/Admin adiciona final description, price, tax e terms se aplicável. Correto?

Resposta:

43\. Quer permitir que um Change Order contenha vários itens/linhas? Ex.: Extra plywood \$800 + Additional flashing \$350.

Resposta:

44\. Como o funcionário pode solicitar vários Change Orders de uma vez, quer um fluxo + Add Another Change Order antes de enviar todos?

Resposta:

45\. Ao enviar ao cliente, precisa obrigatoriamente passar por Preview antes, assim como Estimate? Minha recomendação: sim.

Resposta:

46\. Depois de aprovado pelo cliente: trava conteúdo, registra assinatura, adiciona valor ao Job, atualiza Total Contract Value e notifica Salesperson/Admin/Project Manager. Correto?

Resposta:

47\. Se rejeitado, o motivo aparece no Change Order e no Activity Log. Correto?

Resposta:

## Materials

48\. Na Tab Materials, você quer separar Material Requests e Purchases? Minha sugestão: sim.

Resposta:

49\. Em Material Requests, colunas: Material \| Service \| Requested By \| Quantity \| Status \| Date. Correto?

Resposta:

50\. Status: Requested \| Approved \| Rejected \| Purchased \| Delivered. Quer?

Resposta:

51\. Depois que aprovado, a compra poderá ser registrada diretamente dali?

Resposta:

52\. Na compra, campos: Store/Vendor, Purchase Date, Purchase Order Number, Material, Quantity, Amount, Purchased By, Paid/Unpaid, Receipt e Notes. Correto?

Resposta:

53\. Um Material Request poderá gerar mais de uma compra? Ex.: o material não estava disponível em uma única loja. Minha sugestão: permitir.

Resposta:

## Photos

54\. Na Tab Photos, quer visualização em Gallery com filtros All \| Before \| During \| After \| Damage \| Material \| Change Order \| Receipt?

Resposta:

55\. Quer também filtro por Service e Date?

Resposta:

56\. Ao clicar em foto, mostrar full image, category, Service, uploader, date/time, Daily Log relacionado e visibility. Correto?

Resposta:

57\. Quer permitir seleção de várias fotos para Download, Change Category e Make Customer Visible, desde que o usuário tenha permissão?

Resposta:

58\. Depois de uma foto fazer parte de Daily Log bloqueado ou documento oficial, exclusão deverá ser restrita. Concorda?

Resposta:

## Documents

59\. Na Tab Documents, categorias: Contracts \| Permits \| Warranties \| Drawings \| Measurements \| Customer Uploads \| Other. Faz sentido?

Resposta:

60\. Cada documento terá name, category, uploaded by, date, visibility e related Service/Job/Property. Correto?

Resposta:

61\. Quer preview de PDF/imagem dentro do CrewCommand quando possível, sem precisar baixar?

Resposta:

62\. Customer Visible deverá ter ícone/label claro para evitar envio acidental de documento interno. Correto?

Resposta:

## Messages

63\. Na Tab Messages, mostrar comunicação com cliente relacionada àquele Job em SMS \| Email \| Portal. Correto?

Resposta:

64\. Quer também um acesso separado Internal Chat dentro dessa tela, ou apenas link para Inbox -\> Internal? Minha sugestão: duas subtabs Customer \| Internal.

Resposta:

65\. Se existir Job Chat automático, abrir diretamente esse chat em Internal. Correto?

Resposta:

## Tasks

66\. Na Tab Tasks, mostrar somente Tasks relacionadas àquele Job, com filtros Open \| Completed \| Overdue \| By User. Correto?

Resposta:

67\. Quer permitir criar Task diretamente com + Task e já vincular automaticamente ao Job?

Resposta:

68\. Quando uma Task relacionada ao Job for concluída, além da notificação já definida, o evento entra no Activity Log. Correto?

Resposta:

## Activity

69\. Activity deve mostrar tudo cronologicamente: Job Created, Status Changed, Crew Assigned, Service Rescheduled, Daily Log Updated, Change Order Requested, Material Purchased, Photo Uploaded, Task Completed, Customer Message, payment-related event e field changes. Correto?

Resposta:

70\. Quer filtros All \| Services \| Schedule \| Financial \| Change Orders \| Materials \| Messages \| Files \| Changes?

Resposta:

## Edição e origem dos Services

71\. O botão Edit Job permitirá alterar Project Manager, Job name, internal notes, tags, Custom Fields, Services se permitido e Status. Correto?

Resposta:

72\. Customer/Property devem poder ser alterados depois que Job existe? Minha recomendação: muito restrito, apenas Owner/Admin com confirmação forte.

Resposta:

73\. Se houver Estimate aprovado e documentos assinados, trocar Customer/Property deve ser bloqueado? Minha recomendação: sim.

Resposta:

74\. Outro Estimate aprovado poderá Create New Job ou Add Services to Existing Job. Ao adicionar ao Job existente, os novos Services aparecem normalmente na Tab Services. Correto?

Resposta:

75\. Quer identificar visualmente a origem de cada serviço, por exemplo From Estimate EST-1045? Minha recomendação: sim.

Resposta:

## Conclusão do Job

76\. Antes de marcar o Job inteiro como Completed, o sistema deverá verificar Services incompletos, Daily Logs pendentes, open Change Orders, material requests abertas, tasks críticas e assinaturas pendentes. Correto?

Resposta:

77\. Como no Service, essas verificações podem ser warning ou blocking conforme configuração da empresa. Correto?

Resposta:

78\. Depois de Completed, quer mostrar Generate Project Progress Report, Create Invoice e Request Customer Signature, se necessário?

Resposta:

79\. Mesmo com Job Completed, Invoice continua ação manual, conforme já definido. Correto?

Resposta:

80\. Quando todos os Invoices forem pagos, o Job pode automaticamente mudar para Paid se a empresa ativar essa automação. Correto?

Resposta:

81\. Depois de Paid, você quer estado adicional Closed ou Paid já pode funcionar como estado final? Minha sugestão: Closed opcional.

Resposta:

## Mobile / Tablet

82\. Project Manager no tablet/mobile poderá abrir Job e acessar praticamente todas as Tabs que sua permissão permitir?

Resposta:

83\. Field Worker verá versão reduzida: Overview \| Checklist \| Daily Log \| Materials \| Photos \| Change Order \| Documents \| Chat. Correto?

Resposta:

84\. Ele não verá Financial, comissão ou informações não permitidas. Correto?

Resposta:

85\. Se houver vários Services atribuídos a ele dentro do mesmo Job, a primeira tela deve mostrar quais Services são dele. Correto?

Resposta:

## Ações finais e hierarquia

86\. Quer permitir Favorite/Pin Job para um usuário manter Jobs importantes no topo?

Resposta:

87\. Quer uma ação Copy Job Link para compartilhar internamente, respeitando permissões e Deep Link?

Resposta:

88\. Quer imprimir um resumo completo do Job, como Print Job Summary?

Resposta:

89\. O Job poderá ser Archived depois de encerrado, sem apagar histórico? Minha recomendação: sim.

Resposta:

90\. Confirmamos a hierarquia estrutural: Customer -\> Property -\> Estimate -\> Job -\> Services -\> Schedule/Checklist/Daily Logs/Materials/Photos/Documents, e o Job conecta transversalmente Tasks, Change Orders, Messages, Financial e Activity?

Resposta:

# BLOCO 7 — Schedule, Crews e Field Operations

Calendário, conflitos, capacidade de produção, lógica da Escadinha, Crews/Equipes, recorrências e execução mobile no campo.

**Total deste bloco: 86 perguntas**

## Schedule — visão principal

1\. Ao entrar em Schedule, a visualização padrão será Week, conforme já definido. Confirmamos?

Resposta:

2\. Manteremos as visualizações Day \| Week \| Month \| Agenda/List \| Employee \| Crew/Team \| Salesperson \| Service \| Location?

Resposta:

3\. Quer filtros rápidos por Location, Crew, Team, Employee, Service, Status, Job e Date Range?

Resposta:

4\. Quer Saved Views no Schedule, por exemplo Roofing Crews, Sales Appointments, Miami Location e Unassigned Services?

Resposta:

5\. O Schedule deve respeitar automaticamente o Location Selector global do Topbar?

Resposta:

6\. Cada card do calendário deve mostrar pelo menos horário/data, Customer, Service, Job \# e Status. Quer permitir personalizar os campos visíveis?

Resposta:

7\. Confirmamos que a empresa poderá configurar cores por Crew, Employee, Service, Status e Location?

Resposta:

8\. Ao clicar em um card do calendário, quer abrir um resumo rápido em Drawer e ter botão Open Service/Open Job?

Resposta:

9\. Arrastar o card muda a data; redimensionar muda a duração; mover entre linhas de Crew/Employee muda a atribuição. Correto?

Resposta:

10\. Duplicar agendamento não fará parte da V1. Confirmamos?

Resposta:

## Fluxo de agendamento de um Service

11\. Um Service poderá ser agendado a partir do Job, do Service Detail e do próprio Schedule. Correto?

Resposta:

12\. Ao iniciar pelo Schedule, o usuário deverá selecionar primeiro Job/Customer/Property e depois o Service a ser agendado?

Resposta:

13\. Se um Job tiver vários Services, o usuário poderá agendar um Service por vez ou deseja um wizard para agendar vários em sequência? Minha sugestão: permitir ambos.

Resposta:

14\. Você prefere permitir começar escolhendo Data ou Crew/Team, sem obrigar uma ordem fixa, desde que antes de salvar ambos estejam definidos?

Resposta:

15\. Para Services com Production Unit configurada, o sistema deve carregar automaticamente Quantity, Unit e a capacidade da Crew/Team escolhida?

Resposta:

16\. Quando uma Crew tiver capacidade, por exemplo 12 SQ/day, o sistema calcula automaticamente a quantidade de dias necessária. Correto?

Resposta:

17\. Se o Service estiver atribuído a uma Equipe composta por várias Crews, como deve ser calculada a capacidade: soma das capacidades das Crews ativas naquele Service?

Resposta:

18\. Se a Crew/Team não tiver Production Capacity configurada, o usuário deverá informar manualmente a duração. Correto?

Resposta:

19\. Quer permitir que usuários autorizados substituam manualmente a duração calculada?

Resposta:

20\. Se a duração automática for alterada manualmente, quer solicitar um motivo e registrar no Activity/Audit Log?

Resposta:

21\. Ao escolher Start Date e capacidade/quantidade, End Date deve ser calculada automaticamente. Correto?

Resposta:

22\. O cálculo deve considerar somente dias úteis configurados pela empresa/Location, ignorando dias em que a empresa não trabalha?

Resposta:

23\. Quer que cada Location possa configurar dias e horários de funcionamento usados nesse cálculo?

Resposta:

24\. Se o serviço ocupar somente parte de um dia, quer permitir capacidade fracionada/partial day ou manter cálculo em dias inteiros na V1?

Resposta:

## Conflitos de agenda

25\. Se uma Crew já tiver agendamento na data, o CrewCommand não salva imediatamente o novo agendamento. Primeiro mostra um conflito. Confirmamos?

Resposta:

26\. O modal de conflito deve mostrar qual Job/Service já ocupa aquela Crew/Equipe, datas e horários?

Resposta:

27\. Opções do conflito: Schedule Anyway \| Choose Another Date \| Choose Another Crew/Team. Quer exatamente assim?

Resposta:

28\. Se o usuário escolher Schedule Anyway, quer uma segunda confirmação para evitar clique acidental?

Resposta:

29\. A mesma regra de conflito deve funcionar para uma Equipe inteira, considerando os agendamentos das Crews que fazem parte dela?

Resposta:

30\. Se apenas uma das Crews de uma Equipe estiver ocupada, o sistema deve explicar exatamente qual Crew está em conflito?

Resposta:

31\. Quer avisar também quando um Employee individual estiver alocado em dois Services no mesmo período?

Resposta:

32\. Conflitos nunca devem ser escondidos mesmo que o usuário tenha permissão para Schedule Anyway. Correto?

Resposta:

## Troca de Crew e lógica da Escadinha

33\. Ao trocar a Crew/Team de um Service, o sistema deve recalcular Production Capacity, duração e End Date. Confirmamos?

Resposta:

34\. Se a troca aumentar ou diminuir a duração, a lógica da Escadinha deve ser disparada automaticamente. Correto?

Resposta:

35\. A Escadinha deve considerar somente Services futuros que ainda não estejam DONE/Completed?

Resposta:

36\. A ordem dos Services futuros deve ser definida pelas datas planejadas atuais, correto?

Resposta:

37\. Quando o usuário escolher mover os próximos Services, quer deslocar cada um preservando a distância relativa atual ou recalcular em sequência sem espaços? Qual comportamento prefere?

Resposta:

38\. Se a Escadinha gerar novos conflitos de Crew/Team em Services seguintes, o sistema deve mostrar todos os conflitos antes de confirmar a alteração. Correto?

Resposta:

39\. Quer mostrar um Preview Before/After das datas antes de aplicar a Escadinha?

Resposta:

40\. Quer permitir Undo imediatamente após uma alteração em massa da Escadinha?

Resposta:

## Crews, Equipes e Subcontractors

41\. Confirmamos a lógica: uma empresa pode trabalhar com uma Crew individual ou com uma Equipe formada por várias Crews?

Resposta:

42\. Uma Crew poderá pertencer a mais de uma Equipe ou deve pertencer a apenas uma por vez?

Resposta:

43\. Ao atribuir uma Equipe a um Service, o usuário poderá selecionar quais Crews daquela Equipe realmente trabalharão naquele serviço?

Resposta:

44\. Se apenas parte das Crews da Equipe for selecionada, a capacidade deverá ser recalculada somente com as Crews escolhidas. Correto?

Resposta:

45\. Quer permitir Primary Crew + Additional Crew/Workers no mesmo Service?

Resposta:

46\. Subcontractors/Sub Crews usarão o mesmo mecanismo de capacidade e agenda das Crews internas?

Resposta:

47\. Ao escolher uma Crew/Team, quer filtrar primeiro apenas as que trabalham naquele Service e naquela Location, mas permitir Show All caso necessário?

Resposta:

## Disponibilidade e bloqueios

48\. Manteremos os estados Available \| Partially Booked \| Fully Booked \| Unavailable para Crew/Employee?

Resposta:

49\. Quer uma tela/detail da Crew mostrando calendário, capacidade, Services, membros e próximos agendamentos?

Resposta:

50\. Bloqueios poderão ser Full Day ou intervalo de horário?

Resposta:

51\. Confirmamos que bloqueios podem durar vários dias?

Resposta:

52\. Feriados poderão ser globais da empresa ou específicos por Location?

Resposta:

53\. Quer permitir repetir bloqueios, por exemplo toda sexta-feira à tarde?

Resposta:

54\. Quando um feriado/bloqueio for criado depois de já existirem Services agendados, o sistema deve alertar sobre os agendamentos afetados?

Resposta:

## Recurring Services

55\. Para recorrências, manteremos Weekly, Every 2 Weeks, Monthly, Every X Days/Weeks/Months e padrões como Every Monday ou First Friday of the Month?

Resposta:

56\. Ao editar um evento recorrente, quer opções This Service Only \| This and Future \| Entire Series?

Resposta:

57\. Se a Crew de uma série recorrente mudar, quer permitir aplicar somente naquela ocorrência ou nas próximas ocorrências?

Resposta:

58\. Quando uma ocorrência recorrente cair em feriado/bloqueio, o sistema deve avisar e pedir uma nova data, sem mover automaticamente?

Resposta:

## Field Operations — experiência do usuário

59\. Field Worker abre o app e vê Today como tela principal, contendo somente Services/Jobs atribuídos a ele. Confirmamos?

Resposta:

60\. Cada item de Today deve mostrar hora, Service, Customer, Property e Status. Quer também mostrar Crew/Team?

Resposta:

61\. Ao abrir o Service, manteremos Overview \| Checklist \| Daily Log \| Materials \| Photos \| Change Order \| Documents \| Chat?

Resposta:

62\. Quer que Field Worker possa alterar somente determinados Status do Service, configuráveis pela empresa?

Resposta:

63\. Todos os membros atribuídos à mesma Crew/Service poderão visualizar as mesmas informações operacionais?

Resposta:

64\. Qualquer membro autorizado da Crew poderá atualizar o único Daily Log do dia, conforme já definido. Correto?

Resposta:

## Daily Log no campo

65\. No mobile, ao abrir Daily Log, campos automáticos devem vir preenchidos com Date, Service, Crew/Team, Job, Property e usuário. Correto?

Resposta:

66\. A empresa poderá marcar determinados campos do Daily Log como obrigatórios antes de concluir o dia/Service?

Resposta:

67\. Upload deverá permitir várias imagens de uma vez e comprimir imagens antes de enviar ao Storage. Confirmamos?

Resposta:

68\. Quer permitir vídeo no Daily Log na V1 ou prefere apenas imagens/documentos inicialmente?

Resposta:

69\. Depois do Service DONE, Daily Log fica read-only e somente Add Photos continua disponível. Confirmamos?

Resposta:

70\. Se um Service foi marcado DONE por engano, somente Manager/Admin com permissão poderá reabrir? Quer esse fluxo?

Resposta:

## Problemas, Change Orders e Material Extra no campo

71\. Report Problem será uma ação rápida separada de Change Order e Material Request. Correto?

Resposta:

72\. Ao Report Problem, quer categorias padrão como Damage, Customer Unavailable, Weather, Wrong Measurement, Missing Material, Access Problem, Installation Issue e Other?

Resposta:

73\. Change Order Request do campo continuará sem preço e poderá incluir descrição, motivo, fotos e documentos. Correto?

Resposta:

74\. Material Extra Request deve permitir material, quantity, reason, photo e notes antes de enviar para aprovação. Correto?

Resposta:

75\. O Field Worker poderá ver o Status das suas solicitações de Change Order e Material Request depois de enviadas?

Resposta:

## Conclusão, assinatura e comunicação

76\. Antes de Mark Service Complete, o sistema deve verificar checklist, Daily Log, Change Orders pendentes, Material Requests e demais regras configuradas. Confirmamos?

Resposta:

77\. Warnings poderão ser configurados como bloqueio ou apenas alerta pela empresa. Correto?

Resposta:

78\. A assinatura final do cliente usará texto/template configurável pela empresa. Correto?

Resposta:

79\. Se a assinatura for obrigatória e o cliente não estiver presente, quer permitir selecionar Customer Not Available e gerar pendência para assinatura posterior?

Resposta:

80\. Mudanças de data/horário podem notificar automaticamente Customer, Crew, Salesperson, Project Manager e Admin de acordo com configurações. Correto?

Resposta:

81\. Quando um Service for reagendado, Field Worker deve receber Push Notification com Deep Link para o Service. Correto?

Resposta:

## Maps, impressão e limites da V1

82\. Ao tocar no endereço, o usuário escolhe Google Maps ou Apple Maps. Confirmamos?

Resposta:

83\. Na visão administrativa, mapa do dia mostrará os Services/Jobs com pins, sem otimização automática de rotas na V1. Correto?

Resposta:

84\. Work Order e Checklist continuarão imprimíveis. Correto?

Resposta:

85\. Offline Mode permanece fora da V1. Confirmamos?

Resposta:

86\. Não haverá Time Tracking/Clock In-Clock Out na V1. Confirmamos?

Resposta:

# BLOCO 8 — Financial, Billing e Client Portal

Invoices, Payments, Accounts Receivable, Financing, Commissions, Purchases e toda a experiência financeira/portal do cliente.

**Total deste bloco: 90 perguntas**

## Financial — arquitetura principal

1\. Dentro de Financial, manteremos Tabs: Invoices \| Payments \| Accounts Receivable \| Commissions \| Financing. Correto?

Resposta:

2\. Quer um pequeno Financial Overview no topo com Open Balance, Overdue, Payments This Month e Invoices Pending, respeitando permissões?

Resposta:

3\. Usuários sem permissão financeira não verão o módulo nem valores financeiros em outras telas. Confirmamos?

Resposta:

## Criação de Invoice

4\. Create Invoice poderá ser acionado pelo Job, pelo Financial \> Invoices e pelo fluxo de conclusão do Job. Correto?

Resposta:

5\. Como existe Progress Billing, deve ser possível criar Invoice antes do Job estar Completed. Confirmamos?

Resposta:

6\. Ao criar Invoice a partir do Job, o usuário poderá selecionar quais Services, Change Orders ou percentuais serão cobrados naquele Invoice?

Resposta:

7\. Quer tipos/labels como Deposit Invoice \| Progress Invoice \| Final Invoice para facilitar identificação?

Resposta:

8\. Payment Terms continuarão baseados em datas e percentuais, conforme definido no PRD. Correto?

Resposta:

9\. Se houver mais de um provider conectado, quer permitir definir um provider padrão e alterar no momento da criação quando permitido?

Resposta:

10\. Antes de enviar para a integração, quer uma tela de Review/Preview mostrando Customer, Property, items, taxes, deposits, payments e balance?

Resposta:

11\. Quer permitir Save Draft antes de enviar para o provider externo?

Resposta:

12\. Ao enviar, o CrewCommand deverá armazenar provider, external Invoice ID, number, amount, due date, status, link e sync status. Correto?

Resposta:

13\. O status do Invoice deverá ser atualizado por API/Webhook quando o provider permitir. Correto?

Resposta:

14\. Em caso de Sync Failed, teremos Retry e mensagem explicando o erro. Confirmamos?

Resposta:

15\. Um Job poderá ter vários Invoices e a soma cobrada deverá ser comparada ao Contract Value + Approved Change Orders. Correto?

Resposta:

16\. Quer alerta se o usuário tentar faturar mais que o saldo disponível do contrato?

Resposta:

17\. Tax e Discount devem ser herdados do Estimate/Job quando aplicável. Correto?

Resposta:

18\. Quer permitir ajustes no Invoice antes do envio, somente para usuários com permissão, sem alterar o Estimate aprovado?

Resposta:

19\. Ao criar Invoice, usuário poderá selecionar quais contatos do cliente receberão a cobrança. Correto?

Resposta:

20\. Depois de criado externamente, o Invoice também deverá aparecer automaticamente no Client Portal. Correto?

Resposta:

21\. Quer permitir Void/Cancel Invoice quando o provider suportar, mantendo histórico no CrewCommand?

Resposta:

## Progress Billing e saldo

22\. Para contratos com várias parcelas, quer visualizar uma Payment Schedule dentro do Job mostrando percentuais, datas, valores, status e saldo?

Resposta:

23\. Exemplo: 30% Deposit, 30% Progress, 30% Progress, 10% Final. Confirmamos que a empresa poderá cadastrar esses modelos?

Resposta:

24\. O depósito pago deverá reduzir automaticamente Remaining Balance do Job. Correto?

Resposta:

25\. Pagamentos parciais devem reduzir o saldo do Invoice e do Job em tempo real. Correto?

Resposta:

26\. Se um Change Order aprovado aumentar o contrato depois que alguns Invoices já foram emitidos, o novo valor entra no saldo ainda não faturado. Correto?

Resposta:

27\. Quer uma barra/summary mostrando Contract Total \| Invoiced \| Paid \| Open Balance dentro da área financeira do Job?

Resposta:

## Payments

28\. Métodos poderão incluir Card, ACH, Cash, Check, PayPal, Financing, Zelle, Wire Transfer e métodos personalizados. Confirmamos?

Resposta:

29\. Para Card/ACH/PayPal, a transação deverá acontecer através do provider integrado; o CrewCommand não armazenará dados sensíveis de cartão diretamente. Concorda?

Resposta:

30\. Record Payment manual terá Amount, Date, Method, Reference/Check Number e Notes. Correto?

Resposta:

31\. Record Payment exigirá permissão específica. Confirmamos?

Resposta:

32\. Quer gerar/armazenar Receipt para pagamentos registrados manualmente?

Resposta:

33\. Cliente poderá pagar diretamente pelo Client Portal quando houver provider compatível. Correto?

Resposta:

34\. Se houver mais de um Invoice em aberto, o pagamento deve ser aplicado a um Invoice específico ou quer permitir pagamento geral alocado depois?

Resposta:

35\. Se o cliente pagar valor maior que o saldo, o sistema deve bloquear o overpayment ou permitir com alerta? Lembrando que Customer Credit não faz parte do escopo atual.

Resposta:

36\. Refunds devem aparecer como transações separadas, sem apagar o pagamento original. Correto?

Resposta:

37\. Quer mostrar Timeline financeira de cada Invoice com Created, Sent, Viewed, Payment, Refund, Void e Sync events?

Resposta:

## Financing

38\. A empresa poderá cadastrar Financing Providers com name, instructions, application link e informações adicionais. Correto?

Resposta:

39\. Cliente escolhe uma opção de Financing no Estimate/Portal quando disponível. Correto?

Resposta:

40\. Status: Applied \| Pending \| Approved \| Declined \| Funded. Confirmamos?

Resposta:

41\. Quer permitir anexar documentos relacionados ao financiamento, com controle Internal/Customer Visible?

Resposta:
