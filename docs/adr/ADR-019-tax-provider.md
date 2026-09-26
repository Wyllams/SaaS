# ADR-019 — TaxProvider e tratamento fiscal

- **Status:** Accepted
- **Data:** 2026-09-25

## Context

Imposto **não existia em nenhum documento**. A palavra "tax" aparecia zero vezes no TRD v1.0
e existia apenas como coluna decimal em três entidades. O Estimate, porém, nasce com imposto.

O problema nos Estados Unidos é real: a alíquota varia por estado, condado, cidade e distrito;
vários estados tributam material e isentam mão de obra, ou o inverso; e em construção
residencial é comum o contrato **lump sum**, em que o contractor paga o imposto na compra do
material e **não cobra** sales tax do cliente. Clientes isentos exigem certificado arquivado.

## Options Considered

| Opção | Avaliação |
|---|---|
| **Alíquota configurável + contrato `TaxProvider`** | Quem conhece o tratamento correto é o contador do cliente; custo zero; permite plugar provider depois |
| Avalara AvaTax | Único com regras específicas de construction contractor e gestão de certificados; caro e pesado para a V1 |
| Stripe Tax | Simples e já no ecossistema; desenhado para SaaS e ecommerce, não modela labor versus material nem lump sum |
| TaxJar | Meio-termo; cobertura de construção mais fraca que a da Avalara |

## Decision

Contrato **`TaxProvider`** com implementação interna baseada em tabelas próprias:

- `TaxRate` — alíquota por Location em basis points, com `applies_to_labor` e
  `applies_to_material` separados, e vigência;
- `TaxExemption` — isenção por cliente, com certificado, estado emissor e validade;
- `TaxTreatment` — `LUMP_SUM` ou `RETAIL` por Workspace e Location.

`EstimateLineItem` e `ChangeOrderItem` carregam `labor_amount_cents` e
`material_amount_cents` separados. A alíquota de referência é a do **endereço da Property**.

O cálculo devolve o imposto por linha **mais a explicação aplicada**, que é persistida no
documento.

## Evidence

Nenhuma. Não houve PoC — este ADR fecha uma lacuna documental, não valida uma tecnologia. A
implementação interna é deliberadamente simples e revisável.

## Consequences

**Positivas:** sem custo nem contrato de fornecedor; sem dependência externa no caminho
crítico do Estimate; a responsabilidade pelo tratamento fica com quem a detém legalmente.

**Trade-offs:** a plataforma **não garante** correção multi-jurisdição; empresa que opere em
muitos municípios terá trabalho manual de configuração; mudança de alíquota depende de o
cliente atualizar.

## Guardrails

- A plataforma **nunca decide** o tratamento fiscal pelo cliente — oferece a configuração e
  registra a escolha.
- Certificado de isenção **fora da validade não isenta**, sem exceção.
- Mão de obra e material sempre separados na linha, mesmo quando a alíquota for igual.
- A explicação do cálculo é persistida no documento, para auditoria.
- Nenhum cálculo de imposto no cliente.
- Alíquota vem do endereço da Property, nunca do endereço da empresa.

## Revisit Trigger

Reavaliar e considerar provider externo se ocorrer **qualquer** um destes:

1. um cliente operar em mais de três estados ou em jurisdição com regra que o modelo não
   expresse;
2. ocorrer o primeiro incidente de suporte causado por imposto calculado errado;
3. surgir exigência de relatório de sales tax por jurisdição para declaração.
