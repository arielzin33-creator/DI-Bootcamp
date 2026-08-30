import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCategories } from '../features/selectors'
import { addCategory, deleteCategory } from '../features/categories/categoriesSlice'

function CategorySelector({ selectedCategoryId, onSelect }) {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const [newCategory, setNewCategory] = useState('')

  const handleAddCategory = (event) => {
    event.preventDefault()
    const trimmed = newCategory.trim()
    if (!trimmed) return

    dispatch(addCategory(trimmed))
    setNewCategory('')
  }

  const handleDeleteCategory = (categoryId) => {
    dispatch(deleteCategory(categoryId))
    if (categoryId === selectedCategoryId) {
      const remaining = categories.filter((c) => c.id !== categoryId)
      onSelect(remaining[0]?.id ?? null)
    }
  }

  return (
    <div className="category-selector">
      <div className="category-tabs">
        {categories.map((category) => (
          <div key={category.id} className="category-tab-wrapper">
            <button
              type="button"
              className={category.id === selectedCategoryId ? 'active' : ''}
              onClick={() => onSelect(category.id)}
            >
              {category.name}
            </button>
            <button
              type="button"
              className="delete-category"
              title={`Delete ${category.name}`}
              onClick={() => handleDeleteCategory(category.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form className="add-category" onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="New category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>
    </div>
  )
}

export default CategorySelector
