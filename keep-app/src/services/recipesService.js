import RECIPES from './recipesData';

export async function getRecipes() {
  return RECIPES.map((r) => ({ ...r }));
}

export async function getRecipeById(id) {
  const recipe = RECIPES.find((r) => r.id === id);
  return recipe ? { ...recipe } : null;
}
