// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials, ProfileUpdate } from './types';
import { fakeLoginRequest, fakeLogoutRequest, fakeUpdateProfileRequest } from './authApi';
import { RootState } from '../../store';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null
};

// createAsyncThunk handles the pending/fulfilled/rejected lifecycle automatically
export const login = createAsyncThunk<User, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const user = await fakeLoginRequest(credentials);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await fakeLogoutRequest();
});

export const updateProfile = createAsyncThunk
  User,
  ProfileUpdate,
  { state: RootState; rejectValue: string }
>('auth/updateProfile', async (updates, thunkAPI) => {
  const currentUser = thunkAPI.getState().auth.user;

  if (!currentUser) {
    return thunkAPI.rejectWithValue('No user is currently logged in.');
  }

  try {
    const updatedUser = await fakeUpdateProfileRequest(currentUser, updates);
    return updatedUser;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Profile update failed.';
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed.';
        state.isAuthenticated = false;
      })
      // logout
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.isAuthenticated = false;
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Profile update failed.';
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;