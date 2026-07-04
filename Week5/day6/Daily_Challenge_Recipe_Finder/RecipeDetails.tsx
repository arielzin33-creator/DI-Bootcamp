// src/components/RecipeDetails.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { clearSelectedRecipe } from '../features/recipes/recipeSlice';
import './RecipeDetails.css';

const RecipeDetails: React.FC = () => {
  const selectedRecipe = useSelector((state: RootState) => state.recipes.selectedRecipe);
  const dispatch = useDispatch<AppDispatch>();

  if (!selectedRecipe) {
    return null; // nothing selected -> render nothing (modal/panel stays hidden)
  }

  return (
    <div className="recipe-details-overlay">
      <div className="recipe-details">
        <button
          className="recipe-details__close"
          onClick={() => dispatch(clearSelectedRecipe())}
          aria-label="Close recipe details"
        >
          &times;
        </button>

        <h2>{selectedRecipe.name}</h2>
        <p className="recipe-details__description">{selectedRecipe.description}</p>
        <p className="recipe-details__time">
          <strong>Prep time:</strong> {selectedRecipe.prepTime} minutes
        </p>

        <h3>Ingredients</h3>
        <ul>
          {selectedRecipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>

        <h3>Instructions</h3>
        <ol>
          {selectedRecipe.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDetails;