/**
 * Public profiles, plus editing your own (username + avatar).
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Profile, User } from "@storyapp/types";
import { ApiClientError, apiRequest } from "../../app/api/client";
import type { RootState } from "../../app/store";
import { sessionExpired, tokenRefreshed } from "../auth/authSlice";

export interface ProfileState {
  profile: Profile | null;
  status: "idle" | "loading" | "failed";
  saving: boolean;
  error: string | null;
}

const initialState: ProfileState = { profile: null, status: "idle", saving: false, error: null };

function authOptions(getState: () => unknown, dispatch: (action: unknown) => unknown) {
  const state = getState() as RootState;
  return {
    token: state.auth.accessToken,
    onTokenRefreshed: (accessToken: string) => dispatch(tokenRefreshed(accessToken)),
    onAuthFailure: () => dispatch(sessionExpired()),
  };
}

function messageOf(error: unknown): string {
  return error instanceof ApiClientError ? error.message : "Network error. Is the API running?";
}

export const fetchProfile = createAsyncThunk<Profile, number, { rejectValue: string }>(
  "profile/fetch",
  async (userId, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<Profile>(`/users/${userId}/profile`, authOptions(getState, dispatch));
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const updateProfile = createAsyncThunk<
  User,
  { username?: string; avatar_url?: string | null },
  { rejectValue: string }
>("profile/update", async (patch, { getState, dispatch, rejectWithValue }) => {
  try {
    return await apiRequest<User>("/users/me", {
      ...authOptions(getState, dispatch),
      method: "PATCH",
      body: patch,
    });
  } catch (error) {
    return rejectWithValue(messageOf(error));
  }
});

/** Cloudinary signature for a direct browser upload. */
export interface UploadSignature {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  public_id: string;
  folder: string;
  overwrite: boolean;
  signature: string;
  upload_url: string;
}

/**
 * Uploads an avatar straight to Cloudinary, then saves the resulting URL.
 *
 * The file never passes through our API: we ask the backend only for a signature,
 * POST the image to Cloudinary from the browser, and then PATCH the returned
 * secure_url onto the profile.
 */
export const uploadAvatar = createAsyncThunk<User, File, { rejectValue: string }>(
  "profile/uploadAvatar",
  async (file, { getState, dispatch, rejectWithValue }) => {
    try {
      const signature = await apiRequest<UploadSignature>("/users/me/avatar/signature", {
        ...authOptions(getState, dispatch),
        method: "POST",
      });

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signature.api_key);
      form.append("timestamp", String(signature.timestamp));
      form.append("public_id", signature.public_id);
      form.append("folder", signature.folder);
      form.append("overwrite", String(signature.overwrite));
      form.append("signature", signature.signature);

      // Plain fetch, not apiRequest: this goes to Cloudinary, and must NOT carry our
      // Authorization header or cookies to a third-party host.
      const response = await fetch(signature.upload_url, { method: "POST", body: form });
      if (!response.ok) throw new Error("Cloudinary rejected the upload.");

      const uploaded = (await response.json()) as { secure_url?: string };
      if (!uploaded.secure_url) throw new Error("Cloudinary did not return an image URL.");

      const user = await apiRequest<User>("/users/me", {
        ...authOptions(getState, dispatch),
        method: "PATCH",
        body: { avatar_url: uploaded.secure_url },
      });
      return user;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile() {
      return initialState;
    },
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "idle";
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not load that profile.";
      })
      .addCase(updateProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.saving = false;
        if (state.profile) state.profile.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Could not save your profile.";
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.saving = false;
        if (state.profile) state.profile.user = action.payload;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Could not upload that image.";
      });
  },
});

export const { clearProfile, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
