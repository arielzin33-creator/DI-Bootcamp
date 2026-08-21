/**
 * Comments for the story currently open in the Story Viewer.
 *
 * Reactions use **optimistic updates**: the tally changes the instant you click,
 * before the server has answered. If the request fails we put the previous tallies
 * back. See `toggleReaction` below.
 */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Comment, Reaction } from "@storyapp/types";
import { ApiClientError, apiRequest } from "../../app/api/client";
import type { RootState } from "../../app/store";
import { sessionExpired, tokenRefreshed } from "../auth/authSlice";

export interface CommentsState {
  items: Comment[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  /** Id of the comment currently being edited inline, if any. */
  editingId: number | null;
}

const initialState: CommentsState = {
  items: [],
  status: "idle",
  error: null,
  editingId: null,
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

export const fetchComments = createAsyncThunk<Comment[], number, { rejectValue: string }>(
  "comments/fetchAll",
  async (storyId, { getState, dispatch, rejectWithValue }) => {
    try {
      return await apiRequest<Comment[]>(`/comments/${storyId}`, authOptions(getState, dispatch));
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

export const addComment = createAsyncThunk<
  Comment,
  { storyId: number; commentText: string },
  { rejectValue: string }
>("comments/add", async ({ storyId, commentText }, { getState, dispatch, rejectWithValue }) => {
  try {
    return await apiRequest<Comment>("/comments", {
      ...authOptions(getState, dispatch),
      method: "POST",
      body: { story_id: storyId, comment_text: commentText },
    });
  } catch (error) {
    return rejectWithValue(messageOf(error));
  }
});

export const editComment = createAsyncThunk<
  Comment,
  { id: number; commentText: string },
  { rejectValue: string }
>("comments/edit", async ({ id, commentText }, { getState, dispatch, rejectWithValue }) => {
  try {
    return await apiRequest<Comment>(`/comments/${id}`, {
      ...authOptions(getState, dispatch),
      method: "PATCH",
      body: { comment_text: commentText },
    });
  } catch (error) {
    return rejectWithValue(messageOf(error));
  }
});

export const removeComment = createAsyncThunk<number, number, { rejectValue: string }>(
  "comments/remove",
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      await apiRequest<void>(`/comments/${id}`, {
        ...authOptions(getState, dispatch),
        method: "DELETE",
      });
      return id;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
);

/**
 * Toggles a reaction optimistically.
 *
 * The flow, and why it is shaped this way:
 *  1. `pending`   -> the reducer immediately applies the change locally, and stashes
 *                    the previous tallies in the action meta.
 *  2. `fulfilled` -> replace the local guess with the server's authoritative tallies.
 *                    (Not a no-op: someone else may have reacted in the meantime.)
 *  3. `rejected`  -> restore the stashed tallies. Rolling back to the *snapshot*
 *                    rather than just decrementing is what makes double-clicks and
 *                    concurrent failures safe.
 */
export const toggleReaction = createAsyncThunk<
  { commentId: number; reactions: Reaction[] },
  { commentId: number; emoji: string; previous: Reaction[] },
  { rejectValue: { commentId: number; previous: Reaction[]; message: string } }
>(
  "comments/toggleReaction",
  async ({ commentId, emoji, previous }, { getState, dispatch, rejectWithValue }) => {
    try {
      const reactions = await apiRequest<Reaction[]>(`/comments/${commentId}/reactions`, {
        ...authOptions(getState, dispatch),
        method: "POST",
        body: { emoji },
      });
      return { commentId, reactions };
    } catch (error) {
      return rejectWithValue({ commentId, previous, message: messageOf(error) });
    }
  },
);

/** Applies a toggle to a tally list, purely so the reducer stays readable. */
function applyToggle(reactions: Reaction[], emoji: string): Reaction[] {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);

  if (!existing) {
    return [...reactions, { emoji, count: 1, reacted: true }];
  }
  if (existing.reacted) {
    // Un-reacting: drop the tally entirely once it hits zero.
    const count = existing.count - 1;
    return count <= 0
      ? reactions.filter((reaction) => reaction.emoji !== emoji)
      : reactions.map((reaction) =>
          reaction.emoji === emoji ? { ...reaction, count, reacted: false } : reaction,
        );
  }
  return reactions.map((reaction) =>
    reaction.emoji === emoji
      ? { ...reaction, count: reaction.count + 1, reacted: true }
      : reaction,
  );
}

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments(state) {
      state.items = [];
      state.error = null;
      state.editingId = null;
    },
    startEditingComment(state, action: PayloadAction<number>) {
      state.editingId = action.payload;
    },
    stopEditingComment(state) {
      state.editingId = null;
    },
    clearCommentsError(state) {
      state.error = null;
    },
    /** Applied when another user's edit arrives over the WebSocket. */
    commentsInvalidated(state) {
      state.status = "idle";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not load comments.";
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload ?? "Could not post your comment.";
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const index = state.items.findIndex((comment) => comment.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.editingId = null;
      })
      .addCase(editComment.rejected, (state, action) => {
        state.error = action.payload ?? "Could not save your edit.";
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        state.items = state.items.filter((comment) => comment.id !== action.payload);
      })
      .addCase(removeComment.rejected, (state, action) => {
        state.error = action.payload ?? "Could not delete that comment.";
      })

      // ---- optimistic reaction handling ----
      .addCase(toggleReaction.pending, (state, action) => {
        const { commentId, emoji } = action.meta.arg;
        const comment = state.items.find((item) => item.id === commentId);
        if (comment) comment.reactions = applyToggle(comment.reactions, emoji);
      })
      .addCase(toggleReaction.fulfilled, (state, action) => {
        const comment = state.items.find((item) => item.id === action.payload.commentId);
        // Trust the server over our local guess -- other people react too.
        if (comment) comment.reactions = action.payload.reactions;
      })
      .addCase(toggleReaction.rejected, (state, action) => {
        if (!action.payload) return;
        const comment = state.items.find((item) => item.id === action.payload!.commentId);
        // Roll back to the exact snapshot taken before the optimistic change.
        if (comment) comment.reactions = action.payload.previous;
        state.error = action.payload.message;
      });
  },
});

export const {
  clearComments,
  startEditingComment,
  stopEditingComment,
  clearCommentsError,
  commentsInvalidated,
} = commentsSlice.actions;
export default commentsSlice.reducer;

/** Exported for unit testing the optimistic logic in isolation. */
export { applyToggle };
