import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import todosReducer, { addTodo } from './todosSlice';
import { fetchTodos } from './thunks';

const makeStore = () => configureStore({ reducer: { todos: todosReducer } });

const apiTodos = [
  { userId: 1, id: 1, title: 'delectus aut autem', completed: false },
  { userId: 1, id: 2, title: 'quis ut nam facilis et officia qui', completed: false },
];

const jsonResponse = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(body),
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchTodos thunk', () => {
  it('maps the API shape down to { id, title, completed } before storing it', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse(apiTodos));

    const store = makeStore();
    await store.dispatch(fetchTodos());

    expect(store.getState().todos.items).toEqual([
      { id: 1, title: 'delectus aut autem', completed: false, source: 'api' },
      { id: 2, title: 'quis ut nam facilis et officia qui', completed: false, source: 'api' },
    ]);
    expect(store.getState().todos.status).toBe('succeeded');
  });

  it('preserves locally-added todos already in the store', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse(apiTodos));

    const store = makeStore();
    store.dispatch(addTodo('Pack the crate'));
    await store.dispatch(fetchTodos());

    const items = store.getState().todos.items;
    expect(items).toHaveLength(3);
    expect(items.some((t) => t.title === 'Pack the crate' && t.source === 'local')).toBe(true);
  });

  it('dispatches todosFetchFailed on a non-ok response', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse(null, false, 500));

    const store = makeStore();
    await store.dispatch(fetchTodos());

    expect(store.getState().todos.status).toBe('failed');
    expect(store.getState().todos.error).toBe('Request failed with status 500.');
    expect(store.getState().todos.items).toEqual([]);
  });

  it('dispatches todosFetchFailed when fetch itself rejects', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const store = makeStore();
    await store.dispatch(fetchTodos());

    expect(store.getState().todos.status).toBe('failed');
    expect(store.getState().todos.error).toBe('Failed to fetch');
  });

  it('requests the expected URL with the userId filter and a limit', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse(apiTodos));

    const store = makeStore();
    await store.dispatch(fetchTodos());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos?userId=1&_limit=10',
    );
  });
});
