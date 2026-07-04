// src/features/recipes/recipeApi.ts
import { Recipe } from './types';
import { MOCK_RECIPES } from './mockRecipes';

// Simulates a network request that filters recipes by matching ingredients
export function fetchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedInput = ingredients.map(i => i.trim().toLowerCase()).filter(Boolean);

      if (normalizedInput.length === 0) {
        resolve([]);
        return;
      }

      // A recipe matches if it contains AT LEAST ONE of the searched ingredients
      const matches = MOCK_RECIPES.filter(recipe =>
        recipe.ingredients.some(recipeIngredient =>
          normalizedInput.some(input => recipeIngredient.toLowerCase().includes(input))
        )
      );

      resolve(matches);
    }, 800); // simulate network latency
  });
}