/**
 * Daily Challenge: Generic List component
 *
 * This component demonstrates:
 * - A generic <T extends { id: number | string }>, so List works for books,
 *   movies, or any other item shape, as long as each item has a unique id
 *   (used as the React `key`) — the constraint is the only thing List knows
 *   about T.
 * - A `renderItem: (item: T) => ReactNode` prop, so the *caller* decides
 *   exactly how each item is displayed. List itself contains no rendering
 *   logic specific to books, movies, or anything else.
 */

import type { ReactNode } from 'react';

interface ListProps<T extends { id: number | string }> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
}

function List<T extends { id: number | string }>({
  items,
  renderItem,
  emptyMessage = 'No items to display.',
}: ListProps<T>) {
  if (items.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <ul className="generic-list">
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

export default List;
