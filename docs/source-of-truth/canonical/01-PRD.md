---
title: CrewCommand - Product Requirements Document (PRD)
status: final
created: 2026-09-21
updated: 2026-09-21
---

# CrewCommand - Product Requirements Document (PRD)

## 1. Visão Geral
**Objetivo do Produto:** O CrewCommand é um SaaS B2B abrangente de gestão operacional projetado para empresas de serviços de campo. Ele atua como o sistema nervoso central (Command Center) da empresa, conectando desde a captação de clientes, orçamentação e planejamento de capacidade até o despacho de equipes de campo, execução de trabalhos, faturamento e comunicação com clientes, tudo sob uma sólida governança de segurança, multi-tenancy e auditoria.

## 2. Atores e Papéis
- **Owner / Administrator:** O dono da empresa cliente. Tem acesso total às configurações (Settings), faturamento da assinatura do SaaS, gestão de papéis e permissões e acesso aos dados organizacionais.
- **Backoffice / Office Staff:** Equipe de escritório (atendimento, vendas, financeiro e dispatch). Gerencia clientes, gera orçamentos, atribui ordens de serviço e fatura serviços. Acesso granulado via RBAC.
- **Field Tech / Crew Member:** Trabalhadores em campo. Utilizam a plataforma (foco mobile/portal) para visualizar suas agendas, registrar andamento de trabalhos, realizar inspeções e interagir com as ordens de serviço despachadas.
- **Client (End Customer):** O cliente final que contrata os serviços da empresa usando CrewCommand. Acessa o Portal do Cliente para visualizar propostas, histórico de serviços, realizar pagamentos e aprovar orçamentos.

## 3. Módulos e Funcionalidades

### 3.1. Fase 1: Identidade, Empresa e Onboarding (Core)
- **Objetivo:** Estabelecer a fundação do multitenancy, gestão de identidades e entrada de novas empresas no SaaS.
- **Usuários:** Owners/Administrators.
- **Funcionalidades:** Login (via Auth provider), reconciliação de identidade, aceite de consentimentos (termos de uso/privacidade), criação do tenant (organização), configuração de áreas de serviço e especialidades, convites de novos membros.
- **Regras de Negócio:**
  - O sistema é multi-tenant. Dados são estritamente particionados por Organização.
  - O fluxo de onboarding deve permitir salvar rascunhos persistentes (salvamento por etapas).
  - Um usuário pode pertencer a múltiplas organizações (Memberships).
- **Telas e Fluxos:**
  - `/login` e `/signup`
  - `/consents` (Aceite de termos)
  - `/onboarding/[step]` (Workflow de etapas de setup)
  - `/invitation/[token]` (Aceite de convites)
- **Dependências:** Sistema de banco de dados estruturado para RLS (Row Level Security). Supabase Auth.
- **Estado Atual:** **Implementado e integrado à main.** Funcionalidades reais de RLS, banco de dados e lógica de servidor (via RPCs como `save_onboarding_step`). Migrations criadas.
- **Critérios de Aceitação:**
  - Usuários podem se cadastrar, criar a empresa, salvar rascunhos de onboarding e finalizar o processo.
  - Membros podem ser convidados e ingressar na empresa.
  - RLS deve bloquear completamente o acesso cross-tenant.
- **Riscos e Lacunas:** Supabase remoto ainda não totalmente validado contra o esquema local de testes. Retenção limitante na tabela de idempotência para o rascunho de onboarding.

### 3.2. Fase 2: Segurança, Papéis (RBAC) e Audit Log
- **Objetivo:** Garantir que o acesso aos recursos do sistema seja 100% confiável, seguro e auditável, através do controle de papéis (Roles) e permissões granulares por organização.
- **Usuários:** Owners, Administrators.
- **Funcionalidades:** Definição de permissões, papéis personalizados por organização, atribuição de papéis a membros, bloqueio rigoroso de operações na UI e API baseado em permissões, auditoria (Audit Log) de alterações sensíveis.
- **Regras de Negócio:**
  - A segurança deve ser gerida tanto no backend (RLS, funções DB) quanto refletida no frontend.
  - Uma pessoa convidada deve receber uma "role" (papel) no momento do convite.
