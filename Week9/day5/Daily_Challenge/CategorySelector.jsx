import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ALL_CATEGORIES,
  categoryAdded,
  categoryDeleted,
  categoryEdited,
  categorySelected,
} from '../features/categories/categoriesSlice';
import { selectCategories, selectSelectedCategoryId } from '../features/categories/selectors';
import { selectTasks, selectTaskCountByCategoryId } from '../features/tasks/selectors';

const SWATCHES = ['#e2a63b', '#e1653d', '#4fa3a0', '#7d8f5b', '#7a8ca8', '#b06fae'];

function CategoryChip({ category, count, isActive, onSelect, onRename, onDelete, canDelete }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(category.name);

  const startRename = useCallback((event) => {
    event.stopPropagation();
    setDraftName(category.name);
    setIsRenaming(true);
  }, [category.name]);

  const commitRename = useCallback(() => {
    const trimmed = draftName.trim();
    setIsRenaming(false);
    if (trimmed && trimmed !== category.name) {
      onRename(category.id, trimmed);
    }
  }, [draftName, category.id, category.name, onRename]);

  if (isRenaming) {
    return (
      <input
        className="chip chip--editing"
        autoFocus
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitRename();
          if (e.key === 'Escape') setIsRenaming(false);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="chip"
      aria-pressed={isActive}
      onClick={() => onSelect(category.id)}
      onDoubleClick={startRename}
      title="Double-click to rename"
    >
      <span className="chip__swatch" style={{ backgroundColor: category.color }} aria-hidden="true" />
      <span className="chip__name">{category.name}</span>
      <span className="chip__count">{count}</span>
      {canDelete && (
        <span
          className="chip__delete"
          role="button"
          tabIndex={0}
          aria-label={`Delete ${category.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(category.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onDelete(category.id);
            }
          }}
        >
          ×
        </span>
      )}
    </button>
  );
}

/**
 * Reads the category list and the current selection, and lets the operator
 * switch, rename, delete, or create categories. All filtering happens in
 * selectors; this component only ever dispatches.
 */
export default function CategorySelector() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const selectedCategoryId = useSelector(selectSelectedCategoryId);
  const totalTasks = useSelector(selectTasks).length;
  const countByCategory = useSelector(selectTaskCountByCategoryId);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(SWATCHES[0]);

  const handleSelect = useCallback((id) => dispatch(categorySelected(id)), [dispatch]);
  const handleRename = useCallback(
    (id, name) => dispatch(categoryEdited({ id, changes: { name } })),
    [dispatch],
  );
  const handleDelete = useCallback((id) => dispatch(categoryDeleted(id)), [dispatch]);

  const handleAddSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = newName.trim();
      if (!trimmed) return;
      dispatch(categoryAdded({ name: trimmed, color: newColor }));
      setNewName('');
      setNewColor(SWATCHES[(categories.length + 1) % SWATCHES.length]);
      setIsAdding(false);
    },
    [dispatch, newName, newColor, categories.length],
  );

  return (
    <nav className="categories" aria-label="Filter tasks by category">
      <button
        type="button"
        className="chip"
        aria-pressed={selectedCategoryId === ALL_CATEGORIES}
        onClick={() => handleSelect(ALL_CATEGORIES)}
      >
        <span className="chip__name">All tasks</span>
        <span className="chip__count">{totalTasks}</span>
      </button>

      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          category={category}
          count={countByCategory[category.id] ?? 0}
          isActive={selectedCategoryId === category.id}
          onSelect={handleSelect}
          onRename={handleRename}
          onDelete={handleDelete}
          canDelete={categories.length > 1}
        />
      ))}

      {isAdding ? (
        <form className="chip-form" onSubmit={handleAddSubmit}>
          <input
            autoFocus
            className="chip-form__input"
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setIsAdding(false)}
          />
          <div className="chip-form__swatches">
            {SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                className="swatch"
                style={{ backgroundColor: color }}
                aria-label={`Use colour ${color}`}
                aria-pressed={color === newColor}
                onClick={() => setNewColor(color)}
              />
            ))}
          </div>
          <button type="submit" className="chip-form__submit">Add</button>
        </form>
      ) : (
        <button type="button" className="chip chip--ghost" onClick={() => setIsAdding(true)}>
          + New category
        </button>
      )}
    </nav>
  );
}
