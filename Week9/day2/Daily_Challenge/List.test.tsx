import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import List from './List';

interface Movie {
  id: number;
  name: string;
  year: number;
}

describe('List', () => {
  it('renders one <li> per item, using renderItem for content', () => {
    const items = ['apple', 'banana', 'cherry'];
    render(<List items={items} renderItem={(item) => <span>{item.toUpperCase()}</span>} />);

    expect(screen.getByText('APPLE')).toBeInTheDocument();
    expect(screen.getByText('BANANA')).toBeInTheDocument();
    expect(screen.getByText('CHERRY')).toBeInTheDocument();
  });

  it('shows an empty message rather than an empty <ul> when there are no items', () => {
    render(<List items={[]} renderItem={(item: string) => <span>{item}</span>} />);
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('is genuinely generic: the same component works for a completely different shape with no changes to List itself', () => {
    const movies: Movie[] = [
      { id: 1, name: 'Arrival', year: 2016 },
      { id: 2, name: 'Contact', year: 1997 },
    ];

    render(
      <List
        items={movies}
        keyExtractor={(movie) => movie.id}
        renderItem={(movie) => (
          <span>
            {movie.name} ({movie.year})
          </span>
        )}
      />,
    );

    expect(screen.getByText('Arrival (2016)')).toBeInTheDocument();
    expect(screen.getByText('Contact (1997)')).toBeInTheDocument();
  });
});
