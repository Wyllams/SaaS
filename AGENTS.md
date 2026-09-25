# AGENTS.md — Regras obrigatórias para agentes de código

Estas regras se aplicam a **todo o repositório**.

O Codex e qualquer outro agente de implementação devem obedecer estas instruções antes de editar código, banco, configuração, documentação técnica ou infraestrutura.

# 1. Regra máxima: NÃO INVENTAR

O agente **não pode criar, completar, escolher ou assumir** requisitos que não estejam sustentados pelos documentos oficiais.

É proibido inventar ou extrapolar, entre outros:

- features;
- telas;
- componentes de produto;
- campos;
- entidades;
- tabelas;
- relacionamentos;
- status;
- transições;
- roles;
- permissions;
- scopes;
- rotas;
- endpoints;
- eventos;
- automações;
- regras financeiras;
- integrações;
- providers;
- frameworks;
- fluxos de usuário;
- mensagens de negócio;
- limites de plano;
- nomenclatura de marca;
- comportamento de erro;
- requisitos de segurança.

Quando uma informação necessária estiver ausente, ambígua ou conflitante:

**PARE. NÃO ESCOLHA UMA RESPOSTA.**

Registre:

`BLOCKED — DOCUMENTATION DECISION REQUIRED`

e informe exatamente:

1. qual decisão está faltando;
2. quais documentos foram consultados;
3. qual conflito/lacuna foi encontrado;
4. quais arquivos/tarefas ficaram bloqueados.

A decisão deve voltar para ChatGPT + Product Owner.

# 2. Leitura obrigatória antes de qualquer implementação

Antes de editar qualquer arquivo, o agente deve ler, nesta ordem:

1. `docs/source-of-truth/README.md`
2. `docs/source-of-truth/CURRENT-DECISIONS.md`
3. `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN-v1.0.md`
4. `docs/architecture/TECHNICAL-ARCHITECTURE.md`
5. `docs/adr/README.md`
6. ADRs aplicáveis à tarefa
7. `docs/implementation/EPIC-XX-STATUS.md` do Epic atual
8. `docs/implementation/EPIC-XX-QA.md`, quando existir

Para feature/tela/domínio, também é obrigatório consultar as fontes aplicáveis:

- `01-PRD.md`
- `03-APP-FLOW-OFICIAL.md`
- `04-UI-UX-DESIGN.md`
- `05-BACKEND-SCHEMA-DOMAIN-MODEL.md`
- `02-TRD-OFICIAL.md`

O agente deve identificar os **Screen IDs, entidades, regras e critérios** correspondentes antes de codificar.

# 3. Ordem de autoridade

Quando documentos divergem, aplicar esta precedência:

1. `docs/source-of-truth/CURRENT-DECISIONS.md`
2. Implementation Plan v1.0 aprovado
3. Arquitetura Técnica Consolidada pós-PoCs
4. ADRs Accepted
5. TRD Oficial
6. App Flow Oficial
7. Backend Schema / Domain Model
8. UI/UX Design Document
9. PRD
10. evidências dos PoCs
11. questionários/discovery históricos

Nunca usar um documento histórico isoladamente para reintroduzir algo revogado por uma decisão mais recente.

# 4. Decisões atuais que não podem ser revertidas silenciosamente

- A marca final ainda não foi definida.
- Novo código usa naming brand-neutral conforme a fundação aprovada.
- SMS/Twilio está fora do escopo atual.
- Não implementar SMS, A2P/10DLC, sender pool ou webhooks Twilio.
- O webhook público real do Resend está deferido.
- Código de PoC é evidência, não código de produção.
- PostgreSQL é a fonte de verdade transacional.
- Realtime é mecanismo de entrega/UX, não fonte de verdade.
- Autorização é server-side; visibilidade de UI nunca é autorização.
- Secrets nunca entram no Git.
- Production não reutiliza recursos/credenciais de Development ou Staging.

Alterar qualquer item acima exige nova decisão explícita e atualização documental/ADR.

# 5. Limites do papel do Codex

O Codex é **executor de implementação**, não Product Owner nem Architecture Owner.

Pode:

- implementar tarefas explicitamente entregues;
- escrever/refatorar código dentro do escopo;
- criar testes;
- gerar migrations em Git quando a tarefa autorizar schema;
- executar testes/linters/builds locais;
- corrigir bugs diretamente ligados à tarefa;
- atualizar STATUS/QA da tarefa;
- registrar evidências técnicas.

Não pode, sem autorização explícita no Task Packet:

- ampliar escopo;
- redesenhar fluxo de produto;
- adicionar dependência/provider/framework;
- mudar ADR Accepted;
- mudar contrato público;
- criar nova integração;
- executar migration remota;
- criar/alterar recursos em Production;
- provisionar/deletar cloud resources;
- alterar secrets;
- criar/mergear PR;
- fazer deploy;
- fazer merge em `main`.

# 6. Toda tarefa do Codex exige Task Packet

O Codex não inicia uma feature apenas com uma frase informal.

A tarefa precisa seguir:

`docs/implementation/CODEX-TASK-TEMPLATE.md`

O Task Packet deve indicar:

- Epic;
- slice;
- objetivo;
- fontes obrigatórias;
- escopo;
- fora de escopo;
- critérios de aceite;
- testes obrigatórios;
- mudanças de banco autorizadas;
- ações Git autorizadas;
- condições de bloqueio.

Se o Task Packet e os documentos divergirem, **os documentos vencem** e a tarefa fica bloqueada até reconciliação.

# 7. Regras de implementação

- Trabalhar somente na branch/worktree designada.
- Não editar `main` diretamente.
- Fazer a menor alteração completa que satisfaça o slice.
- Não preparar “features futuras” por conveniência.
- Não criar tabelas/campos “caso sejam necessários”.
- Não duplicar business rules entre Web/API/Worker/Mobile.
- Controllers e UI devem permanecer finos.
- Regras de domínio/aplicação pertencem às boundaries apropriadas.
- Provider SDK objects não viram modelos centrais de domínio.
- Aplicar tenant isolation e authorization desde o primeiro slice que toca dados tenant-owned.
- External side effects devem seguir idempotência/retry definidos nos documentos.
- Não manter transações DB abertas durante chamadas externas lentas.
- Não logar secrets, tokens, cookies, Authorization ou PII não aprovada.

# 8. Banco de dados

Schema físico é implementado incrementalmente pelo Epic dono do domínio.

Antes de criar migration:

1. confirmar entidade/regra no Backend Domain Model;
2. confirmar necessidade no Epic/Task Packet;
3. confirmar constraints/tenancy;
4. escrever testes de integridade/autorização aplicáveis.

É proibido:

- executar migration remota sem autorização explícita;
- fazer alteração manual de Production;
- criar coluna/tabela “preventiva”;
- enfraquecer FK/RLS para fazer teste passar.

# 9. UI/UX

Ao implementar tela:

1. localizar o Screen ID no App Flow;
2. ler o comportamento correspondente;
3. consultar UI/UX Design Document;
4. reutilizar tokens/componentes aprovados;
5. implementar estados loading/empty/error/permission/read-only pertinentes;
6. respeitar breakpoints e contexto Desktop/Tablet/Mobile definidos.

Não redesenhar a experiência com base em gosto pessoal.

# 10. Testes obrigatórios

Cada slice deve executar os testes aplicáveis.

Para autorização/multi-tenancy, incluir casos negativos.

Para side effects externos, testar:

- duplicidade;
- retry;
- timeout/falha;
- idempotência;
- assinatura quando aplicável.

Antes de entregar, executar a CI/local equivalent aplicável.

Não marcar PASS se algum teste foi pulado sem justificativa explícita.

# 11. Documentação de continuidade é obrigatória

Ao concluir ou bloquear uma tarefa, atualizar:

- `docs/implementation/EPIC-XX-STATUS.md`
- `docs/implementation/EPIC-XX-QA.md` quando existir/aplicável

O registro deve informar:

- o que foi feito;
- arquivos principais;
- testes executados;
- resultado;
- decisões tomadas;
- problemas encontrados;
- o que falta;
- próximo passo exato;
- blockers.

Outra sessão deve conseguir continuar usando apenas Git + esses documentos.

# 12. Relatório de conclusão do Codex

Toda entrega deve terminar com:

1. **Implemented**
2. **Not implemented**
3. **Files changed**
4. **Tests run + results**
5. **Docs consulted**
6. **Docs updated**
7. **Known issues / blockers**
8. **Next authorized step**

Nunca reportar “done” quando restarem gates obrigatórios.

# 13. Regra de segurança para ambiguidade

Quando houver dúvida entre:

- “provavelmente era isso”
- e
- “está explicitamente documentado”

sempre escolher a segunda abordagem.

Se não estiver explicitamente documentado:

**NÃO IMPLEMENTAR. ESCALAR A DECISÃO.**
