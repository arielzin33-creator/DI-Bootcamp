/**
 * Exercise 5: Using useEffect Hook with TypeScript in React
 *
 * This component demonstrates:
 * - A typed User interface describing the shape of the API data
 * - useEffect to fetch data once when the component mounts
 * - Typed loading / error / data state handled with useState
 * - Guarding against setting state after the component has unmounted
 */

import { useEffect, useState } from 'react';
import type { User } from '../types/user';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevents a "state update on an unmounted component" warning
    // if the component unmounts before the fetch resolves.
    let isMounted = true;

    async function fetchUsers(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: User[] = await response.json();

        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'An unknown error occurred';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="card">
        <h2>Users</h2>
        <p>Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Users</h2>
        <p className="error-text">Failed to load users: {error}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Users</h2>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> ({user.username}) — {user.email}
            <br />
            <span className="muted">{user.company.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