- **Telas e Fluxos:**
  - `/company/roles` (Gestão de Papéis e Permissões)
  - `/company/team` (Atribuição e lista de equipe)
- **Dependências:** Fase 1 (Memberships) e Supabase RLS policies complexas.
- **Estado Atual:** **Parcial (Em Branch Separada).** O catálogo de roles e permissions existe como migration inicial na branch da Fase 2A, mas o frontend exibe UI demonstrativa. A autorização completa e funcional ainda precisa ser finalizada.
- **Critérios de Aceitação:**
  - Não deve ser possível realizar mutações em dados organizacionais sem a permissão específica (`has_permission`).
  - Roles podem ser customizadas por empresa.
  - Cada ação privilegiada é gravada no Audit Log.
- **Riscos e Lacunas:** A UI de Roles exibe falsos-positivos sem aplicar políticas reais. **Essencial finalizar essa camada de forma robusta e testada antes de expor os módulos operativos operacionais reais.**

### 3.3. Fase 3: Equipes, Profissionais e Capacidade
- **Objetivo:** Gerenciar a força de trabalho (Employees e Crews) e determinar a capacidade operacional da empresa.
- **Usuários:** Staff, Admin, Field Techs.
- **Funcionalidades:** Cadastro de funcionários (Skills, áreas de serviço, calendário base), formação de equipes/esquadrões (Crews), gestão de disponibilidade (férias, licenças).
- **Regras de Negócio:**
  - Um usuário de campo só pode ser atribuído a trabalhos compatíveis com suas áreas de serviço e especialidades.
- **Telas e Fluxos:**
  - Cadastro de Employees.
  - Alocação em Crews.
- **Dependências:** Fase 2 para papéis.
- **Estado Atual:** **Apenas UI Demonstrativa.** Telas renderizam com fixtures locais (dados mockados). O banco, tabelas e mutações não existem.
- **Critérios de Aceitação:** Staff consegue criar Crews, associar membros e definir calendário padrão.
- **Riscos e Lacunas:** Dependência da fundação de tabelas e mutações estruturadas.

### 3.4. Fase 4: Clientes, CRM e Propriedades
- **Objetivo:** Gestão do ciclo de vida do cliente, propriedades físicas onde o trabalho acontece e pipeline inicial de contatos.
- **Usuários:** Vendas, Office Staff, Admin.
- **Funcionalidades:** Base de dados central de Clientes (B2C e B2B), múltiplos endereços/propriedades (Properties), log de atividades e anotações. Deduplicação e arquivamento de registros.
- **Regras de Negócio:**
  - Clientes podem ter múltiplas propriedades e múltiplos contatos atrelados.
- **Telas e Fluxos:**
  - Lista de Clientes, Detalhe do Cliente (Histórico 360).
  - Lista e Detalhe de Properties.
- **Dependências:** Sistema seguro de RBAC (Fase 2) devido à presença de dados sensíveis (PII).
- **Estado Atual:** **Apenas UI Demonstrativa.** Padrões visuais ricos baseados no `@crewcommand/ui`, mas sem persistência em banco ou CRUD conectado.
- **Critérios de Aceitação:**
  - Deve permitir busca rápida (fuzzy) de clientes.
  - CRUD funcional para Clientes e Propriedades com validação e arquivamento (soft-delete).
- **Riscos e Lacunas:** Ausência de engine de deduplicação e schema do banco ainda a ser concebido.

### 3.5. Fase 5: Vendas, Orçamentos e Contratos (Sales)
- **Objetivo:** Captar solicitações (Requests), convertê-las em orçamentos detalhados (Quotes) e obter a aprovação legal (Contratos/Assinatura).
- **Usuários:** Vendas, Clientes (Aprovação), Office Staff.
- **Funcionalidades:** Criação de orçamentos visuais (precificação, impostos, descontos), controle de versionamento dos orçamentos, disparo de email/link para aprovação, fluxo de aprovação com assinaturas eletrônicas simples.
- **Regras de Negócio:**
  - Orçamentos (Quotes) aprovados transformam-se diretamente em Work Orders (Ordens de Serviço).
  - Orçamentos devem suportar versões (V1, V2, V3) mantendo auditoria da linha do tempo.
