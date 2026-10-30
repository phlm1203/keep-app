import { PLAN_RULES } from '../utils/permissions';

// ATENÇÃO: preços são apenas ilustrativos (não há cobrança real implementada). Ajuste à vontade.
export const PLANS = [
  {
    id: 'freemium',
    name: 'Keep Freemium',
    icon: 'leaf-outline',
    description: 'Para começar a controlar suas validades sem pagar nada.',
    priceLabel: 'Grátis',
    annualLabel: 'Sem custo, para sempre',
    ctaLabel: 'Mudar para Keep Freemium',
    features: [
      `Até ${PLAN_RULES.freemium.maxProducts} produtos cadastrados`,
      `Até ${PLAN_RULES.freemium.maxLists} listas de compras`,
      'Alertas de validade e scanner de código de barras',
      'Receitas com o que você tem na despensa',
      `Relatório com os últimos ${PLAN_RULES.freemium.reportMonths} meses`,
    ],
  },
  {
    id: 'casa',
    name: 'Keep Casa',
    icon: 'home-outline',
    description: 'Para a rotina da sua casa, sem limites de produtos e listas.',
    priceLabel: 'R$ 9,90/mês',
    annualLabel: 'ou R$ 99,00/ano',
    ctaLabel: 'Mudar para Keep Casa',
    features: [
      'Produtos e listas de compras ilimitados',
      'Alertas de validade e scanner de código de barras',
      'Receitas com o que você tem na despensa',
      `Relatório com os últimos ${PLAN_RULES.casa.reportMonths} meses`,
      'Perdas por categoria',
    ],
  },
  {
    id: 'business',
    name: 'Keep Business',
    icon: 'storefront-outline',
    description: 'Para restaurantes e comércios que precisam reduzir perdas.',
    priceLabel: 'R$ 29,90/mês',
    annualLabel: 'ou R$ 299,00/ano',
    ctaLabel: 'Mudar para Keep Business',
    features: [
      'Produtos e listas de compras ilimitados',
      'Alertas de validade e scanner de código de barras',
      'Receitas com o que você tem na despensa',
      `Relatório com os últimos ${PLAN_RULES.business.reportMonths} meses`,
      'Perdas por categoria e valor das perdas',
    ],
  },
];

// Linhas da tabela "Comparativo": [recurso, freemium, casa, business]
export const PLAN_COMPARISON = [
  ['Produtos', String(PLAN_RULES.freemium.maxProducts), 'Ilimitado', 'Ilimitado'],
  ['Listas de compras', String(PLAN_RULES.freemium.maxLists), 'Ilimitadas', 'Ilimitadas'],
  ['Alertas de validade', true, true, true],
  ['Scanner de código', true, true, true],
  ['Receitas com a despensa', true, true, true],
  ['Histórico do relatório', `${PLAN_RULES.freemium.reportMonths} meses`, `${PLAN_RULES.casa.reportMonths} meses`, `${PLAN_RULES.business.reportMonths} meses`],
  ['Perdas por categoria', false, true, true],
];

export async function getPlans() {
  return PLANS;
}
