import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FocusableInput from './FocusableInput';

describe('FocusableInput', () => {
  it('focuses the input automatically when the component mounts', () => {
    render(<FocusableInput />);
    expect(screen.getByPlaceholderText('Focused on mount')).toHaveFocus();
  });

  it('refocuses the input when the button is clicked after focus moved elsewhere', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <FocusableInput />
        <button type="button">Elsewhere</button>
      </div>,
    );

    const input = screen.getByPlaceholderText('Focused on mount');
    expect(input).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(input).not.toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Focus the input' }));
    expect(input).toHaveFocus();
  });
});
