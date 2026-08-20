import React, { useReducer, useState } from "react";

/**
 * Todo list
 *
 * All state transitions (adding, removing) go through a single
 * reducer function instead of scattered useState calls. This keeps
 * the update logic in one place and makes it easy to add more
 * actions later (e.g. "toggle complete", "edit") without touching
 * the component's render logic.
 */

// Each todo: { id: string, text: string }
const initialTodos = [];

function todosReducer(state, action) {
  switch (action.type) {
    case "add": {
      const text = action.payload.text.trim();
      if (!text) return state; // ignore empty submissions

      const newTodo = {
        id: crypto.randomUUID(), // unique id, used to remove the right item later
        text,
      };
      return [...state, newTodo];
    }

    case "remove": {
      return state.filter((todo) => todo.id !== action.payload.id);
    }

    default:
      // Unknown action: return state unchanged rather than throwing,
      // so an unrecognized dispatch never crashes the app.
      return state;
  }
}

export default function TodoList() {
  const [todos, dispatch] = useReducer(todosReducer, initialTodos);
  const [draft, setDraft] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "add", payload: { text: draft } });
    setDraft("");
  };

  const handleRemove = (id) => {
    dispatch({ type: "remove", payload: { id } });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Todo list</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a todo..."
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p style={styles.empty}>No todos yet. Add one above.</p>
      ) : (
        <ul style={styles.list}>
          {todos.map((todo) => (
            <li key={todo.id} style={styles.listItem}>
              <span>{todo.text}</span>
              <button
                onClick={() => handleRemove(todo.id)}
                aria-label={`Remove "${todo.text}"`}
                style={styles.removeButton}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "360px",
    fontFamily: "sans-serif",
  },
  heading: {
    margin: "0 0 12px",
    fontSize: "18px",
  },
  form: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  addButton: {
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #1e1e1e",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    cursor: "pointer",
  },
  empty: {
    fontSize: "14px",
    color: "#888",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
  },
  removeButton: {
    border: "none",
    background: "transparent",
    fontSize: "16px",
    lineHeight: 1,
    cursor: "pointer",
    color: "#a33",
  },
};
