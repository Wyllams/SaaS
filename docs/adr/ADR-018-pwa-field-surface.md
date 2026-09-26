# ADR-018 — PWA como superfície de campo

- **Status:** Accepted
- **Data:** 2026-09-25
- **Decision owner:** Product Owner
- **Supersede:** ADR-011 (Expo/EAS) **no escopo da V1**
- **Emenda:** ADR-016 — linha "Mobile delivery", que registrava Expo/EAS

## Context

O ADR-011 escolheu React Native com Expo e EAS para o app de campo. A decisão de concentrar
a infraestrutura em Supabase, Vercel e GitHub exclui o EAS como alvo de build.

O Crew precisa de: ver os serviços do dia, abrir o serviço, checklist, Daily Log, **tirar e
enviar fotos**, e receber notificação.

## Options Considered

| Opção | Avaliação |
|---|---|
| **PWA instalável** | Mesmo deploy da web; câmera e upload pelo navegador; ícone na tela inicial; correção no mesmo dia |
| Expo/EAS | Câmera e push melhores; exige EAS, duas app stores e revisão travando correção urgente |
| Web responsivo simples | Mais barato; sem ícone e sem push, o Crew esquece de abrir e o Daily Log deixa de ser preenchido |

## Decision

A experiência de campo é **PWA instalável**, servida no mesmo deploy do `apps/web`.

- Manifest com ícones e `display: standalone`.
- Service Worker para shell e assets estáticos.
- Câmera e galeria por `input` com `capture`, com compressão no dispositivo.
- **Web Push com VAPID**, inscrição persistida em `PushSubscription`.

`apps/mobile` sai do escopo da V1.

**Executado em 2026-09-26:** o workspace foi **removido** do repositório por decisão do Product
Owner — 7 arquivos versionados, a entrada em `pnpm-workspace.yaml`, a entrada em
`scripts/verify-structure.mjs` e o importer correspondente em `pnpm-lock.yaml`. O monorepo passa
de 10 para 9 workspaces. O histórico preserva o código caso a decisão seja revista.

## Evidence

Decisão do Product Owner em 2026-09-25. O POC-11 validou os requisitos funcionais de campo —
deep link, push, câmera, upload múltiplo com retry — que permanecem exigidos; a tecnologia de
entrega muda.

## Consequences

**Positivas:** um código e um deploy; correção de tela do Crew publicada no mesmo dia, sem
revisão de loja; sem contas de app store; sem EAS.

**Trade-offs:** no iOS, Web Push exige que o usuário **adicione o app à tela inicial** — passo
que precisa entrar no onboarding do Crew; não há background sync; o desempenho de câmera e
upload é inferior ao nativo em aparelho antigo.

## Guardrails

- **Sem sincronização offline de dado de negócio.** Falha de rede é explícita e nunca sugere
  que salvou.
- Service Worker cacheia **apenas** shell e assets — nunca resposta com dado de tenant.
- Token de sessão em cookie `httpOnly`, nunca em `localStorage`.
- Upload comprime no dispositivo e trata falha por arquivo, sem perder os demais.
- Valor financeiro **não é servido** ao Crew, nem na resposta da API.

## Revisit Trigger

Reavaliar se ocorrer **qualquer** um destes:

1. limitação de PWA no iOS impedir um requisito de campo já aprovado, com o problema
   reproduzido em aparelho real;
2. a taxa de instalação na tela inicial ficar baixa a ponto de o push não alcançar os Crews,
   medida após os primeiros clientes;
3. um cliente exigir contratualmente aplicativo publicado em loja.
