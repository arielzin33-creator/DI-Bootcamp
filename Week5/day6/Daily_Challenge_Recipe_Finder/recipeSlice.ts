// src/features/recipes/recipeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, RecipeState } from './types';
import { fetchRecipesByIngredients } from './recipeApi';

const initialState: RecipeState = {
  recipes: [],
  selectedRecipe: null,
  status: 'idle',
  error: null
};

// Async thunk: accepts a search string, splits it into ingredients, and fetches matches
export const fetchRecipes = createAsyncThunk<Recipe[], string, { rejectValue: string }>(
  'recipes/fetchRecipes',
  async (searchTerm, thunkAPI) => {
    try {
      const ingredients = searchTerm.split(',');
      const results = await fetchRecipesByIngredients(ingredients);
      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch recipes.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    selectRecipe: (state, action: PayloadAction<string>) => {
      const recipe = state.recipes.find(r => r.id === action.payload);
      state.selectedRecipe = recipe ?? null;
    },
    clearSelectedRecipe: (state) => {
      state.selectedRecipe = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.status = 'succeeded';
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
        state.recipes = [];
      });
  }
});

export const { selectRecipe, clearSelectedRecipe } = recipeSlice.actions;
export default recipeSlice.reducer;