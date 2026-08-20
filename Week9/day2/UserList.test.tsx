import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserList from './UserList';

const mockUsers = [
  {
    id: 1,
    name: 'Leanne Graham',
    email: 'Sincere@april.biz',
    company: { name: 'Romaguera-Crona' },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    email: 'Shanna@melissa.tv',
    company: { name: 'Deckow-Crist' },
  },
];

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(body),
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UserList', () => {
  it('shows a loading message before the fetch resolves', () => {
    // Never resolves during this test — just checking the synchronous
    // render before any await happens.
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    render(<UserList />);
    expect(screen.getByText('Loading users…')).toBeInTheDocument();
  });

  it('displays each user once the fetch succeeds', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(mockUsers));
    render(<UserList />);

    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument();
    expect(screen.getByText('Sincere@april.biz')).toBeInTheDocument();
    expect(screen.getByText('Romaguera-Crona')).toBeInTheDocument();
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
  });

  it('shows an error message on a non-ok response', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse(null, false, 500),
    );
    render(<UserList />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Request failed with status 500.',
    );
  });

  it('shows an error message when the network request itself rejects', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new TypeError('Failed to fetch'),
    );
    render(<UserList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch');
  });
});
