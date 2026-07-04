// src/components/RecipeList.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { selectRecipe } from '../features/recipes/recipeSlice';
import './RecipeList.css';

const RecipeList: React.FC = () => {
  const { recipes, status, error } = useSelector((state: RootState) => state.recipes);
  const dispatch = useDispatch<AppDispatch>();

  if (status === 'loading') {
    return <p className="recipe-list__message">Loading recipes...</p>;
  }

  if (status === 'failed') {
    return <p className="recipe-list__message recipe-list__message--error">{error}</p>;
  }

  if (status === 'succeeded' && recipes.length === 0) {
    return (
      <p className="recipe-list__message">
        No recipes found for those ingredients. Try a different search.
      </p>
    );
  }

  if (status === 'idle') {
    return <p className="recipe-list__message">Search for ingredients to find recipes.</p>;
  }

  return (
    <div className="recipe-list">
      {recipes.map(recipe => (
        <div key={recipe.id} className="recipe-card">
          <h3 className="recipe-card__title">{recipe.name}</h3>
          <p className="recipe-card__description">{recipe.description}</p>
          <p className="recipe-card__time">Prep time: {recipe.prepTime} min</p>
          <button
            className="recipe-card__button"
            onClick={() => dispatch(selectRecipe(recipe.id))}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;