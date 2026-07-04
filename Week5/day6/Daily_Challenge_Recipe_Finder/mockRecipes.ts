// src/features/recipes/mockRecipes.ts
import { Recipe } from './types';

// A small static dataset simulating a recipe database
export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Tomato Basil Pasta',
    description: 'A quick and fresh pasta dish with tomatoes and basil.',
    ingredients: ['pasta', 'tomato', 'basil', 'garlic', 'olive oil'],
    instructions: [
      'Boil the pasta according to package instructions.',
      'Sauté garlic in olive oil until fragrant.',
      'Add chopped tomatoes and cook until softened.',
      'Toss in the cooked pasta and fresh basil.',
      'Season with salt and pepper, then serve.'
    ],
    prepTime: 20
  },
  {
    id: '2',
    name: 'Chicken Rice Bowl',
    description: 'A hearty bowl of seasoned chicken over rice.',
    ingredients: ['chicken', 'rice', 'onion', 'garlic', 'soy sauce'],
    instructions: [
      'Cook rice according to package instructions.',
      'Season and pan-sear the chicken until fully cooked.',
      'Sauté onion and garlic until golden.',
      'Slice the chicken and place over rice.',
      'Drizzle with soy sauce and serve.'
    ],
    prepTime: 30
  },
  {
    id: '3',
    name: 'Egg and Spinach Omelette',
    description: 'A light, protein-rich omelette with spinach.',
    ingredients: ['egg', 'spinach', 'cheese', 'butter'],
    instructions: [
      'Whisk the eggs in a bowl with a pinch of salt.',
      'Melt butter in a pan over medium heat.',
      'Add spinach and cook until wilted.',
      'Pour in the eggs and cook until just set.',
      'Sprinkle cheese on top, fold, and serve.'
    ],
    prepTime: 10
  },
  {
    id: '4',
    name: 'Garlic Tomato Soup',
    description: 'A comforting soup made with tomato and garlic.',
    ingredients: ['tomato', 'garlic', 'onion', 'vegetable broth'],
    instructions: [
      'Sauté onion and garlic until translucent.',
      'Add chopped tomatoes and cook for 5 minutes.',
      'Pour in vegetable broth and simmer for 15 minutes.',
      'Blend until smooth, then season to taste.',
      'Serve hot with crusty bread.'
    ],
    prepTime: 25
  },
  {
    id: '5',
    name: 'Rice and Egg Fried Rice',
    description: 'A simple, satisfying fried rice with egg.',
    ingredients: ['rice', 'egg', 'onion', 'soy sauce', 'garlic'],
    instructions: [
      'Scramble the eggs in a hot pan and set aside.',
      'Sauté onion and garlic until fragrant.',
      'Add cooked rice and stir-fry for a few minutes.',
      'Mix in the scrambled eggs and soy sauce.',
      'Stir well and serve hot.'
    ],
    prepTime: 15
  }
];