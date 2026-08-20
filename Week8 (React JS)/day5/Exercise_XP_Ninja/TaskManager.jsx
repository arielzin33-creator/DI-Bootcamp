import React, { createContext, useContext, useReducer, useState } from "react";

/**
 * Task manager
 *
 * Combines useReducer (for the state transitions: add / complete / remove)
 * with useContext (so components anywhere in the tree can dispatch
 * actions or read the task list without prop drilling).
 *
 * Each task: { id: string, text: string, completed: boolean }
 */

// ---------- 1. Context ----------

const TaskContext = createContext(null);

function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    // Guards against using the hook outside of <TaskProvider>.
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}

// ---------- 2. Reducer ----------

const initialTasks = [];

function tasksReducer(state, action) {
  switch (action.type) {
    case "add": {
      const text = action.payload.text.trim();
      if (!text) return state;

      const newTask = {
        id: crypto.randomUUID(),
        text,
        completed: false,
      };
      return [...state, newTask];
    }

    case "complete": {
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, completed: !task.completed }
          : task
      );
    }

    case "remove": {
      return state.filter((task) => task.id !== action.payload.id);
    }

    default:
      return state;
  }
}

// ---------- 3. Provider ----------

function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  // Memoizing this isn't strictly required for the exercise, but in a
  // larger app you'd wrap it in useMemo to avoid re-rendering every
  // consumer whenever TaskProvider itself re-renders for unrelated reasons.
  const value = { tasks, dispatch };

  return (
    <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
  );
}

// ---------- 4. Components ----------

function AddTask() {
  const { dispatch } = useTasks();
  const [draft, setDraft] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "add", payload: { text: draft } });
    setDraft("");
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a task..."
        style={styles.input}
      />
      <button type="submit" style={styles.addButton}>
        Add
      </button>
    </form>
  );
}

function TaskList() {
  const { tasks, dispatch } = useTasks();

  if (tasks.length === 0) {
    return <p style={styles.empty}>No tasks yet. Add one above.</p>;
  }

  return (
    <ul style={styles.list}>
      {tasks.map((task) => (
        <li key={task.id} style={styles.listItem}>
          <label style={styles.taskLabel}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() =>
                dispatch({ type: "complete", payload: { id: task.id } })
              }
            />
            <span
              style={{
                ...styles.taskText,
                textDecoration: task.completed ? "line-through" : "none",
                color: task.completed ? "#888" : "#1e1e1e",
              }}
            >
              {task.text}
            </span>
          </label>

          <RemoveTaskButton id={task.id} text={task.text} />
        </li>
      ))}
    </ul>
  );
}

// Kept as its own component to show that "removing" can live in a
// completely separate part of the tree from AddTask/TaskList and
// still work through the same shared context.
function RemoveTaskButton({ id, text }) {
  const { dispatch } = useTasks();

  return (
    <button
      onClick={() => dispatch({ type: "remove", payload: { id } })}
      aria-label={`Remove "${text}"`}
      style={styles.removeButton}
    >
      ×
    </button>
  );
}

// ---------- 5. Root ----------

export default function App() {
  return (
    <TaskProvider>
      <div style={styles.container}>
        <h2 style={styles.heading}>Task manager</h2>
        <AddTask />
        <TaskList />
      </div>
    </TaskProvider>
  );
}

const styles = {
  container: {
    maxWidth: "380px",
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
  taskLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  taskText: {
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
