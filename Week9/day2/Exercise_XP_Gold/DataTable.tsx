import { useMemo, useState } from 'react';
import type { DataTableProps, SortConfig, SortDirection } from './dataTableTypes';

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function nextDirection(current: SortDirection | undefined): SortDirection | null {
  if (current === undefined) return 'asc';
  if (current === 'asc') return 'desc';
  return null; // desc -> back to unsorted
}

export default function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onSort,
  onSelect,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<T['id']>>(new Set());

  // Only sorts locally when the parent hasn't taken ownership of sorting
  // via `onSort`. If `onSort` is provided, `data` is trusted to already be
  // in the order the parent wants — sorting it again here would fight
  // with whatever the parent is doing (e.g. server-side pagination).
  const sortedData = useMemo(() => {
    if (!sortConfig || onSort) return data;
    const { key, direction } = sortConfig;
    const sorted = [...data].sort((a, b) => compareValues(a[key], b[key]));
    return direction === 'asc' ? sorted : sorted.reverse();
  }, [data, sortConfig, onSort]);

  const handleHeaderClick = (key: keyof T, sortable: boolean | undefined) => {
    if (!sortable) return;
    const current = sortConfig?.key === key ? sortConfig.direction : undefined;
    const direction = nextDirection(current);

    if (direction === null) {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(row.id));
  const someSelected = data.some((row) => selectedIds.has(row.id));

  const notifySelection = (nextIds: Set<T['id']>) => {
    onSelect?.(data.filter((row) => nextIds.has(row.id)));
  };

  const toggleRow = (id: T['id']) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      notifySelection(next);
      return next;
    });
  };

  const toggleAll = () => {
    const next = allSelected ? new Set<T['id']>() : new Set(data.map((row) => row.id));
    setSelectedIds(next);
    notifySelection(next);
  };

  const sortIndicator = (key: keyof T, sortable: boolean | undefined) => {
    if (!sortable) return null;
    if (sortConfig?.key !== key) return <span className="data-table__sort-hint">↕</span>;
    return <span className="data-table__sort-active">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="data-table__checkbox-cell">
            <input
              type="checkbox"
              aria-label="Select all rows"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected;
              }}
              onChange={toggleAll}
            />
          </th>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className={column.sortable ? 'data-table__sortable-header' : undefined}
              onClick={() => handleHeaderClick(column.key, column.sortable)}
            >
              {column.title} {sortIndicator(column.key, column.sortable)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row) => (
          <tr key={row.id} className={selectedIds.has(row.id) ? 'data-table__row--selected' : undefined}>
            <td className="data-table__checkbox-cell">
              <input
                type="checkbox"
                aria-label={`Select row ${String(row.id)}`}
                checked={selectedIds.has(row.id)}
                onChange={() => toggleRow(row.id)}
              />
            </td>
            {columns.map((column) => {
              const value = row[column.key];
              return (
                <td key={String(column.key)}>{column.render ? column.render(value, row) : String(value)}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
