# PRODUCT REQUIREMENTS DOCUMENT

**PRD Oficial — v2.0**

Visão de produto, ICP, escopo funcional e regras de negócio da V1

| Campo | Definição |
|---|---|
| Versão | 2.0 |
| Status | Substitui o PRD v1.0 reconstruído |
| Data | 2026-09-25 |
| Marca | **Não definida.** Este documento usa "a Plataforma" e nomes brand-neutral |
| Mercado | Estados Unidos |
| Idioma do documento | Português (Brasil); termos de produto e código em inglês |
| Base | App Flow Oficial + Backend Domain Model + UI/UX Design Document + decisões do Product Owner de 2026-09-25 |
| Próximos documentos | App Flow → Backend Domain Model → UI/UX → TRD → Implementation Plan |

> **Por que uma v2.0.** O PRD v1.0 reconstruído descrevia um produto de field service genérico, com 15 verticais e escopo de 116 telas. Esta versão estreita o ICP para exterior contractors, fixa os sete papéis, define o escopo da V1 e registra o que fica explicitamente fora. As decisões de stack foram tomadas em 2026-09-25 e pertencem ao TRD.

---

# 1. Problema e proposta

## 1.1 O problema

Empresas de serviços externos residenciais nos Estados Unidos operam projetos de vários dias, com equipes que se deslocam entre propriedades, material que representa a maior linha de custo e escopo que muda durante a execução.

A dor concreta:

- ninguém sabe, sem perguntar, em que pé está cada job e o que trava cada um;
- mudar a data de um serviço quebra a sequência dos serviços seguintes, e o reagendamento é refeito na mão;
- escopo adicional descoberto no telhado não vira cobrança porque não foi registrado na hora;
- a capacidade real da equipe não entra na conta ao prometer prazo ao cliente;
- material comprado não é vinculado ao job, e a margem só aparece no fim;
- o cliente liga para perguntar o andamento porque não tem onde olhar.

## 1.2 A proposta

Uma plataforma em que o **Job é a unidade central**, o **agendamento nasce da capacidade real da equipe** e qualquer mudança de data recalcula a sequência inteira mostrando antes e depois.

## 1.3 Resultado esperado

Um contractor de exteriores opera o dia inteiro na Plataforma: do lead ao recebimento, com o campo alimentando o registro e o cliente acompanhando sozinho.

---

# 2. ICP — quem é o cliente

## 2.1 Verticais atendidas

| Vertical | Unidade de produção típica | Prioridade |
|---|---|---|
| **Roofing** | SQ (roofing square, 100 ft²) | **Lidera a V1** |
| Gutters | Linear feet | V1 |
| Siding | SQ / linear feet | V1 |
| Windows | Units | V1 |
| Doors | Units | V1 |
| Decks | ft² | V1 |
| Landscaping (instalação) | ft² / units | V1 |

Roofing lidera porque tem o maior ticket, a maior dor de sequenciamento de crew e a unidade SQ já está modelada no produto.

## 2.2 Por que essas e não outras

A Plataforma é construída em torno de **trabalho de produção multi-dia**: capacidade por unidade/dia, sequenciamento de serviços, Change Order, Daily Log, faturamento parcial e Progress Report.

Serviços de chamado avulso — limpeza, pool service, handyman, reparo de HVAC, encanamento e elétrica emergencial — têm outro modelo: uma visita, despacho otimizado por rota, sem mudança de escopo, fatura igual ao total do job. **Nenhuma feature desta plataforma serve esse modelo**, e é nele que os incumbentes são fortes.

**Essas verticais estão fora do ICP da V1.** Isso é decisão de produto, não limitação técnica.

## 2.3 Perfil da empresa-alvo

- 1 a 10 crews, próprias ou subcontratadas;
- opera em um ou poucos estados;
- vende por Estimate com assinatura do cliente;
- compra material por job;
- usa QuickBooks Online na contabilidade;
- hoje resolve com planilha, WhatsApp e caderno.

---

# 3. Papéis e acesso

Sete papéis. Seis internos ao Workspace e um externo.

