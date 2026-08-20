import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

describe('Counter', () => {
  it('starts at 0 with no last action recorded', () => {
    render(<Counter />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Last action: none yet')).toBeInTheDocument();
  });

  it('increments the count and records the action', () => {
    render(<Counter />);
    fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Last action: increment')).toBeInTheDocument();
  });

  it('decrements the count and records the action', () => {
    render(<Counter />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrement' }));
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByText('Last action: decrement')).toBeInTheDocument();
  });

  it('tracks the most recent action across several clicks, not just the first', () => {
    render(<Counter />);
    const incrementButton = screen.getByRole('button', { name: 'Increment' });
    const decrementButton = screen.getByRole('button', { name: 'Decrement' });

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Last action: decrement')).toBeInTheDocument();
  });
});
