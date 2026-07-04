// src/components/SearchBar.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchRecipes } from '../features/recipes/recipeSlice';
import './SearchBar.css';

const SearchBar: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmed = ingredients.trim();
    if (!trimmed) return;

    dispatch(fetchRecipes(trimmed));
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Enter ingredients, separated by commas (e.g. tomato, garlic)"
        className="search-bar__input"
      />
      <button type="submit" className="search-bar__button">
        Search
      </button>
    </form>
  );
};

export default SearchBar;