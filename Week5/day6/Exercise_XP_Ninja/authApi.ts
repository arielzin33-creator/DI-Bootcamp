// src/features/auth/authApi.ts
import { User, LoginCredentials, ProfileUpdate } from './types';

// A fake "database" of a single registered user, purely for simulation purposes
const FAKE_USER_DB = {
  email: 'test@example.com',
  password: 'password123',
  profile: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    bio: 'This is a simulated user profile.'
  } as User
};

// Simulates a login network request
export function fakeLoginRequest(credentials: LoginCredentials): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        credentials.email === FAKE_USER_DB.email &&
        credentials.password === FAKE_USER_DB.password
      ) {
        resolve(FAKE_USER_DB.profile);
      } else {
        reject(new Error('Invalid email or password.'));
      }
    }, 1000); // simulate 1-second network latency
  });
}

// Simulates a logout network request
export function fakeLogoutRequest(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

// Simulates a profile-update network request
export function fakeUpdateProfileRequest(
  currentUser: User,
  updates: ProfileUpdate
): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!updates.name || updates.name.trim() === '') {
        reject(new Error('Name cannot be empty.'));
        return;
      }
      resolve({ ...currentUser, ...updates });
    }, 800);
  });
}