| Papel | O que faz | Limite de acesso |
|---|---|---|
| **Owner** | Controla a empresa, configurações, permissões e assinatura da Plataforma | Acesso total ao Workspace. Único por empresa; transferência exige confirmação forte e auditoria |
| **Admin** | Opera CRM, Jobs, agenda e suporte ao dia a dia | O que o Owner liberar; normalmente transversal |
| **Salesperson** | Leads, follow-ups, Estimates e fechamento | Por padrão só enxerga os leads e clientes atribuídos a ele. Vê apenas a própria comissão |
| **Supervisor** | Coordena execução, capacidade, crews, materiais e aprovações operacionais | Jobs, Services, Schedule, Daily Logs, aprovações. Sem acesso financeiro por padrão |
| **Crew** | Executa o serviço no campo | Apenas os Services atribuídos a ele ou à sua crew. **Nunca vê valor financeiro** |
| **Accounting** | Invoices, Payments, AR, comissões e integração contábil | Somente financeiro. Sem necessidade de módulos de campo |
| **Client** | Aprova, paga, acompanha e baixa documentos | Apenas os próprios dados e o que for marcado como customer-visible |

## 3.1 Regras transversais

- Permissão é verificada no servidor. Visibilidade de interface nunca é autorização.
- Valor financeiro desaparece por completo para quem não tem permissão financeira — não é exibido borrado, riscado ou zerado.
- Deep link e notificação revalidam permissão antes de abrir o registro.
- Um usuário pode pertencer a vários Workspaces sem que os dados se misturem.
- `Client` não é um Membership. Portal é um caminho de acesso separado.

## 3.2 Crew parceira (subcontratada)

Em roofing e exteriores, subcontratar crew é a norma. Uma Crew pode ser própria ou parceira, e a parceira exige controle adicional:

- empresa, contato e documento fiscal (W-9);
- **certificado de seguro com data de validade**;
- licença quando o estado exigir;
- marcador visível de recurso externo na agenda.

**Seguro vencido de subcontratado é risco jurídico direto do contractor.** A Plataforma deve alertar antes do vencimento e sinalizar ao atribuir uma crew com documento vencido. Isso é argumento de venda, não burocracia.

---

# 4. Escopo da V1

## 4.1 Módulos incluídos

| Módulo | Conteúdo |
|---|---|
| **Identidade e Workspace** | Cadastro, login, múltiplos Workspaces, Locations, membros, papéis, convites |
| **Assinatura** | Planos, Trial de 14 dias com cartão, cobrança recorrente, Grace, Read-only, Suspended |
| **CRM** | Customer, contatos, Properties, lifecycle, tags, lead source, atribuição, follow-up, Saved Views, importação CSV |
| **Sales** | Pipeline, Estimates com versão, templates, catálogo de serviços, preview, envio, assinatura eletrônica, payment terms |
| **Jobs** | Job, Services, milestones, progresso, Supervisor responsável, documentos e fotos |
| **Schedule** | Visões de calendário, capacidade de produção, cálculo de duração, conflitos, bloqueios, feriados e **Escadinha** |
| **Field (PWA)** | Today, Service, checklist, Daily Log, fotos, solicitação de material, solicitação de Change Order, reportar problema, conclusão com assinatura |
| **Change Orders** | Solicitação sem preço no campo, precificação, preview, aprovação e assinatura do cliente |
| **Materiais e Compras** | Material Request, Purchase, Purchase Order, Vendors/Stores, recibos, gasto por job e por fornecedor |
| **Financial** | Invoice, faturamento parcial, Payment, Accounts Receivable com aging, Commissions |
| **Client Portal** | Aprovar Estimate e Change Order, acompanhar projeto, ver e pagar faturas, baixar documentos |
| **Integrações** | Stripe Connect, Stripe Billing, QuickBooks Online, Resend |

## 4.2 Fora da V1

Decidido e registrado, não esquecido:

| Fora | Motivo |
|---|---|
| Chat interno | Crews já usam WhatsApp e SMS; é um dos maiores builds do escopo original |
| Automation Engine | Motor de plataforma; sem clientes, não há automação a configurar |
| Reports como módulo | A V1 entrega relatórios fixos, não construtor de relatório |
| Public API, Webhooks de saída, MCP | Ninguém integra com um produto sem base instalada |
| Super Admin como aplicação separada | Rotas protegidas no app principal resolvem por anos |
| SMS / Twilio / A2P 10DLC | Decisão de 2026-09-25. Ver §4.3 |
| E-mail inbound (responder e cair na conversa) | Outbound entra na V1; bidirecional fica para V2 |
| Financing | Integração com parceiro externo; sai do caminho crítico |
| Offline Mode | Falha de conexão deve ser explícita e nunca sugerir que salvou |
| Time Tracking / Clock In-Out | Fora |
| GPS contínuo e otimização de rota | Fora |
| Serviços recorrentes | Padrão de chamado avulso; não pertence ao ICP |
| Good/Better/Best e itens opcionais no Estimate | Aprovação é do documento inteiro |
| Customer Credit | Overpayment fica bloqueado enquanto não existir |
| Split commission | Uma comissão por vendedor responsável |
| Duplicar agendamento | Fora |
| Dark Mode | Tokens preparados, tema não implementado |
| Vídeo em Daily Log | Fotos e documentos primeiro |
| Multi-moeda | USD na V1; `currency_code` permanece na coluna |

