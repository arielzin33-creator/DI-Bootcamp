import type { ReactNode } from 'react';

interface ListProps<T> {
  items: T[];
  /** Decides exactly how each item is displayed — the component itself has no opinion. */
  renderItem: (item: T) => ReactNode;
  /**
   * Optional: derives a stable React key per item. Falls back to the
   * array index when omitted, which is fine for a list that's only ever
   * appended to (as `BookApp` does) but would misbehave for a list that
   * reorders or removes from the middle — the same caveat that applies to
   * using array index as a key anywhere in React.
   */
  keyExtractor?: (item: T) => string | number;
}

/**
 * `<T>` is what makes this work for books, movies, or anything else
 * without a single line of `List` itself changing — `T` is inferred from
 * whatever array is passed as `items`, and `renderItem` / `keyExtractor`
 * are typed to receive exactly that same `T`, not `unknown` or `any`.
 */
export default function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  if (items.length === 0) {
    return <p className="list__empty">Nothing here yet.</p>;
  }

  return (
    <ul className="list">
      {items.map((item, index) => (
        <li key={keyExtractor ? keyExtractor(item) : index} className="list__item">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