- **Telas e Fluxos:**
  - Pipeline de Vendas, Editor visual de Quotes.
- **Dependências:** Clientes e Propriedades (Fase 4). Catálogo de serviços/produtos base.
- **Estado Atual:** **Apenas UI Demonstrativa.** Layout de tabelas e cards existem, mas sem lógica de versões, snapshotting, fluxo e geração.
- **Critérios de Aceitação:** É possível criar orçamentos complexos e o cliente consegue aprovar/recusar o orçamento através de um link persistente.
- **Riscos e Lacunas:** Precificação complexa (impostos, variações por estado) exige regras transacionais sólidas que não estão desenhadas no banco.

### 3.6. Fase 6: Operações - Work Orders, Projetos, Schedule e Dispatch
- **Objetivo:** O coração do CrewCommand. Executar, planejar e despachar o trabalho técnico.
- **Usuários:** Dispatchers, Office Staff, Field Techs.
- **Funcionalidades:** Gestão de Ordens de Serviço (Work Orders), agrupamento de Jobs em Projetos, calendário interativo (Schedule) de arraste, despacho otimizado (Dispatch) por matriz de mapa/região, registro de visitas e estados (Em Trânsito, Em Progresso, Concluído).
- **Regras de Negócio:**
  - Cada Work Order precisa manter log de transições de status e reatribuição.
- **Telas e Fluxos:**
  - Kanban/Lista de Work Orders e Projetos.
  - Dashboard visual do Schedule e Dispatch.
- **Dependências:** Fase 3 (Capacidade) e Fase 5 (Orçamentos aprovados).
- **Estado Atual:** **Apenas UI Demonstrativa.** Apresentação riquíssima em UI/UX para agendamento, mas sem o engine (mutations, estados, controle de concorrência) de despachos.
- **Critérios de Aceitação:** Dispatchers conseguem visualizar agendas das equipes e alocar Jobs arrastando blocos no calendário.
- **Riscos e Lacunas:** A UI precisará conectar-se a componentes reativos de calendário, gerenciar concorrência pesada (dois despachantes alterando a mesma agenda ao mesmo tempo).

### 3.7. Fase 7: Financeiro - Invoices e Pagamentos
- **Objetivo:** Faturamento e controle de caixa da operação.
- **Usuários:** Financeiro, Staff.
- **Funcionalidades:** Geração de Faturas (Invoices) a partir de Work Orders concluídos, registro de recebimentos (Pagamentos online ou off-line), sincronização com contas bancárias, processos de conciliação (estornos, reversões).
- **Regras de Negócio:**
  - Faturas emitidas viram artefatos imutáveis. Alterações exigem estornos/créditos (voids).
- **Telas e Fluxos:**
  - Contas a Receber, Detalhe do Invoice.
- **Dependências:** Fase 6 (Work Orders Concluídas) e Módulo de Integrações Genéricas.
- **Estado Atual:** **Apenas UI Demonstrativa (Read-Only).**
- **Critérios de Aceitação:** Uma ordem de serviço finalizada gera a fatura. Permite o registro manual do recebimento.
- **Riscos e Lacunas:** Módulo de faturamento requer arquitetura de transações atômicas para evitar cobranças duplas. Integração genérica de pagamentos deverá mapear para futuros gateways (Stripe, Plaid).

