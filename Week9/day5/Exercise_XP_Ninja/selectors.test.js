import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import todosReducer, {
  VISIBILITY_FILTERS,
  todoAdded,
  todoToggled,
  todoRemoved,
  completedTodosCleared,
  visibilityFilterChanged,
} from './todosSlice';
import {
  selectTodoItems,
  selectVisibilityFilter,
  selectTodos,
  selectFilteredTodosCount,
  selectTodoStats,
} from './selectors';

const makeStore = () => configureStore({ reducer: { todos: todosReducer } });

describe('selectTodoItems / selectVisibilityFilter', () => {
  it('returns the seeded todos and the default "All" filter', () => {
    const state = makeStore().getState();
    expect(selectTodoItems(state)).toHaveLength(5);
    expect(selectVisibilityFilter(state)).toBe(VISIBILITY_FILTERS.ALL);
  });
});

describe('selectTodos', () => {
  it('returns every todo under the "All" filter', () => {
    const state = makeStore().getState();
    expect(selectTodos(state)).toHaveLength(5);
  });

  it('returns only incomplete todos under "Active"', () => {
    const store = makeStore();
    store.dispatch(visibilityFilterChanged(VISIBILITY_FILTERS.ACTIVE));
    const result = selectTodos(store.getState());
    expect(result.every((t) => !t.completed)).toBe(true);
    // Seed data has 3 incomplete todos.
    expect(result).toHaveLength(3);
  });

  it('returns only completed todos under "Completed"', () => {
    const store = makeStore();
    store.dispatch(visibilityFilterChanged(VISIBILITY_FILTERS.COMPLETED));
    const result = selectTodos(store.getState());
    expect(result.every((t) => t.completed)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('recomputes only when its inputs actually change, not on every call', () => {
    // RTK 2.x's `createSelector` defaults to `weakMapMemoize`, which caches
    // *every* distinct combination of input values it has seen — not just
    // the most recent one, the way classic Reselect's single-slot cache did.
    // That means `selectTodos` may already have a cached result for
    // `(items, 'All')` left over from an earlier test in this file, and
    // reusing the module-seeded `items` array here would make this test's
    // outcome depend on what ran before it. A freshly constructed `items`
    // array — a reference `selectTodos` has never seen — sidesteps that:
    // the first call below is guaranteed to be a genuine cache miss
    // regardless of test order.
    const freshItems = [{ id: 'x', text: 'A fresh, never-before-seen todo', completed: false }];
    const store = configureStore({
      reducer: { todos: todosReducer },
      preloadedState: { todos: { items: freshItems, visibilityFilter: VISIBILITY_FILTERS.ALL } },
    });

    selectTodos.resetRecomputations();

    selectTodos(store.getState());
    selectTodos(store.getState());
    expect(selectTodos.recomputations()).toBe(1);

    store.dispatch(visibilityFilterChanged(VISIBILITY_FILTERS.ACTIVE));
    selectTodos(store.getState());
    expect(selectTodos.recomputations()).toBe(2);
  });
});

describe('selectFilteredTodosCount', () => {
  it('tracks the length of the currently filtered list', () => {
    const store = makeStore();
    expect(selectFilteredTodosCount(store.getState())).toBe(5);

    store.dispatch(visibilityFilterChanged(VISIBILITY_FILTERS.COMPLETED));
    expect(selectFilteredTodosCount(store.getState())).toBe(2);
  });
});

describe('selectTodoStats', () => {
  it('reports total/active/completed independent of the current filter', () => {
    const store = makeStore();
    store.dispatch(visibilityFilterChanged(VISIBILITY_FILTERS.COMPLETED));
    // Even while viewing the Completed tab, stats still reflect the whole list.
    expect(selectTodoStats(store.getState())).toEqual({ total: 5, active: 3, completed: 2 });
  });
});

describe('todoAdded / todoToggled / todoRemoved', () => {
  it('adds a new, incomplete todo', () => {
    const store = makeStore();
    store.dispatch(todoAdded('Refill the eraser tray'));
    const items = selectTodoItems(store.getState());
    expect(items.at(-1)).toMatchObject({ text: 'Refill the eraser tray', completed: false });
  });

  it('flips completion status', () => {
    const store = makeStore();
    store.dispatch(todoToggled('todo-1'));
    expect(selectTodoItems(store.getState()).find((t) => t.id === 'todo-1').completed).toBe(true);

    store.dispatch(todoToggled('todo-1'));
    expect(selectTodoItems(store.getState()).find((t) => t.id === 'todo-1').completed).toBe(false);
  });

  it('removes a todo by id', () => {
    const store = makeStore();
    store.dispatch(todoRemoved('todo-1'));
    expect(selectTodoItems(store.getState()).find((t) => t.id === 'todo-1')).toBeUndefined();
    expect(selectTodoItems(store.getState())).toHaveLength(4);
  });
});

describe('completedTodosCleared', () => {
  it('removes every completed todo and leaves the rest untouched', () => {
    const store = makeStore();
    store.dispatch(completedTodosCleared());
    const items = selectTodoItems(store.getState());
    expect(items.every((t) => !t.completed)).toBe(true);
    expect(items).toHaveLength(3);
  });
});
