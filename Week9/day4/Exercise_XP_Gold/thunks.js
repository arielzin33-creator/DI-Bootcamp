import { todosFetchStarted, todosFetchFailed, setTodos } from './todosSlice';

/**
 * JSONPlaceholder again (see the previous exercise's thunk for the same
 * note) — `?userId=1&_limit=10` keeps the demo to a manageable ten items
 * out of the 200 the full `/todos` collection contains.
 */
const TODOS_API_URL = 'https://jsonplaceholder.typicode.com/todos?userId=1&_limit=10';

/**
 * Fetches todos from the mock API and stores them via `setTodos`.
 *
 * The API's shape (`{ userId, id, title, completed }`) is deliberately
 * narrowed to just `{ id, title, completed }` here, in the thunk, before
 * dispatching — not left for the reducer or the component to work around.
 * A locally-added todo has no `userId`; keeping every todo in state to the
 * same shape regardless of where it came from means `TodoList` never needs
 * to branch on origin when rendering.
 */
export function fetchTodos() {
  return async function fetchTodosThunk(dispatch) {
    dispatch(todosFetchStarted());
    try {
      const response = await fetch(TODOS_API_URL);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = await response.json();
      const todos = data.map((todo) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
      }));

      dispatch(setTodos(todos));
    } catch (error) {
      dispatch(todosFetchFailed(error.message || 'Something went wrong fetching todos.'));
    }
  };
}