### 3.8. Fase 8 e 10: Comunicação, Busca Global e Home (Command Center)
- **Objetivo:** Dar visibilidade total e centralizada aos gestores.
- **Usuários:** Todos os usuários de escritório (Daily Command Center).
- **Funcionalidades:** Upload e visualização de documentos e fotos de vistoria em nuvem (Storage), alertas push/in-app (Notificações), caixa de busca global (Spotlight) e um Dashboard inicial diário.
- **Regras de Negócio:** Busca global deve respeitar RLS por usuário ativo. Armazenamento de fotos vinculado à Ordem de Serviço deve ser inacessível fora da empresa.
- **Estado Atual:** **Demonstrativo.** Busca genérica e alertas mockados.
- **Critérios de Aceitação:** Ao acessar a Home, o usuário enxerga um sumário real e clica na notificação que o direciona para a O.S. correta. A barra de busca rastreia perfeitamente nomes de clientes e O.S.
- **Riscos e Lacunas:** Implementação do Supabase Storage exige regras claras em `storage.objects` atreladas aos RLS do PostgreSQL.

### 3.9. Fase 9: Portais - Cliente e Equipe de Campo
- **Objetivo:** Oferecer superfícies focadas para acesso externo e uso móvel/operacional extremo.
- **Usuários:** Clientes (Extranet) e Equipe de Campo (Intranet Simplificada).
- **Funcionalidades:** Portal do cliente para visualização de faturas abertas, aceitar orçamentos e solicitar serviços. Portal de campo com UI adaptada para toque/mobile, visualização de agenda de hoje, envio de fotos de inspeção e marcação de status do trabalho.
- **Estado Atual:** **Apenas Documentação Visual (Atlas).** Rotas e estrutura do aplicativo não criados.
- **Critérios de Aceitação:** Técnicos podem dar "check-in" no serviço via smartphone com baixo tráfego de dados.
- **Riscos e Lacunas:** Exigirá roteamento/autenticação separado (Tenant externo x interno).

### 3.10. Configurações Globais e Integrações
- As integrações com serviços externos (ex: Stripe para pagamentos, gateways de SMS) devem manter uma arquitetura genérica e extensível dentro do banco, de forma que módulos de CRM ou Billing interajam com interfaces uniformes. Suas implementações ativas virão posteriormente.

---

## 4. Requisitos Não Funcionais (NFRs)
- **Segurança Absoluta:** O requisito principal. O sistema RBAC (Baseado no Supabase RLS) deve garantir 100% de confiabilidade. O bloqueio cross-tenant e cross-role deve ocorrer estritamente na camada do banco de dados, protegendo contra falhas lógicas da aplicação web.
- **Acessibilidade de Interface:** Utilização estrita do `shadcn` e do Design System `@crewcommand/ui` que possuem regras de ARIA implementadas (Acessibilidade garantida pelas fundações RADIX UI).
- **Consistência e Componentização:** A regra de negócios do banco deve ter correspondência direta e previsível na UI, abolindo a persistência simulada gradativamente pelas Fases operacionais.

## 5. Riscos, Dependências e Restrições Globais
- **Ambiente Remoto (Supabase):** Existe uma divergência observada onde o projeto Supabase remoto local não pôde ser completamente validado contra as migrations recém criadas na Fase 1 e 2A. A aprovação da paridade (Remote DB vs Local Repository) será um obstáculo crítico no desenvolvimento prático.
- **Mockups Confundíveis:** A presença forte de interfaces avançadas e "bonitas" na Main, que usam apenas `requireDemoContext()`, acarreta um alto risco de a equipe subestimar o tempo das integrações backend que ainda são necessárias. O desenvolvimento deve ser extremamente metódico: fasear o backend (Schemas, RLS, Mutações RPC/Endpoint) antes de refazer a "cola" da UI.

## 6. Próximos Passos (Divisão em Epics)
Para a gestão técnica de execução, as epics devem focar em transformar interfaces demonstrativas em sistemas operacionais e seguros:
- **Epic 1:** Consolidação da Fundação Remota (Sincronização e Validação do Banco Supabase remoto com a Branch Main).
- **Epic 2:** Segurança (Conclusão definitiva da Fase 2A: Autorização RBAC 100% operacional e de alta confiança).
- **Epic 3:** Infraestrutura Base Operacional (Tabelas Base de CRM e Operações: Clientes e Work Orders).
- **Epic 4:** UI Operacional CRM e Work (Substituir fixtures de Fases 4 e 6 por dados reais).
- **Epic 5:** Financeiro Base (Integração das Invoices com Work Orders).
