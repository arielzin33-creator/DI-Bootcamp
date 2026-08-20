import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

/**
 * `key` is `keyof T`, not a bare `string` — this is what lets `DataTable`
 * read `row[column.key]` for *any* `T` the caller supplies without a cast,
 * and what makes a typo (a key that doesn't exist on `T`) a compile error
 * in the column definition itself, rather than a silent `undefined` at
 * render time.
 */
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  /** Custom cell rendering; falls back to `String(value)` when omitted. */
  render?: (value: T[keyof T], row: T) => ReactNode;
}

/**
 * `T extends { id: number | string }` is the one requirement `DataTable`
 * places on the data it's given — every row needs a stable, unique
 * identifier for React's `key` prop and for tracking selection, regardless
 * of what else the row contains.
 */
export interface DataTableProps<T extends { id: number | string }> {
  data: T[];
  columns: TableColumn<T>[];
  /**
   * If provided, `DataTable` calls this instead of sorting `data` itself —
   * the parent owns the actual reordering (e.g. because it's sorting a
   * larger dataset server-side). If omitted, `DataTable` sorts internally.
   */
  onSort?: (key: keyof T, direction: SortDirection) => void;
  onSelect?: (selectedRows: T[]) => void;
}
