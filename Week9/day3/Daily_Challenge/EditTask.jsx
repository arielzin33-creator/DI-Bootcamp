import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { editTask } from '../features/planner/plannerSlice';

export default function EditTask({ date, task }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);

  if (!isEditing) {
    return (
      <div className="task__display">
        <span className="task__text">{task.text}</span>
        <button
          type="button"
          className="task__edit"
          onClick={() => {
            setDraft(task.text);
            setIsEditing(true);
          }}
        >
          Edit
        </button>
      </div>
    );
  }

  const commit = () => {
    const trimmed = draft.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== task.text) {
      dispatch(editTask({ date, id: task.id, text: trimmed }));
    }
  };

  return (
    <form
      className="task__edit-form"
      onSubmit={(event) => {
        event.preventDefault();
        commit();
      }}
    >
      <input
        className="task__edit-input"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
        aria-label={`Edit "${task.text}"`}
      />
      <button type="submit" className="task__edit-save">
        Save
      </button>
    </form>
  );
}
