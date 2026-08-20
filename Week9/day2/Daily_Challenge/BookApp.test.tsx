import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookApp from './BookApp';

describe('BookApp', () => {
  it('starts prepopulated with a few books', () => {
    render(<BookApp />);
    expect(screen.getByText(/Pride and Prejudice/)).toBeInTheDocument();
    expect(screen.getByText(/Beloved/)).toBeInTheDocument();
  });

  it('adds a new book without disturbing the existing ones', async () => {
    const user = userEvent.setup();
    render(<BookApp />);

    await user.type(screen.getByLabelText('Book title'), 'Kindred');
    await user.type(screen.getByLabelText('Book author'), 'Octavia E. Butler');
    await user.click(screen.getByRole('button', { name: 'Add book' }));

    expect(screen.getByText(/Kindred/)).toBeInTheDocument();
    expect(screen.getByText(/Octavia E\. Butler/)).toBeInTheDocument();
    // The prepopulated books are all still there too.
    expect(screen.getByText(/Pride and Prejudice/)).toBeInTheDocument();

    // The form clears after a successful add.
    expect(screen.getByLabelText('Book title')).toHaveValue('');
    expect(screen.getByLabelText('Book author')).toHaveValue('');
  });

  it('does not add a book when the title or author is left blank', async () => {
    const user = userEvent.setup();
    render(<BookApp />);

    const initialCount = screen.getAllByRole('listitem').length;

    await user.type(screen.getByLabelText('Book title'), 'Only a title');
    await user.click(screen.getByRole('button', { name: 'Add book' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(initialCount);
  });

  it('gives each added book a distinct id, so React keys never collide', async () => {
    const user = userEvent.setup();
    render(<BookApp />);

    const addOne = async (title: string, author: string) => {
      await user.type(screen.getByLabelText('Book title'), title);
      await user.type(screen.getByLabelText('Book author'), author);
      await user.click(screen.getByRole('button', { name: 'Add book' }));
    };

    await addOne('Book One', 'Author One');
    await addOne('Book Two', 'Author Two');

    expect(screen.getByText(/Book One/)).toBeInTheDocument();
    expect(screen.getByText(/Book Two/)).toBeInTheDocument();
  });
});
