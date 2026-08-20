import { describe, it, expect } from 'vitest';
import todosReducer, { addTodo, toggleTodo, removeTodo } from './todosSlice';

const emptyState = { items: [] };

describe('addTodo', () => {
  it('adds a new todo with completed: false and a generated id', () => {
    const state = todosReducer(emptyState, addTodo('Learn Redux Toolkit'));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ text: 'Learn Redux Toolkit', completed: false });
    expect(typeof state.items[0].id).toBe('string');
  });

  it('appends without disturbing existing todos', () => {
    let state = todosReducer(emptyState, addTodo('First'));
    state = todosReducer(state, addTodo('Second'));
    expect(state.items.map((t) => t.text)).toEqual(['First', 'Second']);
  });
});

describe('toggleTodo', () => {
  it('flips completed for the matching todo only', () => {
    let state = todosReducer(emptyState, addTodo('A'));
    state = todosReducer(state, addTodo('B'));
    const idA = state.items[0].id;

    state = todosReducer(state, toggleTodo(idA));
    expect(state.items[0].completed).toBe(true);
    expect(state.items[1].completed).toBe(false);

    // toggling again flips it back
    state = todosReducer(state, toggleTodo(idA));
    expect(state.items[0].completed).toBe(false);
  });

  it('does nothing if the id does not match any todo', () => {
    const state = todosReducer(emptyState, addTodo('A'));
    const unchanged = todosReducer(state, toggleTodo('does-not-exist'));
    expect(unchanged).toEqual(state);
  });
});

describe('removeTodo', () => {
  it('removes only the matching todo', () => {
    let state = todosReducer(emptyState, addTodo('A'));
    state = todosReducer(state, addTodo('B'));
    const idA = state.items[0].id;

    state = todosReducer(state, removeTodo(idA));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].text).toBe('B');
  });
});
