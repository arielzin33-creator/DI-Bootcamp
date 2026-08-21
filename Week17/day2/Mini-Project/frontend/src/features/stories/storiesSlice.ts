/**
 * Stories state: the list, the story currently open, and the draft being edited.
 *
 * On the brief's "avoid having more than one source of truth": the story being edited
 * lives in `draft` here, the editor component is fully controlled by it, and only on
 * save does it go to the backend and replace the canonical copy. The editor keeps no
 * local useState copy of the text, so the two can never drift apart.
 */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CreateStoryPayload, Story, UpdateStoryPayload, User } from "@storyapp/types";
import { ApiClientError, apiRequest } from "../../app/api/client";
import type { RootState } from "../../app/store";
import { sessionExpired, tokenRefreshed } from "../auth/authSlice";

export interface StoriesState {
  items: Story[];
  current: Story | null;
  draft: { title: string; content: string } | null;
  status: "idle" | "loading" | "failed";
  saving: boolean;
  error: string | null;
  /** Homepage filter: show only the logged-in user's own stories. */
  onlyMine: boolean;
}

const initialState: StoriesState = {
  items: [],
  current: null,
  draft: null,
  status: "idle",
  saving: false,
  error: null,
  onlyMine: false,
};

/**
 * Shared plumbing for every authenticated call: pulls the current token out of the
 * store, and wires the refresh/replay callbacks back into the auth slice.
 */
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

export const fetchStories = createAsyncThunk<Story[], boolean | undefined, { rejectValue: string }>(
  "stories/fetchAll",
  async (onlyMine, { getState, dispatch, rejectWithValue }) => {
    try {
      const path = onlyMine ? "/stories?mine=true" : "/stories";
      return await apiRequest<Story[]>(path, authOptions(getState, dispatch));
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const fetchStory = createAsyncThunk<Story, number, { rejectValue: string }>(
  "stories/fetchOne",
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<Story>(`/stories/${id}`, authOptions(getState, dispatch));
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const createStory = createAsyncThunk<Story, CreateStoryPayload, { rejectValue: string }>(
  "stories/create",
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<Story>("/stories", {
        ...authOptions(getState, dispatch),
        method: "POST",
        body: payload,
      });
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const saveStory = createAsyncThunk<
  Story,
  { id: number; update: UpdateStoryPayload },
  { rejectValue: string }
>("stories/update", async ({ id, update }, { getState, dispatch, rejectWithValue }) => {
  try {
    return await apiRequest<Story>(`/stories/${id}`, {
      ...authOptions(getState, dispatch),
      method: "PATCH",
      body: update,
    });
  } catch (error) {
    return rejectWithValue(messageOf(error));
  }
});

export const removeStory = createAsyncThunk<number, number, { rejectValue: string }>(
  "stories/delete",
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      await apiRequest<void>(`/stories/${id}`, {
        ...authOptions(getState, dispatch),
        method: "DELETE",
      });
      return id;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const addContributor = createAsyncThunk<
  User[],
  { storyId: number; userId: number },
  { rejectValue: string }
>("stories/addContributor", async ({ storyId, userId }, { getState, dispatch, rejectWithValue }) => {
  try {
    return await apiRequest<User[]>("/contributors", {
      ...authOptions(getState, dispatch),
      method: "POST",
      body: { story_id: storyId, user_id: userId },
    });
  } catch (error) {
    return rejectWithValue(messageOf(error));
  }
});

export const searchUsers = createAsyncThunk<User[], string, { rejectValue: string }>(
  "stories/searchUsers",
  async (term, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<User[]>(
        `/users?search=${encodeURIComponent(term)}`,
        authOptions(getState, dispatch),
      );
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

const storiesSlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    setOnlyMine(state, action: PayloadAction<boolean>) {
      state.onlyMine = action.payload;
    },
    /** Seeds the editor from the story currently open. */
    startEditing(state) {
      if (state.current) {
        state.draft = { title: state.current.title, content: state.current.content };
      }
    },
    /** Every keystroke in the editor lands here -- the draft is the single source of truth. */
    draftChanged(state, action: PayloadAction<{ title?: string; content?: string }>) {
      if (!state.draft) return;
      if (action.payload.title !== undefined) state.draft.title = action.payload.title;
      if (action.payload.content !== undefined) state.draft.content = action.payload.content;
    },
    cancelEditing(state) {
      state.draft = null;
    },
    clearStoriesError(state) {
      state.error = null;
    },
    clearCurrent(state) {
      state.current = null;
      state.draft = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not load stories.";
      })
      .addCase(fetchStory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStory.fulfilled, (state, action) => {
        state.status = "idle";
        state.current = action.payload;
      })
      .addCase(fetchStory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not load that story.";
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createStory.rejected, (state, action) => {
        state.error = action.payload ?? "Could not create the story.";
      })
      .addCase(saveStory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveStory.fulfilled, (state, action) => {
        state.saving = false;
        state.current = action.payload;
        state.draft = null; // the server's copy is now canonical again
        const index = state.items.findIndex((story) => story.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(saveStory.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Could not save the story.";
      })
      .addCase(removeStory.fulfilled, (state, action) => {
        state.items = state.items.filter((story) => story.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      })
      .addCase(removeStory.rejected, (state, action) => {
        state.error = action.payload ?? "Could not delete the story.";
      })
      .addCase(addContributor.fulfilled, (state, action) => {
        if (state.current) state.current.contributors = action.payload;
      })
      .addCase(addContributor.rejected, (state, action) => {
        state.error = action.payload ?? "Could not add that contributor.";
      });
  },
});

export const {
  setOnlyMine,
  startEditing,
  draftChanged,
  cancelEditing,
  clearStoriesError,
  clearCurrent,
} = storiesSlice.actions;
export default storiesSlice.reducer;
