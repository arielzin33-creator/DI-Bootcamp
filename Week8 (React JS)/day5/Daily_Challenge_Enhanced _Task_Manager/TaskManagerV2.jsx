import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

/**
 * Task manager v2
 *
 * Builds on the previous exercise (Context + useReducer for shared
 * state) and adds:
 *   - editing an existing task's text in place
 *   - filtering the visible list by completion status
 *
 * State shape is now { tasks, filter } instead of just an array, since
 * "which filter is active" is itself part of the shared task state
 * (the reducer owns it, same as the tasks themselves), per the
 * exercise's instruction to add a FILTER_TASKS reducer action.
 *
 * Each task: { id: string, text: string, completed: boolean }
 */

// ---------- 1. Context ----------

const TaskContext = createContext(null);

function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}

// ---------- 2. Reducer ----------

const initialState = {
  tasks: [],
  filter: "all", // "all" | "active" | "completed"
};

function tasksReducer(state, action) {
  switch (action.type) {
    case "ADD_TASK": {
      const text = action.payload.text.trim();
      if (!text) return state;

      const newTask = {
        id: crypto.randomUUID(),
        text,
        completed: false,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case "EDIT_TASK": {
      const text = action.payload.text.trim();
      if (!text) return state; // ignore attempts to save an empty task

      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, text } : task
        ),
      };
    }

    case "COMPLETE_TASK": {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    }

    case "REMOVE_TASK": {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };
    }

    case "FILTER_TASKS": {
      return { ...state, filter: action.payload.filter };
    }

    default:
      return state;
  }
}

// ---------- 3. Provider ----------

function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

// ---------- 4. Components ----------

function AddTask() {
  const { dispatch } = useTasks();
  const [draft, setDraft] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "ADD_TASK", payload: { text: draft } });
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

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

function FilterBar() {
  const { state, dispatch } = useTasks();

  return (
    <div style={styles.filterBar}>
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => dispatch({ type: "FILTER_TASKS", payload: { filter: f.key } })}
          style={{
            ...styles.filterButton,
            ...(state.filter === f.key ? styles.filterButtonActive : {}),
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function TaskList() {
  const { state } = useTasks();

  const visibleTasks = state.tasks.filter((task) => {
    if (state.filter === "active") return !task.completed;
    if (state.filter === "completed") return task.completed;
    return true; // "all"
  });

  if (state.tasks.length === 0) {
    return <p style={styles.empty}>No tasks yet. Add one above.</p>;
  }

  if (visibleTasks.length === 0) {
    return <p style={styles.empty}>No tasks match this filter.</p>;
  }

  return (
    <ul style={styles.list}>
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

/**
 * A single task, in either "view" or "edit" mode.
 *
 * Editing uses an uncontrolled input: a ref is attached to the input
 * element, and the edited text is read directly from
 * inputRef.current.value when the user saves, rather than mirroring
 * every keystroke into useState. The ref is also used to auto-focus
 * the input the moment edit mode opens.
 */
function TaskItem({ task }) {
  const { dispatch } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => setIsEditing(true);

  const saveEdit = () => {
    const newText = inputRef.current.value;
    dispatch({ type: "EDIT_TASK", payload: { id: task.id, text: newText } });
    setIsEditing(false);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  if (isEditing) {
    return (
      <li style={styles.listItem}>
        <input
          ref={inputRef}
          defaultValue={task.text}
          onKeyDown={handleKeyDown}
          style={styles.editInput}
        />
        <div style={styles.actions}>
          <button onClick={saveEdit} style={styles.smallButton}>
            Save
          </button>
          <button onClick={cancelEdit} style={styles.smallButton}>
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li style={styles.listItem}>
      <label style={styles.taskLabel}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => dispatch({ type: "COMPLETE_TASK", payload: { id: task.id } })}
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

      <div style={styles.actions}>
        <button onClick={startEditing} style={styles.smallButton}>
          Edit
        </button>
        <button
          onClick={() => dispatch({ type: "REMOVE_TASK", payload: { id: task.id } })}
          aria-label={`Remove "${task.text}"`}
          style={styles.removeButton}
        >
          ×
        </button>
      </div>
    </li>
  );
}

// ---------- 5. Root ----------

export default function App() {
  return (
    <TaskProvider>
      <div style={styles.container}>
        <h2 style={styles.heading}>Task manager</h2>
        <AddTask />
        <FilterBar />
        <TaskList />
      </div>
    </TaskProvider>
  );
}

const styles = {
  container: {
    maxWidth: "420px",
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
  filterBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  filterButton: {
    padding: "6px 12px",
    fontSize: "13px",
    borderRadius: "999px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#1e1e1e",
    cursor: "pointer",
  },
  filterButtonActive: {
    backgroundColor: "#1e1e1e",
    borderColor: "#1e1e1e",
    color: "#fff",
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
    gap: "8px",
  },
  taskLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },
  taskText: {
    fontSize: "14px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  editInput: {
    flex: 1,
    padding: "6px 8px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #999",
  },
  actions: {
    display: "flex",
    gap: "6px",
    flexShrink: 0,
  },
  smallButton: {
    padding: "4px 10px",
    fontSize: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
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
