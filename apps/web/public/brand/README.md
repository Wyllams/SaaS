# Marca — arquivos e regra de uso

**Marca vigente: CrewCommand.** Provisória, adotada por decisão do Product Owner em
2026-09-26. A marca final ainda não foi escolhida. Ver `docs/source-of-truth/CURRENT-DECISIONS.md`,
seção "Nome do produto".

Esta pasta é o **único lugar** onde os arquivos de marca vivem. Nenhuma tela deve embutir
logo próprio, redesenhar o símbolo ou aplicar o nome fora do componente de marca.

---

## Qual arquivo usar

| Arquivo | Conteúdo | Fundo do arquivo | Usar em |
|---|---|---|---|
| `logo-mark.png` | Só o símbolo | **transparente** | Favicon, ícone do PWA, avatar, espaços pequenos, qualquer fundo |
| `logo-horizontal-on-dark.webp` | Símbolo + "CrewCommand" | **transparente**, palavra "Crew" em branco | **Somente fundo escuro** — Sidebar (`--color-nav-background`, `#0F172A`) |
| `logo-horizontal-on-white.webp` | Símbolo + "CrewCommand" | **branco sólido**, "Crew" em azul-marinho | **Somente branco puro** (`#FFFFFF`) |
| `logo-mark-on-white.webp` | Só o símbolo | branco sólido | Nenhum uso novo. Mantido por ser entrega original; prefira `logo-mark.png` |

## Lacuna conhecida — bloqueia a tela de login

**Falta o logo horizontal com fundo transparente e a palavra "Crew" escura.**

O fundo das telas é `--color-page` (`#F8FAFC`), que **não é branco puro**. Consequência:

- `logo-horizontal-on-dark.webp` — a palavra "Crew" é branca e desaparece no fundo claro;
- `logo-horizontal-on-white.webp` — o fundo branco sólido aparece como um retângulo
  visível contra o `#F8FAFC`.

Superfícies afetadas: `SCR-AUTH-001` (login), `SCR-AUTH-006` (recuperar senha), Client
Portal (`SCR-PORT-*`) e todos os e-mails transacionais.

Solicitado ao Product Owner em 2026-09-26. Até chegar, usar `logo-mark.png` nessas telas.

## Cor — o azul do logo não é o azul da interface

Medido nos arquivos entregues: o logo usa aproximadamente `#0070F8`. O
`--color-action-primary` aprovado no UI/UX §2.1 é `#2563EB`. **São azuis diferentes, e é
intencional.**

Contraste medido pela régua WCAG:

| Cor | Texto branco em cima | Como link sobre `#F8FAFC` |
|---|---|---|
| `#2563EB` — interface | **5,17:1** ✅ | **4,94:1** ✅ |
| `#0070F8` — logo | 4,49:1 ❌ | 4,30:1 ❌ |

O azul do logo reprova o mínimo de 4,5:1 nos dois usos. Por isso **a interface mantém
`#2563EB`** e o logo permanece com a cor dele. Não substituir o token pela cor do logo.

## Formato

Os quatro arquivos são raster (PNG/WebP), em 1254×1254 e 2000×667. Servem para as telas,
mas ficam levemente suavizados em densidade de pixel alta. `.svg` é preferível quando
houver; não bloqueia nada hoje.

## Ao trocar a marca

Substituir os arquivos desta pasta e o nome no módulo único de marca.

> Esse módulo **ainda não existe**. Ele nasce junto com a primeira tela que exibe a marca,
> e é o único ponto onde o texto "CrewCommand" pode aparecer no código. Enquanto não
> existir, nenhuma tela deve escrever o nome direto.

Identificadores técnicos — `@saas/*`, nomes de pacote, de pasta, de banco e de domínio —
**permanecem brand-neutral** e não mudam junto. Essa separação é o que torna a troca barata.
