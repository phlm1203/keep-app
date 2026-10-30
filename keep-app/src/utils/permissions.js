// Regras de acesso de cada modalidade do Keep.
// É o ÚNICO lugar onde os limites ficam definidos: ajuste aqui para mudar o que cada plano libera.
export const PLAN_RULES = {
  freemium: {
    id: 'freemium',
    name: 'Keep Freemium',
    maxProducts: 30,
    maxLists: 2,
    reportMonths: 3, // meses exibidos no histórico de perdas
    reportByCategory: false, // gráfico de perdas por categoria
  },
  casa: {
    id: 'casa',
    name: 'Keep Casa',
    maxProducts: Infinity,
    maxLists: Infinity,
    reportMonths: 6,
    reportByCategory: true,
  },
  business: {
    id: 'business',
    name: 'Keep Business',
    maxProducts: Infinity,
    maxLists: Infinity,
    reportMonths: 12,
    reportByCategory: true,
  },
};

export function getPlanRules(user) {
  if (!user || user.isGuest) {
    return { ...PLAN_RULES.freemium, name: 'Visitante' };
  }
  return PLAN_RULES[user.plan] || PLAN_RULES.freemium;
}

export const planLabel = (user) => getPlanRules(user).name;

export function planLimitError(message) {
  const error = new Error(message);
  error.code = 'PLAN_LIMIT';
  return error;
}

// Verifica se o usuário pode migrar para o plano `targetPlan` sem estourar os limites dele.
export function checkPlanChange(targetPlan, { productCount = 0, listCount = 0 } = {}) {
  const rules = PLAN_RULES[targetPlan];
  if (!rules) return { ok: false, message: 'Plano inválido.' };
  if (productCount > rules.maxProducts) {
    return {
      ok: false,
      message: `Você tem ${productCount} produtos cadastrados e o ${rules.name} permite até ${rules.maxProducts}. Remova produtos para mudar de plano.`,
    };
  }
  if (listCount > rules.maxLists) {
    return {
      ok: false,
      message: `Você tem ${listCount} listas e o ${rules.name} permite até ${rules.maxLists}. Exclua listas para mudar de plano.`,
    };
  }
  return { ok: true };
}
