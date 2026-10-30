import { getExpiryStatus } from './date';

const normalize = (text) =>
  (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Compara os ingredientes da receita com os produtos da despensa.
// Produtos vencidos NÃO contam como disponíveis.
export function matchRecipe(recipe, products) {
  const usable = products
    .filter((p) => getExpiryStatus(p.expiryDate) !== 'expired')
    .map((p) => ({ product: p, normalized: normalize(p.name) }));

  let expiringName = null;

  const ingredients = recipe.ingredients.map((ingredient) => {
    const hit = usable.find(({ normalized }) =>
      ingredient.keywords.some((keyword) => normalized.includes(normalize(keyword)))
    );
    if (hit && !expiringName && getExpiryStatus(hit.product.expiryDate) === 'soon') {
      expiringName = hit.product.name;
    }
    return { ...ingredient, have: !!hit, productName: hit ? hit.product.name : null };
  });

  const total = ingredients.length;
  const haveCount = ingredients.filter((i) => i.have).length;
  const missing = ingredients.filter((i) => !i.have);
  const ready = missing.length === 0;

  let tag = 'missing';
  let tagLabel = `Você tem ${haveCount}/${total} • faltam ${missing.length}`;
  if (ready) {
    tag = 'ready';
    tagLabel = 'Você tem todos os ingredientes';
  } else if (expiringName) {
    tag = 'expiring';
    tagLabel = `Usa ${expiringName}, que vence em breve • faltam ${missing.length}`;
  }

  return { ...recipe, ingredients, haveCount, total, missing, ready, tag, tagLabel, ratio: total ? haveCount / total : 0 };
}
