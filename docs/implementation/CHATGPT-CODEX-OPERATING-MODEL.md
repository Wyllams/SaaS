# Modelo Operacional — ChatGPT × Codex × Product Owner

- **Data:** 2026-09-25
- **Status:** obrigatório para implementação a partir do Epic 1
- **Objetivo:** separar decisão/governança de execução de código

## 1. Product Owner

O Product Owner é a autoridade final sobre:

- produto;
- escopo;
- prioridades;
- decisões não cobertas pelos documentos;
- aprovação de mudanças importantes;
- aprovação de merge quando solicitado;
- ações externas sensíveis;
- Production.

## 2. ChatGPT nesta conversa

### Responsabilidade principal

**Governança, planejamento, documentação, revisão e coordenação.**

ChatGPT deve:

1. consultar os documentos oficiais antes de orientar trabalho;
2. reconciliar fontes quando necessário;
3. identificar o próximo passo exclusivamente pelo Implementation Plan;
4. decompor cada Epic em slices implementáveis;
5. criar o Task Packet de cada slice para o Codex;
6. definir critérios de aceite a partir dos documentos;
7. resolver com o Product Owner qualquer lacuna/ambiguidade;
8. criar/atualizar ADRs quando uma decisão arquitetural for necessária;
9. revisar o resultado do Codex contra os documentos;
10. revisar testes, diff e riscos;
11. manter STATUS/QA e documentação de continuidade;
12. coordenar branch/PR/merge conforme as aprovações;
13. impedir que uma feature avance se o gate anterior não estiver fechado.

### O que ChatGPT não fará como fluxo normal a partir do Epic 1

- não será o executor principal de feature code;
- não criará telas/domínios inteiros diretamente no chat enquanto Codex for o executor designado;
- não permitirá que decisões de produto sejam tomadas “durante o código” sem registro.

Exceções:

- documentação;
- revisão;
- pequenas correções de governança/CI;
- correções explícitas solicitadas pelo Product Owner;
- situações em que o Codex não esteja disponível e o Product Owner autorize outra estratégia.

## 3. Codex

### Responsabilidade principal

**Execução técnica disciplinada do Task Packet.**

Codex deve:

- ler `AGENTS.md`;
- ler as fontes indicadas no Task Packet;
- implementar somente o slice autorizado;
- escrever testes;
- executar validações;
- produzir migrations somente quando autorizadas;
- manter boundaries aprovadas;
- atualizar STATUS/QA;
- entregar relatório de conclusão.

### Codex não decide produto

Codex não pode decidir por conta própria:

- nova feature;
- nova tela;
- novo fluxo;
- novo campo de negócio;
- nova entidade;
- novo status;
- nova permission;
- novo provider;
- nova dependência estrutural;
- mudança arquitetural;
- reintrodução de escopo removido.

Se necessário para continuar, deve bloquear e escalar.

## 4. Fluxo obrigatório de uma feature

```text
Documentos oficiais
        ↓
ChatGPT identifica slice
        ↓
ChatGPT cria Task Packet
        ↓
Product Owner aprova quando houver decisão necessária
        ↓
Codex lê docs + AGENTS.md
        ↓
Codex implementa + testa
        ↓
Codex atualiza STATUS/QA
        ↓
ChatGPT revisa diff + testes + docs
        ↓
Correções, se necessárias
        ↓
PR
        ↓
Product Owner / gate de merge
        ↓
Merge
        ↓
Próximo slice
```

## 5. O que deve ficar aqui no ChatGPT

Manter aqui:

- decisões de produto;
- escolha da próxima etapa;
- confirmação de escopo;
- resolução de ambiguidades;
- leitura/reconciliação dos documentos;
- arquitetura/ADRs;
- ameaça/risco quando aplicável;
- checklist do Epic;
- review do trabalho do Codex;
- aprovação de PR/merge/deploy;
- resumo de continuidade.

## 6. O que deve ir para o Codex

Enviar ao Codex:

- implementação de backend;
- implementação de frontend;
- implementação mobile;
- migrations autorizadas;
- testes;
- refactors necessários ao slice;
- execução de build/lint/test;
- debugging de código;
- atualização técnica de STATUS/QA;
- geração de evidência do slice.

## 7. Ações externas sensíveis

Por padrão o Codex não executa:

- deploy;
- migration remota;
- Production write;
- criação/deleção de infraestrutura;
- rotação de secret;
- alteração de billing/provider account;
- merge em `main`.

Essas ações exigem autorização explícita específica.

## 8. Regra contra perda de contexto

Nenhum conhecimento crítico pode existir apenas na conversa.

Toda decisão que altere:

- escopo;
- arquitetura;
- segurança;
- implementação;
- ordem;
- status;
- blocker

deve ser registrada no Git antes de encerrar a etapa.

## 9. Regra contra “vibe coding”

Nenhum código deve nascer porque “parece uma boa ideia”.

Cada mudança deve responder:

- Qual documento exige isso?
- Qual Epic/slice autoriza isso?
- Qual critério de aceite comprova que está correto?
- Qual teste protege o comportamento?
- Qual registro permitirá continuar em outra sessão?

Se uma dessas respostas faltar, o trabalho deve parar e ser esclarecido.