## 4.3 SMS — decisão e consequência

SMS está fora da V1. A razão é o A2P 10DLC: cada empresa precisa registrar marca e campanha junto às operadoras, o que leva semanas e trava o onboarding.

**Consequência que a V1 assume:** nos EUA, lembrete por SMS é expectativa básica em serviço residencial. O substituto é o Client Portal com notificação por e-mail, posicionado como "seu cliente acompanha a obra".

**O que não pode ser esquecido:** consentimento por contato e por canal precisa ser registrado **desde a V1**. Consentimento retroativo é impossível de reconstruir, e sem ele o retorno do SMS vira reescrita.

---

# 5. CRM

CRM único. Lead e Customer são o mesmo cadastro, diferenciados por lifecycle, status, tags e Saved Views.

- **Lifecycle:** Lead → Customer → Past Customer.
- **Fontes de lead na V1:** entrada manual e importação CSV/Excel. Captação por formulário de site fica para V2.
- **Obrigatórios ao criar:** nome, sobrenome, telefone, e-mail, endereço completo e serviço de interesse.
- Endereço é estruturado. O primeiro endereço cria automaticamente a primeira Property.
- Duplicidade por e-mail, telefone ou endereço gera aviso antes de salvar ou importar.
- Um Customer tem várias Properties; cada Property tem seus próprios Estimates, Jobs, fotos e histórico.
- Contatos por Property: Primary, Billing, Property Contact e outros.
- Lost Reason é obrigatório ao marcar oportunidade como perdida.
- Notas são permanentes, com menção e anexo, e são distintas de mensagem.

---

# 6. Sales e Estimates

## 6.1 Pipeline

Kanban próprio, separado do pipeline de Jobs. Estágios criáveis, renomeáveis e reordenáveis. Arrastar muda o estágio. Mover para Lost exige motivo. Won pode ser automático na aprovação do Estimate, conforme configuração.

## 6.2 Estimate

- Nasce da escolha da Property, depois template ou em branco.
- Linha de serviço com nome, descrição, quantidade, unidade, preço unitário, desconto, imposto, total e fotos.
- Serviço ad hoc pode ser criado no Estimate e opcionalmente salvo no catálogo.
- Totais: Subtotal, Discount, Tax, Total Contract Value, Deposit Required, Remaining Balance.
- Customer Notes, Terms & Conditions e Internal Notes são campos separados.
- **Preview é obrigatório antes de qualquer envio.**
- Status: Draft, Sent, Viewed, Awaiting Approval, Approved, Rejected, Expired, Cancelled.
- Cada visualização do cliente é registrada; a interface resume primeira e última.
- Versões antes da aprovação; o cliente vê apenas a versão ativa e é avisado quando uma versão enviada é substituída.
- **Estimate aprovado é imutável.** Mudança de escopo vira Change Order.

## 6.3 Imposto

Tratamento fiscal é configurado pela empresa, não calculado por motor genérico.

- alíquota por Location, com override por Estimate;
- **separação entre mão de obra e material**, porque vários estados tributam um e isentam o outro;
- flag de isenção por Customer, com certificado anexado e validade;
- a alíquota de referência é a do endereço da Property, não o da empresa.

> Em muitos estados o contractor de roofing opera por contrato *lump sum*: paga o imposto na compra do material e **não** cobra sales tax do cliente. Quem conhece o tratamento correto é o contador do cliente. A Plataforma oferece a configuração e registra a escolha — não decide por ele.

A implementação fica atrás de um contrato `TaxProvider`, para permitir plugar um provedor externo sem reescrever o domínio.

## 6.4 Aprovação

