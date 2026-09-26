# ADR-023 — Arquitetura de internacionalização

- **Status:** Accepted
- **Data:** 2026-09-25

## Context

O App Flow v1.0 declarava inglês, espanhol e PT-BR como escopo da V1. O TRD v1.0 **não
tratava i18n em nenhum ponto** — a única ocorrência de "idioma" era o metadado do próprio
documento. Três idiomas eram escopo declarado sem projeto técnico.

PT-BR não tem comprador num produto para o mercado americano. Espanhol tem razão concreta:
boa parte da mão de obra de roofing e exteriores nos Estados Unidos é hispanofalante.

## Options Considered

| Opção | Avaliação |
|---|---|
| **`en-US` e `es-US` completos** | Atende crew de campo e dono de empresa hispanofalante, que é fatia real do mercado |
| Inglês, com espanhol só no campo | Menor volume de tradução; deixa de fora o dono de empresa hispanofalante |
| Só inglês | Mais rápido; perde argumento de venda concreto |
| Os três, como no App Flow | Fiel ao documento; PT-BR pesa em toda tela nova sem retorno |

## Decision

**`en-US` e `es-US`, ambos completos.** PT-BR sai do escopo.

- Roteamento por segmento de caminho no App Router.
- Locale efetiva resolvida na ordem: preferência do usuário → padrão do Workspace → padrão do
  sistema. No portal, a do contato, com fallback para a do Workspace.
- Catálogos versionados em `packages/i18n`, com chave semântica.
- **Chave sem tradução falha o build.**
- Data, número e moeda por `Intl`, com a locale efetiva e o **timezone da Location**.
- Conteúdo que sai do produto é traduzido: template de e-mail, PDF do Estimate, rótulo do
  portal e notificação. `MessageTemplate` guarda um registro por idioma.

## Evidence

Nenhuma. Fecha uma lacuna documental; a validação ocorre no Epic 11.

## Consequences

**Positivas:** espanhol completo é diferencial de venda real no segmento; falhar o build em
chave ausente impede a degradação silenciosa que costuma acontecer em i18n.

**Trade-offs:** toda tela nova nasce com dois textos; QA visual dobra nas telas densas, porque
rótulos em espanhol costumam ser 15% a 30% mais longos; PDF e e-mail precisam de revisão nos
dois idiomas.

## Guardrails

- **Nenhum texto traduzível montado por concatenação em runtime.**
- Conteúdo digitado pelo cliente — descrição de serviço, notas, Daily Log — **não é traduzido**.
- Componente não pode depender de largura fixa para caber o rótulo.
- Formatação sempre por `Intl`, nunca manual.
- Chave é semântica, nunca o texto em inglês.
- Moeda é formatada pela locale, mas o valor permanece em cents no domínio.

## Revisit Trigger

Reavaliar se ocorrer **qualquer** um destes:

1. um segmento pagante exigir um terceiro idioma;
2. o custo de manter dois idiomas atrasar entrega de forma mensurável por mais de um Epic;
3. expansão para mercado fora dos Estados Unidos, que traria também moeda e formato de
   endereço.
