import type { ReactNode } from 'react'

interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
  keyExtractor: (item: T) => number | string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  if (items.length === 0) {
    return <p className="empty-message">No items yet.</p>
  }

  return (
    <ul className="generic-list">
      {items.map((item) => (
        <li key={keyExtractor(item)} className="generic-list-item">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}

export default List