O cliente abre link seguro, autentica no Portal e decide sobre o documento inteiro.

Ao aprovar: escolhe payment term e método quando aplicável, assina desenhando ou digitando o nome, e o sistema registra signatário, data, hora e metadados.

Efeitos padrão da aprovação, configuráveis:

- lifecycle vira Customer e pipeline vira Won;
- cria o Job copiando Property, serviços, valores, fotos e documentos;
- mantém o vendedor responsável e calcula a comissão;
- cria o saldo de depósito;
- notifica Admin.

Rejeição exige motivo e **não** move automaticamente para Lost — a decisão é do vendedor.

---

# 7. Jobs, Services e capacidade

## 7.1 Estrutura

Um Job representa o trabalho vendido para uma Property. Contém vários Services, cada um com status, crew, datas, checklist, fotos, materiais e Daily Logs próprios.

Job e Service têm status configuráveis pela empresa. Progresso pode ser manual ou calculado pelo checklist, com pesos vindos de template.

O cabeçalho do Job não exibe o valor do contrato. O valor aparece onde faz sentido no fluxo financeiro.

## 7.2 Capacidade de produção

Cada Crew tem capacidade por unidade e por dia — 12 SQ/day, 8 SQ/day, linear ft/day, rooms/day, units/day.

`quantidade do Service ÷ capacidade da Crew = duração em dias`, e a data final é calculada automaticamente respeitando dias úteis da Location, feriados e bloqueios.

Quando um Team reúne várias Crews, a capacidade é a soma apenas das Crews efetivamente selecionadas.

Sem capacidade configurada, a duração é manual. Override manual exige permissão e motivo auditável.

## 7.3 Conflito de agenda

Conflito **impede o salvamento imediato** e mostra o Job e o horário em choque. As opções são agendar mesmo assim, escolher outra data ou escolher outra crew. "Agendar mesmo assim" exige segunda confirmação e fica registrado.

**Conflito nunca fica escondido**, nem para quem tem permissão de override.

## 7.4 Escadinha — o diferencial

Quando a data ou a duração de um Service muda — por troca de crew, por mudança de quantidade ou por arraste no calendário — a Plataforma pergunta se os Services seguintes ainda não concluídos devem deslocar junto.

Comportamento obrigatório:

- preserva por padrão os intervalos relativos entre os serviços;
- ignora serviços já concluídos;
- mostra **Before → After** antes de confirmar;
- lista todos os novos conflitos gerados;
- permite desfazer imediatamente;
- registra quem fez, quando e por quê.

Esta é a mecânica central do produto. Nenhuma outra decisão de escopo pode degradá-la.

---

# 8. Campo

## 8.1 Entrega

PWA instalável. Sem app store. Um código, o mesmo deploy da web.

Navegação inferior: **Today | Jobs | Chat¹ | Notifications | More** — na V1 sem Chat, portanto **Today | Jobs | Notifications | More**.

Today é a tela inicial. Cards mostram horário, Service, Customer, Property e status. **Sem qualquer valor financeiro.**

Ações rápidas: ligar, mensagem e mapa. Ações operacionais: Daily Log, adicionar foto, material extra, solicitar Change Order, reportar problema. Concluir serviço é ação própria e fixa no rodapé.

Operação com uma mão, alvos de toque grandes, texto objetivo.

## 8.2 Daily Log

Um Daily Log por Service por dia. Nova tentativa abre o existente.

Preenchidos automaticamente: data, Job, Service, Crew, Property e usuário. Editáveis: trabalho realizado, progresso, problemas, materiais usados, fotos, próximos passos e observações. A empresa define quais campos são obrigatórios.

Upload múltiplo com compressão, miniatura e retry por arquivo. **Sem Offline Mode: falha de conexão precisa ser explícita e nunca sugerir que salvou.**

Depois que o Service vai para DONE, o Daily Log fica somente leitura e apenas novas fotos podem ser anexadas. Reabrir exige Supervisor ou Admin, com motivo registrado.

## 8.3 Conclusão

Antes de concluir, a Plataforma verifica checklist, Daily Log, Change Orders e materiais pendentes. Cada regra é aviso ou bloqueio, conforme configuração da empresa.

Assinatura do cliente usa tela limpa, desenho ou nome digitado. Se o cliente não estiver presente, gera pendência visível para o escritório.

---

# 9. Change Orders, materiais e compras

