import { useState } from 'react'
import DataTable, { type TableColumn } from './DataTable'

interface Person {
  id: number
  firstName: string
  lastName: string
  email: string
  age: number
}

const PEOPLE: Person[] = [
  { id: 1, firstName: 'Dana', lastName: 'Cohen', email: 'dana@example.com', age: 29 },
  { id: 2, firstName: 'Noa', lastName: 'Levi', email: 'noa@example.com', age: 34 },
  { id: 3, firstName: 'Omer', lastName: 'Katz', email: 'omer@example.com', age: 22 },
  { id: 4, firstName: 'Yael', lastName: 'Barak', email: 'yael@example.com', age: 41 },
  { id: 5, firstName: 'Itai', lastName: 'Shapira', email: 'itai@example.com', age: 27 },
]

const columns: TableColumn<Person>[] = [
  { key: 'firstName', title: 'First Name', sortable: true },
  { key: 'lastName', title: 'Last Name', sortable: true },
  {
    key: 'email',
    title: 'Email',
    render: (value) => <a href={`mailto:${value}`}>{String(value)}</a>,
  },
  { key: 'age', title: 'Age', sortable: true },
]

function PeopleTableDemo() {
  const [selectedCount, setSelectedCount] = useState(0)

  return (
    <div>
      <DataTable data={PEOPLE} columns={columns} onSelect={(rows) => setSelectedCount(rows.length)} />
      <p className="selection-summary">{selectedCount} row(s) selected</p>
    </div>
  )
}

export default PeopleTableDemo
