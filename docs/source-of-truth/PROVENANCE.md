# Proveniência dos documentos importados

Importação para `Wyllams/SaaS`: 2026-09-25.

Os documentos DOCX fornecidos pelo proprietário foram convertidos para Markdown para permitir pesquisa, diff, citações e consulta futura no GitHub. O conteúdo documental foi preservado; decisões posteriores são registradas separadamente em `CURRENT-DECISIONS.md`.

## Fontes

| Documento importado | Fonte original | SHA-256 do DOCX fornecido |
|---|---|---|
| PRD Oficial (reconstrução) | `CrewCommand_PRD_Oficial_v1.0_Reconstruido.docx` | `670339ee1a77ec6bc7e9935f88aa6eaf98f5db1419b21d5cddbf045929dcc6f8` |
| TRD | `CrewCommand_TRD_Oficial_v1.0.docx` | `4143f953017e10457b44024c699b155c7555b18507e589fff5f59a86cfef3db1` |
| App Flow Oficial | `CrewCommand_App_Flow_Oficial_v1.0.docx` | `2e3abfd8153fe3c21150cb2a30a70679a524056f6c075129cf233d7d2e603036` |
| UI/UX Design | `CrewCommand_UI_UX_Design_Document_v1.0.docx` | `9cb8913431d74ef282104616ada0deb5a7f8371023ba3bc6a68ad5fa6f211dc2` |
| Backend Schema / Domain Model | `CrewCommand_Backend_Domain_Model_v1.0.docx` | `daccb6a8996fbc2f840484121d6bd22d9fbae3802a1d7681acb3496ae0a4dae3` |
| Technical Validation & PoC Plan | `CrewCommand_Technical_Validation_PoC_Plan_v1.0.docx` | `abdac80517dc8496dfd35ff61e731191001485f5aafadcfa84222ef3b4003949` |
| App Flow Questionário 6–10 | `CrewCommand_App_Flow_Questionario_Blocos_6_a_10.docx` | `ae19e5b4dc4aa98a906057a46ae70455c59129633a4d45af47e946b5a7120de3` |

## UI/UX duplicado

Também foi fornecido `CrewCommand_UI_UX_Design_Document_v1.0 (1).docx`.

SHA-256:

`9cb8913431d74ef282104616ada0deb5a7f8371023ba3bc6a68ad5fa6f211dc2`

O hash é idêntico ao arquivo UI/UX sem sufixo, portanto apenas uma cópia canônica foi importada.

## PRD

### Versão atual

`canonical/01-PRD.md` foi substituído em 2026-09-25 pela conversão de
`CrewCommand_PRD_Oficial_v1.0_Reconstruido.docx`, fornecido pelo proprietário.

O próprio documento declara, na abertura, que o arquivo binário do PRD original não está
disponível e que seu conteúdo foi recomposto a partir das decisões preservadas nos
documentos oficiais posteriores. **Não é uma cópia byte a byte do PRD original.**

### Versão anterior (superseded)

Até 2026-09-25 o arquivo continha o PRD importado do repositório histórico:

- repositório: `Wyllams/CrewCommand`;
- caminho: `Obsidian/01 - Produto/prd.md`;
- commit de introdução identificado: `e9808da9db328423d3e1be4fbf11e096e15b6c17`;
- data do commit: 2026-09-21;
- blob: `8ea933b3307373fef6eec95b8ac5e3b15efc92d6`.

Esse arquivo descrevia uma linha de produto anterior (Work Orders, Quotes, Dispatch,
Organizations) e não continha nenhuma ocorrência de Workspace, Estimate, Change Order,
Daily Log, Property ou Escadinha. Por isso não correspondia aos documentos oficiais que
dependem dele. Permanece recuperável pelo histórico do Git.

### Pontos em aberto nesta versão

Registrados para decisão do Product Owner; não foram alterados no documento importado:

- domínios presentes no App Flow Oficial sem cobertura no PRD: Trial/Planos/Assinatura,
  Onboarding, Settings, Super Admin, Public API/Webhooks/MCP;
- itens presentes no PRD sem respaldo nos documentos oficiais: captação de Lead por
  formulário de site, dependências entre Services, exclusão de split commission;
- lifecycle do CRM com `Prospect`, alinhado ao Backend Domain Model e divergente do
  App Flow Oficial;
- referências a SMS permanecem históricas e seguem superseded por `CURRENT-DECISIONS.md`.

## Observação

Os nomes históricos dos arquivos são preservados como evidência de origem. Isso não define a marca futura do produto.
