import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('renders all fields when every prop is provided', () => {
    render(<UserCard name="Ada Lovelace" age={36} role="Mathematician" />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Mathematician')).toBeInTheDocument();
    expect(screen.getByText('Age: 36')).toBeInTheDocument();
  });

  it('falls back to the default role when only name and age are given', () => {
    render(<UserCard name="Grace Hopper" age={85} />);
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Guest')).toBeInTheDocument();
    expect(screen.getByText('Age: 85')).toBeInTheDocument();
  });

  it('falls back to the default name when only role is given', () => {
    render(<UserCard role="Rear Admiral" />);
    expect(screen.getByText('Anonymous user')).toBeInTheDocument();
    expect(screen.getByText('Rear Admiral')).toBeInTheDocument();
  });

  it('omits the age line entirely when age is not provided, rather than showing a fabricated default', () => {
    render(<UserCard name="No Age Given" />);
    expect(screen.queryByText(/^Age:/)).not.toBeInTheDocument();
  });

  it('renders sensible defaults for every field when no props are given at all', () => {
    render(<UserCard />);
    expect(screen.getByText('Anonymous user')).toBeInTheDocument();
    expect(screen.getByText('Guest')).toBeInTheDocument();
    expect(screen.queryByText(/^Age:/)).not.toBeInTheDocument();
  });

  it('renders age 0 correctly, distinguishing "no age given" from "age is 0"', () => {
    // A naive `age || <default>` would treat 0 as falsy and hide a real
    // age of 0; this component checks `age !== undefined` specifically to
    // avoid that trap.
    render(<UserCard name="Newborn" age={0} />);
    expect(screen.getByText('Age: 0')).toBeInTheDocument();
  });
});
