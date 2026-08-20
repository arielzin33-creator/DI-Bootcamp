import { describe, it, expect } from 'vitest';
import todosReducer, {
  addTodo,
  removeTodo,
  toggleTodo,
  setTodos,
  todosFetchStarted,
  todosFetchFailed,
} from './todosSlice';

const initialState = { items: [], status: 'idle', error: null };

describe('addTodo', () => {
  it('adds a local todo with a generated id and completed: false', () => {
    const state = todosReducer(initialState, addTodo('Pack the crate'));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      title: 'Pack the crate',
      completed: false,
      source: 'local',
    });
    expect(typeof state.items[0].id).toBe('string');
  });
});

describe('toggleTodo', () => {
  it('flips completed for the matching todo only', () => {
    let state = todosReducer(initialState, addTodo('A'));
    state = todosReducer(state, addTodo('B'));
    const idA = state.items[0].id;

    state = todosReducer(state, toggleTodo(idA));
    expect(state.items[0].completed).toBe(true);
    expect(state.items[1].completed).toBe(false);
  });
});

describe('removeTodo', () => {
  it('removes only the matching todo', () => {
    let state = todosReducer(initialState, addTodo('A'));
    state = todosReducer(state, addTodo('B'));
    const idA = state.items[0].id;

    state = todosReducer(state, removeTodo(idA));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe('B');
  });
});

describe('setTodos', () => {
  const fetched = [
    { id: 1, title: 'delectus aut autem', completed: false },
    { id: 2, title: 'quis ut nam facilis et officia qui', completed: false },
  ];

  it('stores fetched todos, tagged with source: "api", and marks status succeeded', () => {
    const state = todosReducer(initialState, setTodos(fetched));
    expect(state.status).toBe('succeeded');
    expect(state.items).toHaveLength(2);
    expect(state.items.every((t) => t.source === 'api')).toBe(true);
  });

  it('preserves local todos and replaces only previously-fetched ones on refetch', () => {
    let state = todosReducer(initialState, addTodo('Pack the crate'));
    state = todosReducer(state, setTodos(fetched));
    expect(state.items).toHaveLength(3); // 1 local + 2 fetched

    // Re-fetching with a different result should not duplicate or lose the
    // local todo, and should fully replace the previous fetched batch.
    const refetched = [{ id: 3, title: 'a different todo entirely', completed: true }];
    state = todosReducer(state, setTodos(refetched));

    expect(state.items).toHaveLength(2); // 1 local + 1 newly fetched
    expect(state.items.some((t) => t.title === 'Pack the crate' && t.source === 'local')).toBe(
      true,
    );
    expect(state.items.some((t) => t.id === 1)).toBe(false); // old fetched batch is gone
    expect(state.items.some((t) => t.id === 3)).toBe(true);
  });
});

describe('todosFetchStarted / todosFetchFailed', () => {
  it('sets loading and then failed with the error message', () => {
    let state = todosReducer(initialState, todosFetchStarted());
    expect(state.status).toBe('loading');

    state = todosReducer(state, todosFetchFailed('Request failed with status 500.'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Request failed with status 500.');
  });

  it('does not touch existing items on failure', () => {
    let state = todosReducer(initialState, addTodo('Pack the crate'));
    state = todosReducer(state, todosFetchFailed('offline'));
    expect(state.items).toHaveLength(1);
  });
});
