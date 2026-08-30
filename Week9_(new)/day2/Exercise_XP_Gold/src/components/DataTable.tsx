import { useMemo, useState, type ReactNode } from 'react'

export interface TableColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => ReactNode
}

interface DataTableProps<T extends { id: number | string }> {
  data: T[]
  columns: TableColumn<T>[]
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  onSelect?: (selected: T[]) => void
}

type SortConfig<T> = { key: keyof T; direction: 'asc' | 'desc' } | null

function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onSort,
  onSelect,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null)
  const [selectedIds, setSelectedIds] = useState<Set<T['id']>>(new Set())

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0
      const comparison = aValue > bValue ? 1 : -1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortConfig])

  const handleHeaderClick = (column: TableColumn<T>): void => {
    if (!column.sortable) return

    const direction: 'asc' | 'desc' =
      sortConfig?.key === column.key && sortConfig.direction === 'asc' ? 'desc' : 'asc'

    setSortConfig({ key: column.key, direction })
    onSort?.(column.key, direction)
  }

  const emitSelection = (ids: Set<T['id']>): void => {
    onSelect?.(data.filter((row) => ids.has(row.id)))
  }

  const toggleRow = (id: T['id']): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      emitSelection(next)
      return next
    })
  }

  const toggleAll = (): void => {
    setSelectedIds((prev) => {
      const next = prev.size === data.length ? new Set<T['id']>() : new Set(data.map((row) => row.id))
      emitSelection(next)
      return next
    })
  }

  const allSelected = data.length > 0 && selectedIds.size === data.length

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="select-col">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all rows" />
          </th>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className={column.sortable ? 'sortable' : undefined}
              onClick={() => handleHeaderClick(column)}
            >
              {column.title}
              {sortConfig?.key === column.key && (
                <span className="sort-indicator">{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row) => (
          <tr key={row.id} className={selectedIds.has(row.id) ? 'selected' : undefined}>
            <td className="select-col">
              <input
                type="checkbox"
                checked={selectedIds.has(row.id)}
                onChange={() => toggleRow(row.id)}
                aria-label={`Select row ${row.id}`}
              />
            </td>
            {columns.map((column) => (
              <td key={String(column.key)}>
                {column.render ? column.render(row[column.key], row) : String(row[column.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DataTable
