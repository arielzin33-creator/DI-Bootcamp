import { useEffect, useState } from 'react';

/**
 * Narrowed to the fields this component actually displays, rather than
 * mirroring every field JSONPlaceholder returns (address, phone, website,
 * geo coordinates, ...). A type should describe what the code uses, not
 * everything the API happens to send.
 */
interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

const USERS_API_URL = 'https://jsonplaceholder.typicode.com/users';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setStatus('loading');
      setError(null);
      try {
        const response = await fetch(USERS_API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`);
        }
        const data = (await response.json()) as User[];
        setUsers(data);
        setStatus('succeeded');
      } catch (err) {
        // An aborted request (component unmounted before the fetch
        // resolved) is a cleanup detail, not a failure worth showing —
        // there's no component left to show it to by the time it happens.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setError(message);
        setStatus('failed');
      }
    }

    void fetchUsers();

    return () => controller.abort();
  }, []);

  if (status === 'loading' || status === 'idle') {
    return <p className="user-list__status">Loading users…</p>;
  }

  if (status === 'failed') {
    return (
      <p className="user-list__status user-list__status--error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <ul className="user-list">
      {users.map((user) => (
        <li key={user.id} className="user-list__item">
          <p className="user-list__name">{user.name}</p>
          <p className="user-list__email">{user.email}</p>
          <p className="user-list__company">{user.company.name}</p>
        </li>
      ))}
    </ul>
  );
}
