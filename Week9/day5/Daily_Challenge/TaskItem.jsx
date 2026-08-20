import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeSelectCategoryById } from '../features/categories/selectors';

const PROGRESS_STEPS = 10;

function ProgressDots({ progress, onChange }) {
  const filled = Math.round(progress / PROGRESS_STEPS);
  return (
    <div className="dots" role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      {Array.from({ length: PROGRESS_STEPS }, (_, i) => {
        const step = i + 1;
        const isFilled = step <= filled;
        return (
          <button
            key={step}
            type="button"
            className={`dots__cell${isFilled ? ' dots__cell--filled' : ''}`}
            aria-label={`Set progress to ${step * PROGRESS_STEPS}%`}
            onClick={() => onChange(step * PROGRESS_STEPS)}
          />
        );
      })}
    </div>
  );
}

function CategoryBadge({ categoryId }) {
  const selectCategoryById = useMemo(makeSelectCategoryById, []);
  const category = useSelector((state) => selectCategoryById(state, categoryId));
  if (!category) return null;
  return (
    <span className="badge">
      <span className="badge__dot" style={{ backgroundColor: category.color }} aria-hidden="true" />
      {category.name}
    </span>
  );
}

/**
 * Wrapped in `memo` so that editing or completing one task does not re-render
 * every other row. That guard only holds if the props it's given are
 * themselves stable across renders — an inline arrow function passed as
 * `onToggle` would be a new reference every time the parent re-renders,
 * defeating the memo comparison regardless of whether `task` changed. The
 * `onToggle` / `onProgressChange` / `onDelete` / `onEditSave` callbacks are
 * built with `useCallback` in TaskList for exactly this reason.
 */
function TaskItem({ task, onToggleComplete, onProgressChange, onDelete, onEditSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const startEdit = useCallback(() => {
    setDraftTitle(task.title);
    setIsEditing(true);
  }, [task.title]);

  const commitEdit = useCallback(() => {
    const trimmed = draftTitle.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== task.title) {
      onEditSave(task.id, { title: trimmed });
    }
  }, [draftTitle, task.id, task.title, onEditSave]);

  const cancelEdit = useCallback(() => setIsEditing(false), []);

  return (
    <li className={`task${task.completed ? ' task--done' : ''}`}>
      <button
        type="button"
        className="task__check"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? 'Mark as not completed' : 'Mark as completed'}
        onClick={() => onToggleComplete(task.id)}
      >
        {task.completed ? '✓' : ''}
      </button>

      <div className="task__body">
        {isEditing ? (
          <input
            className="task__title-input"
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
          />
        ) : (
          <p className="task__title">{task.title}</p>
        )}

        <div className="task__meta">
          <CategoryBadge categoryId={task.categoryId} />
          <ProgressDots progress={task.progress} onChange={(value) => onProgressChange(task.id, value)} />
          <span className="task__progress-label">{task.progress}%</span>
        </div>
      </div>

      <div className="task__actions">
        <span className="task__renders" title="Times this row has rendered">
          r{renderCount.current}
        </span>
        {!isEditing && (
          <button type="button" className="task__edit" onClick={startEdit}>
            Edit
          </button>
        )}
        <button type="button" className="task__delete" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default memo(TaskItem);
