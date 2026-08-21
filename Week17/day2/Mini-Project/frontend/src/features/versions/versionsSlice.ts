/**
 * Version history for a story (author-only).
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { DiffLine, Story, Version, VersionSummary } from "@storyapp/types";
import { ApiClientError, apiRequest } from "../../app/api/client";
import type { RootState } from "../../app/store";
import { sessionExpired, tokenRefreshed } from "../auth/authSlice";

export interface VersionDetail {
  version: Version;
  previous_id: number | null;
  diff: DiffLine[];
  stats: { added: number; removed: number };
}

export interface VersionsState {
  items: VersionSummary[];
  selected: VersionDetail | null;
  status: "idle" | "loading" | "failed";
  restoring: boolean;
  error: string | null;
  panelOpen: boolean;
}

const initialState: VersionsState = {
  items: [],
  selected: null,
  status: "idle",
  restoring: false,
  error: null,
  panelOpen: false,
};

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

export const fetchVersions = createAsyncThunk<VersionSummary[], number, { rejectValue: string }>(
  "versions/fetchAll",
  async (storyId, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<VersionSummary[]>(
        `/stories/${storyId}/versions`,
        authOptions(getState, dispatch),
      );
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const fetchVersion = createAsyncThunk<VersionDetail, number, { rejectValue: string }>(
  "versions/fetchOne",
  async (versionId, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<VersionDetail>(
        `/versions/${versionId}`,
        authOptions(getState, dispatch),
      );
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const restoreVersion = createAsyncThunk<Story, number, { rejectValue: string }>(
  "versions/restore",
  async (versionId, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<Story>(`/versions/${versionId}/restore`, {
        ...authOptions(getState, dispatch),
        method: "POST",
      });
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

const versionsSlice = createSlice({
  name: "versions",
  initialState,
  reducers: {
    togglePanel(state) {
      state.panelOpen = !state.panelOpen;
      if (!state.panelOpen) state.selected = null;
    },
    closeVersion(state) {
      state.selected = null;
    },
    clearVersions() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchVersions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchVersions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not load the history.";
      })
      .addCase(fetchVersion.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchVersion.rejected, (state, action) => {
        state.error = action.payload ?? "Could not load that version.";
      })
      .addCase(restoreVersion.pending, (state) => {
        state.restoring = true;
        state.error = null;
      })
      .addCase(restoreVersion.fulfilled, (state) => {
        state.restoring = false;
        state.selected = null;
        // The restore itself created a new version, so the list is now stale.
        state.status = "idle";
      })
      .addCase(restoreVersion.rejected, (state, action) => {
        state.restoring = false;
        state.error = action.payload ?? "Could not restore that version.";
      });
  },
});

export const { togglePanel, closeVersion, clearVersions } = versionsSlice.actions;
export default versionsSlice.reducer;
