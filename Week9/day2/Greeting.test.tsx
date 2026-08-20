import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Greeting from './Greeting';

describe('Greeting', () => {
  it('renders the name and message count', () => {
    render(<Greeting name="Ada" messageCount={3} />);
    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/new messages\.$/)).toBeInTheDocument();
  });

  it('uses singular "message" when the count is exactly 1', () => {
    render(<Greeting name="Grace" messageCount={1} />);
    // Matching against the <p>'s own textContent directly, since the count
    // is rendered inside a nested <strong> — a regex spanning "1 new
    // message" would need to cross that element boundary, which
    // `getByText`'s default per-node matching does not do.
    const paragraph = screen.getByText('Hello, Grace!').nextElementSibling;
    expect(paragraph).toHaveTextContent('You have 1 new message.');
  });
});
