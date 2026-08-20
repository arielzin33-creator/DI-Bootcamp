import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ALL_CATEGORIES } from '../features/categories/categoriesSlice';
import { selectCategories, selectSelectedCategoryId } from '../features/categories/selectors';
import { taskAdded } from '../features/tasks/tasksSlice';

export default function AddTaskForm() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const selectedCategoryId = useSelector(selectSelectedCategoryId);

  const defaultCategoryId =
    selectedCategoryId === ALL_CATEGORIES ? categories[0]?.id : selectedCategoryId;

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = title.trim();
      if (!trimmed || !categoryId) return;
      dispatch(taskAdded({ title: trimmed, categoryId }));
      setTitle('');
    },
    [dispatch, title, categoryId],
  );

  if (categories.length === 0) return null;

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        className="add-task__title"
        placeholder="Log a new task…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className="add-task__category"
        value={categoryId ?? categories[0].id}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <button type="submit" className="add-task__submit">
        Add task
      </button>
    </form>
  );
}
