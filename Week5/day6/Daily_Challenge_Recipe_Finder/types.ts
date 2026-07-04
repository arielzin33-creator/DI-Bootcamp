// src/features/recipes/types.ts

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // in minutes
  imageUrl?: string;
}

export type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface RecipeState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  status: FetchStatus;
  error: string | null;
}