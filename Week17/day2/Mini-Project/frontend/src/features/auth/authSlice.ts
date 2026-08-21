/**
 * Authentication state.
 *
 * The access token lives HERE, in memory, and nowhere else -- never in localStorage.
 * Anything in localStorage can be read by any script that gets injected into the page,
 * so a single XSS would hand an attacker a working token. Keeping it in the Redux store
 * means it dies with the tab; on reload we silently mint a new one from the httpOnly
 * refresh cookie (see `bootstrapSession`).
 */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@storyapp/types";
import { ApiClientError, apiRequest } from "../../app/api/client";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  /** Field-level errors from the backend, e.g. { email: "Email is not valid." }. */
  fieldErrors: Record<string, string> | null;
  /**
   * False until the initial refresh attempt has finished. The router waits on this so
   * a logged-in user reloading the page is not flashed the login screen first.
   */
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
  fieldErrors: null,
  initialized: false,
};

/** Shape used to surface backend errors (message + per-field) into the store. */
interface RejectValue {
  message: string;
  fieldErrors?: Record<string, string>;
}

function toRejectValue(error: unknown): RejectValue {
  if (error instanceof ApiClientError) {
    return { message: error.message, fieldErrors: error.errors };
  }
  return { message: "Network error. Is the API running?" };
}

export const login = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: RejectValue }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: credentials,
        skipRefresh: true, // a failed login is not a stale-token problem
      });
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  },
);

export const signup = createAsyncThunk<AuthResponse, RegisterPayload, { rejectValue: RejectValue }>(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      // The backend returns a full session here, so signing up logs the user straight
      // in -- as the brief requires.
      return await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: payload,
        skipRefresh: true,
      });
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  },
);

/**
 * Runs once on app start. The access token was lost with the page, so we try to mint a
 * new one from the refresh cookie. Failure is normal (nobody is logged in) and must not
 * surface as an error to the user.
 */
export const bootstrapSession = createAsyncThunk<AuthResponse | null>(
  "auth/bootstrap",
  async () => {
    try {
      return await apiRequest<AuthResponse>("/auth/refresh", {
        method: "POST",
        skipRefresh: true, // this IS the refresh call
      });
    } catch {
      return null;
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    // Clears the httpOnly cookie server-side; the browser cannot delete it itself.
    await apiRequest<void>("/auth/logout", { method: "POST", skipRefresh: true });
  } catch {
    // Even if the call fails, we still clear local state below.
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called by the API client after a transparent refresh. */
    tokenRefreshed(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    /** Called when refreshing failed -- the session is unrecoverable. */
    sessionExpired(state) {
      state.user = null;
      state.accessToken = null;
      state.error = "Your session has expired. Please log in again.";
    },
    clearAuthError(state) {
      state.error = null;
      state.fieldErrors = null;
    },
  },
  extraReducers(builder) {
    builder
      // login and signup share identical handling.
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message ?? "Login failed.";
        state.fieldErrors = action.payload?.fieldErrors ?? null;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message ?? "Sign up failed.";
        state.fieldErrors = action.payload?.fieldErrors ?? null;
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
        }
        state.initialized = true;
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.error = null;
        state.fieldErrors = null;
      });
  },
});

export const { tokenRefreshed, sessionExpired, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
