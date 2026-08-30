import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  company: {
    name: string
  }
}

function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchUsers = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data: User[] = await response.json()
        if (!cancelled) setUsers(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="status-message">Loading users…</p>
  if (error) return <p className="status-message error">Error: {error}</p>

  return (
    <div className="user-list">
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="user-list-item">
            <strong>{user.name}</strong> — {user.email} ({user.company.name})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserList
