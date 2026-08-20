import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import AuthGate from './AuthGate';

const renderWithStore = (preloadedState) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
  render(
    <Provider store={store}>
      <AuthGate />
    </Provider>,
  );
  return store;
};

describe('conditional rendering', () => {
  it('shows the login form when logged out', () => {
    renderWithStore({ auth: { isAuthenticated: false, user: null } });
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.queryByText(/^Welcome,/)).not.toBeInTheDocument();
  });

  it('shows the members-only content when logged in', () => {
    renderWithStore({ auth: { isAuthenticated: true, user: { username: 'ada', name: 'Ada' } } });
    expect(screen.getByText('Welcome, Ada')).toBeInTheDocument();
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument();
  });
});

describe('login flow', () => {
  it('logging in through the form reveals the members-only content', () => {
    const store = renderWithStore({ auth: { isAuthenticated: false, user: null } });

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'grace' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));

    expect(screen.getByText('Welcome, Grace')).toBeInTheDocument();
    expect(store.getState().auth).toEqual({
      isAuthenticated: true,
      user: { username: 'grace', name: 'Grace' },
    });
  });

  it('does not log in on an empty username', () => {
    const store = renderWithStore({ auth: { isAuthenticated: false, user: null } });

    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));

    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });
});

describe('logout flow', () => {
  it('logging out returns to the login form', () => {
    const store = renderWithStore({
      auth: { isAuthenticated: true, user: { username: 'ada', name: 'Ada' } },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Leave the club' }));

    expect(store.getState().auth).toEqual({ isAuthenticated: false, user: null });
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });
});

describe('profile editing (setUser)', () => {
  it('updates the displayed name without logging the user out', () => {
    const store = renderWithStore({
      auth: { isAuthenticated: true, user: { username: 'ada', name: 'Ada' } },
    });

    fireEvent.change(screen.getByLabelText('Display name'), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Welcome, Ada Lovelace')).toBeInTheDocument();
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