## 9.1 Change Order

Nasce no campo **sem preço** — o Crew não vê valor. Contém Service, descrição, motivo e fotos.

Vendedor ou Admin revisa, precifica, gera preview e envia ao cliente. Pode ter várias linhas, e um Job pode ter vários Change Orders.

O cliente aceita ou rejeita e assina. Rejeição exige motivo. Aprovado fica bloqueado, aumenta o valor do Job e passa a ser faturável.

## 9.2 Materiais e compras

- Crew solicita material com quantidade, motivo, foto e observação; Supervisor aprova.
- A compra registra fornecedor, data, número de PO, valor, quem comprou, status de pagamento, recibo e observações.
- Uma solicitação pode gerar várias compras.
- Compra pode existir sem solicitação prévia, com permissão.
- Vendors/Stores têm tela própria com histórico, total gasto e jobs relacionados.

Em roofing material é a maior linha de custo. Vincular compra ao job é o que permite ver margem antes do fim da obra.

---

# 10. Financeiro

## 10.1 Invoice

Criada manualmente a partir do Job, do módulo financeiro ou da conclusão. Faturamento parcial permite faturar antes do Job concluído.

O usuário escolhe quais Services, Change Orders ou percentuais entram. Rótulos: Deposit, Progress, Final. Review e preview antes de enviar.

A Plataforma compara o total faturado com Contract Value mais Change Orders aprovados e **bloqueia overbilling por padrão**. Exceção exige permissão alta e justificativa.

Múltiplas invoices por Job. Status sincroniza com o provider quando possível; falha de sincronização mostra motivo e botão de reenvio.

## 10.2 Payment

- Sempre aplicado a uma Invoice específica.
- Métodos: Card, ACH, Cash, Check, Zelle, Wire e custom.
- Card e ACH passam pelo provider. A Plataforma **não armazena dado de cartão ou conta bancária**.
- Registro manual exige permissão e gera recibo.
- **Overpayment é bloqueado** enquanto Customer Credit estiver fora do escopo.
- Refund é transação separada; o pagamento original permanece no histórico.

## 10.3 Accounts Receivable e comissões

AR com aging Current, 1–30, 31–60, 61–90 e 90+, com filtros e drill-down. Lembretes automáticos param quando a fatura é paga e podem ser pausados.

Comissão por venda: percentual sobre venda, percentual sobre margem, valor fixo, percentual por serviço ou combinação. Gatilho configurável. Status Projected, Earned, Approved, Paid. **Paid congela.** Ajuste exige motivo e fica auditado. Vendedor vê apenas a própria.

---

# 11. Client Portal

Login por e-mail e senha. Visual da empresa prestadora, estrutura da Plataforma. Mobile-first.

A home prioriza aprovações pendentes, próximo serviço, projetos ativos, saldo em aberto e documentos recentes.

O cliente vê todas as próprias Properties. Pode **solicitar** nova Property e solicitar serviço ou orçamento — ambos viram solicitação interna, nunca criação direta.

**Nunca expor:** capacidade de crew, notas internas, comissões, custo de material, tarefas internas e qualquer conteúdo não marcado como customer-visible.

Progresso do projeto fica **oculto por padrão** e é liberado pela empresa. Quando liberado, mostra barra, percentual e "X de Y serviços concluídos" — sem expor pesos internos.

No financeiro: saldo em aberto, próximo pagamento, faturas, histórico e pagamento online quando o provider estiver habilitado. Linguagem nunca agressiva.

Falha de pagamento após a aprovação **não desfaz** a aprovação do Estimate; o depósito fica pendente ou falho.

---

# 12. Assinatura da Plataforma

Cobrança da própria assinatura é independente do Stripe Connect usado para os pagamentos dos clientes finais. São duas integrações distintas no mesmo provider e não compartilham código de domínio.

- Planos Starter, Growth, Pro e Enterprise. Valores e limites exatos permanecem em aberto.
- Trial de 14 dias, **com cartão**, informando explicitamente que não haverá cobrança antes do fim.
- O Trial libera apenas os recursos do plano escolhido e exibe contagem regressiva.
- Ciclo de falha: Payment Failed → **Grace de 3 dias** → Read-only → Suspended.
- **Dados nunca são apagados** por falta de pagamento; o acesso retorna com a regularização.
- Cancelamento pelo Owner leva a um período somente de exportação antes da exclusão definitiva.
- Limites de plano viram Entitlements como dado, nunca condicionais de nome de plano espalhados pelo código.

