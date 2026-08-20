/**
 * Exercise (Set 2) 2: Building a Data Table Component with Advanced TypeScript
 *
 * This component demonstrates:
 * - A generic <T extends { id: number | string }> so the same table works
 *   for any data shape that has an id.
 * - keyof T used for column keys, so a column can only reference a real
 *   property of the row type (a typo'd key fails to compile).
 * - Internal sort state and a Set<T['id']> for row selection.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T extends { id: number | string }> {
  data: T[];
  columns: TableColumn<T>[];
  onSort?: (key: keyof T, direction: SortDirection) => void;
  onSelect?: (selectedItems: T[]) => void;
}

function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onSort,
  onSelect,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<T['id']>>(new Set());

  const handleHeaderClick = (column: TableColumn<T>): void => {
    if (!column.sortable) return;

    const direction: SortDirection =
      sortConfig?.key === column.key && sortConfig.direction === 'asc' ? 'desc' : 'asc';

    setSortConfig({ key: column.key, direction });
    onSort?.(column.key, direction);
  };

  const sortedData: T[] = sortConfig
    ? [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === bValue) return 0;
        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      })
    : data;

  const notifySelection = (ids: Set<T['id']>): void => {
    onSelect?.(data.filter((item) => ids.has(item.id)));
  };

  const toggleRow = (id: T['id']): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      notifySelection(next);
      return next;
    });
  };

  const toggleAll = (): void => {
    const next: Set<T['id']> =
      selectedIds.size === data.length ? new Set() : new Set(data.map((item) => item.id));
    setSelectedIds(next);
    notifySelection(next);
  };

  const allSelected = data.length > 0 && selectedIds.size === data.length;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label="Select all rows"
            />
          </th>
          {columns.map((column) => {
            const isSorted = sortConfig?.key === column.key;
            return (
              <th
                key={String(column.key)}
                onClick={() => handleHeaderClick(column)}
                className={column.sortable ? 'sortable' : undefined}
              >
                {column.title}
                {isSorted && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleRow(item.id)}
                aria-label={`Select row ${item.id}`}
              />
            </td>
            {columns.map((column) => (
              <td key={String(column.key)}>
                {column.render ? column.render(item) : String(item[column.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;
