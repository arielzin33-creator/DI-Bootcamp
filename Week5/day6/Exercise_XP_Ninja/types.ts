// src/features/auth/types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type ProfileUpdate = Partial<Pick<User, 'name' | 'bio'>>;