---

# 13. Regras de integridade do produto

1. Estimate aprovado é imutável; escopo novo é Change Order.
2. Change Order aprovado é imutável e exige assinatura.
3. Daily Log de Service concluído é somente leitura, salvo reabertura autorizada com motivo.
4. Conflito de agenda nunca é ocultado; override é rastreável.
5. Overbilling e overpayment são bloqueados por padrão.
6. Pagamento e estorno são append-only; a transação original nunca é apagada.
7. Comissão paga não recalcula sozinha.
8. Valor financeiro é integralmente ocultado de quem não tem permissão.
9. Deep link e notificação não contornam autorização.
10. Registro assinado, financeiro ou de auditoria não sofre exclusão definitiva.
11. Nenhuma referência cruza Workspaces, mesmo com ID válido.
12. Integração externa e pagamento são estados explícitos, nunca sucesso presumido.

---

# 14. Critérios de sucesso da V1

| Dimensão | Critério |
|---|---|
| Ciclo completo | Um roofer leva um negócio do lead ao recebimento sem sair da Plataforma nem recorrer a planilha |
| Escadinha | Mudar a data de um serviço reagenda a sequência com preview e desfazer, sem retrabalho manual |
| Capacidade | O prazo prometido ao cliente sai da capacidade real da crew, não de estimativa de cabeça |
| Campo | O Crew registra Daily Log e fotos pelo celular sem treinamento formal |
| Escopo extra | Change Order pedido no telhado vira cobrança aprovada e assinada no mesmo dia |
| Material | O gasto de material aparece vinculado ao job antes do fechamento |
| Cliente | O cliente aprova, acompanha e paga sem ligar para o escritório |
| Financeiro | Faturado, recebido e saldo em aberto batem sem conferência manual |

## 14.1 Indicadores após os primeiros clientes

Conversão Lead→Estimate e Estimate→Won; tempo entre aprovação e agendamento; conflitos e overrides por mês; percentual de Services com Daily Log conforme regra; Change Orders aprovados e receita adicional capturada; aging de AR; taxa de sucesso de pagamento; uso do Portal para aprovar e pagar.

---

# 15. Decisões ainda abertas

Registradas para decisão do Product Owner. **Não devem ser resolvidas por inferência durante a implementação.**

> Reprodução da lista autoritativa de `CURRENT-DECISIONS.md` §Decisões em aberto.
> Os rótulos são idênticos de propósito, para que a divergência seja detectável.

| Item | Situação |
|---|---|
| Marca do produto | Não definida. Todo identificador permanece brand-neutral; o UI/UX usa o placeholder `[MARCA]` |
| Valores e limites dos planos | Estrutura definida, números em aberto. Não bloqueia o Epic 4: limite é dado em `Entitlement`, nunca condicional por nome de plano |
| Extensão da UI de multi-location | `location_id` permanece no modelo; o alcance na interface da V1 está em aberto |
| Período de exportação e retenção | Em aberto — é o motivo de `SCR-SET-013` estar adiada |

**Idiomas não estão em aberto.** A V1 entrega **`en-US` e `es-US`, ambos completos no produto inteiro**; PT-BR sai do escopo. Decidido em 2026-09-25 e registrado no **ADR-023** (Accepted), em `CURRENT-DECISIONS.md` §Idiomas, no TRD §8 e no adendo A5 do UI/UX. Esta linha existia como decisão pendente e propunha espanhol restrito às telas de campo — escopo **menor** que o decidido. Removida.

---

# 16. Cadeia documental

| Documento | Responsabilidade |
|---|---|
| **PRD** | O que construir e por quê |
| App Flow | Como o usuário percorre o produto |
| Backend Domain Model | Estrutura lógica dos dados |
| UI/UX Design Document | Como a experiência é apresentada |
| TRD | Como é implementado tecnicamente |
| Implementation Plan | Como o trabalho é dividido e entregue |

Este PRD não escolhe framework, banco, cloud nem arquitetura. Essas decisões pertencem ao TRD e aos ADRs.

---

> **Princípio final.** A Plataforma existe para transformar uma operação de exteriores em uma rotina clara e rastreável — sem esconder exceção importante e sem obrigar ninguém a reconstruir o contexto na cabeça.
