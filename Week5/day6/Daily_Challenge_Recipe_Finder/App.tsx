// src/App.tsx
import React from 'react';
import SearchBar from './components/SearchBar';
import RecipeList from './components/RecipeList';
import RecipeDetails from './components/RecipeDetails';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 className="app-title">Recipe Finder</h1>
      <SearchBar />
      <RecipeList />
      <RecipeDetails />
    </div>
  );
}

export default App;